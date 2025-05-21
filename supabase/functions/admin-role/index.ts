
// Follow this setup guide to integrate the Deno runtime and the Supabase JS library with your project:
// https://docs.supabase.com/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { email } = await req.json()
    if (!email) {
      throw new Error('Email is required')
    }

    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (userError) {
        console.error('Error getting user:', userError);
        throw new Error(`Failed to get user: ${userError.message}`);
    }

    if (!user) {
        throw new Error('User not found');
    }

    const userId = user.user.id;

    // Update user's app_metadata to assign the admin role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { app_metadata: { role: 'admin' } }
    );

    if (error) {
      console.error('Error assigning admin role:', error);
      throw new Error(`Failed to assign admin role: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ message: `Admin role assigned to ${email}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
