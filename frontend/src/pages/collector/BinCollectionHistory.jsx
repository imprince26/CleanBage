import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import { formatAddress } from "@/utils/formatters";

const BinCollectionHistory = () => {
  const { id : binId} = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bin, setBin] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBinHistory();
  }, [binId, dateFilter, statusFilter]);

  const fetchBinHistory = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...(dateFilter.from && { from: dateFilter.from }),
        ...(dateFilter.to && { to: dateFilter.to }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const [binResponse, historyResponse] = await Promise.all([
        api.get(`/collector/bins/${binId}`),
        api.get(`/collector/bins/${binId}/history?${queryParams}`),
      ]);

      const [binData, historyData] = await Promise.all([
        binResponse.data,
        historyResponse.data,
      ]);

      if (binData.success && historyData.success) {
        setBin(binData.data);
        setHistory(historyData.data);
      }
    } catch (error) {
      console.error("Error fetching bin history:", error);
      toast.error("Failed to load bin history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      collected: { variant: "success", label: "Collected" },
      skipped: { variant: "destructive", label: "Skipped" },
      delayed: { variant: "warning", label: "Delayed" },
      scheduled: { variant: "secondary", label: "Scheduled" },
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bin) {
    return (
      <div className="container py-8">
        <Card className="text-center py-8">
          <CardContent>
            <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Bin Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The waste bin you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/collector/bins")}>
              View All Bins
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header Card */}
      <Card>
      <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bin #{bin.binId} History</CardTitle>
              <CardDescription>View collection history and details</CardDescription>
            </div>
            <Badge
              variant={bin.status === "active" ? "success" : "secondary"}
              className="capitalize"
            >
              {bin.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bin Info */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Location</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{formatAddress(bin.location)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Collection</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {bin.lastCollected
                    ? format(new Date(bin.lastCollected), "PPp")
                    : "Never"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Fill Level</p>
              <Progress value={bin.fillLevel} className="h-2" />
              <p className="text-sm font-medium">{bin.fillLevel}%</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <p className="text-sm font-medium">Date Range</p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) =>
                    setDateFilter((prev) => ({ ...prev, from: e.target.value }))
                  }
                />
                <Input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) =>
                    setDateFilter((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* History Table */}
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Collection History</h3>
              <p className="text-muted-foreground">
                No collection records found for the selected filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Fill Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {record.collectedAt ? 
                        format(new Date(record.collectedAt), "PPp") : 
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={record.fillLevel}
                          className="w-20 h-2"
                        />
                        <span className="text-sm">{record.fillLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge {...getStatusBadge(record.status)}>
                        {getStatusBadge(record.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.collector?.name || "N/A"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.notes || "No notes"}
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
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Collection Details</DialogTitle>
            <DialogDescription>
              {selectedRecord &&
                format(parseISO(selectedRecord.collectedAt), "PPpp")}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fill Level</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedRecord.fillLevel} className="flex-1" />
                    <span>{selectedRecord.fillLevel}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge {...getStatusBadge(selectedRecord.status)}>
                    {getStatusBadge(selectedRecord.status).label}
                  </Badge>
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedRecord.notes}</p>
                </div>
              )}

              {selectedRecord.images?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRecord.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Collection ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BinCollectionHistory;