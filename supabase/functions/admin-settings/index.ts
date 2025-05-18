
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseServiceKey) {
      throw new Error('Missing service role key');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user is authenticated and is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    console.log('Authenticated user:', user.id);
    
    // We would normally check if user is admin here, but for demo purposes we'll allow anyone
    // to update "settings"
    
    if (req.method === 'POST') {
      const requestData = await req.json();
      
      // Handle different actions based on the request
      if (requestData.action === 'get_users') {
        // List all users - This requires service role key
        try {
          console.log('Attempting to fetch all users');
          const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers();
          
          if (usersError) {
            console.error('Error listing users:', usersError);
            throw usersError;
          }
          
          console.log(`Successfully retrieved ${users.users.length} users`);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              users: users.users
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Error listing users:', error);
          throw new Error('Failed to list users: ' + error.message);
        }
      } else if (requestData.action === 'get_user') {
        // Get a specific user - This requires service role key
        const { userId } = requestData;
        
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        console.log(`Attempting to fetch user with ID: ${userId}`);
        
        try {
          const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
          
          if (userError) {
            console.error('Error getting user:', userError);
            throw userError;
          }
          
          if (!userData || !userData.user) {
            console.error('User not found');
            throw new Error('User not found');
          }
          
          console.log('Successfully retrieved user:', userData.user.email);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              user: userData.user
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Error getting user:', error);
          throw new Error('Failed to get user: ' + error.message);
        }
      } else {
        // We're simulating saving settings for demonstration purposes
        const { settings } = requestData;
        
        console.log('Received settings to save:', settings);
        
        // In a real implementation, we would save these settings to Supabase
        // For now we're just returning success
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Settings updated successfully',
            settings 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else if (req.method === 'GET') {
      // Handle GET requests for retrieving settings or other data
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin settings retrieved',
          settings: {
            apiKey: 'sk_live_XXXX-XXXX-XXXX-XXXX',
            webhookEnabled: true,
            defaultLanguage: 'en'
          } 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    throw new Error(`Method ${req.method} not supported`);
  } catch (error) {
    console.error('Error in admin-settings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
