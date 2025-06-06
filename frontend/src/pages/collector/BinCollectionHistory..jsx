import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Trash2,
  Scale,
  ThermometerSun,
  Wind,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const ITEMS_PER_PAGE = 10;

export default function BinCollectionHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    search: "",
    binId: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "collectedAt",
    direction: "desc",
  });

  useEffect(() => {
    fetchHistory();
  }, [currentPage, filters, sortConfig]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: `${sortConfig.key}:${sortConfig.direction}`,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
        ...(filters.binId && { binId: filters.binId }),
      });

      const response = await api.get(`/collector/bins-history?${queryParams}`);

      if (response.data.success) {
        setHistory(response.data.data);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load collection history");
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

  const clearFilters = () => {
    setFilters({
      status: "all",
      startDate: "",
      endDate: "",
      search: "",
      binId: "",
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: {
        variant: "success",
        label: "Completed",
        icon: CheckCircle2,
      },
      skipped: {
        variant: "destructive",
        label: "Skipped",
        icon: XCircle,
      },
      delayed: {
        variant: "warning",
        label: "Delayed",
        icon: AlertTriangle,
      },
    };
    return variants[status] || { variant: "secondary", label: status, icon: FileText };
  };

  const formatAddress = (location) => {
    if (!location?.address) return "No address available";
    const { street, area, landmark, city } = location.address;
    return [street, area, landmark, city].filter(Boolean).join(", ");
  };

  // Stats summary calculation
  const stats = useMemo(() => {
    return [
      {
        label: "Total Collections",
        value: totalItems,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        label: "Completed",
        value: history.filter((record) => record.status === "completed").length,
        color: "text-green-500",
        bgColor: "bg-green-50",
      },
      {
        label: "Skipped",
        value: history.filter((record) => record.status === "skipped").length,
        color: "text-red-500",
        bgColor: "bg-red-50",
      },
      {
        label: "Delayed",
        value: history.filter((record) => record.status === "delayed").length,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      },
    ];
  }, [history, totalItems]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collection History</h1>
          <p className="text-muted-foreground">
            View and track your bin collection history
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Filter className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search through collection history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Input
                placeholder="Search bins..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            <div>
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
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mt-4"
            size="sm"
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Records</CardTitle>
          <CardDescription>
            Showing {history.length} of {totalItems} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Records Found</h3>
              <p className="text-muted-foreground">
                No collection records match your current filters
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("collectedAt")}
                    >
                      <div className="flex items-center gap-2">
                        Collection Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Bin Details</TableHead>
                    <TableHead>Collection Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(record.collectionDate), "PPp")}
                            </span>
                          </div>
                          {record.completionTime && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{record.completionTime} mins</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">#{record.bin.binId}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate max-w-[200px]">
                              {formatAddress(record.bin.location)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span>{record.wasteVolume.toFixed(1)} kg</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Fill Level:
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={record.fillLevelAfter}
                                  className="w-20 h-2"
                                />
                                <span className="text-sm">
                                  {record.fillLevelAfter}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const { variant, label, icon: Icon } = getStatusBadge(
                            record.status
                          );
                          return (
                            <Badge variant={variant} className="flex w-fit items-center gap-1">
                              <Icon className="h-4 w-4" />
                              {label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
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

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle>Collection Details</DialogTitle>
                <DialogDescription>
                  Bin #{selectedRecord.bin.binId} -{" "}
                  {format(new Date(selectedRecord.collectedAt), "PPP")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                {/* Collection Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Collection Information</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      {(() => {
                        const { variant, label, icon: Icon } = getStatusBadge(
                          selectedRecord.status
                        );
                        return (
                          <Badge
                            variant={variant}
                            className="flex w-fit items-center gap-1"
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{formatAddress(selectedRecord.bin.location)}</span>
                      </div>
                    </div>
                    {selectedRecord.completionTime && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Time Taken</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedRecord.completionTime} minutes</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Waste Details</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Volume</p>
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRecord.wasteVolume.toFixed(1)} kg</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fill Levels</p>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Before:</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={selectedRecord.fillLevelBefore}
                              className="w-24 h-2"
                            />
                            <span className="text-sm">
                              {selectedRecord.fillLevelBefore}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">After:</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={selectedRecord.fillLevelAfter}
                              className="w-24 h-2"
                            />
                            <span className="text-sm">
                              {selectedRecord.fillLevelAfter}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedRecord.issues ||
                  selectedRecord.maintenanceNeeded ||
                  selectedRecord.notes ||
                  selectedRecord.weather?.condition) && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Additional Details</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedRecord.weather?.condition && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Weather</p>
                            <div className="flex items-center gap-2">
                              <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">
                                {selectedRecord.weather.condition}
                                {selectedRecord.weather.temperature &&
                                  ` (${selectedRecord.weather.temperature}°C)`}
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedRecord.notes && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="text-sm">{selectedRecord.notes}</p>
                          </div>
                        )}
                        {selectedRecord.issues && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Issues</p>
                            <p className="text-sm">{selectedRecord.issues}</p>
                          </div>
                        )}
                        {selectedRecord.maintenanceNeeded && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Maintenance Details
                            </p>
                            <p className="text-sm">
                              {selectedRecord.maintenanceDetails ||
                                "Maintenance required"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Photos */}
                {(selectedRecord.photos?.before?.url ||
                  selectedRecord.photos?.after?.url) && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Collection Photos</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedRecord.photos.before?.url && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Before</p>
                            <img
                              src={selectedRecord.photos.before.url}
                              alt="Before collection"
                              className="rounded-lg object-cover aspect-square w-full"
                            />
                          </div>
                        )}
                        {selectedRecord.photos.after?.url && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">After</p>
                            <img
                              src={selectedRecord.photos.after.url}
                              alt="After collection"
                              className="rounded-lg object-cover aspect-square w-full"
                            />
                          </div>
                        )}
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
}