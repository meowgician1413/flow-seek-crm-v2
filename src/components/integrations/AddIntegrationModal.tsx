import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { useLeads } from '@/contexts/LeadContext';
import { toast } from 'sonner';
import { Globe, Facebook, FileText, User, ArrowLeft, CheckCircle } from 'lucide-react';

const integrationTypes = [
  { value: 'website', label: 'Website Form', icon: Globe, description: 'Connect your website contact forms' },
  { value: 'facebook', label: 'Facebook Lead Ads', icon: Facebook, description: 'Import leads from Facebook campaigns' },
  { value: 'google_forms', label: 'Google Forms', icon: FileText, description: 'Connect Google Forms responses' },
  { value: 'manual', label: 'Manual Entry', icon: User, description: 'Manual lead import and entry' },
];

interface AddIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sample sheet data for preview
const sampleSheetData = [
  { 'Full Name': 'John Smith', 'Email Address': 'john.smith@example.com', 'Phone Number': '+1-555-123-4567', 'Company Name': 'Tech Corp' },
  { 'Full Name': 'Sarah Johnson', 'Email Address': 'sarah.j@company.com', 'Phone Number': '+1-555-234-5678', 'Company Name': 'StartupXYZ' },
  { 'Full Name': 'Mike Davis', 'Email Address': 'mike.davis@startup.io', 'Phone Number': '+1-555-345-6789', 'Company Name': 'Innovation Labs' },
  { 'Full Name': 'Emma Wilson', 'Email Address': 'emma.wilson@corp.com', 'Phone Number': '+1-555-456-7890', 'Company Name': 'Global Inc' }
];

const leadFieldOptions = [
  { value: '', label: 'Skip this column' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'notes', label: 'Notes' }
];

export function AddIntegrationModal({ open, onOpenChange }: AddIntegrationModalProps) {
  const { createSource } = useIntegrations();
  const { addLead } = useLeads();
  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [selectedType, setSelectedType] = useState<string>('');
  const [name, setName] = useState('');
  const [config, setConfig] = useState('{}');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setStep('config');
    setSelectedType('');
    setName('');
    setConfig('{}');
    setGoogleSheetUrl('');
    setColumnMapping({});
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedType === 'manual' && !googleSheetUrl.trim()) {
      toast.error('Please enter a Google Sheets URL');
      return;
    }

    if (selectedType === 'manual') {
      // Initialize column mapping with sheet columns
      const sheetColumns = Object.keys(sampleSheetData[0]);
      const initialMapping: Record<string, string> = {};
      sheetColumns.forEach(col => {
        // Smart mapping based on column names
        const lowerCol = col.toLowerCase();
        if (lowerCol.includes('name')) initialMapping[col] = 'name';
        else if (lowerCol.includes('email')) initialMapping[col] = 'email';
        else if (lowerCol.includes('phone')) initialMapping[col] = 'phone';
        else if (lowerCol.includes('company')) initialMapping[col] = 'company';
        else initialMapping[col] = '';
      });
      setColumnMapping(initialMapping);
      setStep('preview');
    } else {
      await handleCreateIntegration();
    }
  };

  const handleCreateIntegration = async () => {
    setLoading(true);
    try {
      let parsedConfig = {};
      
      if (selectedType === 'manual') {
        parsedConfig = { google_sheets_url: googleSheetUrl.trim(), column_mapping: columnMapping };
      } else if (config.trim()) {
        try {
          parsedConfig = JSON.parse(config);
        } catch (error) {
          toast.error('Invalid JSON configuration');
          setLoading(false);
          return;
        }
      }

      await createSource({
        name: name.trim(),
        type: selectedType as any,
        config: parsedConfig,
        status: 'active'
      });

      toast.success('Integration created successfully!');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create integration');
    } finally {
      setLoading(false);
    }
  };

  const handleImportLeads = async () => {
    setLoading(true);
    try {
      const importedCount = sampleSheetData.length;
      
      for (const row of sampleSheetData) {
        const leadData: any = {
          source: 'Other' as const,
          status: 'New' as const
        };

        // Map columns to lead fields
        Object.entries(columnMapping).forEach(([sheetColumn, leadField]) => {
          if (leadField && row[sheetColumn as keyof typeof row]) {
            leadData[leadField] = row[sheetColumn as keyof typeof row];
          }
        });

        // Ensure required fields are present
        if (leadData.name && leadData.email) {
          // Add a small delay to ensure unique IDs
          await new Promise(resolve => setTimeout(resolve, 1));
          await addLead(leadData);
        }
      }

      // Create the integration
      await handleCreateIntegration();
      
      // Close modal and reset form
      onOpenChange(false);
      resetForm();
      
      toast.success(`Successfully imported ${importedCount} leads!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  const updateColumnMapping = (sheetColumn: string, leadField: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [sheetColumn]: leadField
    }));
  };

  const selectedIntegration = integrationTypes.find(type => type.value === selectedType);

  if (step === 'preview') {
    return (
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] bg-popover border-border shadow-glow">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('config')}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <DialogTitle className="text-xl font-semibold text-foreground">Preview & Map Columns</DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex flex-col overflow-hidden flex-1">
            <div className="overflow-y-auto flex-1 px-1 py-2">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Connected to: {googleSheetUrl}</span>
                </div>

                <Card className="p-4 bg-background border-border">
                  <h3 className="font-semibold text-foreground mb-3">Sheet Preview</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(sampleSheetData[0]).map(column => (
                            <TableHead key={column} className="text-foreground font-medium">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleSheetData.slice(0, 3).map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, colIndex) => (
                              <TableCell key={colIndex} className="text-muted-foreground">
                                {value}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing 3 of {sampleSheetData.length} rows
                  </p>
                </Card>

                <Card className="p-4 bg-background border-border">
                  <h3 className="font-semibold text-foreground mb-3">Column Mapping</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Map your sheet columns to lead fields. Skip columns you don't need.
                  </p>
                  <div className="space-y-3">
                    {Object.keys(sampleSheetData[0]).map(sheetColumn => (
                      <div key={sheetColumn} className="flex items-center space-x-4">
                        <div className="w-48 text-sm font-medium text-foreground">
                          {sheetColumn}
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <Select
                          value={columnMapping[sheetColumn] || ''}
                          onValueChange={(value) => updateColumnMapping(sheetColumn, value)}
                        >
                          <SelectTrigger className="w-48 bg-background border-border text-foreground">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-50">
                            {leadFieldOptions.map(option => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                                className="text-foreground hover:bg-accent"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border bg-popover">
              <Button
                variant="ghost"
                onClick={() => setStep('config')}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    resetForm();
                  }}
                  disabled={loading}
                  className="shadow-card"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportLeads}
                  disabled={loading || !Object.values(columnMapping).some(v => v)}
                  className="bg-gradient-primary shadow-elegant hover:shadow-glow"
                >
                  {loading ? 'Importing...' : `Import ${sampleSheetData.length} Leads`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-popover border-border shadow-glow">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">Add New Integration</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col overflow-hidden flex-1">
          <div className="overflow-y-auto flex-1 px-1 py-2">
            <form onSubmit={handleConnect} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold text-foreground">Integration Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integrationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Card
                        key={type.value}
                        className={`p-4 cursor-pointer border-2 transition-all shadow-card hover:shadow-elegant ${
                          selectedType === type.value
                            ? 'border-primary bg-primary/5 shadow-elegant'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedType(type.value)}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${
                            selectedType === type.value ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{type.label}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{type.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="name" className="text-foreground font-semibold">Integration Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Website Form"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background text-foreground"
                />
              </div>

              {selectedIntegration && selectedType === 'manual' && (
                <div className="space-y-3">
                  <Label htmlFor="googleSheetUrl" className="text-foreground font-semibold">Google Sheets URL *</Label>
                  <Input
                    id="googleSheetUrl"
                    placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    required
                    className="bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter the URL of your Google Sheets document to import leads from
                  </p>
                </div>
              )}

              {selectedIntegration && selectedType !== 'manual' && (
                <div className="space-y-3">
                  <Label htmlFor="config" className="text-foreground font-semibold">Configuration (JSON)</Label>
                  <Textarea
                    id="config"
                    placeholder='{"field_mapping": {"name": "full_name", "email": "email_address"}}'
                    value={config}
                    onChange={(e) => setConfig(e.target.value)}
                    rows={4}
                    className="font-mono text-sm bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Optional: Configure field mappings and integration-specific settings in JSON format
                  </p>
                </div>
              )}

              <div className="pb-4"></div>
            </form>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border bg-popover">
            <Button
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="shadow-card"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedType || !name.trim() || (selectedType === 'manual' && !googleSheetUrl.trim())}
              onClick={handleConnect}
              className="bg-gradient-primary shadow-elegant hover:shadow-glow"
            >
              {loading ? 'Connecting...' : selectedType === 'manual' ? 'Connect Google Sheets' : 'Create Integration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}