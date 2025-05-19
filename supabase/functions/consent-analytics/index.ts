
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()
    
    // Parse the request body
    const body = await req.json()
    
    if (path === 'analytics') {
      // Record consent event (accept/reject/partial)
      const { scriptId, action, domain, timestamp, region, visitorId, sessionId } = body
      
      if (!scriptId) {
        return new Response(
          JSON.stringify({ error: 'Missing script ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the script to find the website_id
      const { data: script, error: scriptError } = await supabase
        .from('consent_scripts')
        .select('website_id')
        .eq('script_id', scriptId)
        .single()

      if (scriptError || !script) {
        console.error('Error finding script:', scriptError)
        return new Response(
          JSON.stringify({ error: 'Script not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get today's date in YYYY-MM-DD format for analytics entry
      const today = new Date().toISOString().split('T')[0]

      // Try to get existing analytics record for today
      const { data: existingAnalytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('script_id', scriptId)
        .eq('date', today)
        .maybeSingle()

      if (analyticsError) {
        console.error('Error checking analytics:', analyticsError)
      }

      if (existingAnalytics) {
        // Update existing analytics record
        const updateData: any = {
          updated_at: new Date().toISOString(),
        }
        
        // Increment the appropriate counter based on action
        if (action === 'accept') {
          updateData.accept_count = existingAnalytics.accept_count + 1
        } else if (action === 'reject') {
          updateData.reject_count = existingAnalytics.reject_count + 1
        } else if (action === 'partial') {
          updateData.partial_count = existingAnalytics.partial_count + 1
        }
        
        // Increment visitor count if this is a new visitor
        // In a real system, we would check if this visitor was already counted today
        updateData.visitor_count = existingAnalytics.visitor_count + 1
        
        const { error: updateError } = await supabase
          .from('analytics')
          .update(updateData)
          .eq('id', existingAnalytics.id)

        if (updateError) {
          console.error('Error updating analytics:', updateError)
        }
      } else {
        // Create new analytics record for today
        const analyticsData: any = {
          script_id: scriptId,
          date: today,
          visitor_count: 1,
          accept_count: action === 'accept' ? 1 : 0,
          reject_count: action === 'reject' ? 1 : 0,
          partial_count: action === 'partial' ? 1 : 0
        }

        const { error: insertError } = await supabase
          .from('analytics')
          .insert(analyticsData)

        if (insertError) {
          console.error('Error inserting analytics:', insertError)
        }
      }

      // Store the detailed event in a new domain_events table for more granular analysis
      // This would be implemented in a production system
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (path === 'ping') {
      // Record domain ping (last seen)
      const { scriptId, domain, timestamp, region, visitorId, sessionId, userAgent, language } = body
      
      if (!scriptId) {
        return new Response(
          JSON.stringify({ error: 'Missing script ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the script to find the website_id
      const { data: script, error: scriptError } = await supabase
        .from('consent_scripts')
        .select('website_id')
        .eq('script_id', scriptId)
        .single()

      if (scriptError || !script) {
        console.error('Error finding script:', scriptError)
        return new Response(
          JSON.stringify({ error: 'Script not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update the website with last_seen timestamp
      // In a real system, we would have a dedicated domain_activity table
      const { error: updateError } = await supabase
        .from('websites')
        .update({ 
          updated_at: new Date().toISOString(),
          // In a production system, we would store additional metadata
          // like geo distribution, browser info, etc.
        })
        .eq('id', script.website_id)

      if (updateError) {
        console.error('Error updating website last seen:', updateError)
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default response for unknown paths
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
