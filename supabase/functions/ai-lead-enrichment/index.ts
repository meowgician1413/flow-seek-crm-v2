import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadEnrichmentData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  source: string;
}

const enrichLeadWithAI = async (leadData: LeadEnrichmentData) => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const prompt = `
Analyze this lead information and provide enrichment insights that would help with sales and outreach.

Lead Information:
- Name: ${leadData.name}
- Email: ${leadData.email || 'Not provided'}
- Phone: ${leadData.phone || 'Not provided'}
- Company: ${leadData.company || 'Not provided'}
- Source: ${leadData.source}
- Notes: ${leadData.notes || 'No additional notes'}

Based on the available information, provide insights about:
1. Industry/Market Analysis: What industry might this lead be in based on available data?
2. Personalization Opportunities: What personalized talking points could be used?
3. Outreach Strategy: What's the best approach for initial contact?
4. Pain Points: What business challenges might they face?
5. Value Proposition: What benefits would resonate most?
6. Timing: What might be the best time/approach for outreach?
7. Next Actions: Specific recommended follow-up steps

Respond with ONLY a JSON object in this format:
{
  "industry_analysis": "Brief industry insights",
  "personalization_tips": ["tip1", "tip2", "tip3"],
  "outreach_strategy": "Recommended approach",
  "potential_pain_points": ["pain1", "pain2"],
  "value_propositions": ["value1", "value2"],
  "timing_recommendations": "Best timing approach",
  "next_actions": ["action1", "action2", "action3"],
  "confidence_score": number (0-100)
}

Be specific and actionable. If information is limited, focus on general best practices for the lead type.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert sales strategist and lead analyst. Provide actionable insights for sales teams.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      const enrichmentData = JSON.parse(aiResponse);
      return {
        ...enrichmentData,
        enriched_at: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback enrichment based on available data
      return {
        industry_analysis: leadData.company ? `${leadData.company} appears to be a business entity` : 'Individual lead',
        personalization_tips: [
          `Reference their ${leadData.source} source`,
          leadData.company ? `Mention their company ${leadData.company}` : 'Focus on personal benefits'
        ],
        outreach_strategy: leadData.phone ? 'Phone call followed by email' : 'Professional email outreach',
        potential_pain_points: ['Time management', 'Efficiency improvements'],
        value_propositions: ['Cost savings', 'Time efficiency'],
        timing_recommendations: 'Business hours, Tuesday-Thursday',
        next_actions: ['Send personalized email', 'Follow up within 24 hours'],
        confidence_score: 60,
        enriched_at: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to enrich lead with AI');
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { leadId, leadData } = await req.json();

    console.log('Enriching lead:', leadId, leadData);

    // Enrich the lead with AI
    const enrichmentResult = await enrichLeadWithAI(leadData);
    
    console.log('AI enrichment result:', enrichmentResult);

    // Create enrichment data to store
    const enrichmentPayload = {
      lead_id: leadId,
      enrichment_data: enrichmentResult,
      created_at: new Date().toISOString()
    };

    // Store enrichment data in a new table or update the lead
    // For now, we'll add it to the lead's notes and store in logs
    const enrichmentSummary = `
AI Insights (${new Date().toLocaleDateString()}):
• Industry: ${enrichmentResult.industry_analysis}
• Strategy: ${enrichmentResult.outreach_strategy}
• Pain Points: ${enrichmentResult.potential_pain_points?.join(', ')}
• Best Timing: ${enrichmentResult.timing_recommendations}
• Confidence: ${enrichmentResult.confidence_score}%
    `;

    // Update lead with enrichment summary
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({
        notes: leadData.notes ? `${leadData.notes}\n\n${enrichmentSummary}` : enrichmentSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead with enrichment:', updateError);
    }

    // Log the enrichment activity with full data
    await supabaseClient
      .from('integration_logs')
      .insert({
        source_id: null,
        status: 'success',
        payload: {
          action: 'ai_lead_enrichment',
          lead_id: leadId,
          enrichment_data: enrichmentResult
        }
      });

    return new Response(JSON.stringify({
      success: true,
      enrichment: enrichmentResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-lead-enrichment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});