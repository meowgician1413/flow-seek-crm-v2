import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Mail, 
  Zap, 
  BarChart3, 
  Sparkles, 
  Send,
  TrendingUp,
  Users,
  Target,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadContext';
import { toast } from 'sonner';

export function AIFeatures() {
  const { user } = useAuth();
  const { leads, refreshLeads } = useLeads();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [selectedLead, setSelectedLead] = useState('');
  const [followUpType, setFollowUpType] = useState('welcome');

  const handleAIScoring = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, scoring: true }));
    try {
      let processed = 0;
      const totalLeads = leads.length;

      for (const lead of leads) {
        if (!lead.lead_score || lead.lead_score === 0) {
          try {
            await supabase.functions.invoke('ai-lead-scoring', {
              body: {
                leadId: lead.id,
                leadData: {
                  name: lead.name,
                  email: lead.email,
                  phone: lead.phone,
                  company: lead.company,
                  notes: lead.notes,
                  source: lead.source,
                  lead_value: lead.lead_value
                }
              }
            });
            processed++;
          } catch (error) {
            console.error(`Failed to score lead ${lead.id}:`, error);
          }
        }
      }

      await refreshLeads();
      toast.success(`Successfully scored ${processed} leads with AI!`);
    } catch (error) {
      console.error('Error in AI scoring:', error);
      toast.error('Failed to score leads with AI');
    } finally {
      setLoading(prev => ({ ...prev, scoring: false }));
    }
  };

  const handleLeadEnrichment = async (leadId?: string) => {
    if (!user) return;

    const targetLeads = leadId ? [leads.find(l => l.id === leadId)] : leads.slice(0, 5);
    
    setLoading(prev => ({ ...prev, enrichment: true }));
    try {
      let processed = 0;
      
      for (const lead of targetLeads) {
        if (!lead) continue;
        
        try {
          await supabase.functions.invoke('ai-lead-enrichment', {
            body: {
              leadId: lead.id,
              leadData: {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
                notes: lead.notes,
                source: lead.source
              }
            }
          });
          processed++;
        } catch (error) {
          console.error(`Failed to enrich lead ${lead.id}:`, error);
        }
      }

      await refreshLeads();
      toast.success(`Successfully enriched ${processed} leads with AI insights!`);
    } catch (error) {
      console.error('Error in lead enrichment:', error);
      toast.error('Failed to enrich leads');
    } finally {
      setLoading(prev => ({ ...prev, enrichment: false }));
    }
  };

  const handleSendFollowUp = async () => {
    if (!user || !selectedLead) return;

    const lead = leads.find(l => l.id === selectedLead);
    if (!lead || !lead.email) {
      toast.error('Selected lead must have an email address');
      return;
    }

    setLoading(prev => ({ ...prev, followup: true }));
    try {
      const { data, error } = await supabase.functions.invoke('automated-followups', {
        body: {
          leadId: lead.id,
          leadData: {
            name: lead.name,
            email: lead.email,
            company: lead.company,
            source: lead.source,
            lead_score: lead.lead_score,
            priority: lead.priority,
            notes: lead.notes
          },
          userId: user.id,
          followUpType: followUpType,
          customMessage: followUpMessage || undefined
        }
      });

      if (error) throw error;

      toast.success(`Follow-up email sent to ${lead.name}!`);
      setFollowUpMessage('');
      setSelectedLead('');
    } catch (error) {
      console.error('Error sending follow-up:', error);
      toast.error('Failed to send follow-up email');
    } finally {
      setLoading(prev => ({ ...prev, followup: false }));
    }
  };

  const handleGenerateAnalytics = async (timeRange: string) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, analytics: true }));
    try {
      const { data, error } = await supabase.functions.invoke('ai-analytics-insights', {
        body: {
          userId: user.id,
          timeRange: timeRange,
          insightType: 'comprehensive'
        }
      });

      if (error) throw error;

      setAnalyticsData(data.insights);
      toast.success('AI analytics report generated!');
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast.error('Failed to generate analytics report');
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  };

  const leadsWithEmail = leads.filter(lead => lead.email);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">AI-Powered Features</h2>
        <Badge variant="secondary">Beta</Badge>
      </div>

      <Tabs defaultValue="scoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scoring" className="gap-2">
            <Brain className="w-4 h-4" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="enrichment" className="gap-2">
            <Target className="w-4 h-4" />
            Enrichment
          </TabsTrigger>
          <TabsTrigger value="followups" className="gap-2">
            <Send className="w-4 h-4" />
            Follow-ups
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Lead Scoring</h3>
                <p className="text-muted-foreground mb-4">
                  Automatically score your leads based on conversion potential using AI analysis
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>• Analyzes contact completeness</span>
                  <span>• Company validation</span>
                  <span>• Source quality assessment</span>
                </div>
              </div>
              <Button 
                onClick={handleAIScoring} 
                disabled={loading.scoring || leads.length === 0}
                className="gap-2"
              >
                <Brain className="w-4 h-4" />
                {loading.scoring ? 'Scoring...' : 'Score All Leads'}
              </Button>
            </div>
            
            {leads.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>{leads.filter(l => l.lead_score && l.lead_score > 0).length}</strong> of <strong>{leads.length}</strong> leads have been scored
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="enrichment" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Lead Enrichment</h3>
                <p className="text-muted-foreground mb-4">
                  Enhance your lead data with AI-powered insights and recommendations
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>• Industry analysis</span>
                  <span>• Outreach strategies</span>
                  <span>• Pain point identification</span>
                </div>
              </div>
              <Button 
                onClick={() => handleLeadEnrichment()} 
                disabled={loading.enrichment || leads.length === 0}
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                {loading.enrichment ? 'Enriching...' : 'Enrich Top 5 Leads'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="followups" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Automated Follow-ups</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Lead</label>
                <Select value={selectedLead} onValueChange={setSelectedLead}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lead to follow up with" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadsWithEmail.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} ({lead.email}) - {lead.source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Follow-up Type</label>
                <Select value={followUpType} onValueChange={setFollowUpType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="nurture">Nurture Sequence</SelectItem>
                    <SelectItem value="reminder">Gentle Reminder</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {followUpType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Message Guidelines</label>
                  <Textarea 
                    placeholder="Provide context or specific talking points for the AI to include..."
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                  />
                </div>
              )}

              <Button 
                onClick={handleSendFollowUp}
                disabled={loading.followup || !selectedLead}
                className="w-full gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {loading.followup ? 'Sending...' : 'Send AI-Generated Follow-up'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <Button 
              onClick={() => handleGenerateAnalytics('7d')}
              disabled={loading.analytics}
              variant="outline"
              size="sm"
            >
              7 Days
            </Button>
            <Button 
              onClick={() => handleGenerateAnalytics('30d')}
              disabled={loading.analytics}
              variant="outline"
              size="sm"
            >
              30 Days
            </Button>
            <Button 
              onClick={() => handleGenerateAnalytics('90d')}
              disabled={loading.analytics}
              variant="outline"
              size="sm"
            >
              90 Days
            </Button>
          </div>

          {analyticsData ? (
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">AI Analytics Report</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-medium mb-2">Executive Summary</h4>
                    <p className="text-sm">{analyticsData.executive_summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Lead Quality Trend
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        Direction: <span className={`font-medium ${
                          analyticsData.lead_quality_trend.direction === 'improving' ? 'text-green-600' :
                          analyticsData.lead_quality_trend.direction === 'declining' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {analyticsData.lead_quality_trend.direction}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avg Score: {analyticsData.lead_quality_trend.average_score?.toFixed(1)}/100
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Key Metrics
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Leads: {analyticsData.key_metrics.total_leads}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        High Priority: {analyticsData.key_metrics.high_priority_leads}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Actionable Recommendations</h4>
                    <div className="space-y-2">
                      {analyticsData.actionable_recommendations?.map((rec: any, index: number) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                              {rec.priority}
                            </Badge>
                            <span className="font-medium">{rec.action}</span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Impact: {rec.expected_impact} • Timeline: {rec.timeline}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Generate AI Analytics Report</h3>
              <p className="text-muted-foreground mb-4">
                Get comprehensive insights about your lead performance, conversion patterns, and actionable recommendations
              </p>
              <Button 
                onClick={() => handleGenerateAnalytics('30d')}
                disabled={loading.analytics}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading.analytics ? 'Generating...' : 'Generate Report'}
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}