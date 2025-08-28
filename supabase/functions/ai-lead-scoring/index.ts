import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadScoringData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  source: string;
  lead_value?: number;
}

const scoreLeadWithAI = async (leadData: LeadScoringData): Promise<{ score: number; reasoning: string; priority: 'high' | 'medium' | 'low' }> => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const prompt = `
Analyze this lead and provide a score from 0-100 based on their potential value and conversion likelihood.

Lead Information:
- Name: ${leadData.name}
- Email: ${leadData.email || 'Not provided'}
- Phone: ${leadData.phone || 'Not provided'} 
- Company: ${leadData.company || 'Not provided'}
- Source: ${leadData.source}
- Notes: ${leadData.notes || 'No additional notes'}
- Current Value Estimate: $${leadData.lead_value || 0}

Consider these factors:
1. Completeness of contact information (email + phone = higher score)
2. Company presence (business leads typically score higher)
3. Lead source quality (referrals > organic > paid ads > cold outreach)
4. Engagement indicators from notes
5. Professional email domains vs personal emails

Respond with ONLY a JSON object in this exact format:
{
  "score": number (0-100),
  "reasoning": "Brief explanation of the score",
  "priority": "high" | "medium" | "low"
}

Scoring Guidelines:
- 80-100: High priority (complete info, business email, engaged)
- 50-79: Medium priority (missing some info but shows interest)
- 0-49: Low priority (incomplete info, low engagement signals)
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
            content: 'You are an expert lead scoring analyst. Analyze leads objectively and provide accurate scores based on conversion potential.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return {
        score: Math.max(0, Math.min(100, parsedResponse.score)), // Ensure score is between 0-100
        reasoning: parsedResponse.reasoning || 'AI analysis completed',
        priority: parsedResponse.priority || 'medium'
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback scoring based on available data
      let fallbackScore = 30; // Base score
      
      if (leadData.email) fallbackScore += 20;
      if (leadData.phone) fallbackScore += 15;
      if (leadData.company) fallbackScore += 20;
      if (leadData.email?.includes('@') && !leadData.email.match(/@(gmail|yahoo|hotmail|outlook)\.com$/)) {
        fallbackScore += 15; // Business email bonus
      }
      
      return {
        score: Math.min(100, fallbackScore),
        reasoning: 'Fallback scoring based on data completeness',
        priority: fallbackScore >= 70 ? 'high' : fallbackScore >= 50 ? 'medium' : 'low'
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to score lead with AI');
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

    console.log('Scoring lead:', leadId, leadData);

    // Score the lead with AI
    const scoringResult = await scoreLeadWithAI(leadData);
    
    console.log('AI scoring result:', scoringResult);

    // Update the lead with the new score and priority
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({
        lead_score: scoringResult.score,
        priority: scoringResult.priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead score:', updateError);
      throw updateError;
    }

    // Log the scoring activity
    await supabaseClient
      .from('integration_logs')
      .insert({
        source_id: null,
        status: 'success',
        payload: {
          action: 'ai_lead_scoring',
          lead_id: leadId,
          score: scoringResult.score,
          priority: scoringResult.priority,
          reasoning: scoringResult.reasoning
        }
      });

    return new Response(JSON.stringify({
      success: true,
      score: scoringResult.score,
      priority: scoringResult.priority,
      reasoning: scoringResult.reasoning
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-lead-scoring function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});