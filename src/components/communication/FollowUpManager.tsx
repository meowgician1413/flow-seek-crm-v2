import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FollowUp, FollowUpStatus, CommunicationType } from '@/types/communication';
import { useCommunication } from '@/contexts/CommunicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  X, 
  PauseCircle, 
  MoreVertical,
  Plus,
  Bell,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowUpManagerProps {
  leadId?: string;
  compact?: boolean;
}

const getTypeIcon = (type?: CommunicationType) => {
  switch (type) {
    case 'call': return Phone;
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return MessageSquare;
    default: return Bell;
  }
};

const getStatusColor = (status: FollowUpStatus) => {
  switch (status) {
    case 'pending': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    case 'completed': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    case 'snoozed': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  }
};

export const FollowUpManager = ({ leadId, compact = false }: FollowUpManagerProps) => {
  const { 
    followUps, 
    getFollowUpsByLeadId, 
    getPendingFollowUps,
    getTodayFollowUps,
    scheduleFollowUp, 
    completeFollowUp, 
    snoozeFollowUp, 
    cancelFollowUp 
  } = useCommunication();
  const { user } = useAuth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    type: undefined as CommunicationType | undefined,
  });

  // Get follow-ups based on context
  const relevantFollowUps = leadId 
    ? getFollowUpsByLeadId(leadId)
    : getPendingFollowUps();

  const todayFollowUps = getTodayFollowUps();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (Math.abs(diffInHours) < 24) {
      if (diffInHours > 0) {
        return `In ${Math.round(diffInHours)}h`;
      } else {
        return `${Math.round(Math.abs(diffInHours))}h ago`;
      }
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date();
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUp.title || !newFollowUp.scheduledDate || !leadId) return;

    await scheduleFollowUp({
      leadId,
      userId: user?.id || '1',
      title: newFollowUp.title,
      description: newFollowUp.description,
      scheduledDate: newFollowUp.scheduledDate,
      status: 'pending',
      type: newFollowUp.type,
    });

    setNewFollowUp({
      title: '',
      description: '',
      scheduledDate: '',
      type: undefined,
    });
    setIsAddModalOpen(false);
  };

  const handleSnooze = async (followUpId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    await snoozeFollowUp(followUpId, tomorrow.toISOString());
  };

  const FollowUpItem = ({ followUp }: { followUp: FollowUp }) => {
    const TypeIcon = getTypeIcon(followUp.type);
    const statusColor = getStatusColor(followUp.status);
    const overdue = isOverdue(followUp.scheduledDate) && followUp.status === 'pending';

    return (
      <div className={cn(
        "flex gap-3 p-3 border rounded-lg transition-colors",
        overdue ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20" : "hover:bg-muted/50"
      )}>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", statusColor)}>
          <TypeIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-medium">{followUp.title}</h4>
            <div className="flex items-center gap-2">
              {overdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {followUp.status === 'pending' && (
                    <>
                      <DropdownMenuItem onClick={() => completeFollowUp(followUp.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnooze(followUp.id)}>
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Snooze until tomorrow
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={() => cancelFollowUp(followUp.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {followUp.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {followUp.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatDate(followUp.scheduledDate)}</span>
            </div>
            <Badge variant="outline" className={cn("text-xs", statusColor)}>
              {followUp.status}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    const upcomingFollowUps = relevantFollowUps.filter(f => f.status === 'pending').slice(0, 3);
    
    return (
      <div className="space-y-3">
        {upcomingFollowUps.length > 0 ? (
          upcomingFollowUps.map((followUp) => (
            <FollowUpItem key={followUp.id} followUp={followUp} />
          ))
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No follow-ups scheduled</p>
          </div>
        )}
        
        {leadId && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Follow-up</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newFollowUp.title}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Follow-up title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newFollowUp.description}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What should you follow up about?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Date & Time</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={newFollowUp.scheduledDate}
                    onChange={(e) => setNewFollowUp(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type (Optional)</Label>
                  <Select 
                     value={newFollowUp.type || 'no-type'}
                     onValueChange={(value) => setNewFollowUp(prev => ({ 
                       ...prev, 
                       type: value === 'no-type' ? undefined : value as CommunicationType 
                     }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select follow-up type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-type">No specific type</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddFollowUp}
                    disabled={!newFollowUp.title || !newFollowUp.scheduledDate}
                  >
                    Schedule Follow-up
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Follow-ups
            {todayFollowUps.length > 0 && (
              <Badge variant="secondary">
                {todayFollowUps.length} due today
              </Badge>
            )}
          </div>
          {leadId && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Follow-up
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Follow-up</DialogTitle>
                </DialogHeader>
                {/* Same form content as above */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newFollowUp.title}
                      onChange={(e) => setNewFollowUp(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Follow-up title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newFollowUp.description}
                      onChange={(e) => setNewFollowUp(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What should you follow up about?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Date & Time</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={newFollowUp.scheduledDate}
                      onChange={(e) => setNewFollowUp(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type (Optional)</Label>
                    <Select 
                      value={newFollowUp.type || 'no-type'} 
                       onValueChange={(value) => setNewFollowUp(prev => ({ 
                         ...prev, 
                         type: value === 'no-type' ? undefined : value as CommunicationType 
                       }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select follow-up type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-type">No specific type</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddFollowUp}
                      disabled={!newFollowUp.title || !newFollowUp.scheduledDate}
                    >
                      Schedule Follow-up
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {relevantFollowUps.length > 0 ? (
          relevantFollowUps.map((followUp) => (
            <FollowUpItem key={followUp.id} followUp={followUp} />
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No follow-ups scheduled</p>
            <p className="text-sm text-muted-foreground">
              Stay on top of your leads by scheduling follow-ups
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};