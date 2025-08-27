import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Lead, LeadStatus } from '@/types/lead';
import { useLeads } from '@/contexts/LeadContext';
import { CommunicationButtons } from '@/components/communication/CommunicationButtons';
import { Phone, Mail, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
}

const statusColors = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200',
  Qualified: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200',
  Converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200',
  Lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200',
};

const quickStatusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export const LeadCard = ({ lead, onEdit }: LeadCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateLeadStatus, deleteLead } = useLeads();
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === lead.status) return;
    
    setIsUpdating(true);
    try {
      await updateLeadStatus(lead.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      await deleteLead(lead.id);
    }
  };

  const handleCall = () => {
    window.open(`tel:${lead.phone}`);
  };

  const handleEmail = () => {
    window.open(`mailto:${lead.email}`);
  };

  const handleCardClick = () => {
    navigate(`/leads/${lead.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card 
      className={cn(
        "shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in",
        isUpdating && "opacity-75"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground truncate pr-2">{lead.name}</h3>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger 
                    asChild 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge 
                      className={cn(
                        "cursor-pointer hover:opacity-80 transition-opacity",
                        statusColors[lead.status]
                      )}
                    >
                      {lead.status}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    {quickStatusOptions.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(status);
                        }}
                        className={cn(
                          "cursor-pointer",
                          status === lead.status && "bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", {
                            'bg-blue-500': status === 'New',
                            'bg-yellow-500': status === 'Contacted',
                            'bg-orange-500': status === 'Qualified',
                            'bg-green-500': status === 'Converted',
                            'bg-red-500': status === 'Lost',
                          })} />
                          {status}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center truncate">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{lead.phone}</span>
              </div>
            </div>
            
            {lead.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {lead.notes}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded">
              {lead.source}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(lead.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <CommunicationButtons 
              lead={lead} 
              variant="compact"
              className="mr-2"
            />
            <DropdownMenu>
              <DropdownMenuTrigger 
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(lead);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Lead
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};