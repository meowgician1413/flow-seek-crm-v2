import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { TrendingUp, Zap, AlertCircle, Activity } from 'lucide-react';

export function IntegrationStats() {
  const { sources, logs } = useIntegrations();

  const activeSources = sources.filter(s => s.status === 'active').length;
  const errorSources = sources.filter(s => s.status === 'error').length;
  const successLogs = logs.filter(l => l.status === 'success').length;
  const errorLogs = logs.filter(l => l.status === 'error').length;
  
  const successRate = logs.length > 0 ? (successLogs / logs.length) * 100 : 0;

  const stats = [
    {
      label: 'Active Sources',
      value: activeSources,
      total: sources.length,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Success Rate',
      value: `${Math.round(successRate)}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Recent Activity',
      value: logs.filter(l => {
        const logDate = new Date(l.created_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return logDate > dayAgo;
      }).length,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Errors',
      value: errorSources + errorLogs,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.total && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    of {stat.total}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}