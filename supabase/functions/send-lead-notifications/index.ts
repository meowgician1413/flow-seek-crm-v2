import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationData {
  userId: string;
  leadData: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source: string;
    notes?: string;
    lead_score?: number;
    priority?: string;
  };
  notificationType: 'new_lead' | 'high_priority_lead' | 'integration_alert';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { userId, leadData, notificationType }: NotificationData = await req.json();

    console.log('Sending notification:', { userId, leadData, notificationType });

    // Get user's email from auth.users
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !userData.user?.email) {
      throw new Error('Could not find user email');
    }

    const userEmail = userData.user.email;

    // Generate email content based on notification type
    let subject: string;
    let htmlContent: string;

    switch (notificationType) {
      case 'new_lead':
        subject = `🎯 New Lead: ${leadData.name}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎯 New Lead Alert</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">New lead from ${leadData.source}</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #495057; margin-top: 0;">Lead Details:</h3>
                <p><strong>Name:</strong> ${leadData.name}</p>
                ${leadData.email ? `<p><strong>Email:</strong> ${leadData.email}</p>` : ''}
                ${leadData.phone ? `<p><strong>Phone:</strong> ${leadData.phone}</p>` : ''}
                ${leadData.company ? `<p><strong>Company:</strong> ${leadData.company}</p>` : ''}
                <p><strong>Source:</strong> ${leadData.source}</p>
                ${leadData.lead_score ? `<p><strong>AI Score:</strong> ${leadData.lead_score}/100</p>` : ''}
                ${leadData.priority ? `
                  <p><strong>Priority:</strong> 
                    <span style="background: ${leadData.priority === 'high' ? '#dc3545' : leadData.priority === 'medium' ? '#ffc107' : '#28a745'}; 
                                 color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                      ${leadData.priority.toUpperCase()}
                    </span>
                  </p>
                ` : ''}
                ${leadData.notes ? `<p><strong>Notes:</strong> ${leadData.notes}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'your-app-url'}/leads" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Lead in CRM
                </a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px; text-align: center; margin-bottom: 0;">
                This is an automated notification from your LeadFlow CRM integration system.
              </p>
            </div>
          </div>
        `;
        break;

      case 'high_priority_lead':
        subject = `🚨 HIGH PRIORITY Lead: ${leadData.name} (Score: ${leadData.lead_score}/100)`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚨 HIGH PRIORITY LEAD</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 5px solid #dc3545;">
              <h2 style="color: #dc3545; margin-top: 0;">Immediate Attention Required!</h2>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">High-Value Lead Detected (Score: ${leadData.lead_score}/100)</h3>
                <p><strong>Name:</strong> ${leadData.name}</p>
                ${leadData.email ? `<p><strong>Email:</strong> ${leadData.email}</p>` : ''}
                ${leadData.phone ? `<p><strong>Phone:</strong> ${leadData.phone}</p>` : ''}
                ${leadData.company ? `<p><strong>Company:</strong> ${leadData.company}</p>` : ''}
                <p><strong>Source:</strong> ${leadData.source}</p>
                ${leadData.notes ? `<p><strong>Notes:</strong> ${leadData.notes}</p>` : ''}
              </div>
              
              <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #0c5460;"><strong>💡 Recommendation:</strong> Contact this lead within the next hour for best conversion results!</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'your-app-url'}/leads" 
                   style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  🚀 CONTACT NOW
                </a>
              </div>
            </div>
          </div>
        `;
        break;

      case 'integration_alert':
        subject = `⚠️ Integration Alert - ${leadData.source}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Integration Alert</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Integration Issue Detected</h2>
              <p>There was an issue with your <strong>${leadData.source}</strong> integration.</p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Lead Data:</strong> ${JSON.stringify(leadData, null, 2)}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'your-app-url'}/integrations" 
                   style="background: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Check Integration Status
                </a>
              </div>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: 'LeadFlow CRM <notifications@resend.dev>',
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the notification
    await supabaseClient
      .from('integration_logs')
      .insert({
        source_id: null,
        status: 'success',
        payload: {
          action: 'email_notification',
          notification_type: notificationType,
          recipient: userEmail,
          lead_name: leadData.name,
          email_id: emailResponse.data?.id
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-lead-notifications function:', error);
    
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
          error_message: `Email notification failed: ${error.message}`
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send notification' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});