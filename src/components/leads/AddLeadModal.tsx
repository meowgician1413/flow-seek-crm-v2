import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeads } from '@/contexts/LeadContext';
import { LeadSource } from '@/types/lead';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const leadSources: LeadSource[] = [
  'Website',
  'Referral',
  'Social Media',
  'Advertisement',
  'Cold Call',
  'Email Campaign',
  'Other'
];

export const AddLeadModal = ({ open, onOpenChange }: AddLeadModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website' as LeadSource,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addLead, isLoading } = useLeads();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await addLead({
      ...formData,
      status: 'New',
    });
    
    // Reset form and close modal
    setFormData({
      name: '',
      email: '',
      phone: '',
      source: 'Website',
      notes: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      source: 'Website',
      notes: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[75vh] m-4 bg-popover border-border shadow-glow">
        <DialogHeader className="border-b border-border pb-3 sticky top-0 bg-popover z-10">
          <DialogTitle className="text-lg font-semibold text-foreground">Add New Lead</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col overflow-hidden flex-1">
          <div className="overflow-y-auto flex-1 px-1 py-2 mb-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-semibold text-sm">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className={cn("bg-background text-foreground h-10", errors.name && 'border-destructive')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold text-sm">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={cn("bg-background text-foreground h-10", errors.email && 'border-destructive')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-semibold text-sm">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className={cn("bg-background text-foreground h-10", errors.phone && 'border-destructive')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-foreground font-semibold text-sm">Lead Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleChange('source', value)}
                >
                  <SelectTrigger className="bg-background text-foreground h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border shadow-glow z-50">
                    {leadSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground font-semibold text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                  className="bg-background text-foreground resize-none"
                />
              </div>
            </form>
          </div>

          <div className="flex gap-3 pt-3 pb-4 border-t border-border bg-popover">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 shadow-card h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex-1 bg-gradient-primary shadow-elegant hover:shadow-glow h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Lead'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};