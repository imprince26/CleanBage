import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Trash2,
  Edit,
  Plus,
  Search,
  MapPin,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import api from "@/utils/api";
import { formatAddress } from "@/utils/formatters";

const ITEMS_PER_PAGE = 10;

const BinManagement = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBins, setTotalBins] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBin, setSelectedBin] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    wasteType: "all",
    fillLevel: "all",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "binId",
    direction: "asc",
  });

  useEffect(() => {
    fetchBins();
  }, [currentPage, filters, sortConfig, searchQuery]);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: `${sortConfig.key}:${sortConfig.direction}`,
        search: searchQuery,
        ...filters,
      });

      const response = await api.get(`/admin/bins?${queryParams}`);
      setBins(response.data.data);
      setTotalBins(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch bins");
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

  const handleDelete = async (binId) => {
    try {
      await api.delete(`/collections/${binId}`);
      toast.success("Bin deleted successfully");
      fetchBins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting bin");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getFillLevelColor = (level) => {
    if (level >= 80) return "text-red-500";
    if (level >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: "success", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      maintenance: { variant: "warning", label: "Maintenance" },
      overflow: { variant: "destructive", label: "Overflow" },
    };
    return variants[status] || { variant: "default", label: status };
  };

  const totalPages = Math.ceil(totalBins / ITEMS_PER_PAGE);

  const stats = [
    {
      label: "Total Bins",
      value: totalBins,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Overflowing",
      value: bins.filter((bin) => bin.fillLevel >= 80).length,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      label: "Active",
      value: bins.filter((bin) => bin.status === "active").length,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Maintenance",
      value: bins.filter((bin) => bin.status === "maintenance").length,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bin Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all waste bins in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchBins}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/bins/create">
              <Plus className="h-4 w-4 mr-2" />
              Add New Bin
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="overflow">Overflow</SelectItem>
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
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("binId")}
                  >
                    <div className="flex items-center gap-2">
                      Bin ID
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
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
                  <TableHead>Collector</TableHead>
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
                          <p>{formatAddress(bin.location)}</p>
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
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge {...getStatusBadge(bin.status)}>
                        {getStatusBadge(bin.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bin.assignedCollector ? (
                        bin.assignedCollector.name
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/bins/${bin._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Bin</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete bin #{bin.binId}? This action
                                cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-4 mt-4">
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(bin._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default BinManagement;