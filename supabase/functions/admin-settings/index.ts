
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

// CORS headers for public access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the admin key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Utility for generating HMAC signatures for webhooks
function generateHmacSignature(payload: object, secret: string): string {
  const payloadString = JSON.stringify(payload);
  const hmac = createHmac('sha256', secret);
  hmac.update(payloadString);
  return hmac.digest('hex');
}

// Function to deliver webhook
async function deliverWebhook(
  webhookUrl: string,
  payload: object,
  secret?: string,
  isTest = false
): Promise<{ status: string; statusCode: number | null; error?: string }> {
  try {
    // Generate HMAC signature if secret is provided
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (secret) {
      const signature = generateHmacSignature(payload, secret);
      headers["X-Signature"] = signature;
    }

    // Add test header if this is a test delivery
    if (isTest) {
      headers["X-Test"] = "true";
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    // Get response body for logging
    const responseText = await response.text();

    if (response.ok) {
      return { status: "success", statusCode: response.status, response: responseText };
    } else {
      return { 
        status: "error", 
        statusCode: response.status, 
        error: `HTTP error: ${response.status} ${response.statusText}`,
        response: responseText 
      };
    }
  } catch (error: any) {
    return {
      status: "error",
      statusCode: null,
      error: error.message || "Unknown error occurred",
    };
  }
}

// Check if the user has admin privileges
async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Get the user
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return false;
    }
    
    // Check if the user has admin role
    return user.user?.app_metadata?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Main handler for the edge function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is missing" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Bearer token is missing" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify the user's session
    const { data: { user }, error: sessionError } = await supabaseAdmin.auth.getUser(token);
    if (sessionError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Authenticated user:", user.id);
    
    // Check if the user is an admin
    const admin = await isAdmin(user.id);
    if (!admin) {
      return new Response(
        JSON.stringify({ error: "Admin privileges required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    
    // Handle different actions
    if (requestData.action === "get_user") {
      const userId = requestData.userId;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      console.log("Attempting to fetch user with ID:", userId);
      
      // Get the user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userError || !userData) {
        return new Response(
          JSON.stringify({ error: `Error getting user: ${userError?.message || "Unknown error"}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      console.log("Successfully retrieved user:", userData.user.email);
      
      return new Response(
        JSON.stringify({ user: {
          id: userData.user.id,
          email: userData.user.email,
          role: userData.user.app_metadata?.role || "user",
          created_at: userData.user.created_at
        }}),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    else if (requestData.action === "get_admins") {
      console.log("Attempting to fetch all users");
      
      // Get all users
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (usersError || !users) {
        return new Response(
          JSON.stringify({ error: `Error getting users: ${usersError?.message || "Unknown error"}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      // Filter for admin users
      const adminUsers = users.filter(user => user.app_metadata?.role === "admin");
      
      console.log(`Successfully retrieved ${adminUsers.length} users`);
      
      // Map to a simpler format with only necessary fields
      const admins = adminUsers.map(user => ({
        id: user.id,
        email: user.email,
        role: user.app_metadata?.role || "admin",
        created_at: user.created_at
      }));
      
      return new Response(
        JSON.stringify({ admins }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    else if (requestData.settings) {
      // Store settings in a table or use another method if available
      // This is a placeholder implementation
      console.log("Received admin settings:", requestData.settings);
      
      return new Response(
        JSON.stringify({ message: "Settings saved successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    else if (requestData.webhookId && requestData.test) {
      // Test a webhook
      const webhookId = requestData.webhookId;
      
      // Get the webhook details
      const { data: webhook, error: webhookError } = await supabaseAdmin
        .from("webhooks")
        .select("*")
        .eq("id", webhookId)
        .single();
      
      if (webhookError || !webhook) {
        return new Response(
          JSON.stringify({ error: `Error getting webhook: ${webhookError?.message || "Webhook not found"}` }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      // Create test payload
      const testPayload = {
        event: "test_event",
        timestamp: new Date().toISOString(),
        data: {
          message: "This is a test webhook delivery",
          webhook_id: webhook.id
        }
      };
      
      // Deliver the webhook
      const deliveryResult = await deliverWebhook(
        webhook.url,
        testPayload,
        webhook.secret,
        true
      );
      
      // Log the result
      const logEntry = {
        webhook_id: webhook.id,
        status: deliveryResult.status,
        status_code: deliveryResult.statusCode,
        error_message: deliveryResult.error,
        is_test: true,
        request_payload: testPayload,
        response_body: deliveryResult.response || null,
      };
      
      // Store log in database
      const { data: log, error: logError } = await supabaseAdmin
        .from("webhook_logs")
        .insert(logEntry)
        .select()
        .single();
      
      if (logError) {
        console.error("Error storing webhook log:", logError);
      }
      
      return new Response(
        JSON.stringify({ 
          status: deliveryResult.status, 
          message: deliveryResult.status === "success" ? 
            "Webhook test delivered successfully" : 
            `Webhook test failed: ${deliveryResult.error || "Unknown error"}`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
