
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Create a Supabase client
const supabaseUrl = 'https://rzmfwwkumniuwenammaj.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility for generating HMAC signatures for webhooks
function generateHmacSignature(payload: object, secret: string): string {
  const payloadString = JSON.stringify(payload);
  const hmac = createHmac('sha256', secret);
  hmac.update(payloadString);
  return hmac.digest('hex');
}

// Function to deliver webhook
async function deliverWebhook(
  userId: string, 
  scriptId: string, 
  action: string, 
  consentData: Record<string, boolean>,
  requestInfo: {
    ip?: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
  }
) {
  try {
    // Get the script details
    const { data: scriptData, error: scriptError } = await supabase
      .from('consent_scripts')
      .select('id, website_id, user_id')
      .eq('script_id', scriptId)
      .single();
    
    if (scriptError || !scriptData) {
      console.error('Error fetching script for webhook:', scriptError);
      return;
    }
    
    // Get webhook configuration
    const { data: webhookData, error: webhookError } = await supabase
      .from('webhooks')
      .select('url, secret, enabled, retry_count')
      .eq('user_id', scriptData.user_id)
      .eq('website_id', scriptData.website_id)
      .single();
    
    if (webhookError || !webhookData || !webhookData.enabled || !webhookData.url) {
      // Webhook not configured or disabled - silently exit
      return;
    }
    
    // Prepare webhook payload
    const payload = {
      event: `consent.${action}`,
      timestamp: new Date().toISOString(),
      siteId: scriptId,
      userId: requestInfo.userId || null,
      sessionId: requestInfo.sessionId || null,
      consent: consentData,
      ip: requestInfo.ip || null,
      userAgent: requestInfo.userAgent || null
    };
    
    // Generate HMAC signature if secret is provided
    const signature = webhookData.secret 
      ? generateHmacSignature(payload, webhookData.secret) 
      : null;
    
    // Headers for the webhook request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add signature header if available
    if (signature) {
      headers['X-Consent-Signature'] = signature;
    }
    
    // Send the webhook in the background
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          // Check if the URL is HTTPS (security requirement)
          if (!webhookData.url.startsWith('https://') && !webhookData.url.includes('localhost')) {
            // Log error about non-HTTPS URL
            await supabase
              .from('webhook_logs')
              .insert({
                webhook_id: webhookData.id,
                status: 'error',
                attempt: 1,
                error_message: 'Only HTTPS URLs are allowed for webhooks',
                request_payload: payload
              });
            return;
          }
          
          // Send the webhook
          const webhookResponse = await fetch(webhookData.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });
          
          // Log the webhook delivery attempt
          await supabase
            .from('webhook_logs')
            .insert({
              webhook_id: webhookData.id,
              status: webhookResponse.ok ? 'success' : 'error',
              status_code: webhookResponse.status,
              attempt: 1,
              error_message: webhookResponse.ok ? null : await webhookResponse.text().catch(() => 'Failed to read response'),
              request_payload: payload,
              response_body: webhookResponse.ok 
                ? await webhookResponse.text().catch(() => null) 
                : null
            });
          
          // If failed and retries are configured, trigger retry logic
          if (!webhookResponse.ok && webhookData.retry_count > 0) {
            // Implement retry logic with exponential backoff
            // This would be better handled by a separate retry service/function
            // For now, we'll just log the failure
            console.log(`Webhook delivery failed, would retry ${webhookData.retry_count} times`);
          }
        } catch (error) {
          // Log delivery failure
          await supabase
            .from('webhook_logs')
            .insert({
              webhook_id: webhookData.id,
              status: 'error',
              attempt: 1,
              error_message: error.message || 'Failed to deliver webhook',
              request_payload: payload
            });
          
          console.error('Error delivering webhook:', error);
        }
      })()
    );
  } catch (error) {
    console.error('Error in webhook delivery process:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  
  try {
    // Handle configuration requests (GET)
    if (req.method === 'GET' && url.pathname === '/consent-config') {
      const scriptId = url.searchParams.get('scriptId');
      
      if (!scriptId) {
        return new Response(
          JSON.stringify({ error: 'Script ID parameter required' }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Fetch configuration from database
      const { data, error } = await supabase
        .from('consent_scripts')
        .select(`
          banner_position, 
          banner_color, 
          text_color, 
          button_color, 
          button_text_color, 
          show_powered_by, 
          auto_hide, 
          auto_hide_time
        `)
        .eq('script_id', scriptId)
        .single();
      
      if (error || !data) {
        console.error('Error fetching configuration:', error);
        return new Response(
          JSON.stringify({ error: 'Configuration not found' }),
          { 
            status: 404, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Transform to camelCase for frontend
      const config = {
        bannerPosition: data.banner_position,
        bannerColor: data.banner_color,
        textColor: data.text_color,
        buttonColor: data.button_color,
        buttonTextColor: data.button_text_color,
        showPoweredBy: data.show_powered_by,
        autoHide: data.auto_hide,
        autoHideTime: data.auto_hide_time
      };
      
      return new Response(
        JSON.stringify(config),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Handle analytics recording (POST)
    else if (req.method === 'POST' && url.pathname === '/consent-config/analytics') {
      const body = await req.json();
      const { scriptId, action } = body;
      
      if (!scriptId || !action) {
        return new Response(
          JSON.stringify({ error: 'Script ID and action parameters required' }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Get the script UUID from script_id
      const { data: scriptData, error: scriptError } = await supabase
        .from('consent_scripts')
        .select('id')
        .eq('script_id', scriptId)
        .single();
      
      if (scriptError || !scriptData) {
        console.error('Error fetching script:', scriptError);
        return new Response(
          JSON.stringify({ error: 'Script not found' }),
          { 
            status: 404, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Get today's date in ISO format
      const today = new Date().toISOString().split('T')[0];
      
      // Check if analytics record exists for today
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('script_id', scriptData.id)
        .eq('date', today);
      
      if (analyticsError) {
        console.error('Error checking analytics:', analyticsError);
        return new Response(
          JSON.stringify({ error: 'Error checking analytics' }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Determine which counter to increment based on the action
      let updateData = {};
      
      if (action === 'view') {
        updateData = { visitor_count: 1 };
      } else if (action === 'accept') {
        updateData = { accept_count: 1 };
      } else if (action === 'reject') {
        updateData = { reject_count: 1 };
      } else if (action === 'partial') {
        updateData = { partial_count: 1 };
      }
      
      // Either update existing record or create a new one
      let result;
      
      if (analyticsData && analyticsData.length > 0) {
        // Update existing record
        const existingRecord = analyticsData[0];
        
        if (action === 'view') {
          result = await supabase
            .from('analytics')
            .update({ visitor_count: existingRecord.visitor_count + 1 })
            .eq('id', existingRecord.id);
        } else if (action === 'accept') {
          result = await supabase
            .from('analytics')
            .update({ accept_count: existingRecord.accept_count + 1 })
            .eq('id', existingRecord.id);
        } else if (action === 'reject') {
          result = await supabase
            .from('analytics')
            .update({ reject_count: existingRecord.reject_count + 1 })
            .eq('id', existingRecord.id);
        } else if (action === 'partial') {
          result = await supabase
            .from('analytics')
            .update({ partial_count: existingRecord.partial_count + 1 })
            .eq('id', existingRecord.id);
        }
      } else {
        // Create new record
        result = await supabase
          .from('analytics')
          .insert({
            script_id: scriptData.id,
            date: today,
            visitor_count: action === 'view' ? 1 : 0,
            accept_count: action === 'accept' ? 1 : 0,
            reject_count: action === 'reject' ? 1 : 0,
            partial_count: action === 'partial' ? 1 : 0
          });
      }
      
      if (result?.error) {
        console.error('Error recording analytics:', result.error);
        return new Response(
          JSON.stringify({ error: 'Error recording analytics' }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Handle webhooks for consent actions
      if (['accept', 'reject', 'partial'].includes(action)) {
        // Extract consent data if available
        const consentData = body.consent || {};
        
        // Get request information
        const requestInfo = {
          ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
          userAgent: req.headers.get('user-agent'),
          userId: body.userId,
          sessionId: body.sessionId
        };
        
        // Trigger webhook delivery (async, doesn't block response)
        deliverWebhook(scriptData.user_id, scriptId, action, consentData, requestInfo);
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Handle webhook test endpoint
    else if (req.method === 'POST' && url.pathname === '/consent-config/test-webhook') {
      // This endpoint is for authenticated users only
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Extract token
      const token = authHeader.split(' ')[1];
      
      // Verify token and get user
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Parse request body
      const body = await req.json();
      const { webhookId } = body;
      
      if (!webhookId) {
        return new Response(
          JSON.stringify({ error: 'Webhook ID required' }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Get webhook details
      const { data: webhook, error: webhookError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', webhookId)
        .eq('user_id', user.id)
        .single();
      
      if (webhookError || !webhook) {
        return new Response(
          JSON.stringify({ error: 'Webhook not found' }),
          { 
            status: 404, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Prepare sample webhook payload
      const samplePayload = {
        event: "consent.test",
        timestamp: new Date().toISOString(),
        siteId: "test_site_id",
        userId: "test_user_id",
        sessionId: "test_session_id",
        consent: {
          necessary: true,
          analytics: true,
          functional: true,
          ads: false,
          social: false
        },
        ip: "192.0.2.1", // Example IP from TEST-NET-1
        userAgent: "ConsentGuard Test Webhook"
      };
      
      // Generate signature if secret is present
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (webhook.secret) {
        headers['X-Consent-Signature'] = generateHmacSignature(samplePayload, webhook.secret);
      }
      
      try {
        // Send test webhook
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(samplePayload)
        });
        
        // Log the test
        await supabase
          .from('webhook_logs')
          .insert({
            webhook_id: webhookId,
            status: response.ok ? 'success' : 'error',
            status_code: response.status,
            attempt: 1,
            is_test: true,
            error_message: response.ok ? null : await response.text().catch(() => 'Failed to read response'),
            request_payload: samplePayload,
            response_body: response.ok 
              ? await response.text().catch(() => null) 
              : null
          });
        
        // Return the test result
        return new Response(
          JSON.stringify({
            success: response.ok,
            status: response.status,
            response: response.ok 
              ? await response.text().catch(() => null) 
              : await response.text().catch(() => 'Failed to read response')
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      } catch (error) {
        // Log the error
        await supabase
          .from('webhook_logs')
          .insert({
            webhook_id: webhookId,
            status: 'error',
            attempt: 1,
            is_test: true,
            error_message: error.message || 'Failed to send webhook',
            request_payload: samplePayload
          });
        
        // Return the error
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || 'Failed to send webhook'
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    }
    
    // Handle unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
