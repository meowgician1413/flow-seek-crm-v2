import { useState } from 'react';
import { Plus, Zap, Activity, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { AddIntegrationModal } from '@/components/integrations/AddIntegrationModal';
import { IntegrationStats } from '@/components/integrations/IntegrationStats';
import { IntegrationLogs } from '@/components/integrations/IntegrationLogs';

export default function Integrations() {
  const { sources, loading } = useIntegrations();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Integrations</h1>
          <p className="text-muted-foreground">Connect and manage your lead sources</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </Button>
      </div>

      <IntegrationStats />

      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources" className="gap-2">
            <Zap className="w-4 h-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4 mt-6">
          {sources.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <Zap className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg">No integrations yet</h3>
                  <p className="text-muted-foreground">Connect your first lead source to start capturing leads</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Integration
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sources.map((source) => (
                <IntegrationCard key={source.id} source={source} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <IntegrationLogs />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Integration Settings</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>• Auto-assign new leads to available team members</p>
              <p>• Enable duplicate lead detection and merging</p>
              <p>• Set up notification preferences for new integrations</p>
              <p>• Configure lead scoring and qualification rules</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AddIntegrationModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}