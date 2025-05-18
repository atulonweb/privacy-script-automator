
// Follow this setup guide to integrate the Deno runtime and the Supabase JS library with your project:
// https://docs.supabase.com/guides/functions/getting-started

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
    const { action, userId, email } = body;
    
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
