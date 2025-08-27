export type CommunicationType = 'call' | 'sms' | 'email' | 'whatsapp' | 'meeting';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'completed';
export type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'snoozed';

export interface CommunicationLog {
  id: string;
  leadId: string;
  userId: string;
  type: CommunicationType;
  content?: string;
  subject?: string;
  templateId?: string;
  status: CommunicationStatus;
  duration?: number; // For calls in minutes
  scheduledFor?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  userId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: FollowUpStatus;
  type?: CommunicationType;
  relatedCommunicationId?: string;
  completedAt?: string;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationStats {
  totalCommunications: number;
  communicationsByType: Record<CommunicationType, number>;
  responseRate: number;
  averageResponseTime: number;
  lastCommunication?: CommunicationLog;
}

export interface QuickCommunicationData {
  type: CommunicationType;
  templateId?: string;
  content: string;
  subject?: string;
  scheduleFollowUp?: boolean;
  followUpDate?: string;
  followUpDescription?: string;
}