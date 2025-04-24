import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  Map,
  Gift,
  Trophy,
  MessageSquare,
  Route,
  Calendar,
  Users,
  Trash2,
  FileText,
  Settings,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const residentLinks = [
  { href: '/resident/dashboard', label: 'Dashboard', icon: Home },
  { href: '/resident/bin-map', label: 'Bin Map', icon: Map },
  { href: '/resident/rewards', label: 'Reward Store', icon: Gift },
  { href: '/resident/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/resident/feedback', label: 'Submit Feedback', icon: MessageSquare },
]

const collectorLinks = [
  { href: '/collector/dashboard', label: 'Dashboard', icon: Home },
  { href: '/collector/routes', label: 'Active Routes', icon: Route },
  { href: '/collector/schedule', label: 'Schedule', icon: Calendar },
]

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/bins', label: 'Bins', icon: Trash2 },
  { href: '/admin/routes', label: 'Routes', icon: Route },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
]

export function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  const links = user?.role === 'admin'
    ? adminLinks
    : user?.role === 'garbage_collector'
      ? collectorLinks
      : residentLinks

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden',
          open ? 'block' : 'hidden'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="CleanBage" className="h-8 w-8" />
            <span className="font-bold">CleanBage</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:bg-accent focus:text-accent-foreground focus:outline-none'
                )}
                onClick={() => onClose()}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}