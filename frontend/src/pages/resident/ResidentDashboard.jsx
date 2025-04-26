import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Award,
  Gift,
  MapPin,
  Plus,
  Recycle,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  History,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/utils/api";
import toast from "react-hot-toast";

const ResidentDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id || authLoading) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = user._id;
        console.log("Fetching dashboard data for user:", userId);

        const [statsRes, reportsRes, rewardsRes, leaderboardRes] = await Promise.all([
          api.get(`/users/${userId}/stats`).catch(err => {
            throw new Error(`Stats fetch failed: ${err.response?.data?.message || err.message}`);
          }),
          api.get('/collections', {
            params: {
              reportedBy: userId,
              limit: 5,
              sort: '-createdAt'
            }
          }).catch(err => {
            throw new Error(`Reports fetch failed: ${err.response?.data?.message || err.message}`);
          }),
          api.get('/rewards/transactions', {
            params: {
              limit: 5,
              sort: '-createdAt'
            }
          }).catch(err => {
            throw new Error(`Rewards fetch failed: ${err.response?.data?.message || err.message}`);
          }),
          api.get('/users/leaderboard').catch(err => {
            throw new Error(`Leaderboard fetch failed: ${err.response?.data?.message || err.message}`);
          })
        ]);

        // Validate responses
        if (!statsRes.data?.data) throw new Error("Invalid stats response");
        if (!Array.isArray(reportsRes.data?.data)) throw new Error("Invalid reports response");
        if (!Array.isArray(rewardsRes.data?.data)) throw new Error("Invalid rewards response");
        if (!Array.isArray(leaderboardRes.data?.data)) throw new Error("Invalid leaderboard response");

        setStats(statsRes.data.data);
        setRecentReports(reportsRes.data.data);
        setRewardHistory(rewardsRes.data.data);

        // Calculate leaderboard position
        const position = leaderboardRes.data.data.findIndex(u => u._id === userId) + 1;
        setLeaderboardPosition(position || "-");

        console.log("Dashboard data fetched:", {
          stats: statsRes.data.data,
          reports: reportsRes.data.data,
          rewards: rewardsRes.data.data,
          leaderboardPosition: position
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        setError(error.message);
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isAuthenticated, authLoading]);

  // Stat cards data
  const statCards = [
    {
      title: "Total Reports",
      value: stats?.collectionsCount || 0,
      description: "Waste bins reported",
      icon: Trash2,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Reward Points",
      value: user?.rewardPoints || 0,
      description: "Points earned",
      icon: Gift,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Current Streak",
      value: stats?.streakCount || 0,
      description: "Days active",
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Leaderboard Rank",
      value: leaderboardPosition || "-",
      description: "Current position",
      icon: Trophy,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        {isAuthenticated ? "Loading..." : "Please log in to view the dashboard"}
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your waste management activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/resident/report-bin">
              <Plus className="mr-2 h-4 w-4" />
              Report New Bin
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/resident/bin-map">
              <MapPin className="mr-2 h-4 w-4" />
              View Bin Map
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Rewards Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your latest waste bin reports</CardDescription>
              </div>
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-muted-foreground">No recent reports found.</p>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report._id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <MapPin className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Bin #{report.binId}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.location?.address?.street || "Unknown location"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={report.status === "collected" ? "success" : "default"}>
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reward History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reward History</CardTitle>
                <CardDescription>Recent point transactions</CardDescription>
              </div>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {rewardHistory.length === 0 ? (
              <p className="text-muted-foreground">No reward transactions found.</p>
            ) : (
              <div className="space-y-4">
                {rewardHistory.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === "earned"
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-orange-50 dark:bg-orange-900/20"
                        }`}
                      >
                        {transaction.type === "earned" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <Gift className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === "earned" ? "Earned" : "Redeemed"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.createdAt), "PP")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${
                        transaction.type === "earned" ? "text-green-500" : "text-orange-500"
                      }`}
                    >
                      {transaction.type === "earned" ? "+" : "-"}
                      {transaction.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Progress</CardTitle>
          <CardDescription>Track your waste management milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Reporting Streak</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats?.streakCount || 0}/30 days
                </span>
              </div>
              <Progress value={(stats?.streakCount || 0) * (100 / 30)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Monthly Goal</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats?.monthlyReports || 0}/20 reports
                </span>
              </div>
              <Progress value={(stats?.monthlyReports || 0) * (100 / 20)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Recycle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Recycling Rate</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats?.recyclingRate || 0}%
                </span>
              </div>
              <Progress value={stats?.recyclingRate || 0} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentDashboard;