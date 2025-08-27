export type TemplateCategory = 'Introduction' | 'Follow-up' | 'Closing' | 'Custom';
export type TemplateType = 'email' | 'sms' | 'whatsapp';

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  type: TemplateType;
  subject?: string; // For email templates
  content: string;
  variables: string[]; // Array of variable names like ['leadName', 'companyName']
  usageCount: number;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  description: string;
  defaultValue?: string;
}

export interface TemplateFilters {
  search: string;
  category: TemplateCategory | 'All';
  type: TemplateType | 'All';
  favorites: boolean;
}

export interface QuickSendData {
  templateId: string;
  leadId: string;
  content: string;
  subject?: string;
  type: TemplateType;
  variables: Record<string, string>;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: 'leadName', label: 'Lead Name', description: 'The name of the lead' },
  { name: 'leadEmail', label: 'Lead Email', description: 'The email of the lead' },
  { name: 'leadPhone', label: 'Lead Phone', description: 'The phone number of the lead' },
  { name: 'companyName', label: 'Company Name', description: 'The company name' },
  { name: 'userSignature', label: 'Your Signature', description: 'Your personal signature' },
  { name: 'userName', label: 'Your Name', description: 'Your name' },
  { name: 'today', label: 'Today\'s Date', description: 'Current date' },
  { name: 'time', label: 'Current Time', description: 'Current time' },
];