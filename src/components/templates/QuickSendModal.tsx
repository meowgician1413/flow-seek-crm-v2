import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageTemplate, TemplateType } from '@/types/template';
import { Lead } from '@/types/lead';
import { useTemplates } from '@/contexts/TemplateContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  X, 
  Eye,
  Mail,
  MessageSquare,
  Phone,
  User
} from 'lucide-react';

interface QuickSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: MessageTemplate | null;
  lead?: Lead | null;
}

const getTypeIcon = (type: TemplateType) => {
  switch (type) {
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return Phone;
  }
};

export const QuickSendModal: React.FC<QuickSendModalProps> = ({
  isOpen,
  onClose,
  template,
  lead
}) => {
  const { sendQuickMessage, replaceVariables } = useTemplates();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [editableContent, setEditableContent] = useState('');
  const [editableSubject, setEditableSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  // Populate variables with lead and user data
  const getVariableValues = () => {
    return {
      leadName: lead?.name || '',
      leadEmail: lead?.email || '',
      leadPhone: lead?.phone || '',
      companyName: 'Your Company', // In real app, this would come from settings
      userName: user?.name || '',
      userSignature: `${user?.name || ''}\nSales Representative\nYour Company\n${user?.email || ''}`,
      today: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
  };

  useEffect(() => {
    if (template && isOpen) {
      const variables = getVariableValues();
      setEditableContent(replaceVariables(template.content, variables));
      setEditableSubject(template.subject ? replaceVariables(template.subject, variables) : '');
      setActiveTab('edit');
    }
  }, [template, lead, user, isOpen]);

  const handleSend = async () => {
    if (!template || !lead) return;
    
    if (!editableContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Message content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      await sendQuickMessage({
        templateId: template.id,
        leadId: lead.id,
        content: editableContent,
        subject: editableSubject,
        type: template.type,
        variables: getVariableValues()
      });
      
      toast({
        title: "Message Sent",
        description: `${template.type === 'email' ? 'Email' : template.type === 'sms' ? 'SMS' : 'WhatsApp message'} sent to ${lead.name}`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!template || !lead) return null;

  const TypeIcon = getTypeIcon(template.type);
  const characterCount = editableContent.length;
  const smsLimit = 160;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TypeIcon className="w-5 h-5" />
              Quick Send: {template.name}
            </div>
            <Badge variant="outline">
              <User className="w-3 h-3 mr-1" />
              {lead.name}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit & Send</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            {/* Lead Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sending to:</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                    {lead.phone && (
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    )}
                  </div>
                  <Badge variant="outline">{lead.status}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Email Subject */}
            {template.type === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
            )}

            {/* Message Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Message Content</Label>
                {template.type === 'sms' && (
                  <span className={`text-xs ${characterCount > smsLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {characterCount}/{smsLimit} characters
                  </span>
                )}
              </div>
              <Textarea
                id="content"
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                placeholder="Enter your message..."
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Variable Info */}
            {template.variables.length > 0 && (
              <div className="p-3 bg-muted/50 rounded border">
                <p className="text-sm font-medium mb-2">Variables replaced:</p>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs">
                      {variable}: {getVariableValues()[variable as keyof ReturnType<typeof getVariableValues>] || 'N/A'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Message Preview</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TypeIcon className="w-4 h-4" />
                  {template.type === 'email' ? 'Email' : template.type === 'sms' ? 'SMS' : 'WhatsApp'} to {lead.name}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.type === 'email' && editableSubject && (
                  <div>
                    <Label className="text-sm font-medium">Subject:</Label>
                    <div className="mt-1 p-2 bg-muted rounded border">
                      {editableSubject}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Content:</Label>
                  <div className="mt-1 p-4 bg-muted rounded border whitespace-pre-wrap">
                    {editableContent}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button onClick={handleSend} disabled={isSending}>
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : `Send ${template.type === 'email' ? 'Email' : template.type === 'sms' ? 'SMS' : 'WhatsApp'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};