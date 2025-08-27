import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageTemplate } from '@/types/content';
import { Globe, Eye, Clock } from 'lucide-react';

interface PageGridProps {
  pages: PageTemplate[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
}

export const PageGrid = ({ pages, viewMode, isLoading }: PageGridProps) => {
  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Globe className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No pages found</h3>
          <p className="text-muted-foreground">Create your first page template.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((page) => (
        <Card key={page.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">{page.name}</h3>
                <p className="text-sm text-muted-foreground">{page.title}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                  {page.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <Badge variant="outline">{page.templateType}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{page.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{page.averageTimeSpent}s avg</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};