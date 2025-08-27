import { useState, useCallback } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileCategory } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { 
  Upload, 
  File, 
  X, 
  FileText, 
  Image, 
  Presentation,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadModalProps {
  onClose: () => void;
}

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export const FileUploadModal = ({ onClose }: FileUploadModalProps) => {
  const { uploadFile, isLoading } = useContent();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSettings, setUploadSettings] = useState({
    category: 'Document' as FileCategory,
    isPublic: false,
    allowDownload: true,
  });

  const acceptedTypes = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'text/plain': ['.txt'],
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf')) return FileText;
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return Presentation;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const processFiles = (fileList: FileList | File[]) => {
    const newFiles: FileWithPreview[] = [];
    
    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      const fileWithPreview: FileWithPreview = {
        ...file,
        status: error ? 'error' : 'pending',
        error,
        progress: 0,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      newFiles.push(fileWithPreview);
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f === file ? { ...f, status: 'uploading' as const, progress: 0 } : f
        ));

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f === file && f.progress !== undefined && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }));
        }, 200);

        await uploadFile(file, uploadSettings.category, file.name);
        
        clearInterval(progressInterval);
        
        // Mark as completed
        setFiles(prev => prev.map(f => 
          f === file ? { ...f, status: 'completed' as const, progress: 100 } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f === file ? { 
            ...f, 
            status: 'error' as const, 
            error: 'Upload failed' 
          } : f
        ));
      }
    }
  };

  const canUpload = files.some(f => f.status === 'pending');
  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Files</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Upload Area */}
        <Card>
          <CardContent className="p-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25",
                "hover:border-primary/50"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Drop files here or browse</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Support for PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, GIF, TXT files up to 50MB
              </p>
              
              <input
                type="file"
                multiple
                accept={Object.keys(acceptedTypes).join(',')}
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Upload Settings */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h4 className="font-medium">Upload Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={uploadSettings.category} 
                  onValueChange={(value) => setUploadSettings(prev => ({ 
                    ...prev, 
                    category: value as FileCategory 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proposal">Proposals</SelectItem>
                    <SelectItem value="Brochure">Brochures</SelectItem>
                    <SelectItem value="Contract">Contracts</SelectItem>
                    <SelectItem value="Presentation">Presentations</SelectItem>
                    <SelectItem value="Image">Images</SelectItem>
                    <SelectItem value="Document">Documents</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Files to Upload ({files.length})</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFiles([])}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file);
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img 
                            src={file.preview} 
                            alt={file.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {file.status === 'uploading' && file.progress !== undefined && (
                          <Progress value={file.progress} className="mt-1 h-1" />
                        )}
                        
                        {file.error && (
                          <p className="text-xs text-destructive mt-1">{file.error}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {file.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        {file.status === 'uploading' && (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                          disabled={file.status === 'uploading'}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            {allCompleted ? 'Done' : 'Cancel'}
          </Button>
          
          {canUpload && (
            <Button onClick={uploadAllFiles} disabled={isLoading}>
              {isLoading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Files`}
            </Button>
          )}
          
          {allCompleted && (
            <Button onClick={onClose}>
              View Files
            </Button>
          )}
        </div>
      </div>
    </>
  );
};