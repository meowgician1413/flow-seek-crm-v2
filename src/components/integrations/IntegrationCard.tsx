import { useState } from 'react';
import { LeadSource } from '@/types/integration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Facebook, 
  FileText, 
  Linkedin, 
  User, 
  Webhook,
  MoreVertical,
  TestTube,
  Settings,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { toast } from 'sonner';

const typeIcons = {
  website: Globe,
  facebook: Facebook,
  google_forms: FileText,
  linkedin: Linkedin,
  manual: User,
  webhook: Webhook,
};

const typeLabels = {
  website: 'Website Form',
  facebook: 'Facebook Lead Ads',
  google_forms: 'Google Forms',
  linkedin: 'LinkedIn Lead Gen',
  manual: 'Manual Entry',
  webhook: 'Generic Webhook',
};

interface IntegrationCardProps {
  source: LeadSource;
}

export function IntegrationCard({ source }: IntegrationCardProps) {
  const { updateSource, deleteSource, testWebhook } = useIntegrations();
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const Icon = typeIcons[source.type];
  const label = typeLabels[source.type];

  const handleTest = async () => {
    setTesting(true);
    try {
      const success = await testWebhook(source.id);
      if (success) {
        toast.success('Integration test successful!');
      } else {
        toast.error('Integration test failed. Check your configuration.');
      }
    } catch (error) {
      toast.error('Failed to test integration');
    } finally {
      setTesting(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = source.status === 'active' ? 'inactive' : 'active';
      await updateSource(source.id, { status: newStatus });
      toast.success(`Integration ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update integration status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteSource(source.id);
      toast.success('Integration deleted successfully');
    } catch (error) {
      toast.error('Failed to delete integration');
    } finally {
      setDeleting(false);
    }
  };

  const copyWebhookUrl = () => {
    if (source.webhook_url) {
      navigator.clipboard.writeText(source.webhook_url);
      toast.success('Webhook URL copied to clipboard');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${
            source.status === 'active' ? 'bg-primary/10' : 
            source.status === 'error' ? 'bg-destructive/10' : 'bg-muted'
          }`}>
            <Icon className={`w-6 h-6 ${
              source.status === 'active' ? 'text-primary' :
              source.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
            }`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{source.name}</h3>
              <Badge variant={
                source.status === 'active' ? 'default' :
                source.status === 'error' ? 'destructive' : 'secondary'
              }>
                {source.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{label}</p>
            <div className="text-sm text-muted-foreground">
              Created {new Date(source.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleTest} disabled={testing}>
              <TestTube className="w-4 h-4 mr-2" />
              {testing ? 'Testing...' : 'Test Integration'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStatusToggle}>
              <Settings className="w-4 h-4 mr-2" />
              {source.status === 'active' ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            {source.webhook_url && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyWebhookUrl}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Webhook URL
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={source.webhook_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Webhook URL
                  </a>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete} 
              disabled={deleting}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete Integration'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {source.webhook_url && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Webhook URL</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {source.webhook_url}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={copyWebhookUrl}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}