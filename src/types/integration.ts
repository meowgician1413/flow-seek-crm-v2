export interface LeadSource {
  id: string;
  user_id: string;
  name: string;
  type: 'website' | 'facebook' | 'google_forms' | 'linkedin' | 'manual' | 'webhook';
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  source_id: string;
  status: 'success' | 'error' | 'pending';
  payload?: Record<string, any>;
  error_message?: string;
  created_at: string;
}

export interface IntegrationStats {
  total_leads: number;
  success_rate: number;
  recent_leads: number;
  last_activity?: string;
}