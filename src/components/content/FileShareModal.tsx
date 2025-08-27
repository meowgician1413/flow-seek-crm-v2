import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileTemplate } from '@/types/content';
import { Share2, Copy, Link } from 'lucide-react';

interface FileShareModalProps {
  file: FileTemplate;
  onClose: () => void;
}

export const FileShareModal = ({ file, onClose }: FileShareModalProps) => {
  const shareUrl = `${window.location.origin}/share/file/${file.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Share {file.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly />
          <Button onClick={copyLink} size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>
        <Button onClick={onClose} className="w-full">Done</Button>
      </div>
    </>
  );
};