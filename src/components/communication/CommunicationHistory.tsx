import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunicationLog, CommunicationType, CommunicationStatus } from '@/types/communication';
import { useCommunication } from '@/contexts/CommunicationContext';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunicationHistoryProps {
  leadId?: string;
  showFilters?: boolean;
  compact?: boolean;
}

const getTypeIcon = (type: CommunicationType) => {
  switch (type) {
    case 'call': return Phone;
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return MessageSquare;
    case 'meeting': return Calendar;
    default: return MessageSquare;
  }
};

const getTypeColor = (type: CommunicationType) => {
  switch (type) {
    case 'call': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'email': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
    case 'sms': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    case 'whatsapp': return 'text-green-500 bg-green-50 dark:bg-green-950/20';
    case 'meeting': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  }
};

const getStatusIcon = (status: CommunicationStatus) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'sent': return Send;
    case 'delivered': return CheckCircle;
    case 'failed': return XCircle;
    case 'pending': return Clock;
    default: return Clock;
  }
};

const getStatusColor = (status: CommunicationStatus) => {
  switch (status) {
    case 'completed': return 'text-green-600';
    case 'sent': return 'text-blue-600';
    case 'delivered': return 'text-green-600';
    case 'failed': return 'text-red-600';
    case 'pending': return 'text-orange-600';
    default: return 'text-gray-600';
  }
};

export const CommunicationHistory = ({ leadId, showFilters = true, compact = false }: CommunicationHistoryProps) => {
  const { communicationLogs, getCommunicationsByLeadId } = useCommunication();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommunicationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | 'all'>('all');

  // Get communications - either for specific lead or all
  const communications = leadId 
    ? getCommunicationsByLeadId(leadId)
    : communicationLogs;

  // Apply filters
  const filteredCommunications = communications.filter(comm => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !comm.content?.toLowerCase().includes(searchLower) &&
        !comm.subject?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== 'all' && comm.type !== typeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && comm.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const CommunicationItem = ({ communication }: { communication: CommunicationLog }) => {
    const TypeIcon = getTypeIcon(communication.type);
    const StatusIcon = getStatusIcon(communication.status);
    const typeColor = getTypeColor(communication.type);
    const statusColor = getStatusColor(communication.status);

    return (
      <div className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", typeColor)}>
          <TypeIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{communication.type}</span>
              {communication.duration && (
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(communication.duration)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("w-4 h-4", statusColor)} />
              <span className="text-xs text-muted-foreground">
                {formatDate(communication.createdAt)}
              </span>
            </div>
          </div>
          
          {communication.subject && (
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {communication.subject}
            </p>
          )}
          
          {communication.content && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {communication.content}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", statusColor)}
            >
              {communication.status}
            </Badge>
            {communication.templateId && (
              <Badge variant="secondary" className="text-xs">
                Template Used
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {filteredCommunications.length > 0 ? (
          filteredCommunications.slice(0, 3).map((communication) => (
            <CommunicationItem key={communication.id} communication={communication} />
          ))
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No communications yet</p>
          </div>
        )}
        
        {filteredCommunications.length > 3 && (
          <Button variant="outline" className="w-full">
            View All ({filteredCommunications.length} total)
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Communication History
        </CardTitle>
        
        {showFilters && (
          <div className="flex gap-2 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CommunicationType | 'all')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CommunicationStatus | 'all')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {filteredCommunications.length > 0 ? (
          filteredCommunications.map((communication) => (
            <CommunicationItem key={communication.id} communication={communication} />
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No communications found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Communications will appear here when you interact with leads'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};