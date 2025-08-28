import React from 'react';
import { Plus, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon: Icon = Plus,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7'
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "border-2 border-primary-foreground/20",
        sizeClasses[size],
        className
      )}
      size="icon"
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
};