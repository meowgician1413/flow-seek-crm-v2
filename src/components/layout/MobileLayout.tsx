import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
}

export const MobileLayout = ({ children, title }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title={title} />
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};