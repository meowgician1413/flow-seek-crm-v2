import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileTemplate } from '@/types/content';
import { Download, Eye } from 'lucide-react';

interface FilePreviewModalProps {
  file: FileTemplate;
  onClose: () => void;
}

export const FilePreviewModal = ({ file, onClose }: FilePreviewModalProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{file.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="bg-muted rounded-lg p-8 text-center">
          <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>File preview not available</p>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </>
  );
};