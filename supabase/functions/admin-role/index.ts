
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

serve(async (req) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  try {
    // Verify admin status
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Check if user is an admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      throw new Error('Only admins can manage other admins');
    }

    // Process based on HTTP method
    if (req.method === 'DELETE') {
      const { userId } = await req.json();
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Remove admin role
      const { data: userData, error: getUserError } = await supabaseClient.auth.admin.getUserById(userId);
      if (getUserError) throw getUserError;
      
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { app_metadata: { role: 'user' } }
      );
      
      if (updateError) throw updateError;
      
      return new Response(JSON.stringify({ message: 'Admin role removed successfully' }), {
        status: 200,
        headers,
      });
    }
    
    throw new Error(`Unsupported HTTP method: ${req.method}`);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers }
    );
  }
});
