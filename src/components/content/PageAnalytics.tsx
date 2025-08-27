import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContent } from '@/contexts/ContentContext';
import { BarChart3, Globe, Eye, Clock } from 'lucide-react';

export const PageAnalytics = () => {
  const { getFilteredPages } = useContent();
  const pages = getFilteredPages();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-full p-2 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{pages.length}</p>
                <p className="text-xs text-muted-foreground">Total Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Page Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Page analytics will be available once you have more data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};