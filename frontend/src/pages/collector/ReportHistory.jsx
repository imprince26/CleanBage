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
  Search,
  MapPin,
  ArrowUpDown,
  Loader2,
  Filter,
  CheckCircle2,
  Scale,
  ThermometerSun,
  Wind,
  Truck,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const ReportHistory = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    binId: "",
    search: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    fetchReports();
  }, [currentPage, filters, sortConfig]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: `${sortConfig.key}:${sortConfig.direction}`,
        ...filters,
      });

      const response = await fetch(`/api/reports/history?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data);
        setTotalReports(data.total);
      } else {
        throw new Error(data.message || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

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
    <div className="container py-8 space-y-8">
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
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Date Range Filters */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by bin ID or location..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
          </div>
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
                        Date & Time
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
                            <span>
                              {format(new Date(report.createdAt), "PPp")}
                            </span>
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
                            <span>{report.bin?.location?.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span>{report.wasteVolume} kg collected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={report.fillLevelAfter} className="w-20" />
                            <span className="text-sm">{report.fillLevelAfter}% after</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge {...getStatusBadge(report.status)}>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      />
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
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      />
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
                    <Badge {...getStatusBadge(selectedReport.status)}>
                      {getStatusBadge(selectedReport.status).label}
                    </Badge>
                  </div>
                </div>

                {/* Collection Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Fill Levels</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Before:</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={selectedReport.fillLevelBefore} />
                          <span>{selectedReport.fillLevelBefore}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>After:</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={selectedReport.fillLevelAfter} />
                          <span>{selectedReport.fillLevelAfter}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Waste Details</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Total Volume:</span>
                        <span>{selectedReport.wasteVolume} kg</span>
                      </div>
                      {selectedReport.wasteCategories && (
                        <>
                          {Object.entries(selectedReport.wasteCategories).map(
                            ([category, amount]) => (
                              <div
                                key={category}
                                className="flex justify-between items-center text-sm text-muted-foreground"
                              >
                                <span className="capitalize">{category}:</span>
                                <span>{amount} kg</span>
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
                {selectedReport.photos?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Collection Photos</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedReport.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo.url}
                          alt={`Collection ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
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