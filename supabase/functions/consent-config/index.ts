
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
  secret?: string
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

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { status: "success", statusCode: response.status };
    } else {
      return {
        status: "error",
        statusCode: response.status,
        error: `HTTP error: ${response.status} ${response.statusText}`,
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

    // Parse the request body
    const { scriptId, event, data } = await req.json();

    if (!scriptId) {
      return new Response(
        JSON.stringify({ error: "Script ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!event) {
      return new Response(
        JSON.stringify({ error: "Event name is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the script details
    const { data: script, error: scriptError } = await supabaseAdmin
      .from("consent_scripts")
      .select("*, websites:website_id(id, name, user_id)")
      .eq("script_id", scriptId)
      .single();

    if (scriptError || !script) {
      return new Response(
        JSON.stringify({ error: "Script not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if the user owns the script
    if (script.websites.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get webhooks for this user and website
    const { data: webhooks, error: webhooksError } = await supabaseAdmin
      .from("webhooks")
      .select("*")
      .eq("user_id", user.id)
      .eq("enabled", true)
      .or(`website_id.eq.${script.website_id},website_id.is.null`);

    if (webhooksError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch webhooks" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No webhooks configured" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create the payload for the webhook
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      script_id: scriptId,
      website: {
        id: script.website_id,
        name: script.websites.name,
      },
      data: data || {},
    };

    // Send the webhook to all configured endpoints
    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        const result = await deliverWebhook(webhook.url, payload, webhook.secret);

        // Log the webhook delivery attempt
        await supabaseAdmin.from("webhook_logs").insert({
          webhook_id: webhook.id,
          status: result.status,
          status_code: result.statusCode,
          error_message: result.error,
          request_payload: payload,
          is_test: false,
        });

        return {
          webhook_id: webhook.id,
          url: webhook.url,
          status: result.status,
          error: result.error,
        };
      })
    );

    return new Response(
      JSON.stringify({ message: "Webhooks processed", results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
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
