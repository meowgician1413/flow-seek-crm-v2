import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContent } from '@/contexts/ContentContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Eye,
  Download,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  FileText,
  Image,
  Presentation,
  File as FileIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export const FileAnalytics = () => {
  const { getFilteredFiles, contentViews } = useContent();
  
  const files = getFilteredFiles();
  const fileViews = contentViews.filter(v => v.contentType === 'file');

  // Calculate analytics data
  const totalViews = files.reduce((sum, file) => sum + file.views, 0);
  const totalDownloads = files.reduce((sum, file) => sum + file.downloads, 0);
  const uniqueViewers = new Set(fileViews.map(v => v.ipAddress)).size;

  // Most viewed files
  const mostViewedFiles = files
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Views by file type
  const viewsByType = files.reduce((acc, file) => {
    const type = file.fileType;
    if (!acc[type]) {
      acc[type] = { type, views: 0, downloads: 0, count: 0 };
    }
    acc[type].views += file.views;
    acc[type].downloads += file.downloads;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { type: string; views: number; downloads: number; count: number }>);

  const typeData = Object.values(viewsByType);

  // Views by category
  const viewsByCategory = files.reduce((acc, file) => {
    const category = file.category;
    if (!acc[category]) {
      acc[category] = { category, views: 0, files: 0 };
    }
    acc[category].views += file.views;
    acc[category].files += 1;
    return acc;
  }, {} as Record<string, { category: string; views: number; files: number }>);

  const categoryData = Object.values(viewsByCategory);

  // Trending files (based on recent views)
  const recentViews = fileViews
    .filter(v => {
      const viewDate = new Date(v.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return viewDate > sevenDaysAgo;
    });

  const trendingFiles = files
    .map(file => ({
      ...file,
      recentViews: recentViews.filter(v => v.contentId === file.id).length,
    }))
    .sort((a, b) => b.recentViews - a.recentViews)
    .slice(0, 5);

  // Device breakdown
  const deviceBreakdown = fileViews.reduce((acc, view) => {
    const device = view.location;
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceData = Object.entries(deviceBreakdown).map(([device, count]) => ({
    device,
    count,
    percentage: totalViews > 0 ? ((count / totalViews) * 100).toFixed(1) : '0',
  }));

  // Views over time (last 30 days)
  const viewsOverTime = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayViews = fileViews.filter(v => 
      v.createdAt.startsWith(dateStr)
    ).length;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: dayViews,
    };
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return FileText;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return Image;
      case 'ppt':
      case 'pptx':
        return Presentation;
      default:
        return FileIcon;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViews}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
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
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueViewers}</p>
                <p className="text-xs text-muted-foreground">Unique Viewers</p>
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
                <p className="text-2xl font-bold">{files.length}</p>
                <p className="text-xs text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* File Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Views by File Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Views by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, views }) => `${category}: ${views}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="views"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Most Viewed Files */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostViewedFiles.map((file, index) => {
                  const Icon = getFileIcon(file.fileType);
                  const conversionRate = file.views > 0 ? (file.downloads / file.views * 100).toFixed(1) : '0';
                  
                  return (
                    <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      
                      <Icon className="w-6 h-6 text-muted-foreground" />
                      
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.category}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{file.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span>{file.downloads}</span>
                          </div>
                          <Badge variant="secondary">
                            {conversionRate}% conversion
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Audience by Device</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceData.map((item, index) => {
                  const Icon = getDeviceIcon(item.device);
                  
                  return (
                    <div key={item.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium capitalize">{item.device}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={parseFloat(item.percentage)} 
                          className="w-24 h-2" 
                        />
                        <Badge variant="outline">{item.count}</Badge>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          {/* Trending Files */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Files (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingFiles.map((file, index) => {
                  const Icon = getFileIcon(file.fileType);
                  
                  return (
                    <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      
                      <Icon className="w-6 h-6 text-muted-foreground" />
                      
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.category}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {file.recentViews}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          recent views
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {trendingFiles.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No trending files this week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};