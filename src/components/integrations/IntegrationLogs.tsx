import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function IntegrationLogs() {
  const { logs, sources } = useIntegrations();
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const getSourceName = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    return source?.name || 'Unknown Source';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Clock className="w-12 h-12 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-lg">No activity yet</h3>
            <p className="text-muted-foreground">Integration activity will appear here once you start receiving leads</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(log.status)}
              <div>
                <p className="font-medium">{getSourceName(log.source_id)}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(log.status) as any}>
                {log.status}
              </Badge>
              {log.payload && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="p-1 hover:bg-muted rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Integration Log Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Source</h4>
                        <p className="text-sm text-muted-foreground">{getSourceName(log.source_id)}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <Badge variant={getStatusColor(log.status) as any}>
                          {log.status}
                        </Badge>
                      </div>
                      {log.error_message && (
                        <div>
                          <h4 className="font-medium mb-2 text-red-600">Error Message</h4>
                          <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{log.error_message}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium mb-2">Payload</h4>
                        <ScrollArea className="h-48 w-full border rounded p-3">
                          <pre className="text-xs">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          {log.error_message && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {log.error_message}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}