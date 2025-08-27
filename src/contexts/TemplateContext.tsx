import React, { createContext, useContext, useState, useEffect } from 'react';
import { MessageTemplate, TemplateFilters, QuickSendData, TemplateCategory } from '@/types/template';
import { useAuth } from './AuthContext';

interface TemplateContextType {
  templates: MessageTemplate[];
  filteredTemplates: MessageTemplate[];
  filters: TemplateFilters;
  isLoading: boolean;
  selectedTemplate: MessageTemplate | null;
  
  // Template CRUD
  createTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'usageCount'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<void>;
  
  // Template actions
  toggleFavorite: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;
  
  // Filters and search
  setFilters: (filters: Partial<TemplateFilters>) => void;
  clearFilters: () => void;
  
  // Template selection
  selectTemplate: (template: MessageTemplate | null) => void;
  
  // Quick send
  sendQuickMessage: (data: QuickSendData) => Promise<void>;
  
  // Variable replacement
  replaceVariables: (content: string, variables: Record<string, string>) => string;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Mock data - sample templates
const createSampleTemplates = (userId: string): MessageTemplate[] => [
  {
    id: '1',
    name: 'Welcome Introduction',
    category: 'Introduction',
    type: 'email',
    subject: 'Welcome to {{companyName}}!',
    content: `Hi {{leadName}},

Thank you for your interest in our services! I'm {{userName}}, and I'm excited to help you discover how {{companyName}} can benefit your business.

Based on your inquiry, I believe our solutions could be a perfect fit for your needs. I'd love to schedule a brief 15-minute call to learn more about your specific requirements and show you how we can help.

Are you available for a quick chat this week?

Best regards,
{{userSignature}}`,
    variables: ['leadName', 'companyName', 'userName', 'userSignature'],
    usageCount: 25,
    isFavorite: true,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId
  },
  {
    id: '2',
    name: 'Follow-up After Demo',
    category: 'Follow-up',
    type: 'email',
    subject: 'Following up on our demo - Next steps',
    content: `Hi {{leadName}},

I hope you found our demo yesterday helpful and informative. It was great learning more about your goals and challenges.

As discussed, I'm attaching the proposal that outlines how {{companyName}} can help streamline your processes and save you time.

Do you have any questions about the proposal? I'm happy to schedule another call to discuss the details or address any concerns.

Looking forward to hearing from you!

Best regards,
{{userSignature}}`,
    variables: ['leadName', 'companyName', 'userSignature'],
    usageCount: 18,
    isFavorite: true,
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId
  },
  {
    id: '3',
    name: 'Quick SMS Follow-up',
    category: 'Follow-up',
    type: 'sms',
    content: `Hi {{leadName}}, just following up on our conversation about {{companyName}}'s services. Are you still interested in learning more? Let me know if you have any questions! - {{userName}}`,
    variables: ['leadName', 'companyName', 'userName'],
    usageCount: 42,
    isFavorite: false,
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId
  },
  {
    id: '4',
    name: 'Closing - Ready to Move Forward',
    category: 'Closing',
    type: 'email',
    subject: 'Ready to get started with {{companyName}}?',
    content: `Hi {{leadName}},

I wanted to check in and see if you're ready to move forward with {{companyName}}. 

Based on our previous conversations, I believe we can deliver significant value to your business, and I'm excited about the opportunity to work together.

To get started, I just need a few quick details from you. Would you prefer to handle this over a brief call or via email?

I'm here to make this process as smooth as possible for you.

Best regards,
{{userSignature}}`,
    variables: ['leadName', 'companyName', 'userSignature'],
    usageCount: 12,
    isFavorite: false,
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId
  },
  {
    id: '5',
    name: 'WhatsApp Quick Check-in',
    category: 'Follow-up',
    type: 'whatsapp',
    content: `Hi {{leadName}}! 👋 Hope you're doing well. Just wanted to quickly check if you had a chance to review the information I sent about {{companyName}}. Any questions? I'm here to help! 😊`,
    variables: ['leadName', 'companyName'],
    usageCount: 8,
    isFavorite: false,
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId
  }
];

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [filters, setFiltersState] = useState<TemplateFilters>({
    search: '',
    category: 'All',
    type: 'All',
    favorites: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  // Initialize templates
  useEffect(() => {
    if (user) {
      const sampleTemplates = createSampleTemplates(user.id);
      setTemplates(sampleTemplates);
      setIsLoading(false);
    }
  }, [user]);

  // Filter templates based on current filters
  const filteredTemplates = templates.filter(template => {
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !template.content.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.category !== 'All' && template.category !== filters.category) {
      return false;
    }
    
    if (filters.type !== 'All' && template.type !== filters.type) {
      return false;
    }
    
    if (filters.favorites && !template.isFavorite) {
      return false;
    }
    
    return template.isActive;
  });

  const createTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'usageCount'>) => {
    if (!user) return;
    
    const newTemplate: MessageTemplate = {
      ...templateData,
      id: Date.now().toString(),
      userId: user.id,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, ...updates, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const duplicateTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template || !user) return;
    
    const duplicatedTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTemplates(prev => [duplicatedTemplate, ...prev]);
  };

  const toggleFavorite = async (id: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, isFavorite: !template.isFavorite, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  const incrementUsage = async (id: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, usageCount: template.usageCount + 1, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  const setFilters = (newFilters: Partial<TemplateFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState({
      search: '',
      category: 'All',
      type: 'All',
      favorites: false
    });
  };

  const selectTemplate = (template: MessageTemplate | null) => {
    setSelectedTemplate(template);
  };

  const sendQuickMessage = async (data: QuickSendData) => {
    // In a real app, this would send the message via the appropriate channel
    console.log('Sending message:', data);
    await incrementUsage(data.templateId);
  };

  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  };

  const value: TemplateContextType = {
    templates,
    filteredTemplates,
    filters,
    isLoading,
    selectedTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleFavorite,
    incrementUsage,
    setFilters,
    clearFilters,
    selectTemplate,
    sendQuickMessage,
    replaceVariables,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};