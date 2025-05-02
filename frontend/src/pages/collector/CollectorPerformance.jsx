import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  Truck,
  BarChart3,
  Activity,
  CheckCircle2,
  Award,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const CollectorPerformance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("month");
  const [performance, setPerformance] = useState({
    collectionRate: 0,
    avgTime: 0,
    punctuality: 0,
    efficiency: 0,
    completedRoutes: 0,
    totalRoutes: 0,
    collectedBins: 0,
    totalBins: 0,
    priorityCompletionRate: 0,
    recentCollections: [],
    achievements: []
  });

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/collector/performance", {
        params: { timeframe }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch performance data");
      }

      setPerformance(response.data.data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setError(error.message || "Failed to load performance data");
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [timeframe]);

  // ...keep rest of the component code (performanceMetrics array and JSX)...

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Performance Data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPerformanceData}>
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceMetrics = [
    {
      title: "Collection Rate",
      value: `${performance.collectionRate}%`,
      description: "Successfully collected bins",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Average Time",
      value: `${performance.avgTime}min`,
      description: "Per collection",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Punctuality",
      value: `${performance.punctuality}%`,
      description: "On-time collections",
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Efficiency Score",
      value: `${performance.efficiency}%`,
      description: "Overall performance",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
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
          <h1 className="text-3xl font-bold">Performance Overview</h1>
          <p className="text-muted-foreground">
            Track your collection performance and achievements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchPerformanceData}
            className="h-10 w-10"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Collection Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Statistics</CardTitle>
            <CardDescription>Detailed collection performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Route Completion</span>
                <span>
                  {performance.completedRoutes}/{performance.totalRoutes} routes
                </span>
              </div>
              <Progress
                value={(performance.completedRoutes / Math.max(performance.totalRoutes, 1)) * 100}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bin Collection Rate</span>
                <span>
                  {performance.collectedBins}/{performance.totalBins} bins
                </span>
              </div>
              <Progress
                value={(performance.collectedBins / Math.max(performance.totalBins, 1)) * 100}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">High Priority Completion</span>
                <span>{performance.priorityCompletionRate}%</span>
              </div>
              <Progress value={performance.priorityCompletionRate} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest collection records</CardDescription>
          </CardHeader>
          <CardContent>
            {performance.recentCollections.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent collections</p>
              </div>
            ) : (
              <div className="space-y-4">
                {performance.recentCollections.map((collection) => (
                  <div
                    key={collection._id}
                    className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Truck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Bin #{collection.binId}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(collection.collectedAt), "PPp")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={collection.onTime ? "success" : "warning"}
                    >
                      {collection.onTime ? "On Time" : "Delayed"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your collection milestones</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No achievements yet</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <Card key={achievement._id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          achievement.completed
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <Award
                          className={`h-5 w-5 ${
                            achievement.completed
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {achievement.name}
                        </CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {achievement.current}/{achievement.target}
                        </span>
                      </div>
                      <Progress
                        value={(achievement.current / achievement.target) * 100}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
};

export default CollectorPerformance;