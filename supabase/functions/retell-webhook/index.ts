
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the webhook data
    const webhookData = await req.json();
    console.log('Received Retell webhook data:', webhookData);
    
    // Extract patient ID from query parameters
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patient_id');
    
    if (!patientId) {
      throw new Error('No patient ID provided in webhook URL');
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract relevant data from the webhook
    const { 
      call_id, 
      call_status, 
      conversation_id, 
      recording_url,
      transcript,
      function_calls = []
    } = webhookData;
    
    // Look for update_patient_response function calls
    let patientResponse = null;
    let callNotes = null;
    
    for (const functionCall of function_calls) {
      if (functionCall.name === 'update_patient_response') {
        const args = functionCall.arguments ? JSON.parse(functionCall.arguments) : {};
        patientResponse = args.response;
        callNotes = args.notes;
        break;
      }
    }
    
    // Update the patient record with the call information
    const patientUpdate = {
      voip_call_id: call_id,
      voip_call_status: call_status,
      voip_call_timestamp: new Date().toISOString(),
      call_transcript: transcript,
    };
    
    // If we have a response, update the patient's status
    if (patientResponse) {
      if (patientResponse === 'yes') {
        patientUpdate['status'] = 'Interested';
      } else if (patientResponse === 'no') {
        patientUpdate['status'] = 'Cold';
        patientUpdate['cold_reason'] = callNotes || 'Declined in AI call';
      } else if (patientResponse === 'maybe') {
        patientUpdate['status'] = 'Pending';
      }
      
      patientUpdate['last_interaction'] = new Date().toISOString();
      patientUpdate['last_interaction_outcome'] = patientResponse === 'yes' ? 'Yes' : 
                                                patientResponse === 'no' ? 'No' : 'Maybe';
      patientUpdate['interaction_rating'] = patientResponse === 'yes' ? 'Positive' : 
                                           patientResponse === 'no' ? 'Negative' : 'Neutral';
      
      if (callNotes) {
        patientUpdate['notes'] = callNotes;
      }
    }
    
    // Update the patient record
    const { data, error } = await supabase
      .from('patients')
      .update(patientUpdate)
      .eq('id', patientId);
      
    if (error) {
      console.error('Error updating patient record:', error);
      throw error;
    }
    
    console.log('Successfully updated patient record for ID:', patientId);
    
    // If the patient responded positively, create a follow-up record
    if (patientResponse === 'yes') {
      // Create a follow-up for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const followUpData = {
        patient_id: patientId,
        type: 'call',
        date: tomorrow.toISOString().split('T')[0],
        time: '09:00',
        notes: callNotes || 'Follow up after positive AI call response',
        response: null
      };
      
      const { data: followUpData, error: followUpError } = await supabase
        .from('follow_ups')
        .insert(followUpData);
        
      if (followUpError) {
        console.error('Error creating follow-up record:', followUpError);
      } else {
        console.log('Created follow-up record for patient:', patientId);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error processing Retell webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
