import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  company?: string;
  source?: string;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.pathname.split('/').pop();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required in URL path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse webhook payload
    let payload: WebhookPayload = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      // Try to parse as JSON anyway
      try {
        const text = await req.text();
        payload = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse payload:', e);
        payload = { raw_data: await req.text() };
      }
    }

    console.log('Received webhook payload:', payload);

    // Find the lead source for this user
    const { data: leadSources, error: sourceError } = await supabase
      .from('lead_sources')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (sourceError) {
      console.error('Error fetching lead sources:', sourceError);
      throw sourceError;
    }

    const leadSource = leadSources?.[0];
    if (!leadSource) {
      const errorMsg = 'No active lead source found for user';
      console.error(errorMsg);
      
      // Log the failed attempt
      await supabase.from('integration_logs').insert({
        source_id: null,
        status: 'error',
        payload,
        error_message: errorMsg
      });

      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract lead data from payload based on source config
    const config = leadSource.config || {};
    const fieldMapping = config.field_mapping || {};
    
    const leadData = {
      user_id: userId,
      name: payload[fieldMapping.name || 'name'] || payload.full_name || payload.firstName + ' ' + payload.lastName || 'Unknown',
      email: payload[fieldMapping.email || 'email'] || payload.email_address || null,
      phone: payload[fieldMapping.phone || 'phone'] || payload.phone_number || null,
      company: payload[fieldMapping.company || 'company'] || payload.organization || null,
      status: 'new',
      source: leadSource.name,
      notes: payload[fieldMapping.message || 'message'] || payload.comment || null,
      lead_value: 0,
      created_at: new Date().toISOString()
    };

    console.log('Processed lead data:', leadData);

    // Check for duplicate leads based on email or phone
    let existingLead = null;
    if (leadData.email) {
      const { data } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', userId)
        .eq('email', leadData.email)
        .limit(1);
      existingLead = data?.[0];
    }

    if (!existingLead && leadData.phone) {
      const { data } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', userId)
        .eq('phone', leadData.phone)
        .limit(1);
      existingLead = data?.[0];
    }

    let leadResult;
    if (existingLead) {
      // Update existing lead
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...leadData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
        .select()
        .single();
      
      if (error) throw error;
      leadResult = data;
      console.log('Updated existing lead:', leadResult.id);
    } else {
      // Create new lead
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();
      
      if (error) throw error;
      leadResult = data;
      console.log('Created new lead:', leadResult.id);
    }

    // Log successful integration
    await supabase.from('integration_logs').insert({
      source_id: leadSource.id,
      status: 'success',
      payload: {
        ...payload,
        processed_lead_id: leadResult.id,
        action: existingLead ? 'updated' : 'created'
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: leadResult.id,
        action: existingLead ? 'updated' : 'created'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('integration_logs').insert({
        source_id: null,
        status: 'error',
        payload: {},
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});