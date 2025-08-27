import { useState } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContent } from '@/contexts/ContentContext';

interface PageEditorProps {
  onClose: () => void;
}

export const PageEditor = ({ onClose }: PageEditorProps) => {
  const { createPageTemplate } = useContent();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    content: '',
  });

  const handleSubmit = async () => {
    await createPageTemplate({
      userId: '1',
      name: formData.name,
      title: formData.title,
      content: formData.content,
      templateType: 'Custom',
      isActive: true,
      isPublished: false,
      shareSettings: {
        isPublic: true,
        requiresPassword: false,
        allowSharing: true,
        showBranding: true,
      },
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Page Template</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Page Name</Label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>Page Title</Label>
          <Input 
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div>
          <Label>Content</Label>
          <Textarea 
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="min-h-[200px]"
          />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Page</Button>
        </div>
      </div>
    </>
  );
};