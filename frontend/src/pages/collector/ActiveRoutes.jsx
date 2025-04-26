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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Route as RoutePath,
  Trash2,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const ActiveRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/collector/routes?status=${filter}`);
        const data = await response.json();
        
        if (data.success) {
          setRoutes(data.data);
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
        toast.error("Failed to load routes");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [filter]);

  const handleStatusChange = async (routeId, status) => {
    try {
      const response = await fetch(`/api/collector/routes/${routeId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        setRoutes(routes.map(route => 
          route._id === routeId ? { ...route, status } : route
        ));
        toast.success(`Route ${status === 'in_progress' ? 'started' : 'paused'} successfully`);
      }
    } catch (error) {
      console.error("Error updating route status:", error);
      toast.error("Failed to update route status");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", label: "Pending" },
      in_progress: { variant: "default", label: "In Progress" },
      paused: { variant: "warning", label: "Paused" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    return variants[status] || variants.pending;
  };

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
          <h1 className="text-3xl font-bold">Active Routes</h1>
          <p className="text-muted-foreground">
            Manage and track your collection routes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter routes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Routes Grid */}
      {routes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RoutePath className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Routes Found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              There are no routes matching your current filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {routes.map((route) => (
            <Card key={route._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Route Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <RoutePath className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {route.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Route #{route.routeNumber}
                            </p>
                          </div>
                          <Badge {...getStatusBadge(route.status)}>
                            {getStatusBadge(route.status).label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Bins</p>
                            <p className="font-medium">{route.bins.length} bins</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Estimated Time
                            </p>
                            <p className="font-medium">
                              {route.estimatedTime} mins
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Priority Bins
                            </p>
                            <p className="font-medium">
                              {route.priorityBins || 0} bins
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Completion
                            </p>
                            <p className="font-medium">
                              {route.completionRate || 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>
                          {route.completedBins || 0}/{route.bins.length} bins
                        </span>
                      </div>
                      <Progress
                        value={
                          ((route.completedBins || 0) / route.bins.length) * 100
                        }
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col justify-end gap-3">
                    {route.status !== "completed" && (
                      <Button
                        variant={
                          route.status === "in_progress" ? "outline" : "default"
                        }
                        onClick={() =>
                          handleStatusChange(
                            route._id,
                            route.status === "in_progress"
                              ? "paused"
                              : "in_progress"
                          )
                        }
                      >
                        {route.status === "in_progress" ? (
                          <>
                            <PauseCircle className="h-4 w-4 mr-2" />
                            Pause Route
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Route
                          </>
                        )}
                      </Button>
                    )}
                    <Button variant="secondary" asChild>
                      <Link to={`/collector/routes/${route._id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveRoutes;