import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '@/contexts/TemplateContext';
import { TemplateEditor } from '@/components/templates/TemplateEditor';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { QuickSendModal } from '@/components/templates/QuickSendModal';
import { MessageTemplate, TemplateCategory, TemplateType } from '@/types/template';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Mail, 
  MessageSquare, 
  Phone,
  Grid,
  List,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const getCategoryDisplayName = (category: TemplateCategory | 'All') => {
  switch (category) {
    case 'All': return 'All';
    case 'Introduction': return 'Introduction';
    case 'Follow-up': return 'Follow-up';
    case 'Closing': return 'Closing';
    case 'Custom': return 'Custom';
  }
};

const getTypeDisplayName = (type: TemplateType | 'All') => {
  switch (type) {
    case 'All': return 'All Types';
    case 'email': return 'Email';
    case 'sms': return 'SMS';
    case 'whatsapp': return 'WhatsApp';
  }
};

export const Templates = () => {
  const { 
    filteredTemplates, 
    filters, 
    isLoading, 
    setFilters, 
    clearFilters,
    deleteTemplate,
    duplicateTemplate,
    toggleFavorite 
  } = useTemplates();
  
  const { toast } = useToast();
  
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isQuickSendOpen, setIsQuickSendOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCreateTemplate = () => {
    setEditorMode('create');
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditorMode('edit');
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDuplicateTemplate = async (template: MessageTemplate) => {
    await duplicateTemplate(template.id);
    toast({
      title: "Template Duplicated",
      description: `"${template.name}" has been duplicated successfully`,
    });
  };

  const handleDeleteTemplate = async (template: MessageTemplate) => {
    await deleteTemplate(template.id);
    setTemplateToDelete(null);
    toast({
      title: "Template Deleted",
      description: `"${template.name}" has been deleted`,
    });
  };

  const handleToggleFavorite = async (template: MessageTemplate) => {
    await toggleFavorite(template.id);
    toast({
      title: template.isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: `"${template.name}" ${template.isFavorite ? 'removed from' : 'added to'} favorites`,
    });
  };

  const handleQuickSend = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsQuickSendOpen(true);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'All' && value !== false
  ).length;

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">
            Manage your message templates • {filteredTemplates.length} templates
          </p>
        </div>
        <Button 
          className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow"
          onClick={handleCreateTemplate}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates by name or content..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {getCategoryDisplayName(filters.category)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['All', 'Introduction', 'Follow-up', 'Closing', 'Custom'] as const).map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setFilters({ category })}
                  >
                    {getCategoryDisplayName(category)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {getTypeDisplayName(filters.type)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['All', 'email', 'sms', 'whatsapp'] as const).map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setFilters({ type })}
                  >
                    {getTypeDisplayName(type)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorites Filter */}
            <Button 
              variant={filters.favorites ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilters({ favorites: !filters.favorites })}
            >
              <Star className={`w-4 h-4 mr-2 ${filters.favorites ? 'fill-current' : ''}`} />
              Favorites
            </Button>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-8 text-center shadow-card border-border/50">
          <div className="mb-6 p-6 bg-gradient-subtle rounded-full shadow-card mx-auto w-fit">
            <Mail className="w-12 h-12 text-muted-foreground/70" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            {filters.search || filters.category !== 'All' || filters.type !== 'All' || filters.favorites
              ? 'No templates match your filters'
              : 'No templates yet'
            }
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            {filters.search || filters.category !== 'All' || filters.type !== 'All' || filters.favorites
              ? 'Try adjusting your search or filters'
              : 'Create your first template to streamline your outreach'
            }
          </p>
          {(!filters.search && filters.category === 'All' && filters.type === 'All' && !filters.favorites) && (
            <Button 
              className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow"
              onClick={handleCreateTemplate}
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          )}
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4' : 'space-y-4'}>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onDuplicate={handleDuplicateTemplate}
              onDelete={setTemplateToDelete}
              onToggleFavorite={handleToggleFavorite}
              onQuickSend={handleQuickSend}
            />
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      <TemplateEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        template={selectedTemplate}
        mode={editorMode}
      />

      {/* Quick Send Modal */}
      <QuickSendModal
        isOpen={isQuickSendOpen}
        onClose={() => setIsQuickSendOpen(false)}
        template={selectedTemplate}
        lead={null} // In real app, this would come from context or props
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};