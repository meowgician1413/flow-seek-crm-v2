import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EngagementScore as EngagementScoreType } from '@/types/activity';
import { useActivities } from '@/contexts/ActivityContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Flame,
  Thermometer,
  Snowflake,
  Clock,
  Activity,
  Target,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementScoreProps {
  leadId: string;
  compact?: boolean;
  showDetails?: boolean;
}

export const EngagementScore = ({ leadId, compact = false, showDetails = true }: EngagementScoreProps) => {
  const { engagementScores, calculateEngagementScore } = useActivities();
  
  const score = engagementScores[leadId] || calculateEngagementScore(leadId);

  const getScoreLevelConfig = (level: 'hot' | 'warm' | 'cold') => {
    switch (level) {
      case 'hot':
        return {
          icon: Flame,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200',
          label: 'Hot Lead',
          description: 'High engagement, immediate follow-up recommended',
        };
      case 'warm':
        return {
          icon: Thermometer,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200',
          label: 'Warm Lead',
          description: 'Moderate engagement, regular follow-up needed',
        };
      case 'cold':
        return {
          icon: Snowflake,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200',
          label: 'Cold Lead',
          description: 'Low engagement, nurturing required',
        };
    }
  };

  const config = getScoreLevelConfig(score.scoreLevel);
  const ScoreLevelIcon = config.icon;

  const getEngagementTrend = () => {
    const recentRatio = score.totalPoints > 0 ? (score.recentPoints / score.totalPoints) * 100 : 0;
    if (recentRatio > 70) return { icon: TrendingUp, color: 'text-green-600', label: 'Trending Up' };
    if (recentRatio < 30) return { icon: TrendingDown, color: 'text-red-600', label: 'Trending Down' };
    return { icon: Minus, color: 'text-gray-600', label: 'Stable' };
  };

  const trend = getEngagementTrend();
  const TrendIcon = trend.icon;

  const formatDaysAgo = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bgColor)}>
          <ScoreLevelIcon className={cn("w-4 h-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", config.color, config.borderColor)}
            >
              {config.label}
            </Badge>
            <div className="flex items-center gap-1">
              <TrendIcon className={cn("w-3 h-3", trend.color)} />
              <span className="text-xs text-muted-foreground">
                {score.recentPoints} pts
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {score.conversionProbability.toFixed(0)}% conversion chance
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(config.borderColor, "border-2")}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <ScoreLevelIcon className={cn("w-5 h-5", config.color)} />
            Engagement Score
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Engagement score is calculated based on activity frequency, 
                  type, and recency. Higher scores indicate more engaged leads.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Level */}
        <div className={cn("p-3 rounded-lg", config.bgColor)}>
          <div className="flex items-center justify-between mb-2">
            <Badge 
              variant="outline" 
              className={cn("text-sm", config.color, config.borderColor)}
            >
              {config.label}
            </Badge>
            <div className="flex items-center gap-1">
              <TrendIcon className={cn("w-4 h-4", trend.color)} />
              <span className="text-sm font-medium">{trend.label}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>

        {/* Score Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Total Points</span>
            </div>
            <div className="text-2xl font-bold">{score.totalPoints}</div>
            <div className="text-xs text-muted-foreground">
              {score.recentPoints} recent
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Conversion</span>
            </div>
            <div className="text-2xl font-bold">{score.conversionProbability.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">probability</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Recent Activity</span>
            <span className="font-medium">{score.recentPoints}/50 points</span>
          </div>
          <Progress value={(score.recentPoints / 50) * 100} className="h-2" />
        </div>

        {showDetails && (
          <>
            {/* Activity Stats */}
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <div className="text-lg font-semibold">{score.responseRate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Response Rate</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{score.activityFrequency.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Acts/Week</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{score.daysSinceLastActivity}</div>
                <div className="text-xs text-muted-foreground">Days Ago</div>
              </div>
            </div>

            {/* Last Activity */}
            {score.lastActivity && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last activity:</span>
                <span className="font-medium">{formatDaysAgo(score.daysSinceLastActivity)}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};