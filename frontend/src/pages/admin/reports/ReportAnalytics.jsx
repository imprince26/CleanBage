import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Loader2,
  RefreshCcw,
  TrendingUp,
  Scale,
  MapPin,
  UserCheck,
  CalendarRange,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const TIME_PERIODS = {
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
};

const initialStats = {
  totalReports: 0,
  completedReports: 0,
  totalWasteVolume: 0,
  avgEfficiency: 0,
  wasteCategories: {
    organic: 0,
    recyclable: 0,
    nonRecyclable: 0,
    hazardous: 0,
  },
  topCollectors: [],
  reportsOverTime: [],
};

const ReportAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("month");
  const [stats, setStats] = useState(initialStats);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, collectorsResponse] = await Promise.all([
        api.get("/reports/stats", {
          params: { timeframe },
        }),
        api.get("/reports/top-collectors", {
          params: { timeframe, limit: 10 },
        }),
      ]);

      if (!statsResponse.data.success || !collectorsResponse.data.success) {
        throw new Error("Failed to fetch analytics data");
      }

      setStats({
        ...statsResponse.data.data,
        topCollectors: (collectorsResponse.data.data || []).map(collector => ({
          ...collector,
          efficiency: collector.totalCollections > 0 
            ? Math.round((collector.completedCollections / collector.totalCollections) * 100)
            : 0,
        })),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error.message || "Failed to load analytics data");
      toast.error(error.response?.data?.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const prepareTimelineData = () => {
    if (!stats.reportsOverTime || !Array.isArray(stats.reportsOverTime)) {
      // Return sample data for empty state
      return Array.from({ length: 7 }).map((_, i) => ({
        date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), "MMM dd"),
        total: 0,
        completed: 0
      })).reverse();
    }
    
    return stats.reportsOverTime.map(item => ({
      date: format(new Date(item.date), "MMM dd"),
      total: Number(item.total) || 0,
      completed: Number(item.completed) || 0,
    }));
  };
  
  const prepareWasteCategoryData = () => {
    if (!stats.wasteCategories) return [];
    
    return Object.entries(stats.wasteCategories)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: Number(amount) || 0,
      }))
      .filter(item => item.value > 0);
  };

  if (error) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Failed to load analytics</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Analytics</h1>
          <p className="text-muted-foreground">
            Monitor collection reports and waste management metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  <span>{TIME_PERIODS[timeframe]}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_PERIODS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalytics}
            className="h-10 w-10"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Trash2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Reports
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.totalReports.toLocaleString()}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  For {TIME_PERIODS[timeframe].toLowerCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Reports
                </p>
                <h3 className="text-2xl font-bold">{stats.completedReports.toLocaleString()}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.completedReports / stats.totalReports) * 100).toFixed(1)}% completion rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <Scale className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Waste Collected
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.totalWasteVolume.toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} kg
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Efficiency
                </p>
                <h3 className="text-2xl font-bold">{stats.avgEfficiency}%</h3>
                <Progress value={stats.avgEfficiency} className="mt-2 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Reports Timeline */}
        <Card>
    <CardHeader>
      <CardTitle>Reports Timeline</CardTitle>
      <CardDescription>Collection reports over time</CardDescription>
    </CardHeader>
    <CardContent className="w-full aspect-[4/3]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={prepareTimelineData()}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "8px"
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
          />
          <Line
            name="Total Reports"
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            name="Completed"
            type="monotone"
            dataKey="completed"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* Waste Categories Distribution */}
  <Card>
    <CardHeader>
      <CardTitle>Waste Distribution</CardTitle>
      <CardDescription>Distribution by waste category</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={prepareWasteCategoryData()}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {prepareWasteCategoryData().map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)} kg`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
      </div>

      {/* Top Collectors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Collectors</CardTitle>
          <CardDescription>
            Collectors ranked by collection efficiency and volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Collector</TableHead>
                  <TableHead className="text-center">Total Collections</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Volume Collected</TableHead>
                  <TableHead className="text-right">Efficiency Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topCollectors.map((collector, index) => (
                  <TableRow key={collector._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {collector.avatar?.url ? (
                              <img
                                src={collector.avatar.url}
                                alt={collector.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserCheck className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          {index < 3 && (
                            <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold
                              ${index === 0 ? "bg-yellow-400" :
                                index === 1 ? "bg-gray-300" :
                                  "bg-amber-600"} text-white`}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{collector.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {collector._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {collector.totalCollections}
                    </TableCell>
                    <TableCell className="text-center">
                      {collector.completedCollections} ({((collector.completedCollections / collector.totalCollections) * 100).toFixed(0)}%)
                    </TableCell>
                    <TableCell className="text-center">
                      {collector.totalVolume.toFixed(1)} kg
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress
                          value={collector.efficiency}
                          className="w-24"
                          indicatorColor={
                            collector.efficiency >= 90 ? "bg-green-500" :
                              collector.efficiency >= 70 ? "bg-yellow-500" :
                                "bg-red-500"
                          }
                        />
                        <span className="min-w-[3ch] font-medium">
                          {collector.efficiency}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportAnalytics;