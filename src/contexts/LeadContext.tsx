import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, Activity, LeadStatus, LeadFilters } from '@/types/lead';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LeadContextType {
  leads: Lead[];
  activities: Activity[];
  filters: LeadFilters;
  isLoading: boolean;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
  setFilters: (filters: Partial<LeadFilters>) => void;
  getLeadById: (id: string) => Lead | undefined;
  getActivitiesByLeadId: (leadId: string) => Activity[];
  filteredLeads: Lead[];
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};

// Mock data
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    source: 'Website',
    status: 'New',
    notes: 'Interested in premium package',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 234-5678',
    source: 'Referral',
    status: 'Contacted',
    notes: 'Referred by Mike Davis. Looking for enterprise solution.',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T16:20:00Z',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@startup.io',
    phone: '+1 (555) 345-6789',
    source: 'Social Media',
    status: 'Qualified',
    notes: 'CEO of tech startup. Budget confirmed at $50k annually.',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T14:30:00Z',
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.wilson@corp.com',
    phone: '+1 (555) 456-7890',
    source: 'Advertisement',
    status: 'Converted',
    notes: 'Signed annual contract. Implementation scheduled for next month.',
    createdAt: '2024-01-12T11:20:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'r.brown@business.com',
    phone: '+1 (555) 567-8901',
    source: 'Cold Call',
    status: 'Lost',
    notes: 'Not interested. Budget too tight this quarter.',
    createdAt: '2024-01-11T14:30:00Z',
    updatedAt: '2024-01-11T15:00:00Z',
  },
  {
    id: '6',
    name: 'Lisa Garcia',
    email: 'lisa.garcia@agency.com',
    phone: '+1 (555) 678-9012',
    source: 'Email Campaign',
    status: 'New',
    notes: 'Marketing agency owner. Interested in scaling.',
    createdAt: '2024-01-10T16:15:00Z',
    updatedAt: '2024-01-10T16:15:00Z',
  },
  {
    id: '7',
    name: 'David Lee',
    email: 'david@consulting.com',
    phone: '+1 (555) 789-0123',
    source: 'Referral',
    status: 'Contacted',
    notes: 'Consulting firm. Needs solution for 50+ employees.',
    createdAt: '2024-01-09T13:45:00Z',
    updatedAt: '2024-01-09T14:15:00Z',
  },
  {
    id: '8',
    name: 'Amanda Taylor',
    email: 'amanda.taylor@retail.com',
    phone: '+1 (555) 890-1234',
    source: 'Website',
    status: 'Qualified',
    notes: 'Retail chain owner. Interested in multi-location features.',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T11:30:00Z',
  },
  {
    id: '9',
    name: 'James Rodriguez',
    email: 'james.r@healthcare.com',
    phone: '+1 (555) 901-2345',
    source: 'Social Media',
    status: 'New',
    notes: 'Healthcare practice looking for patient management.',
    createdAt: '2024-01-07T12:20:00Z',
    updatedAt: '2024-01-07T12:20:00Z',
  },
  {
    id: '10',
    name: 'Michelle Chen',
    email: 'michelle@fintech.com',
    phone: '+1 (555) 012-3456',
    source: 'Advertisement',
    status: 'Contacted',
    notes: 'Fintech startup. Needs compliance-ready solution.',
    createdAt: '2024-01-06T08:30:00Z',
    updatedAt: '2024-01-06T09:15:00Z',
  },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    leadId: '2',
    userId: '1',
    type: 'status_change',
    description: 'Status changed from New to Contacted',
    createdAt: '2024-01-14T16:20:00Z',
  },
  {
    id: '2',
    leadId: '3',
    userId: '1',
    type: 'status_change',
    description: 'Status changed from Contacted to Qualified',
    createdAt: '2024-01-13T14:30:00Z',
  },
  {
    id: '3',
    leadId: '4',
    userId: '1',
    type: 'status_change',
    description: 'Status changed from Qualified to Converted',
    createdAt: '2024-01-12T16:45:00Z',
  },
  {
    id: '4',
    leadId: '1',
    userId: '1',
    type: 'note_added',
    description: 'Added note: Interested in premium package',
    createdAt: '2024-01-15T10:35:00Z',
  },
];

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [filters, setFiltersState] = useState<LeadFilters>({
    search: '',
    status: 'All',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newLead: Lead = {
        ...leadData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setLeads(prev => [newLead, ...prev]);
      
      // Add activity for lead creation
      await addActivity({
        leadId: newLead.id,
        userId: user?.id || '1',
        type: 'status_change',
        description: 'Lead created',
      });
      
      toast({
        title: 'Lead Added',
        description: `${leadData.name} has been added to your leads.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setIsLoading(true);
    try {
      setLeads(prev => prev.map(lead => 
        lead.id === id 
          ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
          : lead
      ));
      
      toast({
        title: 'Lead Updated',
        description: 'Lead information has been updated successfully.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    setIsLoading(true);
    try {
      const lead = leads.find(l => l.id === id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
      setActivities(prev => prev.filter(activity => activity.leadId !== id));
      
      toast({
        title: 'Lead Deleted',
        description: `${lead?.name} has been removed from your leads.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    await updateLead(id, { status });
    await addActivity({
      leadId: id,
      userId: user?.id || '1',
      type: 'status_change',
      description: `Status changed from ${lead.status} to ${status}`,
    });
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  const setFilters = (newFilters: Partial<LeadFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const getLeadById = (id: string) => {
    return leads.find(lead => lead.id === id);
  };

  const getActivitiesByLeadId = (leadId: string) => {
    return activities
      .filter(activity => activity.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredLeads = leads.filter(lead => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm) ||
        lead.phone.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status !== 'All' && lead.status !== filters.status) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <LeadContext.Provider value={{
      leads,
      activities,
      filters,
      isLoading,
      addLead,
      updateLead,
      deleteLead,
      updateLeadStatus,
      addActivity,
      setFilters,
      getLeadById,
      getActivitiesByLeadId,
      filteredLeads,
    }}>
      {children}
    </LeadContext.Provider>
  );
};