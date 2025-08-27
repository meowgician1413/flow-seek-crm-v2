import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TasksSection } from '@/components/dashboard/TasksSection';
import { LeadStatusChart } from '@/components/dashboard/LeadStatusChart';
// Import icons from lucide-react
import { 
  Plus, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Target,
  Calendar,
  Import,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const { leads, activities, isLoading } = useLeads();
  const navigate = useNavigate();

  // Calculate stats
  const totalLeads = leads.length;
  const activeLeads = leads.filter(lead => 
    lead.status === 'New' || lead.status === 'Contacted' || lead.status === 'Qualified'
  ).length;
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
  const todayLeads = leads.filter(lead => {
    const today = new Date();
    const leadDate = new Date(lead.createdAt);
    return leadDate.toDateString() === today.toDateString();
  }).length;

  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  // Mock weekly comparison data
  const weeklyStats = {
    totalLeads: { current: totalLeads, previous: Math.max(0, totalLeads - Math.floor(Math.random() * 20)) },
    activeLeads: { current: activeLeads, previous: Math.max(0, activeLeads - Math.floor(Math.random() * 10)) },
    converted: { current: convertedLeads, previous: Math.max(0, convertedLeads - Math.floor(Math.random() * 5)) },
  };

  const getTrend = (current: number, previous: number) => ({
    value: previous > 0 ? Math.round(((current - previous) / previous) * 100) : 100,
    isPositive: current >= previous,
  });

  const handleLeadClick = (leadId: string) => {
    navigate(`/lead/${leadId}`);
  };

  const handleQuickAction = (leadId: string, action: string) => {
    // In a real app, this would trigger the respective action
    console.log(`Performing ${action} action for lead ${leadId}`);
  };

  const handleRefresh = () => {
    // In a real app, this would refresh the data
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')} • {format(new Date(), 'h:mm a')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button 
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
            onClick={() => navigate('/leads')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          label="Total Leads"
          value={totalLeads}
          icon={Users}
          variant="primary"
          trend={getTrend(weeklyStats.totalLeads.current, weeklyStats.totalLeads.previous)}
        />
        <StatsCard
          label="Active Leads"
          value={activeLeads}
          icon={TrendingUp}
          variant="secondary"
          trend={getTrend(weeklyStats.activeLeads.current, weeklyStats.activeLeads.previous)}
        />
        <StatsCard
          label="Converted"
          value={convertedLeads}
          icon={Target}
          variant="success"
          trend={getTrend(weeklyStats.converted.current, weeklyStats.converted.previous)}
        />
        <StatsCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={DollarSign}
          variant="warning"
        />
      </div>

      {/* Today's Tasks */}
      <TasksSection 
        leads={leads}
        onLeadClick={handleLeadClick}
        onQuickAction={handleQuickAction}
      />

      {/* Charts and Activity */}
      <div className="grid gap-6">
        {/* Lead Status Chart */}
        <LeadStatusChart leads={leads} />
        
        {/* Recent Activity Feed */}
        <ActivityFeed 
          activities={activities} 
          onActivityClick={handleLeadClick}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
          onClick={() => navigate('/leads')}
        >
          <Import className="w-6 h-6 text-primary" />
          <span className="text-sm">Import Leads</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow"
          onClick={() => navigate('/templates')}
        >
          <MessageSquare className="w-6 h-6 text-secondary" />
          <span className="text-sm">Templates</span>
        </Button>
      </div>
    </div>
  );
};