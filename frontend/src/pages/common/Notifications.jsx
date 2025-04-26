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
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const ITEMS_PER_PAGE = 20;

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "all",
    isRead: "all",
    priority: "all",
  });

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filters]);

  const fetchNotifications = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...filters,
      });

      const response = await api.get(`/notifications?${queryParams}`);
      console.log(response.data);
      if(!response.data.success) {
        throw new Error(response.data.message);
      }
        setNotifications(response.data.data);
        setTotalNotifications(response.data.total);
    
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
      });
      const data = await response.json();

      if (data.success) {
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
      const response = await fetch("/api/notifications/delete-read", {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Read notifications deleted");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      toast.error("Failed to delete notifications");
    }
  };

  const getNotificationIcon = (type, icon) => {
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
      goal_achieved: Award,
    };
    return icons[type] || Bell;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-blue-500",
      medium: "text-yellow-500",
      high: "text-orange-500",
      urgent: "text-red-500",
    };
    return colors[priority] || "text-gray-500";
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your latest activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <MailCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
          <Button variant="outline" onClick={deleteReadNotifications}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="collection_scheduled">Scheduled</SelectItem>
                <SelectItem value="collection_completed">Completed</SelectItem>
                <SelectItem value="bin_reported">Reported</SelectItem>
                <SelectItem value="reward_earned">Rewards</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isRead}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, isRead: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="false">Unread</SelectItem>
                <SelectItem value="true">Read</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Notifications</h3>
              <p className="text-muted-foreground">
                You don't have any notifications at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(
              notification.type,
              notification.icon
            );
            return (
              <Card
                key={notification._id}
                className={`transition-colors ${
                  !notification.isRead ? "bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full ${
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
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={notification.isRead ? "outline" : "default"}
                          >
                            {notification.isRead ? "Read" : "New"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(notification.priority)}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(notification.createdAt), "PPp")}
                          </span>
                        </div>
                        {notification.action && (
                          <Button variant="link" asChild>
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
      </div>

      {/* Load More Button */}
      {notifications.length < totalNotifications && !loading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;