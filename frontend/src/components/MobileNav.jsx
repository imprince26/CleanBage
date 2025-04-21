import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Home, Map, Calendar, Truck, Users, BarChart3, Trash2, Gift, Award, MessageSquare, Route, X } from 'lucide-react';

const MobileNav = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  const role = user?.role || 'resident';

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: <Home className="h-5 w-5" />,
          },
          {
            title: 'Users',
            href: '/admin/users',
            icon: <Users className="h-5 w-5" />,
          },
          {
            title: 'Bins',
            href: '/admin/bins',
            icon: <Trash2 className="h-5 w-5" />,
          },
          {
            title: 'Routes',
            href: '/admin/routes',
            icon: <Route className="h-5 w-5" />,
          },
          {
            title: 'Schedules',
            href: '/admin/schedules',
            icon: <Calendar className="h-5 w-5" />,
          },
          {
            title: 'Reports',
            href: '/admin/reports',
            icon: <BarChart3 className="h-5 w-5" />,
          },
          {
            title: 'Feedback',
            href: '/admin/feedback',
            icon: <MessageSquare className="h-5 w-5" />,
          },
          {
            title: 'Rewards',
            href: '/admin/rewards',
            icon: <Gift className="h-5 w-5" />,
          },
        ];
      case 'garbage_collector':
        return [
          {
            title: 'Dashboard',
            href: '/collector/dashboard',
            icon: <Home className="h-5 w-5" />,
          },
          {
            title: 'Routes',
            href: '/collector/routes',
            icon: <Truck className="h-5 w-5" />,
          },
          {
            title: 'Schedule',
            href: '/collector/schedule',
            icon: <Calendar className="h-5 w-5" />,
          },
        ];
      default: // resident
        return [
          {
            title: 'Dashboard',
            href: '/resident/dashboard',
            icon: <Home className="h-5 w-5" />,
          },
          {
            title: 'Report Bin',
            href: '/resident/report-bin',
            icon: <Trash2 className="h-5 w-5" />,
          },
          {
            title: 'Bin Map',
            href: '/resident/bin-map',
            icon: <Map className="h-5 w-5" />,
          },
          {
            title: 'Rewards',
            href: '/resident/rewards',
            icon: <Gift className="h-5 w-5" />,
          },
          {
            title: 'Leaderboard',
            href: '/resident/leaderboard',
            icon: <Award className="h-5 w-5" />,
          },
          {
            title: 'Feedback',
            href: '/resident/feedback',
            icon: <MessageSquare className="h-5 w-5" />,
          },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="h-16 flex flex-row items-center justify-between px-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">CleanBage</span>
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Button
                  variant={location.pathname === item.href ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  )}
                  asChild
                  onClick={onClose}
                >
                  <Link to={item.href}>
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;