import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeads } from '@/contexts/LeadContext';
import { LeadCard } from '@/components/leads/LeadCard';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { EditLeadModal } from '@/components/leads/EditLeadModal';
import { Search, Plus, Filter, Users, X, RefreshCw } from 'lucide-react';
import { Lead, LeadStatus } from '@/types/lead';

const statusOptions: Array<{ value: LeadStatus | 'All'; label: string }> = [
  { value: 'All', label: 'All Leads' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Converted', label: 'Converted' },
  { value: 'Lost', label: 'Lost' },
];

export const Leads = () => {
  const { filteredLeads, filters, setFilters, isLoading } = useLeads();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setEditModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const hasActiveFilters = filters.search || filters.status !== 'All';

  const clearFilters = () => {
    setFilters({ search: '', status: 'All' });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">
            {filteredLeads.length} {filters.status !== 'All' ? filters.status.toLowerCase() : ''} leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary-glow shadow-lg"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ status: value as LeadStatus | 'All' })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && (
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setFilters({ search: '' })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {filters.status !== 'All' && (
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setFilters({ status: 'All' })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead, index) => (
            <div
              key={lead.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <LeadCard lead={lead} onEdit={handleEditLead} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredLeads.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {hasActiveFilters ? 'No leads match your filters' : 'No leads yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {hasActiveFilters 
              ? 'Try adjusting your search term or filters to find what you\'re looking for.'
              : 'Get started by adding your first lead to begin tracking your sales pipeline.'
            }
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : (
            <Button 
              className="bg-gradient-to-r from-primary to-primary-glow"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Lead
            </Button>
          )}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-glow z-40 md:hidden"
        onClick={() => setAddModalOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modals */}
      <AddLeadModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />
      
      <EditLeadModal
        lead={editingLead}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};