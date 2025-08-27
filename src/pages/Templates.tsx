import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, MessageSquare, Phone, Edit, Copy } from 'lucide-react';

const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to our service!',
    content: 'Hi {{name}}, thank you for your interest in our service. We\'re excited to help you...',
    lastUsed: '2 days ago',
    useCount: 15,
  },
  {
    id: '2',
    name: 'Follow-up SMS',
    type: 'sms',
    subject: '',
    content: 'Hi {{name}}, just following up on our conversation. Are you still interested in {{service}}?',
    lastUsed: '1 week ago',
    useCount: 8,
  },
  {
    id: '3',
    name: 'Cold Outreach',
    type: 'email',
    subject: 'Quick question about {{company}}',
    content: 'Hi {{name}}, I noticed {{company}} might benefit from our {{service}}. Would you be open to a quick chat?',
    lastUsed: '3 days ago',
    useCount: 22,
  },
  {
    id: '4',
    name: 'Demo Invitation',
    type: 'email',
    subject: 'Schedule your personalized demo',
    content: 'Hi {{name}}, would you like to see how {{service}} can help {{company}}? Let\'s schedule a 15-minute demo...',
    lastUsed: '1 day ago',
    useCount: 12,
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return Mail;
    case 'sms':
      return MessageSquare;
    case 'call':
      return Phone;
    default:
      return Mail;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'sms':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'call':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const Templates = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">Manage your message templates</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Template Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Email', 'SMS', 'Call Scripts'].map((category) => (
          <Button
            key={category}
            variant={category === 'All' ? 'default' : 'outline'}
            size="sm"
            className={category === 'All' ? 'bg-primary text-primary-foreground' : ''}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="space-y-4">
        {mockTemplates.map((template) => {
          const TypeIcon = getTypeIcon(template.type);
          return (
            <Card key={template.id} className="shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      {template.subject && (
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-3 mb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Used {template.useCount} times</span>
                  <span>Last used {template.lastUsed}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State (if no templates) */}
      {mockTemplates.length === 0 && (
        <Card className="p-8 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first template to streamline your outreach
          </p>
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </Card>
      )}
    </div>
  );
};