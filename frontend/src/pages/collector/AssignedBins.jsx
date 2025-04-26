import { useState, useEffect, useMemo } from "react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  MapPin,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Loader2,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const AssignedBins = () => {
  const [loading, setLoading] = useState(true);
  const [bins, setBins] = useState([]);
  const [totalBins, setTotalBins] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    wasteType: "all",
    fillLevel: "all",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "lastCollected",
    direction: "desc",
  });

  useEffect(() => {
    fetchBins();
  }, [currentPage, filters, sortConfig, searchQuery]);

  const fetchBins = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: `${sortConfig.key}:${sortConfig.direction}`,
        search: searchQuery,
        ...filters,
      });

      const response = await fetch(`/api/collector/bins?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setBins(data.data);
        setTotalBins(data.total);
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
      toast.error("Failed to load assigned bins");
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
      pending: { variant: "secondary", label: "Pending" },
      collected: { variant: "success", label: "Collected" },
      overflow: { variant: "destructive", label: "Overflow" },
      maintenance: { variant: "warning", label: "Maintenance" },
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  const getFillLevelColor = (level) => {
    if (level >= 80) return "text-red-500";
    if (level >= 60) return "text-yellow-500";
    return "text-green-500";
  };

  const totalPages = Math.ceil(totalBins / ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const total = bins.length;
    const overflowing = bins.filter((bin) => bin.fillLevel >= 80).length;
    const needsCollection = bins.filter(
      (bin) => bin.fillLevel >= 60 && bin.fillLevel < 80
    ).length;
    const recentlyCollected = bins.filter(
      (bin) =>
        bin.lastCollected &&
        new Date(bin.lastCollected) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return [
      {
        label: "Total Assigned",
        value: total,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        label: "Overflowing",
        value: overflowing,
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      },
      {
        label: "Needs Collection",
        value: needsCollection,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      {
        label: "Collected Today",
        value: recentlyCollected,
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
    ];
  }, [bins]);

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assigned Bins</h1>
          <p className="text-muted-foreground">
            Manage and monitor your assigned waste bins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchBins}>
            <Loader2 className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/collector/bin-map">
              <MapPin className="mr-2 h-4 w-4" />
              View Map
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <BarChart3 className={`h-6 w-6 ${stat.color}`} />
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

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search bins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="overflow">Overflow</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.wasteType}
              onValueChange={(value) => handleFilterChange("wasteType", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="recyclable">Recyclable</SelectItem>
                <SelectItem value="hazardous">Hazardous</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.fillLevel}
              onValueChange={(value) => handleFilterChange("fillLevel", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by fill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="overflow">Overflow (≥80%)</SelectItem>
                <SelectItem value="high">High (60-79%)</SelectItem>
                <SelectItem value="medium">Medium (40-59%)</SelectItem>
                <SelectItem value="low">Low (≤39%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bins</CardTitle>
          <CardDescription>
            Found {totalBins} bins matching your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bins.length === 0 ? (
            <div className="text-center py-8">
              <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Bins Found</h3>
              <p className="text-muted-foreground">
                No bins match your current filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bin ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("fillLevel")}
                  >
                    <div className="flex items-center gap-2">
                      Fill Level
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("lastCollected")}
                  >
                    <div className="flex items-center gap-2">
                      Last Collected
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bins.map((bin) => (
                  <TableRow key={bin._id}>
                    <TableCell className="font-medium">#{bin.binId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p>{bin.location.address.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {bin.location.address.area}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {bin.wasteType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className={`font-medium ${getFillLevelColor(bin.fillLevel)}`}>
                          {bin.fillLevel}%
                        </p>
                        <Progress
                          value={bin.fillLevel}
                          className="h-2"
                          indicatorClassName={getFillLevelColor(bin.fillLevel)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge {...getStatusBadge(bin.status)}>
                        {getStatusBadge(bin.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bin.lastCollected ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(bin.lastCollected), "dd MMM yyyy")}
                          </span>
                        </div>
                      ) : (
                        "Never"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/collector/bins/${bin._id}/history`}>
                            History
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link to={`/collector/bins/${bin._id}`}>
                            Details
                          </Link>
                        </Button>
                      </div>
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
    </div>
  );
};

export default AssignedBins;