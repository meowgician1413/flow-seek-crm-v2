import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

export const StatsCard = ({ 
  label, 
  value, 
  icon: Icon, 
  variant = 'default', 
  trend,
  className 
}: StatsCardProps) => {
  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs flex items-center gap-1 mt-1",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                <span>{trend.isPositive ? "↗" : "↘"}</span>
                {Math.abs(trend.value)}% vs last week
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg bg-muted/50",
            variantStyles[variant]
          )}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};