
// Follow Supabase Edge Functions pattern
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { patientId, patientPhone, patientName, scriptText } = await req.json()
    
    // Validate required fields
    if (!patientId || !patientPhone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // TODO: Implement actual Voximplant API integration
    // For now, we'll create a mock response
    
    // Generate a unique call ID
    const callId = `vox-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const timestamp = new Date().toISOString()
    
    // Update the patient record with call information
    const { data, error } = await supabase
      .from('patients')
      .update({
        voip_call_id: callId,
        voip_call_status: 'scheduled',
        voip_call_timestamp: timestamp,
      })
      .eq('id', patientId)
      .select()
    
    if (error) {
      console.error('Error updating patient record:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update patient record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        callId, 
        status: 'scheduled', 
        timestamp,
        message: 'Call scheduled successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error handling request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
