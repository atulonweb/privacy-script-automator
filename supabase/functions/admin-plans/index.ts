
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

    // First check if a subscription already exists for this user
    const { data: existingSubscription, error: fetchError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error checking existing subscription:', fetchError);
      throw new Error(`Failed to check subscription: ${fetchError.message}`);
    }
    
    let result;
    
    if (existingSubscription) {
      // Update existing subscription
      console.log('Updating existing subscription for user:', userId);
      const { data: updatedSubscription, error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          plan: plan,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }
      
      result = updatedSubscription;
      console.log('Successfully updated subscription:', result);
    } else {
      // Insert new subscription
      console.log('Creating new subscription for user:', userId);
      const { data: newSubscription, error: insertError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan: plan,
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (insertError) {
        console.error('Error creating subscription:', insertError);
        throw new Error(`Failed to create subscription: ${insertError.message}`);
      }
      
      result = newSubscription;
      console.log('Successfully created subscription:', result);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully updated user plan to ${plan}`,
        data: result
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
