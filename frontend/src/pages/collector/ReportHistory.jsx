import { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Calendar,
    Clock,
    FileText,
    MapPin,
    ArrowUpDown,
    Loader2,
    Filter,
    CheckCircle2,
    Scale,
    ThermometerSun,
    Wind,
    Truck,
    Image,
    X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const ITEMS_PER_PAGE = 10;

const ReportHistory = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Removed search from filters
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    binId: "",
    location: "",
  });
  const [filterErrors, setFilterErrors] = useState({ dates: "" });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Format location object for display
  const formatAddress = (location) => {
    if (!location) return "No address available";
    const { street, area, landmark, city, postalCode } = location;
    return [street, area, landmark, city, postalCode].filter(Boolean).join(", ");
  };

  // Fetch reports using filters, sort and pagination
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      if (sortConfig.key) {
        queryParams.append("sort", `${sortConfig.key}:${sortConfig.direction}`);
      }
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.startDate) {
        queryParams.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append("endDate", filters.endDate);
      }

      const response = await api.get(`/reports/history?${queryParams}`);
      if (response.data.success) {
        setReports(response.data.data);
        setTotalReports(response.data.total);
      } else {
        throw new Error(response.data.message || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, sortConfig]);

  // Sort handler toggle between asc and desc
  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // When filters change, validate date range and update filters state
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === "startDate" || key === "endDate") {
        const start = key === "startDate" ? value : prev.startDate;
        const end = key === "endDate" ? value : prev.endDate;
        if (start && end && new Date(start) > new Date(end)) {
          setFilterErrors((prevErr) => ({
            ...prevErr,
            dates: "Start date cannot be after end date",
          }));
          return prev;
        } else {
          setFilterErrors((prevErr) => ({ ...prevErr, dates: "" }));
        }
      }
      setCurrentPage(1);
      return newFilters;
    });
  }, []);

  // Clear all filters and reset page
  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "all",
      startDate: "",
      endDate: "",
      binId: "",
      location: "",
    });
    setFilterErrors({});
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Render report photos section
  const renderReportPhotos = (report) => {
    if (!report.photoBefore && !report.photoAfter) return null;
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Collection Photos</h4>
        <div className="grid grid-cols-2 gap-4">
          {report.photoBefore && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Before</p>
              <img
                src={report.photoBefore.url}
                alt="Before collection"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}
          {report.photoAfter && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">After</p>
              <img
                src={report.photoAfter.url}
                alt="After collection"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get badge settings based on report status
  const getStatusBadge = (status) => {
    const variants = {
      completed: { variant: "success", label: "Completed" },
      delayed: { variant: "warning", label: "Delayed" },
      skipped: { variant: "destructive", label: "Skipped" },
      pending: { variant: "secondary", label: "Pending" },
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 px-4 md:px-8 lg:px-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Report History</h1>
          <p className="text-muted-foreground">
            View and track your collection reports
          </p>
        </div>
      </div>
      {/* Filters Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Refine your report history</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            Clear Filters
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* From Date Filter */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                max={filters.endDate || undefined}
              />
              {filterErrors.dates && filters.startDate && (
                <p className="text-xs text-destructive mt-1">{filterErrors.dates}</p>
              )}
            </div>
            {/* To Date Filter */}
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                min={filters.startDate || undefined}
              />
            </div>
            {/* (Other filters such as binId or location may be added here as needed) */}
          </div>
          {/* Display active filters */}
          {(filters.status !== "all" ||
            filters.startDate ||
            filters.endDate) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.status !== "all" && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("status", "all")}
                >
                  Status: {filters.status}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
              {filters.startDate && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("startDate", "")}
                >
                  From: {format(new Date(filters.startDate), "PP")}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
              {filters.endDate && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("endDate", "")}
                >
                  To: {format(new Date(filters.endDate), "PP")}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Reports</CardTitle>
          <CardDescription>
            Found {totalReports} reports matching your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Reports Found</h3>
              <p className="text-muted-foreground">
                No reports match your current filters
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-2">
                        Date &amp; Time
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Bin Details</TableHead>
                    <TableHead>Collection Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(report.createdAt), "PPp")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{report.completionTime || 0} mins</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">Bin #{report.bin?.binId}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{formatAddress(report.bin?.location)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {report.wasteVolume} {report.wasteMeasurementUnit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={report.fillLevelAfter} className="w-20" />
                            <span className="text-sm">{report.fillLevelAfter}% after</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(report.status).variant}>
                          {getStatusBadge(report.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {/* Report Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>
                  Collection report for Bin #{selectedReport.bin?.binId}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Collection Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedReport.createdAt), "PPp")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {selectedReport.completionTime || 0} minutes
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadge(selectedReport.status).variant}>
                      {getStatusBadge(selectedReport.status).label}
                    </Badge>
                  </div>
                </div>
                {/* Collection Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Location</h4>
                    <p className="text-sm">{formatAddress(selectedReport.bin?.location)}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Waste Details</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Total Volume:</span>
                        <span>
                          {selectedReport.wasteVolume} {selectedReport.wasteMeasurementUnit}
                        </span>
                      </div>
                      {selectedReport.wasteCategories && (
                        <>
                          {Object.entries(selectedReport.wasteCategories).map(
                            ([category, amount]) =>
                              amount > 0 && (
                                <div
                                  key={category}
                                  className="flex justify-between items-center text-sm text-muted-foreground"
                                >
                                  <span className="capitalize">{category}:</span>
                                  <span>
                                    {amount} {selectedReport.wasteMeasurementUnit}
                                  </span>
                                </div>
                              )
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {/* Additional Info */}
                {(selectedReport.issues ||
                  selectedReport.maintenanceNeeded ||
                  selectedReport.weather) && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Additional Information</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {selectedReport.weather && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">
                              {selectedReport.weather.condition}
                            </span>
                          </div>
                          {selectedReport.weather.temperature && (
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedReport.weather.temperature}°C</span>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedReport.issues && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Issues</p>
                          <p className="text-sm">{selectedReport.issues}</p>
                        </div>
                      )}
                      {selectedReport.maintenanceNeeded && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Maintenance Required
                          </p>
                          <p className="text-sm">
                            {selectedReport.maintenanceDetails}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Photos */}
                {renderReportPhotos(selectedReport)}
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link to={`/collector/bins/${selectedReport.bin?._id}`}>
                    View Bin Details
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportHistory;