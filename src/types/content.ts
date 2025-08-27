export type FileCategory = 'Proposal' | 'Brochure' | 'Contract' | 'Presentation' | 'Image' | 'Document' | 'Other';
export type FileType = 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'txt' | 'other';
export type PageTemplateType = 'About' | 'Services' | 'Pricing' | 'Product' | 'Contact' | 'Proposal' | 'Custom';
export type ViewerLocation = 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';

export interface FileTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: FileType;
  fileSize: number; // in bytes
  category: FileCategory;
  mimeType: string;
  views: number;
  downloads: number;
  uniqueViews: number;
  lastViewed?: string;
  isActive: boolean;
  tags?: string[];
  shareSettings: {
    isPublic: boolean;
    requiresPassword: boolean;
    password?: string;
    expiresAt?: string;
    allowDownload: boolean;
    allowPrint: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PageTemplate {
  id: string;
  userId: string;
  name: string;
  title: string;
  description?: string;
  content: string; // HTML content
  templateType: PageTemplateType;
  customCSS?: string;
  metaDescription?: string;
  thumbnailUrl?: string;
  views: number;
  uniqueViews: number;
  averageTimeSpent: number; // in seconds
  lastViewed?: string;
  isActive: boolean;
  isPublished: boolean;
  shareSettings: {
    isPublic: boolean;
    requiresPassword: boolean;
    password?: string;
    expiresAt?: string;
    allowSharing: boolean;
    showBranding: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContentView {
  id: string;
  contentId: string;
  contentType: 'file' | 'page';
  leadId?: string;
  viewerName?: string;
  viewerEmail?: string;
  ipAddress: string;
  userAgent: string;
  location: ViewerLocation;
  country?: string;
  city?: string;
  viewDuration: number; // in seconds
  actions: string[]; // ['viewed', 'downloaded', 'printed', 'shared']
  referrer?: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  createdAt: string;
}

export interface ContentAnalytics {
  contentId: string;
  contentType: 'file' | 'page';
  totalViews: number;
  uniqueViews: number;
  totalDownloads?: number;
  averageViewDuration: number;
  topLocations: Array<{
    location: string;
    views: number;
    percentage: number;
  }>;
  viewsByDate: Array<{
    date: string;
    views: number;
    uniqueViews: number;
    downloads?: number;
  }>;
  deviceBreakdown: Array<{
    type: ViewerLocation;
    views: number;
    percentage: number;
  }>;
  recentViews: ContentView[];
  conversionRate?: number;
  engagementScore: number;
}

export interface FileFilters {
  search: string;
  category: FileCategory | 'All';
  fileType: FileType | 'All';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PageFilters {
  search: string;
  templateType: PageTemplateType | 'All';
  isPublished?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ShareLink {
  id: string;
  contentId: string;
  contentType: 'file' | 'page';
  token: string;
  url: string;
  qrCodeUrl?: string;
  customName?: string;
  isActive: boolean;
  clickCount: number;
  lastClicked?: string;
  expiresAt?: string;
  createdAt: string;
}

export const FILE_TYPE_ICONS: Record<FileType, string> = {
  pdf: 'FileText',
  doc: 'FileText',
  docx: 'FileText',
  ppt: 'Presentation',
  pptx: 'Presentation',
  jpg: 'Image',
  jpeg: 'Image',
  png: 'Image',
  gif: 'Image',
  txt: 'FileText',
  other: 'File',
};

export const FILE_TYPE_COLORS: Record<FileType, string> = {
  pdf: 'text-red-600',
  doc: 'text-blue-600',
  docx: 'text-blue-600',
  ppt: 'text-orange-600',
  pptx: 'text-orange-600',
  jpg: 'text-green-600',
  jpeg: 'text-green-600',
  png: 'text-green-600',
  gif: 'text-green-600',
  txt: 'text-gray-600',
  other: 'text-gray-600',
};