
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
    
    // Create Supabase admin client directly using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    console.log('Updating plan for user:', userId, 'to plan:', plan);

    // Update the user's subscription plan directly using admin client
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
