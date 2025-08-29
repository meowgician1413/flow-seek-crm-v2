import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      <div className="mb-6 p-6 bg-gradient-subtle rounded-full shadow-card">
        <Icon className="h-12 w-12 text-muted-foreground/70" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-3">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="animate-fade-in bg-gradient-primary shadow-elegant hover:shadow-glow"
          size="lg"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};