import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Moon, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationType } from '@/types/notification';

interface NotificationSettingsProps {
  onBack: () => void;
}

const notificationTypeLabels: Record<NotificationType, string> = {
  new_lead: 'New Leads',
  follow_up_due: 'Follow-up Reminders',
  content_viewed: 'Content Views',
  high_engagement: 'High Engagement Alerts',
  integration_error: 'Integration Errors',
  daily_summary: 'Daily Summary',
  system_maintenance: 'System Maintenance',
  account_limit: 'Account Limits',
  security_alert: 'Security Alerts',
  feature_update: 'Feature Updates',
};

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const { preferences, settings, updatePreference, updateSettings } = useNotifications();

  const getPreference = (type: NotificationType, method: string) => {
    return preferences.find(p => p.type === type && p.method === method)?.enabled ?? true;
  };

  const handlePreferenceChange = (type: NotificationType, method: string, enabled: boolean) => {
    updatePreference(type, method, enabled);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">Notification Settings</h3>
      </div>

      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General Settings</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                <Label htmlFor="sound">Sound notifications</Label>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <Label htmlFor="dnd">Do Not Disturb</Label>
              </div>
              <Switch
                id="dnd"
                checked={settings.doNotDisturb}
                onCheckedChange={(checked) => updateSettings({ doNotDisturb: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="quiet">Quiet Hours</Label>
              <Switch
                id="quiet"
                checked={settings.quietHoursEnabled}
                onCheckedChange={(checked) => updateSettings({ quietHoursEnabled: checked })}
              />
            </div>

            {settings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-2 pl-6">
                <div>
                  <Label htmlFor="start">Start</Label>
                  <Select
                    value={settings.quietHoursStart}
                    onValueChange={(value) => updateSettings({ quietHoursStart: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="end">End</Label>
                  <Select
                    value={settings.quietHoursEnd}
                    onValueChange={(value) => updateSettings({ quietHoursEnd: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="digest">Email Digest</Label>
              </div>
              <Select
                value={settings.emailDigestFrequency}
                onValueChange={(value: any) => updateSettings({ emailDigestFrequency: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Types</CardTitle>
            <CardDescription>Choose which notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(notificationTypeLabels).map(([type, label]) => (
                <div key={type} className="space-y-3">
                  <h4 className="font-medium text-sm">{label}</h4>
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${type}-browser`} className="text-xs">Browser</Label>
                      <Switch
                        id={`${type}-browser`}
                        checked={getPreference(type as NotificationType, 'browser')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(type as NotificationType, 'browser', checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${type}-email`} className="text-xs">Email</Label>
                      <Switch
                        id={`${type}-email`}
                        checked={getPreference(type as NotificationType, 'email')}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(type as NotificationType, 'email', checked)
                        }
                      />
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};