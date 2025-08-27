export type ActivityType = 
  | 'call' 
  | 'email' 
  | 'sms' 
  | 'whatsapp' 
  | 'note' 
  | 'status_change' 
  | 'meeting' 
  | 'file_share' 
  | 'page_view'
  | 'template_sent'
  | 'follow_up';

export type ActivityOutcome = 'successful' | 'no_answer' | 'busy' | 'voicemail' | 'callback_requested' | 'interested' | 'not_interested' | 'converted';

export interface ActivityTypeConfig {
  id: ActivityType;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  engagementPoints: number;
  allowDuration: boolean;
  allowOutcome: boolean;
  allowFiles: boolean;
}

export interface EnhancedActivity {
  id: string;
  leadId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  outcome?: ActivityOutcome;
  duration?: number; // in minutes
  scheduledFor?: string;
  completedAt?: string;
  metadata?: {
    templateId?: string;
    fileUrls?: string[];
    pageUrl?: string;
    emailOpened?: boolean;
    emailClicked?: boolean;
    responseReceived?: boolean;
    previousStatus?: string;
    newStatus?: string;
    [key: string]: any;
  };
  tags?: string[];
  isAutomated: boolean;
  engagementPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilters {
  search: string;
  types: ActivityType[];
  outcomes: ActivityOutcome[];
  dateRange?: {
    start: string;
    end: string;
  };
  isAutomated?: boolean;
}

export interface EngagementScore {
  leadId: string;
  totalPoints: number;
  recentPoints: number; // Last 30 days
  scoreLevel: 'hot' | 'warm' | 'cold';
  lastActivity?: string;
  daysSinceLastActivity: number;
  activityFrequency: number; // Activities per week
  responseRate: number; // Percentage of responses to outbound communications
  conversionProbability: number; // AI-calculated probability
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByOutcome: Record<ActivityOutcome, number>;
  averageResponseTime: number; // in hours
  engagementTrend: Array<{
    date: string;
    points: number;
    activities: number;
  }>;
  topPerformingTypes: Array<{
    type: ActivityType;
    conversionRate: number;
    averageEngagement: number;
  }>;
}

export const ACTIVITY_TYPE_CONFIGS: Record<ActivityType, ActivityTypeConfig> = {
  call: {
    id: 'call',
    name: 'Phone Call',
    icon: 'Phone',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    engagementPoints: 10,
    allowDuration: true,
    allowOutcome: true,
    allowFiles: false,
  },
  email: {
    id: 'email',
    name: 'Email',
    icon: 'Mail',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    engagementPoints: 5,
    allowDuration: false,
    allowOutcome: true,
    allowFiles: true,
  },
  sms: {
    id: 'sms',
    name: 'SMS Message',
    icon: 'MessageSquare',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    engagementPoints: 3,
    allowDuration: false,
    allowOutcome: false,
    allowFiles: false,
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'MessageSquare',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    engagementPoints: 4,
    allowDuration: false,
    allowOutcome: false,
    allowFiles: true,
  },
  note: {
    id: 'note',
    name: 'Note',
    icon: 'StickyNote',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    engagementPoints: 1,
    allowDuration: false,
    allowOutcome: false,
    allowFiles: true,
  },
  status_change: {
    id: 'status_change',
    name: 'Status Change',
    icon: 'ArrowRightLeft',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    engagementPoints: 2,
    allowDuration: false,
    allowOutcome: false,
    allowFiles: false,
  },
  meeting: {
    id: 'meeting',
    name: 'Meeting',
    icon: 'Calendar',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    engagementPoints: 15,
    allowDuration: true,
    allowOutcome: true,
    allowFiles: true,
  },
  file_share: {
    id: 'file_share',
    name: 'File Shared',
    icon: 'FileText',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/20',
    engagementPoints: 3,
    allowDuration: false,
    allowOutcome: false,
    allowFiles: true,
  },
  page_view: {
    id: 'page_view',
    name: 'Page View',
    icon: 'Eye',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
    engagementPoints: 2,
    allowDuration: false,
    allowOutcome: false,
    allowFiles: false,
  },
  template_sent: {
    id: 'template_sent',
    name: 'Template Sent',
    icon: 'Send',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-950/20',
    engagementPoints: 5,
    allowDuration: false,
    allowOutcome: false,
    allowFiles: false,
  },
  follow_up: {
    id: 'follow_up',
    name: 'Follow-up',
    icon: 'Clock',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    engagementPoints: 3,
    allowDuration: false,
    allowOutcome: true,
    allowFiles: false,
  },
};