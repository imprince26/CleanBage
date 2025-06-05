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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Search,
  Calendar,
  Clock,
  MapPin,
  ArrowUpDown,
  Loader2,
  ChevronRight,
  Trash2,
  Scale,
  ThermometerSun,
  Wind,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  ChevronLeft,
  BarChart3,
  ImageIcon,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import { Separator } from "@/components/ui/separator";

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
      const dateParams = {};
      if (filters.startDate) {
        dateParams.startDate = new Date(filters.startDate).toISOString();
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateParams.endDate = endDate.toISOString();
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: `${sortConfig.key}:${sortConfig.direction}`,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...dateParams,
      });

      const response = await api.get(`/reports/collector?${queryParams}`);

      if (response.data.success) {
        setReports(response.data.reports);
        setTotalReports(response.data.totalCount);
      } else {
        throw new Error(response.data.message || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(error.message || "Failed to load reports");
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

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: { variant: "success", label: "Completed", icon: CheckCircle2 },
      delayed: { variant: "warning", label: "Delayed", icon: AlertTriangle },
      skipped: { variant: "destructive", label: "Skipped", icon: XCircle },
    };
    return variants[status] || { variant: "secondary", label: status, icon: Activity };
  };

  const formatAddress = (location) => {
    if (!location?.address) return "No address available";
    const { street, area, landmark, city } = location.address;
    return [street, area, landmark, city].filter(Boolean).join(", ");
  };

  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collection Reports</h1>
          <p className="text-muted-foreground">
            View and manage your waste collection reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button asChild>
            <Link to="/collector/reports/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>
            Filter and search through your collection reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Search Reports
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by bin ID or location..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-[200px]">
                <label className="text-sm font-medium mb-2 block">Status</label>
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
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Collection Reports</CardTitle>
              <CardDescription>
                Found {totalReports} reports matching your criteria
              </CardDescription>
            </div>
          </div>
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
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("collectionDate")}
                    >
                      <div className="flex items-center gap-2">
                        Collection Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Bin Details</TableHead>
                    <TableHead>Waste Details</TableHead>
                    <TableHead>Weather</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => {
                    const StatusIcon = getStatusBadge(report.status).icon;
                    return (
                      <TableRow key={report._id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(new Date(report.collectionDate), "PPP")}
                              </span>
                            </div>
                            {report.startTime && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(new Date(report.startTime), "p")}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">#{report.bin.binId}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate max-w-[200px]">
                                {formatAddress(report.bin.location)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Scale className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {report.wasteVolume.toFixed(1)} kg total
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Fill Level:
                                </span>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={report.fillLevelAfter}
                                    className="w-20 h-2"
                                  />
                                  <span className="text-sm">
                                    {report.fillLevelAfter}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.weather?.condition && (
                            <div className="flex items-center gap-2">
                              <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">
                                {report.weather.condition}
                                {report.weather.temperature &&
                                  ` (${report.weather.temperature}°C)`}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadge(report.status).variant}
                            className="flex w-fit items-center gap-1"
                          >
                            <StatusIcon className="h-4 w-4" />
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
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
                <DialogTitle>Collection Report Details</DialogTitle>
                <DialogDescription>
                  Bin #{selectedReport.bin.binId} -{" "}
                  {format(new Date(selectedReport.collectionDate), "PPP")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="waste">Waste Info</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Collection Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge
                              variant={getStatusBadge(selectedReport.status).variant}
                              className="flex w-fit items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {getStatusBadge(selectedReport.status).label}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Collection Time
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {format(
                                    new Date(selectedReport.collectionDate),
                                    "PPP"
                                  )}
                                </span>
                              </div>
                              {selectedReport.startTime && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Started at{" "}
                                    {format(
                                      new Date(selectedReport.startTime),
                                      "p"
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedReport.completionTime && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Completion Time
                              </p>
                              <p>{selectedReport.completionTime} minutes</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Location Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p>{formatAddress(selectedReport.bin.location)}</p>
                          </div>
                          {selectedReport.weather && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Weather Conditions
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                                  <span className="capitalize">
                                    {selectedReport.weather.condition}
                                  </span>
                                </div>
                                {selectedReport.weather.temperature && (
                                  <div className="flex items-center gap-2">
                                    <Wind className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {selectedReport.weather.temperature}°C
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {(selectedReport.issues ||
                      selectedReport.maintenanceNeeded) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Issues & Maintenance
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {selectedReport.issues && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Reported Issues
                                </p>
                                <p className="bg-muted p-3 rounded-lg">
                                  {selectedReport.issues}
                                </p>
                              </div>
                            )}
                            {selectedReport.maintenanceNeeded && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Maintenance Details
                                </p>
                                <p className="bg-muted p-3 rounded-lg">
                                  {selectedReport.maintenanceDetails ||
                                    "No specific details provided"}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                  </TabsContent>

                  <TabsContent value="waste" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Waste Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Fill Levels
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span>Before Collection:</span>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={selectedReport.fillLevelBefore}
                                      className="w-24 h-2"
                                    />
                                    <span>{selectedReport.fillLevelBefore}%</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>After Collection:</span>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={selectedReport.fillLevelAfter}
                                      className="w-24 h-2"
                                    />
                                    <span>{selectedReport.fillLevelAfter}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Total Waste Volume
                              </p>
                              <div className="text-2xl font-bold">
                                {selectedReport.wasteVolume.toFixed(1)} kg
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Waste Categories
                            </p>
                            <div className="space-y-3">
                              {Object.entries(
                                selectedReport.wasteCategories
                              ).map(([category, amount]) => (
                                <div
                                  key={category}
                                  className="flex justify-between items-center"
                                >
                                  <span className="capitalize">{category}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={(amount / selectedReport.wasteVolume) * 100}
                                      className="w-24 h-2"
                                    />
                                    <span>{amount.toFixed(1)} kg</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="photos">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Collection Photos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedReport.photos &&
                          (selectedReport.photos.before?.url ||
                            selectedReport.photos.after?.url) ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {selectedReport.photos.before?.url && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Before Collection
                                </p>
                                <img
                                  src={selectedReport.photos.before.url}
                                  alt="Before collection"
                                  className="rounded-lg object-cover w-full aspect-square"
                                />
                              </div>
                            )}
                            {selectedReport.photos.after?.url && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  After Collection
                                </p>
                                <img
                                  src={selectedReport.photos.after.url}
                                  alt="After collection"
                                  className="rounded-lg object-cover w-full aspect-square"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No photos available for this collection
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
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