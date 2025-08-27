import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FileUploadModal } from '@/components/content/FileUploadModal';
import { FileGrid } from '@/components/content/FileGrid';
import { FileAnalytics } from '@/components/content/FileAnalytics';
import { useContent } from '@/contexts/ContentContext';
import { FileCategory, FileType } from '@/types/content';
import { 
  Upload, 
  Search, 
  Filter, 
  BarChart3,
  Files as FilesIcon,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Files = () => {
  const { 
    getFilteredFiles, 
    fileFilters, 
    setFileFilters,
    contentViews,
    isLoading 
  } = useContent();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredFiles = getFilteredFiles();
  const recentFileViews = contentViews.filter(v => v.contentType === 'file').slice(0, 5);

  const totalFileViews = filteredFiles.reduce((sum, file) => sum + file.views, 0);
  const totalDownloads = filteredFiles.reduce((sum, file) => sum + file.downloads, 0);

  const handleSearch = (search: string) => {
    setFileFilters({ search });
  };

  const handleCategoryFilter = (category: string) => {
    setFileFilters({ category: category as FileCategory | 'All' });
  };

  const handleTypeFilter = (fileType: string) => {
    setFileFilters({ fileType: fileType as FileType | 'All' });
  };

  const clearFilters = () => {
    setFileFilters({
      search: '',
      category: 'All',
      fileType: 'All',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">File Library</h1>
            <p className="text-sm text-muted-foreground">
              Manage and share your files with tracking analytics
            </p>
          </div>
          
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FileUploadModal onClose={() => setIsUploadModalOpen(false)} />
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
                  <FilesIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredFiles.length}</p>
                  <p className="text-xs text-muted-foreground">Total Files</p>
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
                  <p className="text-2xl font-bold">{totalFileViews}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/20 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDownloads}</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentFileViews.length}</p>
                  <p className="text-xs text-muted-foreground">Recent Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="files" className="w-full">
          <TabsList>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={fileFilters.search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select value={fileFilters.category} onValueChange={handleCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Proposal">Proposals</SelectItem>
                      <SelectItem value="Brochure">Brochures</SelectItem>
                      <SelectItem value="Contract">Contracts</SelectItem>
                      <SelectItem value="Presentation">Presentations</SelectItem>
                      <SelectItem value="Image">Images</SelectItem>
                      <SelectItem value="Document">Documents</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={fileFilters.fileType} onValueChange={handleTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="doc">DOC</SelectItem>
                      <SelectItem value="docx">DOCX</SelectItem>
                      <SelectItem value="ppt">PPT</SelectItem>
                      <SelectItem value="pptx">PPTX</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>

                  {(fileFilters.search || fileFilters.category !== 'All' || fileFilters.fileType !== 'All') && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>

                {(fileFilters.search || fileFilters.category !== 'All' || fileFilters.fileType !== 'All') && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {fileFilters.search && (
                      <Badge variant="secondary">Search: {fileFilters.search}</Badge>
                    )}
                    {fileFilters.category !== 'All' && (
                      <Badge variant="secondary">Category: {fileFilters.category}</Badge>
                    )}
                    {fileFilters.fileType !== 'All' && (
                      <Badge variant="secondary">Type: {fileFilters.fileType}</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Grid */}
            <FileGrid 
              files={filteredFiles} 
              viewMode={viewMode}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <FileAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};