import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  FileText, 
  Eye, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Settings,
  Shield,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '@/types/notification';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
}

const notificationIcons: Record<NotificationType, React.ComponentType<any>> = {
  new_lead: User,
  follow_up_due: CheckCircle2,
  content_viewed: Eye,
  high_engagement: TrendingUp,
  integration_error: AlertTriangle,
  daily_summary: BarChart3,
  system_maintenance: Settings,
  account_limit: AlertTriangle,
  security_alert: Shield,
  feature_update: Sparkles,
};

const notificationColors: Record<NotificationType, string> = {
  new_lead: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  follow_up_due: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
  content_viewed: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
  high_engagement: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
  integration_error: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
  daily_summary: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20',
  system_maintenance: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20',
  account_limit: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
  security_alert: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
  feature_update: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20',
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div 
      className={cn(
        "p-3 hover:bg-muted/50 cursor-pointer group transition-colors",
        !notification.read && "bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "text-sm font-medium",
                !notification.read && "font-semibold"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            
            {notification.data?.leadName && (
              <Badge variant="outline" className="text-xs">
                {notification.data.leadName}
              </Badge>
            )}
            
            {notification.data?.priority === 'high' && (
              <Badge variant="destructive" className="text-xs">
                High Priority
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};