
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Get the Supabase URL and key from environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  // Create a Supabase client with the admin key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Handle domain activity recording
    if (req.url.includes("/domain-activity")) {
      const { scriptId, eventType, domain, url, visitorId, sessionId, userAgent, region, language } = await req.json();

      if (!scriptId || !eventType || !domain) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Insert domain activity record
      const { data, error } = await supabase.from("domain_activity").insert({
        script_id: scriptId,
        event_type: eventType,
        domain,
        url,
        visitor_id: visitorId,
        session_id: sessionId,
        user_agent: userAgent,
        region,
        language,
      });

      if (error) {
        console.error("Error inserting domain activity:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to record domain activity",
            details: error.message,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Domain activity recorded",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Handle analytics recording (update the existing analytics logic)
    else if (req.url.includes("/analytics")) {
      const { scriptId, action, domain, visitorId } = await req.json();

      if (!scriptId || !action) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // First, get the actual UUID id from consent_scripts table using the script_id
      const { data: scriptData, error: scriptError } = await supabase
        .from("consent_scripts")
        .select("id")
        .eq("script_id", scriptId)
        .single();

      if (scriptError || !scriptData) {
        console.error("Error finding script:", scriptError);
        return new Response(
          JSON.stringify({
            error: "Script not found",
            details: scriptError?.message || "No script found with this ID",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }

      const actualScriptId = scriptData.id;

      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0];

      // Check if an entry for today already exists for this script
      const { data: existingEntries, error: queryError } = await supabase
        .from("analytics")
        .select("*")
        .eq("script_id", actualScriptId)
        .eq("date", today);

      if (queryError) {
        console.error("Error querying analytics:", queryError);
        return new Response(
          JSON.stringify({
            error: "Failed to check existing analytics",
            details: queryError.message,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      // Track the unique visitors by checking if this visitor has been counted today
      const visitorAlreadyCounted = existingEntries?.some(entry => {
        // This is a simplified check; in a production system, you would store visitor IDs
        // in a separate table and check against that
        return entry.visitor_ids && entry.visitor_ids.includes(visitorId);
      });

      // Prepare increment values based on action
      let incrementValues: any = {};
      switch (action) {
        case "accept":
          incrementValues.accept_count = 1;
          break;
        case "reject":
          incrementValues.reject_count = 1;
          break;
        case "partial":
          incrementValues.partial_count = 1;
          break;
        // 'view' doesn't increment any specific counter but is tracked in domain_activity
      }

      // If this is a unique visitor for today, increment the visitor count
      if (!visitorAlreadyCounted) {
        incrementValues.visitor_count = 1;
      }

      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from("analytics")
          .update(incrementValues)
          .eq("id", existingEntries[0].id);

        if (updateError) {
          console.error("Error updating analytics:", updateError);
          return new Response(
            JSON.stringify({
              error: "Failed to update analytics",
              details: updateError.message,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
      } else {
        // Create new entry for today
        const newEntry = {
          script_id: actualScriptId,
          date: today,
          accept_count: action === "accept" ? 1 : 0,
          reject_count: action === "reject" ? 1 : 0,
          partial_count: action === "partial" ? 1 : 0,
          visitor_count: 1, // First visitor of the day
        };

        const { error: insertError } = await supabase.from("analytics").insert(newEntry);

        if (insertError) {
          console.error("Error inserting analytics:", insertError);
          return new Response(
            JSON.stringify({
              error: "Failed to insert analytics",
              details: insertError.message,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Analytics recorded",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Handle ping requests (update last seen)
    else if (req.url.includes("/ping")) {
      const requestBody = await req.json();
      const { scriptId, domain, visitorId, sessionId, userAgent, region, language } = requestBody;

      if (!scriptId || !domain) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Record ping as domain activity
      await supabase.from("domain_activity").insert({
        script_id: scriptId,
        event_type: 'ping',
        domain,
        visitor_id: visitorId || null,
        session_id: sessionId || null,
        user_agent: userAgent || null,
        region: region || 'other',
        language: language || null,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Ping recorded",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Handle unknown endpoints
    return new Response(
      JSON.stringify({
        error: "Unknown endpoint",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
