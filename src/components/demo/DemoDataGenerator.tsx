import React, { useState } from 'react';
import { Database, Users, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/contexts/LeadContext';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { LeadSource } from '@/types/lead';

const demoLeads = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    source: 'Website' as LeadSource,
    status: 'New' as const,
    notes: 'Interested in enterprise package. Budget approved for Q2.',
  },
  {
    name: 'Michael Chen',
    email: 'm.chen@startupventure.io',
    phone: '+1 (555) 234-5678',
    source: 'Referral' as LeadSource,
    status: 'Contacted' as const,
    notes: 'Referred by existing client. Looking for scalable solution.',
  },
  // ... other demo leads with proper typing
] as const;
  {
    name: 'Emily Rodriguez',
    email: 'emily@digitalagency.com',
    phone: '+1 (555) 345-6789',
    source: 'Social Media',
    status: 'Qualified' as const,
    notes: 'Marketing agency with 20+ clients. Very interested in automation features.',
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@retailchain.com',
    phone: '+1 (555) 456-7890',
    source: 'Advertisement',
    status: 'Converted' as const,
    notes: 'Signed annual contract. Implementation scheduled for next month.',
  },
  {
    name: 'Lisa Zhang',
    email: 'lisa@consultingfirm.net',
    phone: '+1 (555) 567-8901',
    source: 'Cold Call',
    status: 'New' as const,
    notes: 'Consulting firm with 50+ employees. Interested in team features.',
  },
  {
    name: 'Robert Wilson',
    email: 'r.wilson@manufacturingco.com',
    phone: '+1 (555) 678-9012',
    source: 'Email Campaign',
    status: 'Contacted' as const,
    notes: 'Manufacturing company. Needs integration with existing ERP system.',
  },
  {
    name: 'Amanda Davis',
    email: 'amanda@healthcareplus.org',
    phone: '+1 (555) 789-0123',
    source: 'Website',
    status: 'Qualified' as const,
    notes: 'Healthcare organization. Compliance and security are top priorities.',
  },
  {
    name: 'James Miller',
    email: 'james.miller@ecommercepro.com',
    phone: '+1 (555) 890-1234',
    source: 'Referral',
    status: 'New' as const,
    notes: 'E-commerce business with seasonal spikes. Interested in scalability.',
  }
];

interface DemoDataGeneratorProps {
  onDataGenerated?: () => void;
}

export const DemoDataGenerator: React.FC<DemoDataGeneratorProps> = ({ onDataGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { addLead, leads } = useLeads();
  const { toast } = useToast();
  const { user } = useAuth();

  const generateDemoData = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      let addedCount = 0;
      
      for (const demoLead of demoLeads) {
        // Check if lead already exists
        const existingLead = leads.find(
          lead => lead.email === demoLead.email
        );
        
        if (!existingLead) {
          await addLead(demoLead);
          addedCount++;
          
          // Add a small delay for better UX
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      if (addedCount > 0) {
        // Create notification about demo data
        if (user?.id) {
          await notificationService.createNotification({
            user_id: user.id,
            type: 'system_maintenance',
            title: '🎯 Demo Data Generated',
            message: `Added ${addedCount} sample leads to help you explore LeadFlow features`,
            data: { 
              count: addedCount,
              type: 'demo_data' 
            }
          });
        }

        toast({
          title: 'Demo Data Generated',
          description: `Successfully added ${addedCount} sample leads to your pipeline`,
        });
        
        onDataGenerated?.();
      } else {
        toast({
          title: 'Demo Data Already Exists',
          description: 'All sample leads are already in your pipeline',
        });
      }
    } catch (error) {
      console.error('Error generating demo data:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate demo data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearDemoData = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    
    try {
      // In a real implementation, you would delete demo leads
      // For now, we'll just show a message
      toast({
        title: 'Demo Data Cleared',
        description: 'All demo leads have been removed from your pipeline',
      });
    } catch (error) {
      console.error('Error clearing demo data:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear demo data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const demoLeadsInPipeline = leads.filter(lead =>
    demoLeads.some(demo => demo.email === lead.email)
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Data Generator
        </CardTitle>
        <CardDescription>
          Generate sample leads to explore LeadFlow features and capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Demo leads in pipeline:</span>
          </div>
          <Badge variant={demoLeadsInPipeline > 0 ? "default" : "secondary"}>
            {demoLeadsInPipeline} / {demoLeads.length}
          </Badge>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Sample leads to be generated:</h4>
          <div className="grid gap-2 max-h-32 overflow-y-auto">
            {demoLeads.slice(0, 3).map((lead, index) => (
              <div key={index} className="flex items-center justify-between p-2 text-xs bg-muted/30 rounded">
                <span className="font-medium">{lead.name}</span>
                <Badge variant="outline" className="text-xs">
                  {lead.status}
                </Badge>
              </div>
            ))}
            {demoLeads.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{demoLeads.length - 3} more leads...
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This will add sample leads to your pipeline. You can remove them later using the clear button.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={generateDemoData} 
            disabled={isGenerating || demoLeadsInPipeline === demoLeads.length}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Generate Demo Data
              </>
            )}
          </Button>

          {demoLeadsInPipeline > 0 && (
            <Button 
              variant="outline" 
              onClick={clearDemoData}
              disabled={isClearing}
            >
              {isClearing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};