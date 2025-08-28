import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { toast } from 'sonner';
import { Globe, Facebook, FileText, Linkedin, User, Webhook } from 'lucide-react';

const integrationTypes = [
  { value: 'website', label: 'Website Form', icon: Globe, description: 'Connect your website contact forms' },
  { value: 'facebook', label: 'Facebook Lead Ads', icon: Facebook, description: 'Import leads from Facebook campaigns' },
  { value: 'google_forms', label: 'Google Forms', icon: FileText, description: 'Connect Google Forms responses' },
  { value: 'linkedin', label: 'LinkedIn Lead Gen', icon: Linkedin, description: 'Import LinkedIn lead generation forms' },
  { value: 'webhook', label: 'Generic Webhook', icon: Webhook, description: 'Custom webhook for any platform' },
  { value: 'manual', label: 'Manual Entry', icon: User, description: 'Manual lead import and entry' },
];

interface AddIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddIntegrationModal({ open, onOpenChange }: AddIntegrationModalProps) {
  const { createSource } = useIntegrations();
  const [selectedType, setSelectedType] = useState<string>('');
  const [name, setName] = useState('');
  const [config, setConfig] = useState('{}');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let parsedConfig = {};
      if (config.trim()) {
        try {
          parsedConfig = JSON.parse(config);
        } catch (error) {
          toast.error('Invalid JSON configuration');
          setLoading(false);
          return;
        }
      }

      await createSource({
        name: name.trim(),
        type: selectedType as any,
        config: parsedConfig,
        status: 'active'
      });

      toast.success('Integration created successfully!');
      onOpenChange(false);
      setSelectedType('');
      setName('');
      setConfig('{}');
    } catch (error) {
      toast.error('Failed to create integration');
    } finally {
      setLoading(false);
    }
  };

  const selectedIntegration = integrationTypes.find(type => type.value === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Integration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Integration Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {integrationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      selectedType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        selectedType === type.value ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <h4 className="font-medium text-sm">{type.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Integration Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Main Website Form"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {selectedIntegration && (
            <div className="space-y-2">
              <Label htmlFor="config">Configuration (JSON)</Label>
              <Textarea
                id="config"
                placeholder='{"field_mapping": {"name": "full_name", "email": "email_address"}}'
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Configure field mappings and integration-specific settings in JSON format
              </p>
            </div>
          )}

          {selectedType === 'webhook' && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Webhook Setup</h4>
              <p className="text-sm text-muted-foreground">
                After creating this integration, you'll receive a unique webhook URL to use with your external service.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedType || !name.trim()}>
              {loading ? 'Creating...' : 'Create Integration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}