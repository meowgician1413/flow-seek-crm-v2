import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ActivityStats, ACTIVITY_TYPE_CONFIGS } from '@/types/activity';
import { useActivities } from '@/contexts/ActivityContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Activity,
  Clock,
  Target,
  Award,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  StickyNote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityAnalyticsProps {
  leadId?: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

export const ActivityAnalytics = ({ leadId, timeframe = 'month' }: ActivityAnalyticsProps) => {
  const { getActivityStats, getEngagementTrend } = useActivities();
  
  const stats = getActivityStats(leadId);
  const engagementTrend = leadId ? getEngagementTrend(leadId, 30) : [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'whatsapp': return MessageSquare;
      case 'note': return StickyNote;
      default: return Activity;
    }
  };

  // Prepare chart data
  const activityTypeData = Object.entries(stats.activitiesByType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: ACTIVITY_TYPE_CONFIGS[type as keyof typeof ACTIVITY_TYPE_CONFIGS]?.name || type,
      value: count,
      type,
    }));

  const engagementTrendData = engagementTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    points: item.points,
    activities: item.activities,
  }));

  const outcomeData = Object.entries(stats.activitiesByOutcome)
    .filter(([, count]) => count > 0)
    .map(([outcome, count]) => ({
      name: outcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      percentage: ((count / stats.totalActivities) * 100).toFixed(1),
    }));

  // Calculate key metrics
  const totalEngagementPoints = engagementTrend.reduce((sum, item) => sum + item.points, 0);
  const averageActivitiesPerDay = stats.totalActivities > 0 
    ? (stats.totalActivities / 30).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalActivities}</p>
                <p className="text-xs text-muted-foreground">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEngagementPoints}</p>
                <p className="text-xs text-muted-foreground">Engagement Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageResponseTime}h</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageActivitiesPerDay}</p>
                <p className="text-xs text-muted-foreground">Per Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities">Activity Types</TabsTrigger>
          <TabsTrigger value="trend">Engagement Trend</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {activityTypeData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {activityTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {activityTypeData.map((item, index) => {
                      const Icon = getActivityIcon(item.type);
                      const percentage = ((item.value / stats.totalActivities) * 100).toFixed(1);
                      
                      return (
                        <div key={item.type} className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="flex-1 text-sm">{item.name}</span>
                          <Badge variant="outline">{item.value}</Badge>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No activity data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Engagement Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {engagementTrendData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          value, 
                          name === 'points' ? 'Engagement Points' : 'Activities'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="points" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activities" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No engagement data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              {outcomeData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={outcomeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {outcomeData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={parseFloat(item.percentage)} 
                            className="w-24 h-2" 
                          />
                          <Badge variant="outline">{item.value}</Badge>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No outcome data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performing Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Performing Activity Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topPerformingTypes.length > 0 ? (
            <div className="space-y-3">
              {stats.topPerformingTypes.map((item, index) => {
                const Icon = getActivityIcon(item.type);
                const config = ACTIVITY_TYPE_CONFIGS[item.type];
                
                return (
                  <div key={item.type} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{config.name}</span>
                    </div>
                    
                    <div className="flex-1" />
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {item.conversionRate.toFixed(1)}% conversion
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.averageEngagement.toFixed(1)} avg engagement
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No performance data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};