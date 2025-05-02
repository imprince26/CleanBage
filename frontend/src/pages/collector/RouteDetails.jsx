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
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  Calendar,
  Truck,
  Route as RoutePath,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Navigation,
  Loader2,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchRouteDetails();
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const response = await fetch(`/api/routes/${id}`);
      const data = await response.json();

      if (data.success) {
        setRoute(data.data);
      }
    } catch (error) {
      console.error("Error fetching route details:", error);
      toast.error("Failed to load route details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const response = await fetch(`/api/routes/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        setRoute(data.data);
        toast.success(`Route ${status === "in_progress" ? "started" : "paused"}`);
      }
    } catch (error) {
      console.error("Error updating route status:", error);
      toast.error("Failed to update route status");
    }
    setConfirmDialog({ open: false, action: null, title: "", description: "" });
  };

  const handleBinCollection = async (binId) => {
    try {
      const response = await fetch(`/api/routes/${id}/collect/${binId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setRoute(data.data);
        toast.success("Bin marked as collected");
        fetchRouteDetails();
      }
    } catch (error) {
      console.error("Error marking bin as collected:", error);
      toast.error("Failed to mark bin as collected");
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Button onClick={() => navigate("/collector/routes")}>
              View All Routes
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
        onClick={() => navigate("/collector/routes")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Routes
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Route #{route.routeNumber}</CardTitle>
              <CardDescription>{route.name}</CardDescription>
            </div>
            <Badge
              variant={
                route.status === "completed"
                  ? "success"
                  : route.status === "in_progress"
                    ? "default"
                    : "secondary"
              }
              className="capitalize"
            >
              {route.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <p className="text-sm text-muted-foreground">Estimated Duration</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{route.estimatedTime} mins</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Distance</p>
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
              <Progress value={route.completionRate} />
            </div>
          </div>

          {/* Bins Table */}
          <div className="space-y-4">
            <h3 className="font-semibold">Collection Points</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bin ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>{bin.estimated_time} mins</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/collector/bins/${bin.bin._id}`)
                          }
                        >
                          Details
                        </Button>
                        {!bin.isCollected && route.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => handleBinCollection(bin.bin._id)}
                          >
                            Mark Collected
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${route.startLocation.coordinates[1]},${route.startLocation.coordinates[0]}&destination=${route.endLocation.coordinates[1]},${route.endLocation.coordinates[0]}&waypoints=${route.waypoints
                  .map((wp) => `${wp.location.coordinates[1]},${wp.location.coordinates[0]}`)
                  .join("|")}&travelmode=driving`
              )
            }
          >
            <Navigation className="mr-2 h-4 w-4" />
            Open in Maps
          </Button>
          {route.status !== "completed" && (
            <Button
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  action:
                    route.status === "in_progress" ? "pause" : "start",
                  title: `${route.status === "in_progress" ? "Pause" : "Start"
                    } Route?`,
                  description: `Are you sure you want to ${route.status === "in_progress" ? "pause" : "start"
                    } this route?`,
                })
              }
            >
              {route.status === "in_progress" ? (
                <>
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Pause Route
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Route
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  action: null,
                  title: "",
                  description: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleStatusChange(
                  confirmDialog.action === "start"
                    ? "in_progress"
                    : "paused"
                )
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteDetails;