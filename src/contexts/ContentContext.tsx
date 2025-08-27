import React, { createContext, useContext, useState } from 'react';
import { 
  FileTemplate, 
  PageTemplate, 
  ContentView, 
  ContentAnalytics, 
  ShareLink,
  FileFilters,
  PageFilters,
  FileCategory,
  PageTemplateType,
  FileType
} from '@/types/content';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ContentContextType {
  // File management
  fileTemplates: FileTemplate[];
  pageTemplates: PageTemplate[];
  contentViews: ContentView[];
  shareLinks: ShareLink[];
  isLoading: boolean;
  
  // File operations
  uploadFile: (file: File, category: FileCategory, name?: string) => Promise<FileTemplate>;
  updateFileTemplate: (id: string, updates: Partial<FileTemplate>) => Promise<void>;
  deleteFileTemplate: (id: string) => Promise<void>;
  generateFileShareLink: (fileId: string, options?: Partial<ShareLink>) => Promise<ShareLink>;
  
  // Page operations
  createPageTemplate: (data: Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'uniqueViews' | 'averageTimeSpent'>) => Promise<PageTemplate>;
  updatePageTemplate: (id: string, updates: Partial<PageTemplate>) => Promise<void>;
  deletePageTemplate: (id: string) => Promise<void>;
  duplicatePageTemplate: (id: string) => Promise<PageTemplate>;
  generatePageShareLink: (pageId: string, options?: Partial<ShareLink>) => Promise<ShareLink>;
  
  // Analytics
  trackView: (contentId: string, contentType: 'file' | 'page', viewerInfo?: any) => Promise<void>;
  getContentAnalytics: (contentId: string, contentType: 'file' | 'page') => ContentAnalytics;
  getRecentViews: (limit?: number) => ContentView[];
  
  // Filtering and search
  fileFilters: FileFilters;
  pageFilters: PageFilters;
  setFileFilters: (filters: Partial<FileFilters>) => void;
  setPageFilters: (filters: Partial<PageFilters>) => void;
  getFilteredFiles: () => FileTemplate[];
  getFilteredPages: () => PageTemplate[];
  
  // Utilities
  getFileById: (id: string) => FileTemplate | undefined;
  getPageById: (id: string) => PageTemplate | undefined;
  getShareLinkByToken: (token: string) => ShareLink | undefined;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

// Mock data
const mockFileTemplates: FileTemplate[] = [
  {
    id: '1',
    userId: '1',
    name: 'Company Brochure 2024',
    description: 'Latest company brochure with services and pricing',
    fileUrl: '/mock-files/brochure.pdf',
    thumbnailUrl: '/mock-thumbnails/brochure.jpg',
    fileType: 'pdf',
    fileSize: 2048576, // 2MB
    category: 'Brochure',
    mimeType: 'application/pdf',
    views: 45,
    downloads: 12,
    uniqueViews: 23,
    lastViewed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    tags: ['marketing', 'services', '2024'],
    shareSettings: {
      isPublic: true,
      requiresPassword: false,
      allowDownload: true,
      allowPrint: true,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    name: 'Service Proposal Template',
    description: 'Template for client service proposals',
    fileUrl: '/mock-files/proposal.docx',
    fileType: 'docx',
    fileSize: 1024000, // 1MB
    category: 'Proposal',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    views: 28,
    downloads: 8,
    uniqueViews: 15,
    lastViewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    tags: ['proposal', 'template'],
    shareSettings: {
      isPublic: false,
      requiresPassword: true,
      password: 'secure123',
      allowDownload: true,
      allowPrint: false,
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockPageTemplates: PageTemplate[] = [
  {
    id: '1',
    userId: '1',
    name: 'Company About Page',
    title: 'About Our Company',
    description: 'Professional about page template',
    content: '<h1>About Our Company</h1><p>We are a leading provider of innovative solutions...</p>',
    templateType: 'About',
    views: 156,
    uniqueViews: 89,
    averageTimeSpent: 120, // 2 minutes
    lastViewed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isActive: true,
    isPublished: true,
    shareSettings: {
      isPublic: true,
      requiresPassword: false,
      allowSharing: true,
      showBranding: true,
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockContentViews: ContentView[] = [
  {
    id: '1',
    contentId: '1',
    contentType: 'file',
    leadId: '1',
    viewerName: 'John Smith',
    viewerEmail: 'john.smith@example.com',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    location: 'Desktop',
    country: 'United States',
    city: 'New York',
    viewDuration: 180,
    actions: ['viewed', 'downloaded'],
    deviceInfo: {
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileTemplates, setFileTemplates] = useState<FileTemplate[]>(mockFileTemplates);
  const [pageTemplates, setPageTemplates] = useState<PageTemplate[]>(mockPageTemplates);
  const [contentViews, setContentViews] = useState<ContentView[]>(mockContentViews);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [fileFilters, setFileFiltersState] = useState<FileFilters>({
    search: '',
    category: 'All',
    fileType: 'All',
  });
  
  const [pageFilters, setPageFiltersState] = useState<PageFilters>({
    search: '',
    templateType: 'All',
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File, category: FileCategory, name?: string): Promise<FileTemplate> => {
    setIsLoading(true);
    try {
      // Simulate file upload
      const fileTemplate: FileTemplate = {
        id: Date.now().toString(),
        userId: user?.id || '1',
        name: name || file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: getFileType(file.type),
        fileSize: file.size,
        category,
        mimeType: file.type,
        views: 0,
        downloads: 0,
        uniqueViews: 0,
        isActive: true,
        shareSettings: {
          isPublic: false,
          requiresPassword: false,
          allowDownload: true,
          allowPrint: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setFileTemplates(prev => [fileTemplate, ...prev]);
      
      toast({
        title: 'File Uploaded',
        description: `${fileTemplate.name} has been uploaded successfully.`,
      });

      return fileTemplate;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFileTemplate = async (id: string, updates: Partial<FileTemplate>) => {
    setFileTemplates(prev =>
      prev.map(file =>
        file.id === id
          ? { ...file, ...updates, updatedAt: new Date().toISOString() }
          : file
      )
    );
    
    toast({
      title: 'File Updated',
      description: 'File has been updated successfully.',
    });
  };

  const deleteFileTemplate = async (id: string) => {
    const file = fileTemplates.find(f => f.id === id);
    setFileTemplates(prev => prev.filter(f => f.id !== id));
    setContentViews(prev => prev.filter(v => v.contentId !== id || v.contentType !== 'file'));
    
    toast({
      title: 'File Deleted',
      description: `${file?.name} has been deleted.`,
    });
  };

  const createPageTemplate = async (data: Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'uniqueViews' | 'averageTimeSpent'>): Promise<PageTemplate> => {
    setIsLoading(true);
    try {
      const pageTemplate: PageTemplate = {
        ...data,
        id: Date.now().toString(),
        views: 0,
        uniqueViews: 0,
        averageTimeSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPageTemplates(prev => [pageTemplate, ...prev]);
      
      toast({
        title: 'Page Created',
        description: `${pageTemplate.name} has been created successfully.`,
      });

      return pageTemplate;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePageTemplate = async (id: string, updates: Partial<PageTemplate>) => {
    setPageTemplates(prev =>
      prev.map(page =>
        page.id === id
          ? { ...page, ...updates, updatedAt: new Date().toISOString() }
          : page
      )
    );
    
    toast({
      title: 'Page Updated',
      description: 'Page has been updated successfully.',
    });
  };

  const deletePageTemplate = async (id: string) => {
    const page = pageTemplates.find(p => p.id === id);
    setPageTemplates(prev => prev.filter(p => p.id !== id));
    setContentViews(prev => prev.filter(v => v.contentId !== id || v.contentType !== 'page'));
    
    toast({
      title: 'Page Deleted',
      description: `${page?.name} has been deleted.`,
    });
  };

  const duplicatePageTemplate = async (id: string): Promise<PageTemplate> => {
    const original = pageTemplates.find(p => p.id === id);
    if (!original) throw new Error('Page not found');

    const duplicate: PageTemplate = {
      ...original,
      id: Date.now().toString(),
      name: `${original.name} (Copy)`,
      views: 0,
      uniqueViews: 0,
      averageTimeSpent: 0,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPageTemplates(prev => [duplicate, ...prev]);
    
    toast({
      title: 'Page Duplicated',
      description: `${duplicate.name} has been created.`,
    });

    return duplicate;
  };

  const generateFileShareLink = async (fileId: string, options: Partial<ShareLink> = {}): Promise<ShareLink> => {
    const shareLink: ShareLink = {
      id: Date.now().toString(),
      contentId: fileId,
      contentType: 'file',
      token: generateToken(),
      url: `${window.location.origin}/share/file/${generateToken()}`,
      isActive: true,
      clickCount: 0,
      createdAt: new Date().toISOString(),
      ...options,
    };

    setShareLinks(prev => [shareLink, ...prev]);
    
    toast({
      title: 'Share Link Generated',
      description: 'File share link has been created.',
    });

    return shareLink;
  };

  const generatePageShareLink = async (pageId: string, options: Partial<ShareLink> = {}): Promise<ShareLink> => {
    const shareLink: ShareLink = {
      id: Date.now().toString(),
      contentId: pageId,
      contentType: 'page',
      token: generateToken(),
      url: `${window.location.origin}/share/page/${generateToken()}`,
      isActive: true,
      clickCount: 0,
      createdAt: new Date().toISOString(),
      ...options,
    };

    setShareLinks(prev => [shareLink, ...prev]);
    
    toast({
      title: 'Share Link Generated',
      description: 'Page share link has been created.',
    });

    return shareLink;
  };

  const trackView = async (contentId: string, contentType: 'file' | 'page', viewerInfo: any = {}) => {
    const view: ContentView = {
      id: Date.now().toString(),
      contentId,
      contentType,
      ipAddress: viewerInfo.ipAddress || '127.0.0.1',
      userAgent: viewerInfo.userAgent || navigator.userAgent,
      location: viewerInfo.location || 'Desktop',
      viewDuration: viewerInfo.duration || 0,
      actions: viewerInfo.actions || ['viewed'],
      deviceInfo: {
        browser: viewerInfo.browser || 'Unknown',
        os: viewerInfo.os || 'Unknown',
        device: viewerInfo.device || 'Unknown',
      },
      createdAt: new Date().toISOString(),
      ...viewerInfo,
    };

    setContentViews(prev => [view, ...prev]);

    // Update view count on content
    if (contentType === 'file') {
      setFileTemplates(prev =>
        prev.map(file =>
          file.id === contentId
            ? { ...file, views: file.views + 1, lastViewed: new Date().toISOString() }
            : file
        )
      );
    } else {
      setPageTemplates(prev =>
        prev.map(page =>
          page.id === contentId
            ? { ...page, views: page.views + 1, lastViewed: new Date().toISOString() }
            : page
        )
      );
    }
  };

  const getContentAnalytics = (contentId: string, contentType: 'file' | 'page'): ContentAnalytics => {
    const views = contentViews.filter(v => v.contentId === contentId && v.contentType === contentType);
    const totalViews = views.length;
    const uniqueViews = new Set(views.map(v => v.ipAddress)).size;
    const averageViewDuration = views.reduce((sum, v) => sum + v.viewDuration, 0) / Math.max(totalViews, 1);

    return {
      contentId,
      contentType,
      totalViews,
      uniqueViews,
      averageViewDuration,
      topLocations: [],
      viewsByDate: [],
      deviceBreakdown: [],
      recentViews: views.slice(0, 10),
      engagementScore: Math.min(100, (uniqueViews * 10) + (averageViewDuration / 60 * 5)),
    };
  };

  const getRecentViews = (limit = 10) => {
    return contentViews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const setFileFilters = (filters: Partial<FileFilters>) => {
    setFileFiltersState(prev => ({ ...prev, ...filters }));
  };

  const setPageFilters = (filters: Partial<PageFilters>) => {
    setPageFiltersState(prev => ({ ...prev, ...filters }));
  };

  const getFilteredFiles = () => {
    return fileTemplates.filter(file => {
      if (fileFilters.search) {
        const searchLower = fileFilters.search.toLowerCase();
        if (
          !file.name.toLowerCase().includes(searchLower) &&
          !file.description?.toLowerCase().includes(searchLower) &&
          !file.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }

      if (fileFilters.category !== 'All' && file.category !== fileFilters.category) {
        return false;
      }

      if (fileFilters.fileType !== 'All' && file.fileType !== fileFilters.fileType) {
        return false;
      }

      return true;
    });
  };

  const getFilteredPages = () => {
    return pageTemplates.filter(page => {
      if (pageFilters.search) {
        const searchLower = pageFilters.search.toLowerCase();
        if (
          !page.name.toLowerCase().includes(searchLower) &&
          !page.title.toLowerCase().includes(searchLower) &&
          !page.description?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (pageFilters.templateType !== 'All' && page.templateType !== pageFilters.templateType) {
        return false;
      }

      if (pageFilters.isPublished !== undefined && page.isPublished !== pageFilters.isPublished) {
        return false;
      }

      return true;
    });
  };

  const getFileById = (id: string) => fileTemplates.find(f => f.id === id);
  const getPageById = (id: string) => pageTemplates.find(p => p.id === id);
  const getShareLinkByToken = (token: string) => shareLinks.find(s => s.token === token);

  const generateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const getFileType = (mimeType: string): FileType => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('msword')) return 'doc';
    if (mimeType.includes('openxmlformats-officedocument.wordprocessingml')) return 'docx';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
    if (mimeType.includes('openxmlformats-officedocument.presentationml')) return 'pptx';
    if (mimeType.includes('jpeg')) return 'jpeg';
    if (mimeType.includes('jpg')) return 'jpg';
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('gif')) return 'gif';
    if (mimeType.includes('text')) return 'txt';
    return 'other';
  };

  return (
    <ContentContext.Provider value={{
      fileTemplates,
      pageTemplates,
      contentViews,
      shareLinks,
      isLoading,
      uploadFile,
      updateFileTemplate,
      deleteFileTemplate,
      generateFileShareLink,
      createPageTemplate,
      updatePageTemplate,
      deletePageTemplate,
      duplicatePageTemplate,
      generatePageShareLink,
      trackView,
      getContentAnalytics,
      getRecentViews,
      fileFilters,
      pageFilters,
      setFileFilters,
      setPageFilters,
      getFilteredFiles,
      getFilteredPages,
      getFileById,
      getPageById,
      getShareLinkByToken,
    }}>
      {children}
    </ContentContext.Provider>
  );
};