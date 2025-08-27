import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  EnhancedActivity, 
  ActivityType, 
  ActivityFilters, 
  EngagementScore, 
  ActivityStats,
  ActivityOutcome,
  ACTIVITY_TYPE_CONFIGS 
} from '@/types/activity';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ActivityContextType {
  activities: EnhancedActivity[];
  engagementScores: Record<string, EngagementScore>;
  isLoading: boolean;
  filters: ActivityFilters;
  
  // Activity management
  addActivity: (data: Omit<EnhancedActivity, 'id' | 'createdAt' | 'updatedAt' | 'engagementPoints'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<EnhancedActivity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  
  // Filtering and querying
  setFilters: (filters: Partial<ActivityFilters>) => void;
  getActivitiesByLeadId: (leadId: string) => EnhancedActivity[];
  getRecentActivities: (limit?: number) => EnhancedActivity[];
  
  // Engagement scoring
  calculateEngagementScore: (leadId: string) => EngagementScore;
  updateEngagementScore: (leadId: string) => Promise<void>;
  
  // Analytics
  getActivityStats: (leadId?: string) => ActivityStats;
  getEngagementTrend: (leadId: string, days: number) => Array<{ date: string; points: number; activities: number }>;
  
  // Auto-logging
  logAutomaticActivity: (leadId: string, type: ActivityType, title: string, metadata?: any) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};

// Mock data
const mockActivities: EnhancedActivity[] = [
  {
    id: '1',
    leadId: '1',
    userId: '1',
    type: 'call',
    title: 'Initial consultation call',
    description: 'Discussed requirements for premium package. Very interested in features.',
    outcome: 'interested',
    duration: 15,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isAutomated: false,
    engagementPoints: 10,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    leadId: '1',
    userId: '1',
    type: 'email',
    title: 'Welcome email sent',
    description: 'Sent introduction email with company overview',
    metadata: {
      templateId: 'welcome-1',
      emailOpened: true,
      emailClicked: false,
    },
    isAutomated: true,
    engagementPoints: 5,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    leadId: '2',
    userId: '1',
    type: 'status_change',
    title: 'Status changed to Contacted',
    description: 'Lead status updated from New to Contacted',
    metadata: {
      previousStatus: 'New',
      newStatus: 'Contacted',
    },
    isAutomated: true,
    engagementPoints: 2,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    leadId: '1',
    userId: '1',
    type: 'note',
    title: 'Follow-up reminder',
    description: 'Need to send pricing information by Friday. Lead mentioned budget of $50k.',
    tags: ['pricing', 'budget', 'urgent'],
    isAutomated: false,
    engagementPoints: 1,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    leadId: '3',
    userId: '1',
    type: 'meeting',
    title: 'Product demo scheduled',
    description: 'Scheduled product demonstration for next Tuesday at 2 PM',
    outcome: 'successful',
    duration: 45,
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isAutomated: false,
    engagementPoints: 15,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<EnhancedActivity[]>(mockActivities);
  const [engagementScores, setEngagementScores] = useState<Record<string, EngagementScore>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFiltersState] = useState<ActivityFilters>({
    search: '',
    types: [],
    outcomes: [],
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate engagement score for a lead
  const calculateEngagementScore = (leadId: string): EngagementScore => {
    const leadActivities = activities.filter(a => a.leadId === leadId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalPoints = leadActivities.reduce((sum, activity) => sum + activity.engagementPoints, 0);
    const recentActivities = leadActivities.filter(a => new Date(a.createdAt) > thirtyDaysAgo);
    const recentPoints = recentActivities.reduce((sum, activity) => sum + activity.engagementPoints, 0);
    
    const lastActivity = leadActivities.length > 0 
      ? leadActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : undefined;
    
    const daysSinceLastActivity = lastActivity 
      ? Math.floor((now.getTime() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const activityFrequency = leadActivities.length > 0 
      ? (leadActivities.length / Math.max(1, daysSinceLastActivity / 7))
      : 0;
    
    // Calculate response rate (simplified)
    const outboundActivities = leadActivities.filter(a => 
      ['email', 'sms', 'whatsapp', 'call'].includes(a.type) && !a.isAutomated
    );
    const responsesReceived = leadActivities.filter(a => 
      a.metadata?.responseReceived || a.outcome === 'successful'
    );
    const responseRate = outboundActivities.length > 0 
      ? (responsesReceived.length / outboundActivities.length) * 100
      : 0;
    
    // Determine score level
    let scoreLevel: 'hot' | 'warm' | 'cold' = 'cold';
    if (recentPoints >= 20 && daysSinceLastActivity <= 3) scoreLevel = 'hot';
    else if (recentPoints >= 10 && daysSinceLastActivity <= 7) scoreLevel = 'warm';
    
    // Simple conversion probability calculation
    const conversionProbability = Math.min(100, 
      (recentPoints * 2) + 
      (responseRate / 2) + 
      Math.max(0, 20 - daysSinceLastActivity)
    );
    
    return {
      leadId,
      totalPoints,
      recentPoints,
      scoreLevel,
      lastActivity: lastActivity?.createdAt,
      daysSinceLastActivity,
      activityFrequency,
      responseRate,
      conversionProbability,
    };
  };

  const addActivity = async (data: Omit<EnhancedActivity, 'id' | 'createdAt' | 'updatedAt' | 'engagementPoints'>) => {
    setIsLoading(true);
    try {
      const config = ACTIVITY_TYPE_CONFIGS[data.type];
      const newActivity: EnhancedActivity = {
        ...data,
        id: Date.now().toString(),
        engagementPoints: config.engagementPoints,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setActivities(prev => [newActivity, ...prev]);
      await updateEngagementScore(data.leadId);
      
      toast({
        title: 'Activity Added',
        description: `${config.name} activity has been logged.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (id: string, updates: Partial<EnhancedActivity>) => {
    setActivities(prev => 
      prev.map(activity =>
        activity.id === id
          ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
          : activity
      )
    );
  };

  const deleteActivity = async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;
    
    setActivities(prev => prev.filter(a => a.id !== id));
    await updateEngagementScore(activity.leadId);
    
    toast({
      title: 'Activity Deleted',
      description: 'Activity has been removed.',
    });
  };

  const logAutomaticActivity = async (
    leadId: string, 
    type: ActivityType, 
    title: string, 
    metadata?: any
  ) => {
    await addActivity({
      leadId,
      userId: user?.id || '1',
      type,
      title,
      metadata,
      isAutomated: true,
    });
  };

  const setFilters = (newFilters: Partial<ActivityFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const getActivitiesByLeadId = (leadId: string) => {
    return activities
      .filter(activity => activity.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getRecentActivities = (limit = 10) => {
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const updateEngagementScore = async (leadId: string) => {
    const score = calculateEngagementScore(leadId);
    setEngagementScores(prev => ({ ...prev, [leadId]: score }));
  };

  const getActivityStats = (leadId?: string): ActivityStats => {
    const relevantActivities = leadId 
      ? activities.filter(a => a.leadId === leadId)
      : activities;
    
    const activitiesByType = Object.keys(ACTIVITY_TYPE_CONFIGS).reduce((acc, type) => {
      acc[type as ActivityType] = relevantActivities.filter(a => a.type === type).length;
      return acc;
    }, {} as Record<ActivityType, number>);
    
    const activitiesByOutcome = relevantActivities
      .filter(a => a.outcome)
      .reduce((acc, activity) => {
        if (activity.outcome) {
          acc[activity.outcome] = (acc[activity.outcome] || 0) + 1;
        }
        return acc;
      }, {} as Record<ActivityOutcome, number>);
    
    // Calculate average response time (simplified)
    const averageResponseTime = 24; // placeholder
    
    // Generate engagement trend (last 7 days)
    const engagementTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = relevantActivities.filter(a => 
        a.createdAt.startsWith(dateStr)
      );
      
      return {
        date: dateStr,
        points: dayActivities.reduce((sum, a) => sum + a.engagementPoints, 0),
        activities: dayActivities.length,
      };
    });
    
    // Calculate top performing types
    const topPerformingTypes = Object.entries(activitiesByType)
      .map(([type, count]) => ({
        type: type as ActivityType,
        conversionRate: Math.random() * 100, // placeholder
        averageEngagement: count > 0 ? ACTIVITY_TYPE_CONFIGS[type as ActivityType].engagementPoints : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);
    
    return {
      totalActivities: relevantActivities.length,
      activitiesByType,
      activitiesByOutcome,
      averageResponseTime,
      engagementTrend,
      topPerformingTypes,
    };
  };

  const getEngagementTrend = (leadId: string, days: number) => {
    const leadActivities = activities.filter(a => a.leadId === leadId);
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = leadActivities.filter(a => 
        a.createdAt.startsWith(dateStr)
      );
      
      return {
        date: dateStr,
        points: dayActivities.reduce((sum, a) => sum + a.engagementPoints, 0),
        activities: dayActivities.length,
      };
    });
  };

  // Initialize engagement scores on component mount
  useEffect(() => {
    const uniqueLeadIds = [...new Set(activities.map(a => a.leadId))];
    const scores: Record<string, EngagementScore> = {};
    
    uniqueLeadIds.forEach(leadId => {
      scores[leadId] = calculateEngagementScore(leadId);
    });
    
    setEngagementScores(scores);
  }, [activities]);

  return (
    <ActivityContext.Provider value={{
      activities,
      engagementScores,
      isLoading,
      filters,
      addActivity,
      updateActivity,
      deleteActivity,
      setFilters,
      getActivitiesByLeadId,
      getRecentActivities,
      calculateEngagementScore,
      updateEngagementScore,
      getActivityStats,
      getEngagementTrend,
      logAutomaticActivity,
    }}>
      {children}
    </ActivityContext.Provider>
  );
};