import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Loader2,
  Search,
  Filter,
  FileSpreadsheet,
  Calendar,
  ArrowUpDown,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "delayed", label: "Delayed" },
  { value: "skipped", label: "Skipped" },
];

const WASTE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "organic", label: "Organic" },
  { value: "recyclable", label: "Recyclable" },
  { value: "non-recyclable", label: "Non-Recyclable" },
  { value: "hazardous", label: "Hazardous" },
];

// Format address helper function
const formatAddress = (location) => {
  if (!location || !location.address) return "No address available";
  const { street, area, landmark, city, postalCode } = location.address;
  const parts = [street, area, landmark, city, postalCode].filter(Boolean);
  return parts.join(", ");
};

const ReportManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    wasteType: "all",
    search: "",
    dateRange: {
      from: null,
      to: null,
    },
  });
  const [sort, setSort] = useState({
    field: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filters, sort, pagination.page, pagination.totalPages]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.wasteType !== "all" && { wasteType: filters.wasteType }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateRange.from && {
          startDate: filters.dateRange.from.toISOString(),
        }),
        ...(filters.dateRange.to && {
          endDate: filters.dateRange.to.toISOString(),
        }),
        sortBy: `${sort.field}:${sort.direction}`,
      });

      const response = await api.get(`/reports?${queryParams}`);

      if (response.data.success) {
        setReports(response.data.data);
        setPagination({
          page: response.data.page,
          totalPages: response.data.pages,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(error.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/reports/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "success",
      pending: "warning",
      delayed: "destructive",
      skipped: "secondary",
    };

    const icons = {
      completed: <CheckCircle2 className="h-4 w-4 mr-1" />,
      pending: <Clock className="h-4 w-4 mr-1" />,
      delayed: <AlertTriangle className="h-4 w-4 mr-1" />,
      skipped: <XCircle className="h-4 w-4 mr-1" />,
    };

    return (
      <Badge variant={variants[status] || "default"} className="flex items-center">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collection Reports</h1>
          <p className="text-muted-foreground">
            Manage and monitor waste collection reports
          </p>
        </div>
        <Button onClick={() => navigate("/admin/reports/export")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <FileSpreadsheet className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Reports
                  </p>
                  <h3 className="text-2xl font-bold">{stats.totalReports}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stats.completedReports}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Waste
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stats.totalWasteVolume.toFixed(1)} kg
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <ArrowUpDown className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Efficiency
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stats.avgEfficiency}%
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
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Select
              value={filters.wasteType}
              onValueChange={(value) => handleFilterChange("wasteType", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by waste type" />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePickerWithRange
              value={filters.dateRange}
              onChange={(range) => handleFilterChange("dateRange", range)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Reports</CardTitle>
          <CardDescription>
            View and manage waste collection reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Date
                      {sort.field === "createdAt" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Bin ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("wasteVolume")}
                    >
                      Volume
                      {sort.field === "wasteVolume" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        {format(new Date(report.createdAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {report.collector.avatar ? (
                            <img
                              src={report.collector.avatar.url}
                              alt={report.collector.name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary/10" />
                          )}
                          {report.collector.name}
                        </div>
                      </TableCell>
                      <TableCell>#{report.bin.binId}</TableCell>
                      <TableCell 
                        className="max-w-[200px] truncate"
                        title={formatAddress(report.bin.location)}
                      >
                        {formatAddress(report.bin.location)}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {report.wasteVolume} {report.wasteMeasurementUnit}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/reports/${report._id}`)}
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
    </div>
  );
};

export default ReportManagement;