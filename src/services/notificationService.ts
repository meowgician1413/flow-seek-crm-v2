import { supabase } from '@/integrations/supabase/client';
import { NotificationType } from '@/types/notification';

interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export const notificationService = {
  async createNotification(params: CreateNotificationParams) {
    try {
      const { data, error } = await supabase.functions.invoke('create-notification', {
        body: params
      });

      if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error calling notification service:', error);
      return { success: false, error };
    }
  },

  // Helper methods for common notification types
  async notifyNewLead(user_id: string, leadName: string, leadSource: string) {
    return this.createNotification({
      user_id,
      type: 'new_lead',
      title: '🎉 New Lead Received!',
      message: `${leadName} from ${leadSource} just joined your pipeline`,
      data: {
        leadName,
        leadSource,
        priority: 'high'
      }
    });
  },

  async notifyFollowUpDue(user_id: string, leadName: string, taskDescription: string) {
    return this.createNotification({
      user_id,
      type: 'follow_up_due',
      title: '⏰ Follow-up Due',
      message: `Time to follow up with ${leadName}: ${taskDescription}`,
      data: {
        leadName,
        taskDescription
      }
    });
  },

  async notifyContentViewed(user_id: string, leadName: string, contentTitle: string) {
    return this.createNotification({
      user_id,
      type: 'content_viewed',
      title: '👀 Content Viewed',
      message: `${leadName} just viewed "${contentTitle}"`,
      data: {
        leadName,
        contentTitle,
        priority: 'medium'
      }
    });
  },

  async notifyHighEngagement(user_id: string, leadName: string, engagementType: string) {
    return this.createNotification({
      user_id,
      type: 'high_engagement',
      title: '🔥 High Engagement Alert!',
      message: `${leadName} is showing high engagement: ${engagementType}`,
      data: {
        leadName,
        engagementType,
        priority: 'high'
      }
    });
  },

  async notifyIntegrationError(user_id: string, integration: string, error: string) {
    return this.createNotification({
      user_id,
      type: 'integration_error',
      title: '⚠️ Integration Issue',
      message: `Problem with ${integration}: ${error}`,
      data: {
        integration,
        error,
        priority: 'high'
      }
    });
  },

  async notifyDailySummary(user_id: string, newLeads: number, followUps: number, conversions: number) {
    return this.createNotification({
      user_id,
      type: 'daily_summary',
      title: '📊 Your Daily Summary',
      message: `Today: ${newLeads} new leads, ${followUps} follow-ups due, ${conversions} conversions`,
      data: {
        newLeads,
        followUps,
        conversions
      }
    });
  }
};