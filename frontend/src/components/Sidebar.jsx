import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Shield,
  Book,
  LineChart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navigationConfig = {
  resident: [
    { href: "/resident/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resident/report-bin", label: "Report Bin", icon: AlertTriangle },
    { href: "/resident/bin-map", label: "Bin Map", icon: Map },
    { href: "/resident/collections", label: "Collections", icon: Trash2 },
    { 
      label: "Rewards",
      icon: Gift,
      children: [
        { href: "/resident/rewards", label: "Reward Store" },
        { href: "/resident/rewards/history", label: "Reward History" },
      ]
    },
    { href: "/resident/leaderboard", label: "Leaderboard", icon: Trophy },
    {
      label: "Feedback",
      icon: MessageSquare,
      children: [
        { href: "/resident/feedback", label: "Submit Feedback" },
        { href: "/resident/feedback/history", label: "Feedback History" },
      ]
    },
  ],
  garbage_collector: [
    { href: "/collector/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      label: "Routes",
      icon: Route,
      children: [
        { href: "/collector/routes", label: "Active Routes" },
        { href: "/collector/routes/history", label: "Route History" },
      ]
    },
    {
      label: "Schedule",
      icon: Calendar,
      children: [
        { href: "/collector/schedule", label: "View Schedule" },
        { href: "/collector/schedule/calendar", label: "Calendar View" },
      ]
    },
    {
      label: "Bins",
      icon: Trash2,
      children: [
        { href: "/collector/bins", label: "Assigned Bins" },
        { href: "/collector/bins/history", label: "Collection History" },
      ]
    },
    {
      label: "Reports",
      icon: FileText,
      children: [
        { href: "/collector/reports", label: "View Reports" },
        { href: "/collector/reports/history", label: "Report History" },
      ]
    },
    { href: "/collector/performance", label: "Performance", icon: Activity },
    { href: "/collector/safety", label: "Safety Guidelines", icon: Shield },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      label: "Users",
      icon: Users,
      children: [
        { href: "/admin/users", label: "User Management" },
        { href: "/admin/users/create", label: "Create User" },
      ]
    },
    {
      label: "Bins",
      icon: Trash2,
      children: [
        { href: "/admin/bins", label: "Bin Management" },
        { href: "/admin/bins/create", label: "Create Bin" },
        { href: "/admin/bins/map", label: "Bin Map" },
      ]
    },
    {
      label: "Routes",
      icon: Route,
      children: [
        { href: "/admin/routes", label: "Route Management" },
        { href: "/admin/routes/create", label: "Create Route" },
        { href: "/admin/routes/optimize", label: "Route Optimization" },
      ]
    },
    {
      label: "Analytics",
      icon: LineChart,
      children: [
        { href: "/admin/analytics", label: "System Analytics" },
        { href: "/admin/analytics/waste", label: "Waste Analytics" },
        { href: "/admin/analytics/performance", label: "Performance Analytics" },
      ]
    },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export function Sidebar({ onClose,collapsed }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigation = navigationConfig[user?.role] || [];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    const [isOpen, setIsOpen] = useState(false);

    if (item.children) {
      return (
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsOpen(!isOpen)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </Button>
          {isOpen && (
            <div className="pl-6 space-y-1">
              {item.children.map((child) => (
                <Button
                  key={child.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    location.pathname === child.href &&
                      "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link to={child.href} onClick={onClose}>
                    {child.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          isActive && "bg-accent text-accent-foreground"
        )}
        asChild
      >
        <Link to={item.href} onClick={onClose}>
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      </Button>
    );
  };

  return (
    <div className={cn(
      "flex h-full flex-col",
      collapsed && "w-0 overflow-hidden"
    )}>
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-6">
        <Link 
          to="/" 
          className="flex items-center gap-2" 
          onClick={onClose}
        >
          <img src="/logo.svg" alt="CleanBage" className="h-8 w-8" />
          <span className={cn(
            "font-bold text-lg transition-opacity duration-200",
            collapsed && "opacity-0"
          )}>
            CleanBage
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavItem 
              key={item.href || item.label} 
              item={item}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.avatar?.url || `/avatars/${user?.role}.svg`}
            alt={user?.name}
            className="h-8 w-8 rounded-full"
          />
          <div className={cn(
            "flex-1 overflow-hidden transition-opacity duration-200",
            collapsed && "opacity-0"
          )}>
            <p className="truncate text-sm font-medium">
              {user?.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}