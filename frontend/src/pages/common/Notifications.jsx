import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  MailCheck,
  Trash2,
  Award,
  MessageSquare,
  Route as RouteIcon,
  FileText,
  Settings,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const ITEMS_PER_PAGE = 10;

const NOTIFICATION_TYPES = [
  { value: "all", label: "All Types" },
  { value: "collection_scheduled", label: "Collection Scheduled" },
  { value: "collection_completed", label: "Collection Completed" },
  { value: "bin_reported", label: "Bin Reported" },
  { value: "report_submitted", label: "Report Submitted" },
  { value: "reward_earned", label: "Reward Earned" },
  { value: "feedback_response", label: "Feedback Response" },
  { value: "route_assigned", label: "Route Assigned" },
  { value: "bin_overflow", label: "Bin Overflow" },
  { value: "system_announcement", label: "System Announcement" },
  { value: "maintenance_alert", label: "Maintenance Alert" },
];

const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    isRead: "all",
    priority: "all",
  });

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filters]);

  const fetchNotifications = async (loadMore = false) => {
    try {
      setLoadingMore(loadMore);
      if (!loadMore) setLoading(true);

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.isRead !== "all" && { isRead: filters.isRead }),
        ...(filters.priority !== "all" && { priority: filters.priority }),
      });

      const response = await api.get(`/notifications?${queryParams}`);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const { data, total, unreadCount } = response.data;

      if (loadMore) {
        setNotifications((prev) => [...prev, ...data]);
      } else {
        setNotifications(data);
      }
      
      setTotalNotifications(total);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
    fetchNotifications(true);
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put("/notifications/read-all");
      
      if (response.data.success) {
        toast.success("All notifications marked as read");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const deleteReadNotifications = async () => {
    try {
      const response = await api.delete("/notifications/delete-read");
      
      if (response.data.success) {
        toast.success("Read notifications deleted");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      toast.error("Failed to delete notifications");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
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
      bin_overflow: Trash2,
      system_announcement: Bell,
      maintenance_alert: Settings,
    };
    return icons[type] || Bell;
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      low: "text-blue-500 border-blue-200 bg-blue-50",
      medium: "text-yellow-500 border-yellow-200 bg-yellow-50",
      high: "text-orange-500 border-orange-200 bg-orange-50",
      urgent: "text-red-500 border-red-200 bg-red-50",
    };
    return styles[priority] || "";
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <MailCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
          <Button 
            variant="outline" 
            onClick={deleteReadNotifications}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.isRead}
              onValueChange={(value) => handleFilterChange("isRead", value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Read status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="false">Unread</SelectItem>
                <SelectItem value="true">Read</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange("priority", value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Notifications</h3>
              <p className="text-muted-foreground">
                {filters.type !== "all" || filters.isRead !== "all" || filters.priority !== "all"
                  ? "No notifications match your filters"
                  : "You don't have any notifications yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(notification.type);
            return (
              <Card
                key={notification._id}
                className={`transition-colors hover:bg-muted/50 ${
                  !notification.isRead ? "bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        !notification.isRead
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}
                    >
                      <NotificationIcon
                        className={`h-5 w-5 ${
                          !notification.isRead
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-medium line-clamp-1">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={notification.isRead ? "outline" : "default"}
                          >
                            {notification.isRead ? "Read" : "New"}
                          </Badge>
                          <Badge
                            className={getPriorityStyles(notification.priority)}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(notification.createdAt), "PPp")}
                          </span>
                        </div>
                        {notification.action && (
                          <Button variant="link" asChild className="p-0">
                            <Link to={notification.action.url}>
                              {notification.action.text}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Load More Button */}
        {!loading && notifications.length < totalNotifications && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full sm:w-auto"
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;