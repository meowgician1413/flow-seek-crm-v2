import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Users, TrendingUp, DollarSign, Clock } from 'lucide-react';

const mockStats = [
  { label: 'Total Leads', value: '247', icon: Users, color: 'text-primary' },
  { label: 'Active Leads', value: '89', icon: TrendingUp, color: 'text-secondary' },
  { label: 'Converted', value: '34', icon: DollarSign, color: 'text-green-600' },
  { label: 'Follow-ups', value: '12', icon: Clock, color: 'text-orange-600' },
];

const recentLeads = [
  { name: 'John Smith', email: 'john@example.com', status: 'New', time: '2 minutes ago' },
  { name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Contacted', time: '1 hour ago' },
  { name: 'Mike Davis', email: 'mike@example.com', status: 'Qualified', time: '3 hours ago' },
  { name: 'Emma Wilson', email: 'emma@example.com', status: 'Converted', time: '1 day ago' },
];

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your leads</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {mockStats.map((stat, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {recentLeads.map((lead, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b border-border last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lead.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    lead.status === 'Qualified' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {lead.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{lead.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
          <Users className="w-6 h-6 text-primary" />
          <span className="text-sm">Import Leads</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
          <TrendingUp className="w-6 h-6 text-secondary" />
          <span className="text-sm">View Reports</span>
        </Button>
      </div>
    </div>
  );
};