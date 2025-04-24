import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  MessageSquare,
  FileText,
  Book,
  HelpCircle,
  Shield,
  Users,
} from 'lucide-react'

export function Footer() {
  const { user } = useAuth()

  // Role-based quick links
  const quickLinks = {
    public: [
      { name: 'About Us', href: '/about' },
      { name: 'Services', href: '/services' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    resident: [
      { name: 'Bin Map', href: '/resident/bin-map' },
      { name: 'Rewards Store', href: '/resident/rewards' },
      { name: 'Leaderboard', href: '/resident/leaderboard' },
      { name: 'Submit Feedback', href: '/resident/feedback' },
      { name: 'View Schedule', href: '/resident/schedule' },
    ],
    garbage_collector: [
      { name: 'Active Routes', href: '/collector/routes' },
      { name: 'Daily Schedule', href: '/collector/schedule' },
      { name: 'Report Issues', href: '/collector/report-issue' },
      { name: 'Safety Guidelines', href: '/collector/safety' },
      { name: 'Performance', href: '/collector/performance' },
    ],
    admin: [
      { name: 'User Management', href: '/admin/users' },
      { name: 'Bin Management', href: '/admin/bins' },
      { name: 'Route Planning', href: '/admin/routes' },
      { name: 'Reports', href: '/admin/reports' },
      { name: 'System Settings', href: '/admin/settings' },
    ],
  }

  // Resource links based on role
  const resourceLinks = {
    public: [
      { name: 'User Guide', href: '/guide', icon: Book },
      { name: 'Help Center', href: '/help', icon: HelpCircle },
      { name: 'Terms of Service', href: '/terms', icon: Shield },
    ],
    resident: [
      { name: 'Waste Guidelines', href: '/resident/waste-guide', icon: Book },
      { name: 'Report Issue', href: '/resident/report', icon: MessageSquare },
      { name: 'Community', href: '/resident/community', icon: Users },
    ],
    garbage_collector: [
      { name: 'Operation Manual', href: '/collector/manual', icon: Book },
      { name: 'Daily Reports', href: '/collector/reports', icon: FileText },
      { name: 'Support', href: '/collector/support', icon: HelpCircle },
    ],
    admin: [
      { name: 'Documentation', href: '/admin/docs', icon: Book },
      { name: 'Analytics', href: '/admin/analytics', icon: FileText },
      { name: 'Support Portal', href: '/admin/support', icon: HelpCircle },
    ],
  }

  const getCurrentLinks = () => {
    if (!user) return quickLinks.public
    return quickLinks[user.role] || quickLinks.public
  }

  const getCurrentResources = () => {
    if (!user) return resourceLinks.public
    return resourceLinks[user.role] || resourceLinks.public
  }

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <svg
                className="h-8 w-8 text-primary"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="8" fill="currentColor"/>
                <path
                  d="M22.667 12.667v8a2 2 0 01-2 2H11.333a2 2 0 01-2-2v-8m13.334 0H9.333m13.334 0l-1.334-2.667H10.667L9.333 12.667m6.667 4v3m0-3l-2-2m2 2l2-2"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-bold">CleanBage</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Smart Waste Management System for Jamnagar Municipal Corporation
            </p>
            {user && (
              <p className="text-sm text-primary">
                Logged in as: <span className="capitalize">{user.role.replace('_', ' ')}</span>
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {getCurrentLinks().map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              {getCurrentResources().map((resource) => (
                <li key={resource.name}>
                  <Link 
                    to={resource.href} 
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <resource.icon className="h-4 w-4" />
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Contact Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@cleanbage.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                +91 1234567890
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                JMC Office, Jamnagar, Gujarat, India
              </li>
              <li className="mt-4 flex space-x-4">
                <a 
                  href="https://facebook.com/cleanbage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com/cleanbage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://instagram.com/cleanbage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CleanBage. All rights reserved. Made with ❤️ for Jamnagar
          </p>
        </div>
      </div>
    </footer>
  )
}