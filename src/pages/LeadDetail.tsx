import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLeads } from '@/contexts/LeadContext';
import { EditLeadModal } from '@/components/leads/EditLeadModal';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  Edit, 
  Trash2,
  Clock,
  User,
  Building,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200',
  Qualified: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200',
  Converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200',
  Lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200',
};

const activityIcons = {
  status_change: Clock,
  note_added: Edit,
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  meeting: Calendar,
};

export const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLeadById, getActivitiesByLeadId, deleteLead } = useLeads();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const lead = id ? getLeadById(id) : null;
  const activities = id ? getActivitiesByLeadId(id) : [];

  if (!lead) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Lead not found</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/leads')}
          className="mt-4"
        >
          Back to Leads
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      await deleteLead(lead.id);
      navigate('/leads');
    }
  };

  const handleCall = () => {
    window.open(`tel:${lead.phone}`);
  };

  const handleEmail = () => {
    window.open(`mailto:${lead.email}`);
  };

  const handleSMS = () => {
    window.open(`sms:${lead.phone}`);
  };

  const handleWhatsApp = () => {
    const phoneNumber = lead.phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${phoneNumber}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/leads')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold truncate">{lead.name}</h1>
              <p className="text-sm text-muted-foreground">Lead Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditModalOpen(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
        {/* Lead Information */}
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{lead.name}</h2>
                  <p className="text-muted-foreground">{lead.source}</p>
                </div>
              </div>
              <Badge className={cn("ml-2", statusColors[lead.status])}>
                {lead.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">{lead.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">{lead.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">{lead.source}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">Created {formatDateShort(lead.createdAt)}</span>
              </div>
            </div>

            {lead.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lead.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCall}
                className="h-12 flex flex-col gap-1"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Call</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleEmail}
                className="h-12 flex flex-col gap-1"
              >
                <Mail className="w-5 h-5" />
                <span className="text-xs">Email</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleSMS}
                className="h-12 flex flex-col gap-1"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">SMS</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="h-12 flex flex-col gap-1"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">WhatsApp</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const IconComponent = activityIcons[activity.type] || Clock;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {index < activities.length - 1 && (
                          <div className="w-0.5 h-6 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No activities yet</p>
                <p className="text-sm text-muted-foreground">
                  Activities will appear here when you interact with this lead
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditLeadModal
        lead={lead}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};