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
  Search,
  HelpCircle,
  LayoutDashboard,
  Book,
  TreeDeciduous,
  LineChart,
  Activity,
  Shield,
  Truck
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
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      if (user) {
        await fetchNotifications();
      }
    };
    fetchUserNotifications();
  }, [user]);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const publicNavLinks = [
    { name: "About", href: "/about", icon: User, description: "Learn about our mission" },
    { name: "Services", href: "/services", icon: Gift, description: "Our services" },
    { name: "Contact", href: "/contact", icon: MessageSquare, description: "Get in touch" },
    { name: "FAQ", href: "/faq", icon: HelpCircle, description: "Common questions" },
  ];

  const residentNavLinks = [
    { name: "Dashboard", href: "/resident/dashboard", icon: LayoutDashboard },
    { name: "Report Bin", href: "/resident/report-bin", icon: AlertTriangle },
    { name: "Bin Map", href: "/resident/bin-map", icon: Map },
    { name: "Collections", href: "/resident/collections", icon: Truck },
    {
      name: "Rewards",
      href: "/resident/rewards",
      icon: Gift,
      children: [
        { name: "Reward Store", href: "/resident/rewards" },
        { name: "Reward History", href: "/resident/rewards/history" },
      ],
    },
    { name: "Leaderboard", href: "/resident/leaderboard", icon: Trophy },
    {
      name: "Feedback",
      href: "/resident/feedback",
      icon: MessageSquare,
      children: [
        { name: "Submit Feedback", href: "/resident/feedback" },
        { name: "Feedback History", href: "/resident/feedback/history" },
      ],
    },
    { name: "Schedule", href: "/resident/schedule", icon: Calendar },
    { name: "Environmental Impact", href: "/resident/impact", icon: TreeDeciduous },
    { name: "Education", href: "/resident/education", icon: Book },
  ];

  const collectorNavLinks = [
    { name: "Dashboard", href: "/collector/dashboard", icon: LayoutDashboard },
    {
      name: "Routes",
      href: "/collector/routes",
      icon: Route,
      children: [
        { name: "Active Routes", href: "/collector/routes" },
        { name: "Route History", href: "/collector/routes/history" },
      ],
    },
    {
      name: "Schedule",
      href: "/collector/schedule",
      icon: Calendar,
      children: [
        { name: "View Schedule", href: "/collector/schedule" },
        { name: "Calendar View", href: "/collector/schedule/calendar" },
      ],
    },
    {
      name: "Bins",
      href: "/collector/bins",
      icon: Trash2,
      children: [
        { name: "Assigned Bins", href: "/collector/bins" },
        { name: "Collection History", href: "/collector/bins/history" },
      ],
    },
    {
      name: "Reports",
      href: "/collector/reports",
      icon: FileText,
      children: [
        { name: "View Reports", href: "/collector/reports" },
        { name: "Submit Report", href: "/collector/reports/submit" },
        { name: "Report History", href: "/collector/reports/history" },
      ],
    },
    { name: "Performance", href: "/collector/performance", icon: Activity },
    { name: "Safety Guidelines", href: "/collector/safety", icon: Shield },
  ];

  const adminNavLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      children: [
        { name: "User Management", href: "/admin/users" },
        { name: "Create User", href: "/admin/users/create" },
      ],
    },
    {
      name: "Bins",
      href: "/admin/bins",
      icon: Trash2,
      children: [
        { name: "Bin Management", href: "/admin/bins" },
        { name: "Create Bin", href: "/admin/bins/create" },
        { name: "Bin Map", href: "/admin/bins/map" },
      ],
    },
    {
      name: "Routes",
      href: "/admin/routes",
      icon: Route,
      children: [
        { name: "Route Management", href: "/admin/routes" },
        { name: "Create Route", href: "/admin/routes/create" },
        { name: "Route Optimization", href: "/admin/routes/optimize" },
      ],
    },
    {
      name: "Schedules",
      href: "/admin/schedules",
      icon: Calendar,
      children: [
        { name: "Schedule Management", href: "/admin/schedules" },
        { name: "Create Schedule", href: "/admin/schedules/create" },
        { name: "Calendar View", href: "/admin/schedules/calendar" },
      ],
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
      children: [
        { name: "Report Management", href: "/admin/reports" },
        { name: "Report Analytics", href: "/admin/reports/analytics" },
        { name: "Export Reports", href: "/admin/reports/export" },
      ],
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: MessageSquare,
      children: [
        { name: "Feedback Management", href: "/admin/feedback" },
        { name: "Feedback Analytics", href: "/admin/feedback/analytics" },
      ],
    },
    {
      name: "Rewards",
      href: "/admin/rewards",
      icon: Gift,
      children: [
        { name: "Reward Management", href: "/admin/rewards" },
        { name: "Create Reward", href: "/admin/rewards/create" },
        { name: "Reward Analytics", href: "/admin/rewards/analytics" },
      ],
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: LineChart,
      children: [
        { name: "System Analytics", href: "/admin/analytics" },
        { name: "Waste Analytics", href: "/admin/analytics/waste" },
        { name: "Performance Analytics", href: "/admin/analytics/performance" },
        { name: "User Analytics", href: "/admin/analytics/user" },
      ],
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      children: [
        { name: "System Settings", href: "/admin/settings" },
        { name: "Notification Settings", href: "/admin/settings/notifications" },
        { name: "API Settings", href: "/admin/settings/api" },
      ],
    },
  ];

  const getNavLinks = () => {
    if (!user) return publicNavLinks;
    switch (user.role) {
      case "resident":
        return residentNavLinks;
      case "garbage_collector":
        return collectorNavLinks;
      case "admin":
        return adminNavLinks;
      default:
        return publicNavLinks;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

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
              {/* Navigation Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hidden lg:flex">
                    <Menu className="h-4 w-4" />
                    <span className="hidden sm:block">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[280px] max-h-[500px] overflow-y-auto"
                >
                  {getNavLinks().map((item) => (
                    <div key={item.name}>
                      {item.children ? (
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </DropdownMenuLabel>
                          {item.children.map((child) => (
                            <DropdownMenuItem key={child.href} asChild>
                              <Link to={child.href} className="cursor-pointer">
                                {child.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              to={item.href}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <item.icon className="h-4 w-4" />
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full" />
                    )}
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
                        <p className="text-sm text-muted-foreground">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const NotificationIcon = getNotificationIcon(
                          notification.type
                        );
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
                                  await api.put(
                                    `/notifications/${notification._id}/read`
                                  );
                                  fetchNotifications();
                                } catch (error) {
                                  console.error(
                                    "Error marking notification as read:",
                                    error
                                  );
                                }
                              }
                            }}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-full",
                                !notification.isRead
                                  ? "bg-primary/10"
                                  : "bg-muted"
                              )}
                            >
                              <NotificationIcon
                                className={cn(
                                  "h-4 w-4",
                                  !notification.isRead
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p
                                className={cn(
                                  "text-sm",
                                  !notification.isRead && "font-medium"
                                )}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(notification.createdAt),
                                    "MMM d, h:mm a"
                                  )}
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
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/notifications">View All Notifications</Link>
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
                      <p className="text-sm font-medium line-clamp-1">
                        {user.name}
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/help" className="cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
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

                  {/* Mobile Navigation */}
                  <div className="space-y-1">
                    {getNavLinks().map((item) => (
                      <div key={item.name}>
                        {item.children ? (
                          <div className="space-y-1">
                            <p className="px-3 py-2 text-sm font-medium">
                              {item.name}
                            </p>
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={() => setIsMobileOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <Link
                            to={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}