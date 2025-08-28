import { useState } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityType, ActivityOutcome, ACTIVITY_TYPE_CONFIGS } from '@/types/activity';
import { useActivities } from '@/contexts/ActivityContext';
import { useAuth } from '@/contexts/AuthContext';
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
  Timer,
  Target,
  Tag,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddActivityModalProps {
  leadId: string;
  onClose: () => void;
  initialType?: ActivityType;
}

const activityTypeOptions = Object.values(ACTIVITY_TYPE_CONFIGS).filter(
  config => !['status_change', 'template_sent'].includes(config.id) // Hide automated types
);

const outcomeOptions: { value: ActivityOutcome; label: string }[] = [
  { value: 'successful', label: 'Successful' },
  { value: 'interested', label: 'Interested' },
  { value: 'converted', label: 'Converted' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'busy', label: 'Busy' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'callback_requested', label: 'Callback Requested' },
  { value: 'not_interested', label: 'Not Interested' },
];

export const AddActivityModal = ({ leadId, onClose, initialType }: AddActivityModalProps) => {
  const { addActivity, isLoading } = useActivities();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: initialType || 'note' as ActivityType,
    title: '',
    description: '',
    outcome: undefined as ActivityOutcome | undefined,
    duration: undefined as number | undefined,
    scheduledFor: '',
    tags: [] as string[],
  });
  
  const [newTag, setNewTag] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [durationString, setDurationString] = useState('');

  const selectedConfig = ACTIVITY_TYPE_CONFIGS[formData.type];

  const handleTypeChange = (type: ActivityType) => {
    setFormData(prev => ({
      ...prev,
      type,
      // Reset type-specific fields
      outcome: undefined,
      duration: undefined,
    }));
    setDurationString('');
  };

  const handleDurationChange = (value: string) => {
    setDurationString(value);
    const duration = parseInt(value);
    setFormData(prev => ({
      ...prev,
      duration: isNaN(duration) ? undefined : duration,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    const activityData = {
      leadId,
      userId: user?.id || '1',
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      outcome: formData.outcome,
      duration: formData.duration,
      scheduledFor: isScheduled && formData.scheduledFor ? formData.scheduledFor : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      isAutomated: false,
    };

    try {
      await addActivity(activityData);
      onClose();
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'whatsapp': return MessageSquare;
      case 'note': return StickyNote;
      case 'meeting': return Calendar;
      case 'file_share': return FileText;
      case 'follow_up': return Clock;
      default: return Clock;
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Activity</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Activity Type Selection */}
        <div className="space-y-3">
          <Label>Activity Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {activityTypeOptions.map((config) => {
              const Icon = getTypeIcon(config.id);
              return (
                <Button
                  key={config.id}
                  variant={formData.type === config.id ? "default" : "outline"}
                  onClick={() => handleTypeChange(config.id)}
                  className={cn(
                    "h-12 flex flex-col gap-1 text-xs",
                    formData.type === config.id && selectedConfig.bgColor
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {config.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Activity Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter activity title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add details about this activity..."
              className="min-h-[100px]"
            />
          </div>

          {/* Duration (for applicable types) */}
          {selectedConfig.allowDuration && (
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={durationString}
                onChange={(e) => handleDurationChange(e.target.value)}
                placeholder="Enter duration in minutes"
                min="1"
              />
            </div>
          )}

          {/* Outcome (for applicable types) */}
          {selectedConfig.allowOutcome && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Outcome
              </Label>
               <Select 
                 value={formData.outcome || 'no-outcome'}
                 onValueChange={(value) => setFormData(prev => ({ 
                   ...prev, 
                   outcome: value === 'no-outcome' ? undefined : value as ActivityOutcome 
                 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-outcome">No outcome</SelectItem>
                  {outcomeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto w-auto p-0 ml-1"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Activity
              </Label>
              <Switch
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
            </div>

            {isScheduled && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="scheduledFor">Date & Time</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Activity Preview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", selectedConfig.bgColor)}>
                {(() => {
                  const Icon = getTypeIcon(formData.type);
                  return <Icon className={cn("w-4 h-4", selectedConfig.color)} />;
                })()}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {formData.title || 'Activity title'}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedConfig.name}</span>
                  {formData.duration && (
                    <>
                      <span>•</span>
                      <span>{formData.duration}m</span>
                    </>
                  )}
                  {formData.outcome && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{formData.outcome.replace('_', ' ')}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                +{selectedConfig.engagementPoints} pts
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isLoading}
          >
            Add Activity
          </Button>
        </div>
      </div>
    </>
  );
};