import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Menu,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Map,
  Gift,
  Trophy,
  MessageSquare,
  Route,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Route as RouteIcon,
  Loader2,
  Users,
  Trash2,
  FileText,
  Clock,
  Home,
  X,
  Search,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import api from "@/utils/api";
import format from "date-fns/format";

export function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const location = useLocation();

  // Add this useEffect hook
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Add this function in the Header component
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get("/notifications?limit=5");
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Add this function to get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      collection_scheduled: Calendar,
      collection_completed: CheckCircle2,
      bin_reported: AlertTriangle,
      report_submitted: FileText,
      reward_earned: Award,
      feedback_response: MessageSquare,
      route_assigned: RouteIcon,
      system_announcement: Bell,
      maintenance_alert: Settings,
    };
    return icons[type] || Bell;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation configurations
  const publicNavigation = [
    { name: "About", href: "/about", description: "Learn about our mission" },
    { name: "Services", href: "/services", description: "Our waste management services" },
    { name: "Contact", href: "/contact", description: "Get in touch with us" },
    { name: "FAQ", href: "/faq", description: "Frequently asked questions" },
  ];

  const roleNavigation = {
    resident: [
      { name: "Dashboard", href: "/resident/dashboard", icon: LayoutDashboard, description: "Your overview" },
      { name: "Report Bin", href: "/resident/report-bin", icon: Bell, description: "Report waste issues" },
      { name: "Bin Map", href: "/resident/bin-map", icon: Map, description: "Find nearby bins" },
      { name: "Rewards", href: "/resident/rewards", icon: Gift, description: "View available rewards", badge: "New" },
      { name: "Leaderboard", href: "/resident/leaderboard", icon: Trophy, description: "Community rankings" },
      { name: "Feedback", href: "/resident/feedback", icon: MessageSquare, description: "Share your thoughts" },
    ],
    garbage_collector: [
      { name: "Dashboard", href: "/collector/dashboard", icon: LayoutDashboard, description: "Your overview" },
      { name: "Active Routes", href: "/collector/routes", icon: Route, description: "View assigned routes" },
      { name: "Schedule", href: "/collector/schedule", icon: Calendar, description: "Your collection schedule" },
    ],
    admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, description: "System overview" },
      { name: "Users", href: "/admin/users", icon: Users, description: "Manage users" },
      { name: "Bins", href: "/admin/bins", icon: Trash2, description: "Manage bins" },
      { name: "Routes", href: "/admin/routes", icon: Route, description: "Plan routes" },
      { name: "Reports", href: "/admin/reports", icon: FileText, description: "View reports" },
    ],
  };

  const getNavLinks = () => {
    if (!user) return publicNavigation;
    return roleNavigation[user.role] || [];
  };

  const userMenuItems = [
    { name: "View Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help Center", href: "/help", icon: HelpCircle },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="CleanBage" className="h-8 w-8" />
            <span className="font-bold text-lg hidden sm:inline-block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              CleanBage
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {getNavLinks().map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-2 text-sm font-medium transition-all hover:text-primary relative px-2 py-1.5 rounded-md hover:bg-accent",
                location.pathname === item.href
                  ? "text-primary bg-accent"
                  : "text-muted-foreground"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.name}</span>
              {item.badge && (
                <Badge variant="default" className="ml-1 px-1 py-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden sm:flex"
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5 transition-all" />
            ) : (
              <Sun className="h-5 w-5 transition-all" />
            )}
          </Button>

          {user ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {unreadCount} New
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <ScrollArea className="h-[300px]">
                    {loadingNotifications ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const NotificationIcon = getNotificationIcon(notification.type);
                        return (
                          <Link
                            key={notification._id}
                            to={notification.action?.url || "/notifications"}
                            className={cn(
                              "flex items-start gap-3 p-4 hover:bg-muted transition-colors",
                              !notification.isRead && "bg-primary/5"
                            )}
                            onClick={async () => {
                              if (!notification.isRead) {
                                try {
                                  await api.put(`/notifications/${notification._id}/read`);
                                  fetchNotifications();
                                } catch (error) {
                                  console.error("Error marking notification as read:", error);
                                }
                              }
                            }}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-full",
                                !notification.isRead ? "bg-primary/10" : "bg-muted"
                              )}
                            >
                              <NotificationIcon
                                className={cn(
                                  "h-4 w-4",
                                  !notification.isRead ? "text-primary" : "text-muted-foreground"
                                )}
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className={cn("text-sm", !notification.isRead && "font-medium")}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </ScrollArea>

                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link to="/notifications">
                        View All Notifications
                      </Link>
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-2 -mr-2 relative group"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar?.url || `/avatars/${user.role}.svg`}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
                      />
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium line-clamp-1">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role.replace("_", " ")}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {userMenuItems.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          to={item.href}
                          className="flex items-center cursor-pointer"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="hidden sm:flex">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="border-b pb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] py-4">
                <div className="space-y-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Separator />

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {getNavLinks().map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                          location.pathname === item.href
                            ? "bg-accent text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                        {item.badge && (
                          <Badge variant="default" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>

                  {user && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent text-muted-foreground"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}