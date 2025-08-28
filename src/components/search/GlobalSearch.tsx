import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeads } from '@/contexts/LeadContext';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'lead' | 'activity' | 'template' | 'file';
  title: string;
  subtitle?: string;
  highlight?: string;
}

interface GlobalSearchProps {
  onClose?: () => void;
  onResultClick?: (result: SearchResult) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  onClose, 
  onResultClick 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { leads, activities } = useLeads();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate search delay
    const timeout = setTimeout(() => {
      const searchResults: SearchResult[] = [];
      const lowercaseQuery = query.toLowerCase();

      // Search leads
      leads.forEach(lead => {
        if (
          lead.name.toLowerCase().includes(lowercaseQuery) ||
          lead.email.toLowerCase().includes(lowercaseQuery) ||
          lead.phone.includes(query) ||
          lead.source.toLowerCase().includes(lowercaseQuery) ||
          lead.notes?.toLowerCase().includes(lowercaseQuery)
        ) {
          searchResults.push({
            id: lead.id,
            type: 'lead',
            title: lead.name,
            subtitle: lead.email,
            highlight: `${lead.status} • ${lead.source}`
          });
        }
      });

      // Search activities
      activities.forEach(activity => {
        if (activity.description.toLowerCase().includes(lowercaseQuery)) {
          const lead = leads.find(l => l.id === activity.leadId);
          searchResults.push({
            id: activity.id,
            type: 'activity',
            title: activity.description,
            subtitle: lead?.name,
            highlight: activity.type
          });
        }
      });

      setResults(searchResults);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, leads, activities]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-full max-h-96">
      {/* Search input */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search leads, activities, files..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {/* Search results */}
        {query && (
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  {results.length} results found
                </p>
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onResultClick?.(result)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {highlightMatch(result.title, query)}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {highlightMatch(result.subtitle, query)}
                          </p>
                        )}
                        {result.highlight && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.highlight}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for lead names, emails, or activities
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent searches and suggestions */}
        {!query && (
          <div className="p-4 space-y-4">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Recent searches</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Popular searches</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['New leads', 'High priority', 'This week', 'Converted', 'Follow up'].map((term) => (
                  <Badge
                    key={term}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};