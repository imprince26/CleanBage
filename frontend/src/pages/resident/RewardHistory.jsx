import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import {
  Gift,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Copy,
  CheckCircle2,
  Tag,
  Coffee,
  Heart,
  Ticket,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const RewardHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);

  // Fetch transactions and redemptions
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [transactionsRes, redemptionsRes] = await Promise.all([
          fetch("/api/rewards/transactions"),
          fetch("/api/rewards/redemptions"),
        ]);

        const transactionsData = await transactionsRes.json();
        const redemptionsData = await redemptionsRes.json();

        setTransactions(transactionsData.data);
        setRedemptions(redemptionsData.data);
      } catch (error) {
        console.error("Error fetching reward history:", error);
        toast.error("Failed to load reward history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getCategoryIcon = (category) => {
    const icons = {
      voucher: Ticket,
      discount: Tag,
      freebie: Gift,
      experience: Coffee,
      donation: Heart,
    };
    const Icon = icons[category] || Gift;
    return <Icon className="h-4 w-4" />;
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reward History</h1>
          <p className="text-muted-foreground">
            Track your reward points and redemptions
          </p>
        </div>
        <Card className="w-full md:w-auto">
          <CardContent className="py-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Available Points</p>
              <p className="text-2xl font-bold">{user?.rewardPoints || 0}</p>
            </div>
            <Button asChild>
              <Link to="/resident/rewards">
                Browse Rewards
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>
                Your reward points earning and spending history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Transactions Yet</h3>
                  <p className="text-muted-foreground">
                    Start reporting waste bins to earn reward points!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {format(new Date(transaction.createdAt), "PPp")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "earned" ? "success" : "default"
                            }
                            className="capitalize"
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span
                            className={
                              transaction.type === "earned"
                                ? "text-green-600"
                                : "text-orange-600"
                            }
                          >
                            {transaction.type === "earned" ? "+" : "-"}
                            {Math.abs(transaction.points)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {transaction.balance}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions">
          <Card>
            <CardHeader>
              <CardTitle>Redemption History</CardTitle>
              <CardDescription>
                Your redeemed rewards and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Redemptions Yet</h3>
                  <p className="text-muted-foreground">
                    Visit the reward store to redeem your points!
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/resident/rewards">Visit Reward Store</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {redemptions.map((redemption) => (
                    <Card key={redemption._id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Reward Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                {getCategoryIcon(redemption.rewardItem.category)}
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {redemption.rewardItem.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {redemption.rewardItem.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Redemption Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Redeemed on{" "}
                                {format(
                                  new Date(redemption.redeemedAt),
                                  "dd MMM yyyy"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  redemption.status === "used"
                                    ? "default"
                                    : redemption.status === "expired"
                                    ? "destructive"
                                    : "success"
                                }
                                className="capitalize"
                              >
                                {redemption.status}
                              </Badge>
                            </div>
                            {redemption.code && (
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-muted rounded text-sm">
                                  {redemption.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(redemption.code)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardHistory;