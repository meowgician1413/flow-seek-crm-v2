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
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9'
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-6 z-50 rounded-full shadow-glow hover:shadow-elegant hover:scale-110 transition-all duration-300",
        "bg-gradient-primary text-primary-foreground",
        "border-2 border-primary-foreground/10 backdrop-blur-sm",
        sizeClasses[size],
        className
      )}
      size="icon"
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
};