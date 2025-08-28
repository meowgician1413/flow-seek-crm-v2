import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUpData {
  leadId: string;
  leadData: {
    name: string;
    email: string;
    company?: string;
    source: string;
    lead_score?: number;
    priority?: string;
    notes?: string;
  };
  userId: string;
  followUpType: 'welcome' | 'nurture' | 'reminder' | 'custom';
  customMessage?: string;
}

const generatePersonalizedEmail = async (leadData: FollowUpData['leadData'], followUpType: string, customMessage?: string) => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const prompt = `
Generate a personalized follow-up email for this lead:

Lead Information:
- Name: ${leadData.name}
- Company: ${leadData.company || 'Individual'}
- Source: ${leadData.source}
- Priority: ${leadData.priority || 'medium'}
- Score: ${leadData.lead_score || 'not scored'}/100
- Notes: ${leadData.notes || 'None'}

Follow-up Type: ${followUpType}
${customMessage ? `Custom Message Guidance: ${customMessage}` : ''}

Requirements:
- Professional yet friendly tone
- Personalized to their information
- Clear call-to-action
- Value-focused approach
- Keep it concise (2-3 paragraphs max)

Generate:
1. Subject line
2. Email body (HTML format)
3. Call-to-action recommendation

Respond with ONLY a JSON object in this format:
{
  "subject": "Email subject line",
  "html_body": "Complete HTML email body with proper formatting",
  "cta_recommendation": "Suggested next action"
}

Make it genuine and helpful, not pushy or salesy.
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
            content: 'You are an expert email marketing specialist. Create professional, personalized follow-up emails that build relationships and provide value.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback email template
      return {
        subject: `Following up - ${leadData.name}`,
        html_body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p>Hi ${leadData.name},</p>
            
            <p>I wanted to follow up regarding your recent inquiry through ${leadData.source}. 
            ${leadData.company ? `I see you're with ${leadData.company}` : 'I hope this message finds you well'}.</p>
            
            <p>I'd love to learn more about your needs and see how we might be able to help. 
            Would you be available for a brief conversation this week?</p>
            
            <p>Best regards,<br>
            Your Sales Team</p>
          </div>
        `,
        cta_recommendation: 'Schedule a brief call to discuss their needs'
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate personalized email');
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize services
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { leadId, leadData, userId, followUpType, customMessage }: FollowUpData = await req.json();

    console.log('Generating follow-up for lead:', leadId, followUpType);

    if (!leadData.email) {
      throw new Error('Lead email is required for follow-up');
    }

    // Generate personalized email content with AI
    const emailContent = await generatePersonalizedEmail(leadData, followUpType, customMessage);
    
    console.log('Generated email content:', emailContent);

    // Get user's information for the 'from' field
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
      throw new Error('Could not find user information');
    }

    const fromName = userData.user.user_metadata?.full_name || 'Your CRM Team';
    const replyToEmail = userData.user.email;

    // Send the follow-up email
    const emailResponse = await resend.emails.send({
      from: `${fromName} <followup@resend.dev>`,
      to: [leadData.email],
      replyTo: replyToEmail,
      subject: emailContent.subject,
      html: emailContent.html_body,
    });

    console.log('Follow-up email sent successfully:', emailResponse);

    // Log the follow-up activity
    await supabaseClient
      .from('integration_logs')
      .insert({
        source_id: null,
        status: 'success',
        payload: {
          action: 'automated_followup',
          follow_up_type: followUpType,
          lead_id: leadId,
          lead_email: leadData.email,
          email_id: emailResponse.data?.id,
          subject: emailContent.subject,
          cta_recommendation: emailContent.cta_recommendation
        }
      });

    // Update lead with follow-up activity
    const followUpNote = `Follow-up sent (${followUpType}): ${emailContent.subject} - ${new Date().toLocaleString()}`;
    
    await supabaseClient
      .from('leads')
      .update({
        notes: leadData.notes ? `${leadData.notes}\n${followUpNote}` : followUpNote,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      subject: emailContent.subject,
      cta_recommendation: emailContent.cta_recommendation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in automated-followups function:', error);
    
    // Log the error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );
      
      await supabaseClient
        .from('integration_logs')
        .insert({
          source_id: null,
          status: 'error',
          payload: {},
          error_message: `Automated follow-up failed: ${error.message}`
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send follow-up' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});