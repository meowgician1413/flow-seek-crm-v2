import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageTemplate } from '@/types/template';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Edit, 
  Copy, 
  Trash2, 
  Star,
  MoreVertical,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface TemplateCardProps {
  template: MessageTemplate;
  onEdit: (template: MessageTemplate) => void;
  onDuplicate: (template: MessageTemplate) => void;
  onDelete: (template: MessageTemplate) => void;
  onToggleFavorite: (template: MessageTemplate) => void;
  onQuickSend?: (template: MessageTemplate) => void;
}

const getTypeIcon = (type: MessageTemplate['type']) => {
  switch (type) {
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return Phone;
  }
};

const getTypeColor = (type: MessageTemplate['type']) => {
  switch (type) {
    case 'email': return 'bg-primary/10 text-primary border-primary/20';
    case 'sms': return 'bg-success/10 text-success border-success/20';
    case 'whatsapp': return 'bg-secondary/10 text-secondary border-secondary/20';
  }
};

const getCategoryColor = (category: MessageTemplate['category']) => {
  switch (category) {
    case 'Introduction': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Follow-up': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Closing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Custom': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  }
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onQuickSend
}) => {
  const TypeIcon = getTypeIcon(template.type);
  const timeAgo = formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true });

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${getTypeColor(template.type)} border`}>
              <TypeIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
                {template.isFavorite && (
                  <Star className="w-4 h-4 text-warning fill-current" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getCategoryColor(template.category)}`}
                >
                  {template.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.type.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onQuickSend && (
                <>
                  <DropdownMenuItem onClick={() => onQuickSend(template)}>
                    <Send className="w-4 h-4 mr-2" />
                    Quick Send
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(template)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(template)}>
                <Star className={`w-4 h-4 mr-2 ${template.isFavorite ? 'fill-current' : ''}`} />
                {template.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(template)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Subject (for email templates) */}
        {template.subject && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground font-medium">
              Subject: {template.subject}
            </p>
          </div>
        )}

        {/* Content Preview */}
        <div className="bg-muted/50 rounded-lg p-3 mb-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {template.content}
          </p>
        </div>

        {/* Variables */}
        {template.variables.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {template.variables.slice(0, 3).map((variable) => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {variable}
                </Badge>
              ))}
              {template.variables.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.variables.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Used {template.usageCount} times</span>
          <span>Updated {timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
};