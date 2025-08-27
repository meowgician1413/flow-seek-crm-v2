export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Advertisement' | 'Cold Call' | 'Email Campaign' | 'Other';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  userId: string;
  type: 'status_change' | 'note_added' | 'call' | 'email' | 'sms' | 'whatsapp' | 'meeting';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LeadFilters {
  search: string;
  status: LeadStatus | 'All';
  dateRange?: {
    start: string;
    end: string;
  };
}