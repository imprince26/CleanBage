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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  FileText,
  Search,
  Calendar,
  Clock,
  MapPin,
  ArrowUpDown,
  Loader2,
  BarChart3,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const CollectorReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "collectionDate",
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

      const response = await fetch(`/api/reports/collector?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data);
        setTotalReports(data.total);
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
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE);

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collection Reports</h1>
          <p className="text-muted-foreground">
            View and manage your collection reports
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Found {totalReports} reports matching your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Reports Found</h3>
              <p className="text-muted-foreground">
                No reports match your current filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("collectionDate")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Bin Details</TableHead>
                  <TableHead>Waste Details</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            {format(new Date(report.collectionDate), "dd MMM yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(report.startTime), "hh:mm a")}
                          </span>
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
                          <span className="text-sm text-muted-foreground">Volume:</span>
                          <span>{report.wasteVolume} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Fill Level:</span>
                          <div className="flex items-center gap-2 flex-1">
                            <Progress
                              value={report.fillLevelAfter}
                              className="h-2"
                            />
                            <span className="text-sm">{report.fillLevelAfter}%</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge {...getStatusBadge(report.status)}>
                        {getStatusBadge(report.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
          )}

          {/* Pagination */}
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

              <div className="grid gap-6">
                {/* Collection Info */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Collection Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedReport.collectionDate), "PPp")}
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

                {/* Waste Details */}
                <div className="space-y-4">
                  <h4 className="font-medium">Waste Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Fill Levels</p>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Before:</span>
                          <div className="flex items-center gap-2 flex-1 ml-2">
                            <Progress
                              value={selectedReport.fillLevelBefore}
                              className="h-2"
                            />
                            <span>{selectedReport.fillLevelBefore}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">After:</span>
                          <div className="flex items-center gap-2 flex-1 ml-2">
                            <Progress
                              value={selectedReport.fillLevelAfter}
                              className="h-2"
                            />
                            <span>{selectedReport.fillLevelAfter}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Waste Categories</p>
                      <div className="space-y-1">
                        {Object.entries(selectedReport.wasteCategories || {}).map(
                          ([category, amount]) => (
                            <div
                              key={category}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm capitalize">
                                {category}:
                              </span>
                              <span>{amount} kg</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedReport.issues || selectedReport.maintenanceNeeded) && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Additional Information</h4>
                    {selectedReport.issues && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Issues</p>
                        <p className="text-sm">{selectedReport.issues}</p>
                      </div>
                    )}
                    {selectedReport.maintenanceNeeded && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Maintenance Required
                        </p>
                        <p className="text-sm">
                          {selectedReport.maintenanceDetails}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Photos */}
                {selectedReport.photos?.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Collection Photos</h4>
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
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectorReports;