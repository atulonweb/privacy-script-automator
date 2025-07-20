import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handleOptions = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

const handleRequest = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { action, userId, plan } = body;
    
    // Create Supabase client using service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    if (action === 'get_user_plan') {
      if (!userId) {
        throw new Error('Missing userId');
      }
      
      console.log('Fetching plan for user:', userId);
      
      const { data: subscription, error } = await supabaseAdmin
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user plan:', error);
        throw new Error(`Failed to fetch plan: ${error.message}`);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          plan: subscription?.plan || 'free'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    if (action === 'update_user_plan') {
      if (!userId || !plan) {
        throw new Error('Missing userId or plan');
      }
      
      console.log('Updating plan for user:', userId, 'to plan:', plan);
      
      // First check if a subscription already exists
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
      } else {
        // Insert new subscription
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
    }
    
    throw new Error('Invalid action');
    
  } catch (error) {
    console.error('Error in user-plans function:', error);
    
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
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }
  
  return handleRequest(req);
});