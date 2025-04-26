import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Route as RoutePath,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Truck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const CollectorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [upcomingCollections, setUpcomingCollections] = useState([]);
  const [timeframe, setTimeframe] = useState("today");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, routesRes, collectionsRes] = await Promise.all([
          fetch("/api/collector/stats?timeframe=" + timeframe),
          fetch("/api/collector/routes/active"),
          fetch("/api/collector/collections/upcoming"),
        ]);

        const [statsData, routesData, collectionsData] = await Promise.all([
          statsRes.json(),
          routesRes.json(),
          collectionsRes.json(),
        ]);

        setStats(statsData.data);
        setActiveRoutes(routesData.data);
        setUpcomingCollections(collectionsData.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  const statCards = [
    {
      title: "Collections Today",
      value: stats?.collectionsToday || 0,
      change: stats?.collectionsChange,
      icon: Truck,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      change: stats?.completionRateChange,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Average Time",
      value: `${stats?.averageTime || 0}min`,
      change: stats?.timeChange,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Route Efficiency",
      value: `${stats?.efficiency || 0}%`,
      change: stats?.efficiencyChange,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

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
          <h1 className="text-3xl font-bold">Collector Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's your collection overview.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/collector/routes">
              <RoutePath className="mr-2 h-4 w-4" />
              View Routes
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  {stat.change && (
                    <p
                      className={`text-xs ${
                        stat.change > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.change > 0 ? "+" : ""}
                      {stat.change}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Routes and Collections Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Routes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Routes</CardTitle>
                <CardDescription>Your assigned collection routes</CardDescription>
              </div>
              <RoutePath className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {activeRoutes.length === 0 ? (
              <p className="text-muted-foreground">No active routes found.</p>
            ) : (
              <div className="space-y-4">
                {activeRoutes.map((route) => (
                  <div
                    key={route._id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {route.bins.length} bins • {route.status}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/collector/routes/${route._id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Collections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Collections</CardTitle>
                <CardDescription>
                  Scheduled collections for today
                </CardDescription>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {upcomingCollections.length === 0 ? (
              <p className="text-muted-foreground">
                No upcoming collections found.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingCollections.map((collection) => (
                  <div
                    key={collection._id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          collection.priority === "high"
                            ? "bg-red-50 dark:bg-red-900/20"
                            : "bg-primary/10"
                        }`}
                      >
                        <Trash2
                          className={`h-4 w-4 ${
                            collection.priority === "high"
                              ? "text-red-500"
                              : "text-primary"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">Bin #{collection.binId}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(
                              new Date(collection.scheduledTime),
                              "h:mm a"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {collection.priority === "high" && (
                        <Badge variant="destructive">Priority</Badge>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/collector/bins/${collection._id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Your collection performance statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Route Completion</span>
                <span className="font-medium">
                  {stats?.completedRoutes || 0}/{stats?.totalRoutes || 0} routes
                </span>
              </div>
              <Progress
                value={
                  ((stats?.completedRoutes || 0) / (stats?.totalRoutes || 1)) *
                  100
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collection Accuracy</span>
                <span className="font-medium">
                  {stats?.accuracy || 0}% accurate
                </span>
              </div>
              <Progress value={stats?.accuracy || 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Efficiency</span>
                <span className="font-medium">
                  {stats?.timeEfficiency || 0}% efficient
                </span>
              </div>
              <Progress value={stats?.timeEfficiency || 0} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectorDashboard;