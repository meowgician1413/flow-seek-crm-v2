import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { 
  Clock, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TasksSectionProps {
  leads: Lead[];
  onLeadClick?: (leadId: string) => void;
  onQuickAction?: (leadId: string, action: string) => void;
}

export const TasksSection = ({ leads, onLeadClick, onQuickAction }: TasksSectionProps) => {
  // Mock follow-up data - in real app this would come from activities/tasks
  const followUpTasks = leads
    .filter(lead => lead.status === 'New' || lead.status === 'Contacted')
    .slice(0, 5)
    .map(lead => ({
      ...lead,
      followUpDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within week
      isOverdue: Math.random() > 0.7, // 30% chance of being overdue
    }));

  const todayTasks = followUpTasks.filter(task => 
    isToday(task.followUpDate) || task.isOverdue
  );

  const overdueTasks = followUpTasks.filter(task => task.isOverdue);
  const newLeadsToday = leads.filter(lead => 
    isToday(parseISO(lead.createdAt))
  );

  return (
    <div className="space-y-4">
      {/* Today's Tasks */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Today's Tasks
            {todayTasks.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {todayTasks.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {todayTasks.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No tasks for today</p>
            </div>
          ) : (
            <div className="space-y-0">
              {todayTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onLeadClick?.(task.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        task.isOverdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      )}>
                        {task.isOverdue ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Follow-up • {format(task.followUpDate, 'HH:mm')}
                          {task.isOverdue && (
                            <span className="text-destructive ml-2">Overdue</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onQuickAction?.(task.id, 'call')}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onQuickAction?.(task.id, 'email')}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Leads Today */}
      {newLeadsToday.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              New Leads Today
              <Badge variant="secondary" className="ml-auto">
                {newLeadsToday.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {newLeadsToday.slice(0, 3).map((lead) => (
                <div 
                  key={lead.id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onLeadClick?.(lead.id)}
                >
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <Badge variant="outline" className="text-secondary border-secondary">
                    {lead.source}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};