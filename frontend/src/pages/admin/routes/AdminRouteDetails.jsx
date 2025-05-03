import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  Calendar,
  Truck,
  Route as RoutePath,
  ChevronLeft,
  AlertTriangle,
  Edit,
  Trash2,
  ThermometerSun,
  Wind,
  User,
  Box,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const AdminRouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchRouteDetails();
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const response = await api.get(`/routes/${id}`);
      if (response.data.success) {
        setRoute(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch route details");
      navigate("/admin/routes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/routes/${id}`);
      toast.success("Route deleted successfully");
      navigate("/admin/routes");
    } catch (error) {
      toast.error("Failed to delete route");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", label: "Pending" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    return variants[status] || variants.pending;
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container py-8">
        <Card className="text-center py-8">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Route Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The route you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/admin/routes")}>
              View All Routes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate("/admin/routes")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Routes
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${route.startLocation.coordinates[1]},${route.startLocation.coordinates[0]}&destination=${route.endLocation.coordinates[1]},${route.endLocation.coordinates[0]}&waypoints=${route.waypoints?.map((wp) => `${wp.location.coordinates[1]},${wp.location.coordinates[0]}`).join("|")}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="h-4 w-4 mr-2" />
              View on Maps
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/admin/routes/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Route
            </a>
          </Button>
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Route</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this route? This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Route Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Route #{route.routeNumber}</CardTitle>
              <CardDescription>{route.name}</CardDescription>
            </div>
            <Badge {...getStatusBadge(route.status)}>
              {getStatusBadge(route.status).label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Collector Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {route.collector.avatar?.url ? (
                <img
                  src={route.collector.avatar.url}
                  alt={route.collector.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{route.collector.name}</h3>
              <p className="text-sm text-muted-foreground">
                {route.collector.phone}
              </p>
            </div>
          </div>

          {/* Route Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Start Time</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {route.startedAt
                    ? format(new Date(route.startedAt), "hh:mm a")
                    : "Not started"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Est. Duration</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{route.estimatedTime} mins</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Distance</p>
              <div className="flex items-center gap-2">
                <RoutePath className="h-4 w-4 text-primary" />
                <span>{(route.distance / 1000).toFixed(1)} km</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>{route.vehicle || "Not assigned"}</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ThermometerSun className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weather</p>
                    <p className="font-medium capitalize">
                      {route.weatherConditions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Wind className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Traffic</p>
                    <p className="font-medium capitalize">
                      {route.trafficConditions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Progress Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Collection Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {route.bins.filter((bin) => bin.isCollected).length} of{" "}
                  {route.bins.length} bins collected
                </span>
                <span className="font-medium">{route.completionRate}%</span>
              </div>
              <Progress value={route.completionRate} className="h-2" />
            </div>
          </div>

          {/* Bins Table */}
          <div className="space-y-4">
            <h3 className="font-semibold">Collection Points</h3>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bin ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Collection Time</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {route.bins.map((bin) => (
                    <TableRow key={bin.bin._id}>
                      <TableCell className="font-medium">
                        #{bin.bin.binId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{bin.bin.location.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={bin.isCollected ? "success" : "secondary"}
                        >
                          {bin.isCollected ? "Collected" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bin.collectedAt
                          ? format(new Date(bin.collectedAt), "hh:mm a")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{bin.notes || "No notes"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRouteDetails;