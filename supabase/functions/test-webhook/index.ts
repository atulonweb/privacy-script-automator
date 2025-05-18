
import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// CORS headers for public access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Create a Supabase client with the admin key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Utility for generating HMAC signatures for webhooks
async function generateHmacSignature(payload: object, secret: string): Promise<string> {
  try {
    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadString);
    const key = encoder.encode(secret);
    
    // Create HMAC using SHA-256
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", hmacKey, data);
    
    // Convert ArrayBuffer to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error("Error generating HMAC signature:", error);
    throw new Error("Failed to generate signature");
  }
}

// Function to deliver webhook
async function deliverWebhook(
  webhookUrl: string,
  payload: object,
  secret?: string
): Promise<{ status: string; statusCode: number | null; error?: string; responseBody?: string }> {
  try {
    // Generate HMAC signature if secret is provided
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (secret) {
      try {
        const signature = await generateHmacSignature(payload, secret);
        headers["X-Signature"] = signature;
      } catch (sigError) {
        console.error("Failed to generate signature:", sigError);
        // Continue without signature if it fails
      }
    }

    console.log(`Delivering test webhook to ${webhookUrl}`);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    console.log(`Webhook delivery response: ${response.status} ${response.statusText}`);
    
    let responseBody: string | null = null;
    try {
      responseBody = await response.text();
      console.log(`Response body: ${responseBody}`);
    } catch (e) {
      console.error(`Couldn't read response body: ${e}`);
    }

    if (response.ok) {
      return { 
        status: "success", 
        statusCode: response.status, 
        responseBody: responseBody || undefined
      };
    } else {
      return {
        status: "error",
        statusCode: response.status,
        error: `HTTP error: ${response.status} ${response.statusText}`,
        responseBody: responseBody || undefined
      };
    }
  } catch (error: any) {
    console.error(`Error in webhook delivery: ${error.message}`);
    return {
      status: "error",
      statusCode: null,
      error: error.message || "Unknown error occurred",
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests - CRITICAL FIX
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content
      headers: corsHeaders
    });
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

    // Parse the request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { webhookId } = reqBody;

    if (!webhookId) {
      return new Response(
        JSON.stringify({ error: "Webhook ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Testing webhook with ID: ${webhookId}`);

    // Get the webhook details
    const { data: webhook, error: webhookError } = await supabaseAdmin
      .from("webhooks")
      .select("*")
      .eq("id", webhookId)
      .single();

    if (webhookError || !webhook) {
      console.error(`Webhook not found: ${webhookError?.message}`);
      return new Response(
        JSON.stringify({ error: "Webhook not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if the user owns the webhook
    if (webhook.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create a test payload - NO SCRIPT ID REQUIRED FOR TEST
    const payload = {
      event: "test_webhook",
      timestamp: new Date().toISOString(),
      test: true,
      webhook_id: webhookId,
      data: {
        message: "This is a test webhook",
      },
    };

    // Send the test webhook
    const result = await deliverWebhook(webhook.url, payload, webhook.secret);

    // Log the webhook delivery attempt
    await supabaseAdmin.from("webhook_logs").insert({
      webhook_id: webhook.id,
      status: result.status,
      status_code: result.statusCode,
      error_message: result.error,
      request_payload: payload,
      is_test: true,
      response_body: result.responseBody || null
    });

    return new Response(
      JSON.stringify({
        success: result.status === "success",
        status: result.status,
        message: result.status === "success" ? "Test webhook delivered successfully" : result.error,
      }),
      {
        status: result.status === "success" ? 200 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error(`Unexpected error: ${error.message}`);
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
