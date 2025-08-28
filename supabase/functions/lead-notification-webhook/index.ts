import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function is called by the webhook-receiver to send notifications
// when new leads are created through integrations
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { leadId, leadData, userId } = await req.json();

    console.log('Processing lead notification:', { leadId, leadData, userId });

    // First, score the lead with AI
    let leadScore = 0;
    let priority = 'medium';

    try {
      const scoringResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-lead-scoring`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          leadData
        }),
      });

      if (scoringResponse.ok) {
        const scoringResult = await scoringResponse.json();
        leadScore = scoringResult.score;
        priority = scoringResult.priority;
        console.log('Lead scored:', { leadScore, priority });
      }
    } catch (error) {
      console.error('Failed to score lead:', error);
    }

    // Determine notification type based on score
    let notificationType = 'new_lead';
    if (leadScore >= 80) {
      notificationType = 'high_priority_lead';
    }

    // Send email notification
    try {
      const notificationResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-lead-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          leadData: {
            ...leadData,
            lead_score: leadScore,
            priority
          },
          notificationType
        }),
      });

      if (notificationResponse.ok) {
        console.log('Notification sent successfully');
      } else {
        console.error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }

    // For high-priority leads, also enrich with AI
    if (leadScore >= 70) {
      try {
        const enrichmentResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-lead-enrichment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId,
            leadData
          }),
        });

        if (enrichmentResponse.ok) {
          console.log('High-priority lead enriched with AI');
        }
      } catch (error) {
        console.error('Failed to enrich lead:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed: {
        leadId,
        leadScore,
        priority,
        notificationType
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in lead-notification-webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});