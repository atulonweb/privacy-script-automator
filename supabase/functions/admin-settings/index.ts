// Follow this setup guide to integrate the Deno runtime and the Supabase JS library with your project:
// https://docs.lovable.dev/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Set up CORS headers for this request
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebResponse {
  error?: string;
  message?: string;
  admins?: any[];
  users?: any[];
  plans?: any[];
  cache_busted?: boolean;
}

export const handleOptions = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

const handleRequest = async (req: Request): Promise<Response> => {
  try {
    // Get request body
    const body = await req.json();
    const { action, userId, email, bustCache = false } = body;
    
    // Get Supabase client with admin privileges from Supabase Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Verify that the caller has admin privileges
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Authenticated user:', user.id);

    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      throw new Error('User is not an admin');
    }

    // Different actions based on the request
    let result: WebResponse = {};

    switch (action) {
      case 'get_admins':
        result = await getAdmins(supabaseAdmin);
        break;
      case 'get_users':
        result = await getUsers(supabaseAdmin);
        break;
      case 'get_users_complete':
        result = await getUsersComplete(supabaseAdmin, bustCache);
        break;
      case 'get_plans':
        result = await getPlans(supabaseAdmin, bustCache);
        break;
      case 'block_user':
        if (!userId) throw new Error('User ID is required');
        result = await blockUser(supabaseAdmin, userId);
        break;
      case 'unblock_user':
        if (!userId) throw new Error('User ID is required');
        result = await unblockUser(supabaseAdmin, userId);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in admin-settings function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
};

async function getAdmins(supabaseAdmin: SupabaseClient) {
  console.log('Getting admin users');
  
  try {
    // Get all users with admin role
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Filter admin users
    const adminUsers = data.users.filter(user => 
      user.app_metadata?.role === 'admin'
    );
    
    return {
      admins: adminUsers,
    };
  } catch (error) {
    console.error('Error getting admin users:', error);
    throw error;
  }
}

async function getUsers(supabaseAdmin: SupabaseClient) {
  console.log('Attempting to fetch all users');
  
  try {
    // Get all users
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;
    
    console.log(`Successfully retrieved ${data.users.length} users`);
    return {
      users: data.users,
    };
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

async function getUsersComplete(supabaseAdmin: SupabaseClient, bustCache = false) {
  console.log(`Attempting to fetch complete user data${bustCache ? ' (cache busted)' : ''}`);
  
  try {
    // Get all users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Get all subscription data using service role with cache busting
    const subscriptionQuery = supabaseAdmin
      .from('user_subscriptions')
      .select('user_id, plan');
    
    if (bustCache) {
      // Add timestamp to bust cache
      subscriptionQuery.gte('updated_at', new Date(0).toISOString());
    }

    const { data: subscriptionData, error: subscriptionError } = await subscriptionQuery;

    if (subscriptionError) {
      console.error("Subscription error:", subscriptionError);
    }

    // Get website counts for each user using service role
    const { data: websiteData, error: websiteError } = await supabaseAdmin
      .from('websites')
      .select('user_id');

    if (websiteError) {
      console.error("Website error:", websiteError);
    }

    // Get script counts for each user using service role
    const { data: scriptData, error: scriptError } = await supabaseAdmin
      .from('consent_scripts')
      .select('user_id');

    if (scriptError) {
      console.error("Script error:", scriptError);
    }

    // Create maps for counts
    const subscriptionMap = subscriptionData?.reduce((acc: any, item: any) => {
      acc[item.user_id] = item.plan;
      return acc;
    }, {}) || {};

    const websiteCountMap = websiteData?.reduce((acc: any, item: any) => {
      acc[item.user_id] = (acc[item.user_id] || 0) + 1;
      return acc;
    }, {}) || {};

    const scriptCountMap = scriptData?.reduce((acc: any, item: any) => {
      acc[item.user_id] = (acc[item.user_id] || 0) + 1;
      return acc;
    }, {}) || {};

    // Process users with complete data
    const processedUsers = authData.users?.map((user: any) => ({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || 'Unknown User',
      email: user.email,
      role: user.app_metadata?.role || 'user',
      status: user.email_confirmed_at ? 'Active' : 'Pending',
      plan: subscriptionMap[user.id] || 'free',
      websites: websiteCountMap[user.id] || 0,
      scripts: scriptCountMap[user.id] || 0,
      joined: new Date(user.created_at).toLocaleDateString()
    })) || [];

    console.log(`Successfully retrieved ${processedUsers.length} users with complete data`);
    return {
      users: processedUsers,
      cache_busted: bustCache
    };
  } catch (error) {
    console.error('Error getting complete user data:', error);
    throw error;
  }
}

async function getPlans(supabaseAdmin: SupabaseClient, bustCache = false) {
  console.log(`Attempting to fetch available plans${bustCache ? ' (cache busted)' : ''}`);
  
  try {
    // Get all plan settings using service role
    const planQuery = supabaseAdmin
      .from('plan_settings')
      .select('*')
      .order('plan_type');

    if (bustCache) {
      // Add timestamp to bust cache
      planQuery.gte('updated_at', new Date(0).toISOString());
    }

    const { data: planData, error: planError } = await planQuery;

    if (planError) throw planError;

    console.log(`Successfully retrieved ${planData?.length || 0} plans`);
    return {
      plans: planData || [],
      cache_busted: bustCache
    };
  } catch (error) {
    console.error('Error getting plans:', error);
    throw error;
  }
}

async function blockUser(supabaseAdmin: SupabaseClient, userId: string) {
  console.log(`Blocking user ${userId}`);
  
  try {
    // Ban the user in Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { banned: true }
    );
    
    if (error) throw error;
    
    return {
      message: 'User blocked successfully',
    };
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

async function unblockUser(supabaseAdmin: SupabaseClient, userId: string) {
  console.log(`Unblocking user ${userId}`);
  
  try {
    // Unban the user in Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { banned: false }
    );
    
    if (error) throw error;
    
    return {
      message: 'User unblocked successfully',
    };
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}

async function getUserById(supabaseAdmin: SupabaseClient, userId: string) {
  console.log(`Attempting to fetch user with ID: ${userId}`);
  
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error) throw error;
    if (!data.user) throw new Error(`User with ID ${userId} not found`);
    
    console.log(`Successfully retrieved user: ${data.user.email}`);
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }
  
  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }
  
  return handleRequest(req);
});
