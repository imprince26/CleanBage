import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trash2,
  Edit,
  MapPin,
  Calendar,
  User,
  BarChart3,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/utils/api";
import { formatAddress } from "@/utils/formatters";

const AdminBinDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bin, setBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collectionHistory, setCollectionHistory] = useState([]);

  useEffect(() => {
    fetchBinDetails();
  }, [id]);

  const fetchBinDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/collections/${id}`);
      setBin(data.data);
      
      // Fetch collection history
      const historyResponse = await api.get(`/collections/${id}/history`);
      setCollectionHistory(historyResponse.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching bin details");
      navigate("/admin/bins");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/collections/${id}`);
      toast.success("Bin deleted successfully");
      navigate("/admin/bins");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting bin");
    }
  };

  const getFillLevelColor = (level) => {
    if (level >= 80) return "bg-red-500";
    if (level >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bin Details</h1>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/bins/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Bin</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this bin? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-4 mt-4">
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Details about the waste bin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bin ID</p>
                <p className="font-medium">{bin?.binId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={bin?.status === "active" ? "success" : "warning"}>
                  {bin?.status}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  {formatAddress(bin?.location?.address)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fill Level Card */}
        <Card>
          <CardHeader>
            <CardTitle>Fill Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{bin?.fillLevel}%</span>
            </div>
            <Progress
              value={bin?.fillLevel}
              className={`h-3 ${getFillLevelColor(bin?.fillLevel)}`}
            />
            <p className="text-sm text-center text-muted-foreground">
              Last updated: {format(new Date(bin?.updatedAt), "PPp")}
            </p>
          </CardContent>
        </Card>

        {/* Collection History */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Collection History</CardTitle>
            <CardDescription>Recent collection activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waste Weight</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectionHistory.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {format(new Date(record.collectedAt), "PP")}
                    </TableCell>
                    <TableCell>{record.collector?.name}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "completed" ? "success" : "default"}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.wasteWeight} kg</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {collectionHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No collection history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBinDetails;