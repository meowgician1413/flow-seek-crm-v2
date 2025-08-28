export type NotificationType = 
  | 'new_lead'
  | 'follow_up_due'
  | 'content_viewed'
  | 'high_engagement'
  | 'integration_error'
  | 'daily_summary'
  | 'system_maintenance'
  | 'account_limit'
  | 'security_alert'
  | 'feature_update';

export type NotificationMethod = 'browser' | 'email' | 'push';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type: NotificationType;
  enabled: boolean;
  method: NotificationMethod;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  emailDigestFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  doNotDisturb: boolean;
}