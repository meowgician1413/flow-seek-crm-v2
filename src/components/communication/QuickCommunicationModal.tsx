import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import { CommunicationType, QuickCommunicationData } from '@/types/communication';
import { MessageTemplate } from '@/types/template';
import { useTemplates } from '@/contexts/TemplateContext';
import { useCommunication } from '@/contexts/CommunicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Send, 
  FileText,
  User,
  Building2,
  Clock,
  X
} from 'lucide-react';

interface QuickCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  type: CommunicationType;
}

const getTypeIcon = (type: CommunicationType) => {
  switch (type) {
    case 'call': return Phone;
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return MessageSquare;
    default: return MessageSquare;
  }
};

const getTypeColor = (type: CommunicationType) => {
  switch (type) {
    case 'call': return 'text-green-600';
    case 'email': return 'text-blue-600';
    case 'sms': return 'text-orange-600';
    case 'whatsapp': return 'text-green-500';
    default: return 'text-gray-600';
  }
};

export const QuickCommunicationModal = ({ isOpen, onClose, lead, type }: QuickCommunicationModalProps) => {
  const { templates, replaceVariables } = useTemplates();
  const { sendCommunication, isLoading } = useCommunication();
  const { user } = useAuth();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('no-template');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpDescription, setFollowUpDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');

  const Icon = getTypeIcon(type);
  const typeColor = getTypeColor(type);
  
  // Filter templates by communication type
  const relevantTemplates = templates.filter(template => 
    template.type === type || 
    (type === 'whatsapp' && template.type === 'sms') ||
    template.type === 'email' // Email templates can be adapted for other types
  );

  // Variable values for replacement
  const getVariableValues = () => ({
    leadName: lead.name,
    leadEmail: lead.email,
    leadPhone: lead.phone,
    companyName: 'YourCompany',
    userSignature: user?.name || 'Best regards',
    userName: user?.name || 'Your Name',
    today: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Apply selected template
  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== 'no-template') {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        const variables = getVariableValues();
        setContent(replaceVariables(template.content, variables));
        if (template.subject) {
          setSubject(replaceVariables(template.subject, variables));
        }
      }
    }
  }, [selectedTemplateId, templates, lead, user]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplateId('no-template');
      setContent('');
      setSubject('');
      setScheduleFollowUp(false);
      setFollowUpDate('');
      setFollowUpDescription('');
      setActiveTab('compose');
    }
  }, [isOpen]);

  // Set default follow-up date to tomorrow
  useEffect(() => {
    if (scheduleFollowUp && !followUpDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setFollowUpDate(tomorrow.toISOString().slice(0, 16));
    }
  }, [scheduleFollowUp]);

  const handleSend = async () => {
    if (!content.trim()) return;

    const communicationData: QuickCommunicationData = {
      type,
      templateId: selectedTemplateId === 'no-template' ? undefined : selectedTemplateId || undefined,
      content: type === 'call' ? lead.phone : 
               type === 'email' ? `${lead.email}:${content}` :
               `${lead.phone}:${content}`,
      subject: type === 'email' ? subject : undefined,
      scheduleFollowUp,
      followUpDate: scheduleFollowUp ? followUpDate : undefined,
      followUpDescription: scheduleFollowUp ? followUpDescription : undefined,
    };

    try {
      await sendCommunication(lead.id, communicationData);
      onClose();
    } catch (error) {
      console.error('Failed to send communication:', error);
    }
  };

  const characterCount = content.length;
  const maxChars = type === 'sms' ? 160 : 1000;
  const isOverLimit = characterCount > maxChars;

  const getContactInfo = () => {
    switch (type) {
      case 'call': return lead.phone;
      case 'email': return lead.email;
      case 'sms': return lead.phone;
      case 'whatsapp': return lead.phone;
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${typeColor}`} />
            {type.charAt(0).toUpperCase() + type.slice(1)} {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Lead Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{lead.name}</h3>
                    <p className="text-sm text-muted-foreground">{getContactInfo()}</p>
                  </div>
                </div>
                <Badge variant="outline">{lead.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          {relevantTemplates.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Select Template (Optional)
              </Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or write your own" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-template">No template</SelectItem>
                  {relevantTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'compose' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              {/* Subject (for email) */}
              {type === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
              )}

              {/* Message Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Message</Label>
                  <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {characterCount}/{maxChars}
                  </span>
                </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Write your ${type} message here...`}
                  className="min-h-[120px]"
                />
                {type === 'sms' && isOverLimit && (
                  <p className="text-xs text-destructive">
                    Message exceeds SMS character limit. Consider shortening or use email instead.
                  </p>
                )}
              </div>

              {/* Follow-up Scheduling */}
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Follow-up
                  </Label>
                  <Switch
                    checked={scheduleFollowUp}
                    onCheckedChange={setScheduleFollowUp}
                  />
                </div>

                {scheduleFollowUp && (
                  <div className="space-y-3 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="followUpDate">Follow-up Date & Time</Label>
                      <Input
                        id="followUpDate"
                        type="datetime-local"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="followUpDescription">Follow-up Description</Label>
                      <Input
                        id="followUpDescription"
                        value={followUpDescription}
                        onChange={(e) => setFollowUpDescription(e.target.value)}
                        placeholder="What should you follow up about?"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4" />
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)} to {getContactInfo()}</span>
                    </div>
                    
                    {type === 'email' && subject && (
                      <div>
                        <p className="text-sm font-medium">Subject:</p>
                        <p className="text-sm">{subject}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium">Message:</p>
                      <div className="bg-muted p-3 rounded-md mt-1">
                        <p className="text-sm whitespace-pre-wrap">{content || 'No message content'}</p>
                      </div>
                    </div>

                    {scheduleFollowUp && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Follow-up Scheduled</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {new Date(followUpDate).toLocaleString()}
                        </p>
                        {followUpDescription && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {followUpDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!content.trim() || isLoading || isOverLimit}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};