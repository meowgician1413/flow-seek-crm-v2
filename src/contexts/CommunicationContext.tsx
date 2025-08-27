import React, { createContext, useContext, useState } from 'react';
import { CommunicationLog, FollowUp, CommunicationType, CommunicationStatus, FollowUpStatus, QuickCommunicationData } from '@/types/communication';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from './LeadContext';

interface CommunicationContextType {
  communicationLogs: CommunicationLog[];
  followUps: FollowUp[];
  isLoading: boolean;
  
  // Communication methods
  sendCommunication: (leadId: string, data: QuickCommunicationData) => Promise<void>;
  logCommunication: (data: Omit<CommunicationLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCommunicationStatus: (id: string, status: CommunicationStatus) => Promise<void>;
  
  // Follow-up methods
  scheduleFollowUp: (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  completeFollowUp: (id: string) => Promise<void>;
  snoozeFollowUp: (id: string, snoozeUntil: string) => Promise<void>;
  cancelFollowUp: (id: string) => Promise<void>;
  
  // Query methods
  getCommunicationsByLeadId: (leadId: string) => CommunicationLog[];
  getFollowUpsByLeadId: (leadId: string) => FollowUp[];
  getPendingFollowUps: () => FollowUp[];
  getTodayFollowUps: () => FollowUp[];
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};

// Mock data
const mockCommunicationLogs: CommunicationLog[] = [
  {
    id: '1',
    leadId: '1',
    userId: '1',
    type: 'call',
    status: 'completed',
    duration: 15,
    content: 'Initial consultation call',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    completedAt: '2024-01-15T14:45:00Z',
  },
  {
    id: '2',
    leadId: '2',
    userId: '1',
    type: 'email',
    status: 'sent',
    subject: 'Welcome to our service',
    content: 'Thank you for your interest in our premium package...',
    templateId: 'intro-1',
    createdAt: '2024-01-14T16:20:00Z',
    updatedAt: '2024-01-14T16:20:00Z',
  },
  {
    id: '3',
    leadId: '3',
    userId: '1',
    type: 'sms',
    status: 'delivered',
    content: 'Hi Mike, following up on our conversation about the enterprise solution.',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:16:00Z',
  },
];

const mockFollowUps: FollowUp[] = [
  {
    id: '1',
    leadId: '1',
    userId: '1',
    title: 'Follow-up call',
    description: 'Schedule demo presentation',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    status: 'pending',
    type: 'call',
    createdAt: '2024-01-15T14:45:00Z',
    updatedAt: '2024-01-15T14:45:00Z',
  },
  {
    id: '2',
    leadId: '2',
    userId: '1',
    title: 'Send pricing proposal',
    description: 'Send detailed pricing for enterprise package',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    status: 'pending',
    type: 'email',
    createdAt: '2024-01-14T16:25:00Z',
    updatedAt: '2024-01-14T16:25:00Z',
  },
];

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(mockCommunicationLogs);
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockFollowUps);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addActivity } = useLeads();

  const sendCommunication = async (leadId: string, data: QuickCommunicationData) => {
    setIsLoading(true);
    try {
      // Create communication log
      const newLog: CommunicationLog = {
        id: Date.now().toString(),
        leadId,
        userId: user?.id || '1',
        type: data.type,
        content: data.content,
        subject: data.subject,
        templateId: data.templateId,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCommunicationLogs(prev => [newLog, ...prev]);

      // Add activity to lead
      await addActivity({
        leadId,
        userId: user?.id || '1',
        type: data.type,
        description: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} sent: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
        metadata: { communicationId: newLog.id },
      });

      // Schedule follow-up if requested
      if (data.scheduleFollowUp && data.followUpDate) {
        await scheduleFollowUp({
          leadId,
          userId: user?.id || '1',
          title: data.followUpDescription || `Follow up on ${data.type}`,
          scheduledDate: data.followUpDate,
          status: 'pending',
          type: data.type,
          relatedCommunicationId: newLog.id,
        });
      }

      // Simulate sending based on type
      switch (data.type) {
        case 'call':
          // Open dialer
          window.open(`tel:${data.content}`);
          break;
        case 'sms':
          // Open SMS app
          window.open(`sms:${data.content.split(':')[0]}?body=${encodeURIComponent(data.content.split(':')[1] || data.content)}`);
          break;
        case 'email':
          // Open email client
          window.open(`mailto:${data.content.split(':')[0]}?subject=${encodeURIComponent(data.subject || '')}&body=${encodeURIComponent(data.content.split(':')[1] || data.content)}`);
          break;
        case 'whatsapp':
          // Open WhatsApp
          const phoneNumber = data.content.split(':')[0]?.replace(/[^\d]/g, '');
          window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(data.content.split(':')[1] || data.content)}`);
          break;
      }

      toast({
        title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Sent`,
        description: `Your ${data.type} has been sent successfully.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logCommunication = async (data: Omit<CommunicationLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLog: CommunicationLog = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCommunicationLogs(prev => [newLog, ...prev]);

    // Add activity to lead
    await addActivity({
      leadId: data.leadId,
      userId: data.userId,
      type: data.type,
      description: data.content || `${data.type} logged`,
      metadata: { communicationId: newLog.id },
    });
  };

  const updateCommunicationStatus = async (id: string, status: CommunicationStatus) => {
    setCommunicationLogs(prev =>
      prev.map(log =>
        log.id === id
          ? {
              ...log,
              status,
              updatedAt: new Date().toISOString(),
              ...(status === 'completed' && { completedAt: new Date().toISOString() }),
            }
          : log
      )
    );
  };

  const scheduleFollowUp = async (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFollowUp: FollowUp = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFollowUps(prev => [newFollowUp, ...prev]);

    toast({
      title: 'Follow-up Scheduled',
      description: `Follow-up "${data.title}" has been scheduled.`,
    });
  };

  const completeFollowUp = async (id: string) => {
    setFollowUps(prev =>
      prev.map(followUp =>
        followUp.id === id
          ? {
              ...followUp,
              status: 'completed' as FollowUpStatus,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : followUp
      )
    );

    toast({
      title: 'Follow-up Completed',
      description: 'Follow-up has been marked as completed.',
    });
  };

  const snoozeFollowUp = async (id: string, snoozeUntil: string) => {
    setFollowUps(prev =>
      prev.map(followUp =>
        followUp.id === id
          ? {
              ...followUp,
              status: 'snoozed' as FollowUpStatus,
              snoozedUntil: snoozeUntil,
              updatedAt: new Date().toISOString(),
            }
          : followUp
      )
    );

    toast({
      title: 'Follow-up Snoozed',
      description: 'Follow-up has been snoozed.',
    });
  };

  const cancelFollowUp = async (id: string) => {
    setFollowUps(prev =>
      prev.map(followUp =>
        followUp.id === id
          ? {
              ...followUp,
              status: 'cancelled' as FollowUpStatus,
              updatedAt: new Date().toISOString(),
            }
          : followUp
      )
    );

    toast({
      title: 'Follow-up Cancelled',
      description: 'Follow-up has been cancelled.',
    });
  };

  const getCommunicationsByLeadId = (leadId: string) => {
    return communicationLogs
      .filter(log => log.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getFollowUpsByLeadId = (leadId: string) => {
    return followUps
      .filter(followUp => followUp.leadId === leadId)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  const getPendingFollowUps = () => {
    return followUps
      .filter(followUp => followUp.status === 'pending')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  const getTodayFollowUps = () => {
    const today = new Date().toISOString().split('T')[0];
    return followUps
      .filter(followUp => 
        followUp.status === 'pending' && 
        followUp.scheduledDate.startsWith(today)
      )
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  return (
    <CommunicationContext.Provider value={{
      communicationLogs,
      followUps,
      isLoading,
      sendCommunication,
      logCommunication,
      updateCommunicationStatus,
      scheduleFollowUp,
      completeFollowUp,
      snoozeFollowUp,
      cancelFollowUp,
      getCommunicationsByLeadId,
      getFollowUpsByLeadId,
      getPendingFollowUps,
      getTodayFollowUps,
    }}>
      {children}
    </CommunicationContext.Provider>
  );
};