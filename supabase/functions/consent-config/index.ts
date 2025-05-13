
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
