import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Crown,
  Gift,
  Activity,
  Users,
  ChevronUp,
  ChevronDown,
  Minus,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Leaderboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState("all-time");
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/leaderboard?timeframe=${timeframe}`);
        const data = await response.json();
        
        if (data.success) {
          setLeaderboard(data.data);
          // Find current user's rank
          const rank = data.data.findIndex((u) => u._id === user?._id) + 1;
          setUserRank(rank > 0 ? rank : null);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe, user?._id]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-primary" />;
    }
  };

  const getPointsChange = (change) => {
    if (!change) return null;
    
    if (change > 0) {
      return (
        <span className="flex items-center text-green-500 text-sm">
          <ChevronUp className="h-4 w-4" />
          {change}
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-red-500 text-sm">
          <ChevronDown className="h-4 w-4" />
          {Math.abs(change)}
        </span>
      );
    }
    
    return (
      <span className="flex items-center text-gray-500 text-sm">
        <Minus className="h-4 w-4" />
      </span>
    );
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top contributors in waste management
          </p>
        </div>

        {userRank && (
          <Card className="w-full md:w-auto">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">#{userRank}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Time Frame Tabs */}
      <Tabs defaultValue="all-time" onValueChange={setTimeframe}>
        <TabsList>
          <TabsTrigger value="all-time">All Time</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Leaderboard Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {leaderboard.map((leader, index) => (
            <Card
              key={leader._id}
              className={`${
                leader._id === user?._id
                  ? "bg-primary/5 border-primary/20"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {leader.name}
                        {leader._id === user?._id && (
                          <Badge variant="secondary" className="ml-2">
                            You
                          </Badge>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        <span>{leader.streakCount || 0} day streak</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{leader.reportsCount || 0} reports</span>
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="font-bold">{leader.rewardPoints}</span>
                    </div>
                    {getPointsChange(leader.pointsChange)}
                  </div>
                </div>

                {/* Progress to Next Rank (only show for non-top-3) */}
                {index > 2 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Points to #{index}
                      </span>
                      <span>
                        {leader.rewardPoints -
                          (leaderboard[index - 1]?.rewardPoints || 0)}{" "}
                        points
                      </span>
                    </div>
                    <Progress
                      value={
                        (leader.rewardPoints /
                          (leaderboard[index - 1]?.rewardPoints || 1)) *
                        100
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && leaderboard.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground">
              Start contributing to appear on the leaderboard!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;