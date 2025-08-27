import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { CommunicationType } from '@/types/communication';
import { QuickCommunicationModal } from './QuickCommunicationModal';
import { Phone, Mail, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunicationButtonsProps {
  lead: Lead;
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
}

const communicationTypes: { type: CommunicationType; icon: any; label: string; color: string }[] = [
  { type: 'call', icon: Phone, label: 'Call', color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20' },
  { type: 'email', icon: Mail, label: 'Email', color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20' },
  { type: 'sms', icon: MessageSquare, label: 'SMS', color: 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20' },
  { type: 'whatsapp', icon: MessageSquare, label: 'WhatsApp', color: 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20' },
];

export const CommunicationButtons = ({ lead, variant = 'default', className }: CommunicationButtonsProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CommunicationType>('call');

  const openModal = (type: CommunicationType) => {
    setSelectedType(type);
    setModalOpen(true);
  };

  if (variant === 'compact') {
    return (
      <>
        <div className={cn("flex items-center gap-1", className)}>
          {communicationTypes.map(({ type, icon: Icon, color }) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openModal(type);
              }}
              className={cn("h-8 w-8 p-0", color)}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
        
        <QuickCommunicationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          lead={lead}
          type={selectedType}
        />
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <div className={cn(
          "fixed bottom-20 right-4 flex flex-col gap-2 z-40",
          "md:bottom-4 md:right-4",
          className
        )}>
          {communicationTypes.map(({ type, icon: Icon, label, color }) => (
            <Button
              key={type}
              onClick={() => openModal(type)}
              className={cn(
                "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all",
                "bg-background border hover:scale-105",
                color
              )}
              size="icon"
            >
              <Icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
        
        <QuickCommunicationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          lead={lead}
          type={selectedType}
        />
      </>
    );
  }

  // Default variant
  return (
    <>
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        {communicationTypes.map(({ type, icon: Icon, label, color }) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => openModal(type)}
            className={cn("h-12 flex flex-col gap-1", color)}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
      
      <QuickCommunicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lead={lead}
        type={selectedType}
      />
    </>
  );
};