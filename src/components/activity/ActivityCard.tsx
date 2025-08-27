import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EnhancedActivity, ACTIVITY_TYPE_CONFIGS } from '@/types/activity';
import { useActivities } from '@/contexts/ActivityContext';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  StickyNote, 
  ArrowRightLeft,
  Calendar,
  FileText,
  Eye,
  Send,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Timer,
  Target,
  Tag,
  Link,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activity: EnhancedActivity;
  showTimeline?: boolean;
  compact?: boolean;
  expandable?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'call': return Phone;
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return MessageSquare;
    case 'note': return StickyNote;
    case 'status_change': return ArrowRightLeft;
    case 'meeting': return Calendar;
    case 'file_share': return FileText;
    case 'page_view': return Eye;
    case 'template_sent': return Send;
    case 'follow_up': return Clock;
    default: return Clock;
  }
};

const getOutcomeIcon = (outcome?: string) => {
  switch (outcome) {
    case 'successful': return CheckCircle;
    case 'interested': return CheckCircle;
    case 'converted': return CheckCircle;
    case 'no_answer': return XCircle;
    case 'not_interested': return XCircle;
    case 'busy': return AlertCircle;
    case 'voicemail': return AlertCircle;
    case 'callback_requested': return AlertCircle;
    default: return null;
  }
};

const getOutcomeColor = (outcome?: string) => {
  switch (outcome) {
    case 'successful':
    case 'interested':
    case 'converted':
      return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'no_answer':
    case 'not_interested':
      return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    case 'busy':
    case 'voicemail':
    case 'callback_requested':
      return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  }
};

export const ActivityCard = ({ 
  activity, 
  showTimeline = false, 
  compact = false,
  expandable = true 
}: ActivityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { updateActivity, deleteActivity } = useActivities();
  
  const config = ACTIVITY_TYPE_CONFIGS[activity.type];
  const Icon = getActivityIcon(activity.type);
  const OutcomeIcon = activity.outcome ? getOutcomeIcon(activity.outcome) : null;
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const hasExpandableContent = activity.description || 
    activity.metadata || 
    activity.tags?.length || 
    activity.duration ||
    activity.outcome;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(activity.id);
    }
  };

  return (
    <div className="relative">
      {/* Timeline connector */}
      {showTimeline && (
        <div className="absolute left-5 top-12 w-0.5 h-full bg-border -z-10" />
      )}
      
      <div className={cn(
        "flex gap-3",
        compact ? "p-2" : "p-3",
        "border rounded-lg hover:bg-muted/30 transition-colors"
      )}>
        {/* Activity icon */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          config.bgColor
        )}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        
        {/* Activity content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                {activity.isAutomated && (
                  <Badge variant="outline" className="text-xs">
                    Auto
                  </Badge>
                )}
                {activity.engagementPoints > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{activity.engagementPoints} pts
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatTime(activity.createdAt)}</span>
                
                {activity.duration && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      <span>{formatDuration(activity.duration)}</span>
                    </div>
                  </>
                )}
                
                {activity.outcome && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {OutcomeIcon && <OutcomeIcon className="w-3 h-3" />}
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs capitalize", getOutcomeColor(activity.outcome))}
                      >
                        {activity.outcome.replace('_', ' ')}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Expandable content */}
          {hasExpandableContent && expandable ? (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              {!isExpanded && activity.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {activity.description}
                </p>
              )}
              
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <><ChevronDown className="w-3 h-3 mr-1" /> Show less</>
                  ) : (
                    <><ChevronRight className="w-3 h-3 mr-1" /> Show more</>
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 mt-2">
                {activity.description && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">Description</h5>
                    <p className="text-sm text-foreground">{activity.description}</p>
                  </div>
                )}
                
                {activity.tags && activity.tags.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">Tags</h5>
                    <div className="flex flex-wrap gap-1">
                      {activity.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {activity.metadata && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">Details</h5>
                    <div className="space-y-1">
                      {activity.metadata.templateId && (
                        <div className="text-xs text-muted-foreground">
                          Template: {activity.metadata.templateId}
                        </div>
                      )}
                      {activity.metadata.emailOpened && (
                        <div className="text-xs text-green-600">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Email opened
                        </div>
                      )}
                      {activity.metadata.pageUrl && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Link className="w-3 h-3 mr-1" />
                          {activity.metadata.pageUrl}
                        </div>
                      )}
                      {activity.metadata.previousStatus && activity.metadata.newStatus && (
                        <div className="text-xs text-muted-foreground">
                          {activity.metadata.previousStatus} → {activity.metadata.newStatus}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activity.scheduledFor && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">Scheduled</h5>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(activity.scheduledFor)}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            // Non-expandable content (compact mode)
            activity.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {activity.description}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};