import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from '@/types/lead';
import { formatDistanceToNow } from 'date-fns';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick?: (leadId: string) => void;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'call':
      return Phone;
    case 'email':
      return Mail;
    case 'sms':
    case 'whatsapp':
      return MessageSquare;
    case 'status_change':
      return TrendingUp;
    case 'note_added':
      return FileText;
    case 'meeting':
      return Calendar;
    default:
      return User;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'call':
      return 'text-primary';
    case 'email':
      return 'text-secondary';
    case 'sms':
    case 'whatsapp':
      return 'text-success';
    case 'status_change':
      return 'text-warning';
    case 'note_added':
      return 'text-muted-foreground';
    case 'meeting':
      return 'text-primary';
    default:
      return 'text-muted-foreground';
  }
};

export const ActivityFeed = ({ activities, onActivityClick }: ActivityFeedProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.slice(0, 10).map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
              
              return (
                <div 
                  key={activity.id} 
                  className={cn(
                    "flex items-start gap-3 p-4 border-b border-border last:border-b-0",
                    "hover:bg-muted/50 transition-colors cursor-pointer"
                  )}
                  onClick={() => onActivityClick?.(activity.leadId)}
                >
                  <div className={cn(
                    "p-2 rounded-full bg-muted/50 flex-shrink-0",
                    getActivityColor(activity.type)
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};