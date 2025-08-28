import React, { useState } from 'react';
import { Bell, CheckCheck, Settings, Trash2, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationSettings } from './NotificationSettings';
import { NotificationType } from '@/types/notification';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAll,
    isConnected 
  } = useNotifications();
  
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');

  const filteredNotifications = notifications.filter(notification => 
    filterType === 'all' || notification.type === filterType
  );

  const unreadNotifications = filteredNotifications.filter(n => !n.read);
  const readNotifications = filteredNotifications.filter(n => n.read);

  const notificationTypes: Array<{value: NotificationType | 'all', label: string}> = [
    { value: 'all', label: 'All' },
    { value: 'new_lead', label: 'New Leads' },
    { value: 'follow_up_due', label: 'Follow-ups' },
    { value: 'content_viewed', label: 'Content Views' },
    { value: 'high_engagement', label: 'High Engagement' },
    { value: 'integration_error', label: 'Errors' },
    { value: 'daily_summary', label: 'Summaries' },
  ];

  if (showSettings) {
    return <NotificationSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border-b">
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
            Reconnecting to notification service...
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by type:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {notificationTypes.map(type => (
            <Button
              key={type.value}
              variant={filterType === type.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType(type.value)}
              className="h-7 text-xs"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y">
            {/* Unread notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
                
                {readNotifications.length > 0 && (
                  <Separator className="my-2" />
                )}
              </div>
            )}
            
            {/* Read notifications */}
            {readNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer Actions */}
      {notifications.length > 0 && (
        <div className="p-3 border-t flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs"
          >
            Mark all read
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};