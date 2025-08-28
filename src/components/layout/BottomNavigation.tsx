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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-4 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-1.5 rounded-lg transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium mt-1 truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};