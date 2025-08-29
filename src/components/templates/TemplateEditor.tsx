import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageTemplate, TemplateCategory, TemplateType, TEMPLATE_VARIABLES } from '@/types/template';
import { useTemplates } from '@/contexts/TemplateContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  X, 
  Eye, 
  Plus,
  Hash,
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react';

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: MessageTemplate | null;
  mode: 'create' | 'edit';
}

const getTypeIcon = (type: TemplateType) => {
  switch (type) {
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return Phone;
  }
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  isOpen,
  onClose,
  template,
  mode
}) => {
  const { createTemplate, updateTemplate, replaceVariables } = useTemplates();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Custom' as TemplateCategory,
    type: 'email' as TemplateType,
    subject: '',
    content: '',
    variables: [] as string[]
  });
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sample data for preview
  const sampleVariables = {
    leadName: 'John Smith',
    leadEmail: 'john@example.com',
    leadPhone: '+1 (555) 123-4567',
    companyName: 'Acme Solutions',
    userName: 'Sarah Johnson',
    userSignature: 'Sarah Johnson\nSales Manager\nAcme Solutions\n(555) 987-6543',
    today: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };

  useEffect(() => {
    if (template && mode === 'edit') {
      setFormData({
        name: template.name,
        category: template.category,
        type: template.type,
        subject: template.subject || '',
        content: template.content,
        variables: template.variables
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        category: 'Custom',
        type: 'email',
        subject: '',
        content: '',
        variables: []
      });
    }
  }, [template, mode, isOpen]);

  const extractVariables = (text: string): string[] => {
    const regex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  };

  const handleContentChange = (content: string) => {
    const variables = extractVariables(content);
    setFormData(prev => ({ ...prev, content, variables }));
  };

  const handleSubjectChange = (subject: string) => {
    const variables = extractVariables(subject);
    const contentVariables = extractVariables(formData.content);
    const allVariables = [...new Set([...variables, ...contentVariables])];
    
    setFormData(prev => ({ ...prev, subject, variables: allVariables }));
  };

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.substring(0, start) + variable + formData.content.substring(end);
      
      handleContentChange(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      handleContentChange(formData.content + variable);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Validation Error", 
        description: "Template content is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      if (mode === 'create') {
        await createTemplate({
          name: formData.name,
          category: formData.category,
          type: formData.type,
          subject: formData.type === 'email' ? formData.subject : undefined,
          content: formData.content,
          variables: formData.variables,
          isFavorite: false,
          isActive: true
        });
        
        toast({
          title: "Template Created",
          description: "Your template has been saved successfully",
        });
      } else if (template) {
        await updateTemplate(template.id, {
          name: formData.name,
          category: formData.category,
          type: formData.type,
          subject: formData.type === 'email' ? formData.subject : undefined,
          content: formData.content,
          variables: formData.variables
        });
        
        toast({
          title: "Template Updated",
          description: "Your changes have been saved successfully",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const previewContent = replaceVariables(formData.content, sampleVariables);
  const previewSubject = formData.subject ? replaceVariables(formData.subject, sampleVariables) : '';
  const characterCount = formData.content.length;
  const smsLimit = 160;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-popover border-border shadow-glow">
        <DialogHeader className="border-b border-border pb-4 sticky top-0 bg-popover z-10">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            {mode === 'create' ? 'Create New Template' : 'Edit Template'}
            {formData.type && (
              <Badge variant="outline" className="ml-2 text-xs">
                {React.createElement(getTypeIcon(formData.type), { className: "w-3 h-3 mr-1" })}
                {formData.type.toUpperCase()}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1">
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TemplateCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Introduction">Introduction</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Closing">Closing</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Message Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TemplateType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Message Content</Label>
                    {formData.type === 'sms' && (
                      <span className={`text-xs ${characterCount > smsLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {characterCount}/{smsLimit} characters
                      </span>
                    )}
                  </div>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Enter your message content..."
                    className="min-h-[300px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Available Variables</Label>
                    <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                      {TEMPLATE_VARIABLES.map((variable) => (
                        <button
                          key={variable.name}
                          type="button"
                          onClick={() => insertVariable(variable.name)}
                          className="w-full text-left p-2 text-xs bg-muted hover:bg-muted/80 rounded border transition-colors"
                        >
                          <div className="font-medium">{`{{${variable.name}}}`}</div>
                          <div className="text-muted-foreground">{variable.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.variables.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Used Variables</Label>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Preview with sample data
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.type === 'email' && formData.subject && (
                    <div>
                      <Label className="text-sm font-medium">Subject:</Label>
                      <div className="mt-1 p-2 bg-muted rounded border">
                        {previewSubject}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium">Content:</Label>
                    <div className="mt-1 p-4 bg-muted rounded border whitespace-pre-wrap">
                      {previewContent}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between pt-6 border-t border-border bg-muted/20 sticky bottom-0 -mx-6 px-6 -mb-6 pb-6 mt-6">
          <Button variant="outline" onClick={onClose} className="shadow-card">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-primary shadow-elegant">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};