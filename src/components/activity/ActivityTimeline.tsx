import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EnhancedActivity, ActivityType, ACTIVITY_TYPE_CONFIGS } from '@/types/activity';
import { useActivities } from '@/contexts/ActivityContext';
import { AddActivityModal } from './AddActivityModal';
import { ActivityCard } from './ActivityCard';
import { 
  Filter, 
  Search, 
  Plus, 
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  leadId?: string;
  showFilters?: boolean;
  showAddButton?: boolean;
  compact?: boolean;
  limit?: number;
}

export const ActivityTimeline = ({ 
  leadId, 
  showFilters = true, 
  showAddButton = true,
  compact = false,
  limit 
}: ActivityTimelineProps) => {
  const { 
    activities, 
    getActivitiesByLeadId, 
    getRecentActivities,
    filters, 
    setFilters 
  } = useActivities();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');

  // Get relevant activities
  const relevantActivities = leadId 
    ? getActivitiesByLeadId(leadId)
    : getRecentActivities();

  // Apply filters
  const filteredActivities = relevantActivities.filter(activity => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !activity.title.toLowerCase().includes(searchLower) &&
        !activity.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== 'all' && activity.type !== typeFilter) {
      return false;
    }

    return true;
  });

  // Apply limit if specified
  const displayActivities = limit 
    ? filteredActivities.slice(0, limit)
    : filteredActivities;

  const formatTimeGroup = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return 'Today';
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return 'This week';
    return 'Earlier';
  };

  // Group activities by time periods
  const groupedActivities = displayActivities.reduce((groups, activity) => {
    const timeGroup = formatTimeGroup(activity.createdAt);
    if (!groups[timeGroup]) {
      groups[timeGroup] = [];
    }
    groups[timeGroup].push(activity);
    return groups;
  }, {} as Record<string, EnhancedActivity[]>);

  const timeGroupOrder = ['Just now', 'Today', 'Yesterday', 'This week', 'Earlier'];

  if (compact) {
    return (
      <div className="space-y-3">
        {displayActivities.map((activity, index) => (
          <div key={activity.id} className="relative">
            <ActivityCard 
              activity={activity} 
              showTimeline={index < displayActivities.length - 1}
              compact 
            />
          </div>
        ))}
        
        {displayActivities.length === 0 && (
          <div className="text-center py-6">
            <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No activities yet</p>
          </div>
        )}
        
        {showAddButton && leadId && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <AddActivityModal 
                leadId={leadId}
                onClose={() => setIsAddModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Timeline
            {filteredActivities.length > 0 && (
              <Badge variant="secondary">
                {filteredActivities.length}
              </Badge>
            )}
          </CardTitle>
          
          {showAddButton && leadId && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <AddActivityModal 
                  leadId={leadId}
                  onClose={() => setIsAddModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {showFilters && (
          <div className="flex gap-2 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select 
              value={typeFilter} 
              onValueChange={(value) => setTypeFilter(value as ActivityType | 'all')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(ACTIVITY_TYPE_CONFIGS).map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        {Object.keys(groupedActivities).length > 0 ? (
          <div className="space-y-6">
            {timeGroupOrder.map((timeGroup) => {
              const groupActivities = groupedActivities[timeGroup];
              if (!groupActivities || groupActivities.length === 0) return null;
              
              return (
                <div key={timeGroup} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {timeGroup}
                    </h3>
                    <div className="flex-1 h-px bg-border" />
                    <Badge variant="outline" className="text-xs">
                      {groupActivities.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 ml-4">
                    {groupActivities.map((activity, index) => (
                      <div key={activity.id} className="relative">
                        <ActivityCard 
                          activity={activity}
                          showTimeline={index < groupActivities.length - 1}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activities found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Activities will appear here as you interact with leads'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};