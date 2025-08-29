import React from 'react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MobileHeaderProps {
  title?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title = 'LeadFlow' }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50 shadow-card">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-elegant">
              <span className="text-primary-foreground font-bold text-lg drop-shadow-sm">L</span>
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground">
                Professional CRM
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <Avatar className="h-9 w-9 ring-2 ring-primary/20 shadow-card">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};