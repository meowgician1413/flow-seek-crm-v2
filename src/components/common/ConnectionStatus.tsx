import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className,
  showText = false 
}) => {
  const isOnline = useOnlineStatus();

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs",
      isOnline ? "text-green-600" : "text-red-600",
      className
    )}>
      {isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      
      {showText && (
        <span className="font-medium">
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
};