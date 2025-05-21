
// Follow this setup guide to integrate the Deno runtime and the Supabase JS library with your project:
// https://docs.supabase.com/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Set up CORS headers for this request
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { userId, plan } = body;
    
    if (!userId || !plan) {
      throw new Error('Missing required fields: userId and plan');
    }
    
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
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Authenticated user:', user.id);

    // Verify admin status using raw app metadata instead of the is_admin function
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    
    const isAdmin = userData?.user?.app_metadata?.role === 'admin';
    if (!isAdmin) {
      throw new Error('User is not an admin');
    }

    // Update the user's subscription plan
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan: plan,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
      
    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully updated user plan to ${plan}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in admin-plans function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
};

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
