import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PageEditor } from '@/components/content/PageEditor';
import { PageGrid } from '@/components/content/PageGrid';
import { PageAnalytics } from '@/components/content/PageAnalytics';
import { useContent } from '@/contexts/ContentContext';
import { PageTemplateType } from '@/types/content';
import { 
  Plus, 
  Search, 
  Globe,
  BarChart3,
  Eye,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Pages = () => {
  const { 
    getFilteredPages, 
    pageFilters, 
    setPageFilters,
    contentViews,
    isLoading 
  } = useContent();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPages = getFilteredPages();
  const recentPageViews = contentViews.filter(v => v.contentType === 'page').slice(0, 5);

  const totalPageViews = filteredPages.reduce((sum, page) => sum + page.views, 0);
  const publishedPages = filteredPages.filter(p => p.isPublished).length;
  const averageTimeSpent = filteredPages.reduce((sum, page) => sum + page.averageTimeSpent, 0) / Math.max(filteredPages.length, 1);

  const handleSearch = (search: string) => {
    setPageFilters({ search });
  };

  const handleTypeFilter = (templateType: string) => {
    setPageFilters({ templateType: templateType as PageTemplateType | 'All' });
  };

  const handlePublishedFilter = (published: string) => {
    setPageFilters({ 
      isPublished: published === 'all' ? undefined : published === 'published' 
    });
  };

  const clearFilters = () => {
    setPageFilters({
      search: '',
      templateType: 'All',
      isPublished: undefined,
    });
  };

  const hasActiveFilters = pageFilters.search || 
    pageFilters.templateType !== 'All' || 
    pageFilters.isPublished !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Page Templates</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage web pages with tracking analytics
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <PageEditor onClose={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredPages.length}</p>
                  <p className="text-xs text-muted-foreground">Total Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPageViews}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedPages}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(averageTimeSpent)}s</p>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pages" className="w-full">
          <TabsList>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search pages..."
                      value={pageFilters.search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select 
                    value={pageFilters.templateType} 
                    onValueChange={handleTypeFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Template Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="About">About</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Pricing">Pricing</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Contact">Contact</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={
                      pageFilters.isPublished === undefined 
                        ? 'all' 
                        : pageFilters.isPublished 
                          ? 'published' 
                          : 'draft'
                    } 
                    onValueChange={handlePublishedFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {pageFilters.search && (
                      <Badge variant="secondary">Search: {pageFilters.search}</Badge>
                    )}
                    {pageFilters.templateType !== 'All' && (
                      <Badge variant="secondary">Type: {pageFilters.templateType}</Badge>
                    )}
                    {pageFilters.isPublished !== undefined && (
                      <Badge variant="secondary">
                        Status: {pageFilters.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Page Grid */}
            <PageGrid 
              pages={filteredPages} 
              viewMode={viewMode}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <PageAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};