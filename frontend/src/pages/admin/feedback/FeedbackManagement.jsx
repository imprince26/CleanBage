import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Star,
  Building2,
  Users,
  AlertTriangle,
  Lightbulb,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import { useNavigate } from "react-router-dom";

const FEEDBACK_TYPES = [
  { value: "all", label: "All Types" },
  { value: "service", label: "Service", icon: Building2 },
  { value: "app", label: "App", icon: MessageSquare },
  { value: "collector", label: "Collector", icon: Users },
  { value: "bin", label: "Bin", icon: AlertTriangle },
  { value: "suggestion", label: "Suggestion", icon: Lightbulb },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "addressed", label: "Addressed" },
  { value: "archived", label: "Archived" },
];

const FeedbackManagement = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [sort, setSort] = useState({
    field: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [filters, sort, pagination.page]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        sortBy: `${sort.field}:${sort.direction}`,
      });

      const response = await api.get(`/feedback?${queryParams}`);

      if (response.data.success) {
        setFeedback(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.limit),
        }));
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/feedback/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(
        `/feedback/${selectedFeedback._id}/respond`,
        {
          comment: responseText,
        }
      );

      if (response.data.success) {
        toast.success("Response submitted successfully");
        setSelectedFeedback(null);
        setResponseText("");
        fetchFeedback();
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      reviewed: "default",
      addressed: "success",
      archived: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Feedback Management
          </h1>
          <p className="text-muted-foreground">
            View and manage user feedback and suggestions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Feedback
                  </p>
                  <h3 className="text-2xl font-bold">{stats.totalFeedback}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </p>
                  <h3 className="text-2xl font-bold">{stats.avgRating}/5</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          
<Card>
  <CardContent className="p-6">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
        <Users className="h-6 w-6 text-green-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Response Rate
        </p>
        <h3 className="text-2xl font-bold">
          {(() => {
            const addressed = stats.statusCounts?.addressed || 0;
            const total = stats.totalFeedback || 0;
            return total > 0 ? ((addressed / total) * 100).toFixed(1) : "0.0";
          })()}%
        </h3>
      </div>
    </div>
  </CardContent>
</Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <AlertTriangle className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stats.statusCounts.pending || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon && <type.icon className="h-4 w-4" />}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchFeedback}
              className="h-10 w-10"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback List</CardTitle>
          <CardDescription>
            View and respond to user feedback and suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
              <p className="text-muted-foreground">
                No feedback matches your current filters
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="min-w-[200px] cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Date
                      {sort.field === "createdAt" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        {format(new Date(item.createdAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.user.avatar ? (
                            <img
                              src={item.user.avatar.url}
                              alt={item.user.name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary/10" />
                          )}
                          <span>{item.isAnonymous ? "Anonymous" : item.user.name}</span>
                        </div>
                      </TableCell>
                     
<TableCell>
  <div className="flex items-center gap-2">
    {(() => {
      const feedbackType = FEEDBACK_TYPES.find((t) => t.value === item.type);
      if (feedbackType?.icon) {
        const Icon = feedbackType.icon;
        return <Icon className="h-4 w-4" />;
      }
      return null;
    })()}
    <span>
      {FEEDBACK_TYPES.find((t) => t.value === item.type)?.label || 'Unknown'}
    </span>
  </div>
</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(item.rating)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/feedback/${item._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <Button variant="outline" disabled>
                Page {pagination.page} of {pagination.totalPages}
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Submitted on{" "}
              {selectedFeedback &&
                format(new Date(selectedFeedback.createdAt), "PPpp")}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {selectedFeedback.user.avatar ? (
                    <img
                      src={selectedFeedback.user.avatar.url}
                      alt={selectedFeedback.user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">
                    {selectedFeedback.isAnonymous
                      ? "Anonymous User"
                      : selectedFeedback.user.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(selectedFeedback.rating)}
                    <span className="text-sm text-muted-foreground">
                      ({selectedFeedback.rating}/5)
                    </span>
                  </div>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedFeedback.status)}
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Title
                  </h4>
                  <p className="mt-1">{selectedFeedback.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Feedback
                  </h4>
                  <p className="mt-1">{selectedFeedback.comment}</p>
                </div>
              </div>

              {/* Images if any */}
              {selectedFeedback.images?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Attached Images
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFeedback.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Feedback image ${index + 1}`}
                        className="rounded-lg object-cover aspect-video w-full"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Response Section */}
              {selectedFeedback.status === "pending" ? (
                <div className="space-y-4">
                  <h4 className="font-medium">Respond to Feedback</h4>
                  <Textarea
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFeedback(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleResponse} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Submit Response"
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                selectedFeedback.response && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Admin Response</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p>{selectedFeedback.response.comment}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>Responded by {selectedFeedback.response.respondedBy.name}</span>
                        <span>•</span>
                        <span>
                          {format(
                            new Date(selectedFeedback.response.respondedAt),
                            "PPp"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement;