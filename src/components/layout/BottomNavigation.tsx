import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/integrations', icon: Zap, label: 'Integrations' },
  { to: '/templates', icon: FileText, label: 'Templates' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 z-50 shadow-glow">
      <div className="flex justify-around items-center h-18 px-4 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-3 px-2 transition-all duration-200 rounded-lg mx-1',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-2 rounded-xl transition-all duration-200 shadow-card',
                  isActive && 'bg-gradient-primary text-primary-foreground shadow-elegant scale-110'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1.5 truncate transition-all",
                  isActive && "font-semibold"
                )}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};