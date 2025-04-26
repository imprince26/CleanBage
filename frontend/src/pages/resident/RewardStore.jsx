import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gift,
  Tag,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Clock,
  Ticket,
  Gift as GiftIcon,
  Coffee,
  Heart,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useUser } from "@/context/UserContext";

const RewardStore = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    maxPoints: "",
    search: "",
  });

  // Categories with their corresponding icons
  const categories = [
    { value: "voucher", label: "Vouchers", icon: Ticket },
    { value: "discount", label: "Discounts", icon: Tag },
    { value: "freebie", label: "Freebies", icon: GiftIcon },
    { value: "experience", label: "Experiences", icon: Coffee },
    { value: "donation", label: "Donations", icon: Heart },
  ];

  // Fetch rewards from API
  const fetchRewards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.maxPoints) params.append("maxPoints", filters.maxPoints);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/rewards/items?${params}`);
      const data = await response.json();
      setRewards(data.data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [filters]);

  // Handle reward redemption
  const handleRedeem = async () => {
    try {
      const response = await fetch(`/api/rewards/items/${selectedReward._id}/redeem`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Reward redeemed successfully!");
        setIsRedeemDialogOpen(false);
        // Refresh rewards list
        fetchRewards();
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error(error.response?.data?.message || "Failed to redeem reward");
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reward Store</h1>
          <p className="text-muted-foreground">
            Redeem your points for exciting rewards
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card p-2 rounded-lg border">
          <Gift className="h-5 w-5 text-primary" />
          <span className="font-medium">{user?.rewardPoints || 0}</span>
          <span className="text-muted-foreground">points available</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search rewards..."
      className="pl-10"
      value={filters.search}
      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
    />
  </div>
  <Select
    value={filters.category}
    onValueChange={(value) => setFilters({ ...filters, category: value })}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Categories</SelectItem>
      {categories.map((category) => (
        <SelectItem key={category.value} value={category.value}>
          <div className="flex items-center gap-2">
            <category.icon className="h-4 w-4" />
            {category.label}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <Select
    value={filters.maxPoints}
    onValueChange={(value) => setFilters({ ...filters, maxPoints: value })}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Max Points" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="any">Any Points</SelectItem>
      <SelectItem value="100">Under 100 points</SelectItem>
      <SelectItem value="500">Under 500 points</SelectItem>
      <SelectItem value="1000">Under 1000 points</SelectItem>
    </SelectContent>
  </Select>
</div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card key={reward._id} className="overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={reward.image?.url || "/images/reward-placeholder.png"}
                  alt={reward.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge
                  className="absolute top-4 right-4"
                  variant={reward.remainingQuantity === 0 ? "destructive" : "secondary"}
                >
                  {reward.remainingQuantity === -1
                    ? "Unlimited"
                    : reward.remainingQuantity === 0
                    ? "Out of Stock"
                    : `${reward.remainingQuantity} left`}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{reward.name}</CardTitle>
                    <CardDescription>
                      {categories.find((c) => c.value === reward.category)?.label}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-bold">
                    {reward.pointsCost} points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reward.description}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Valid until {format(new Date(reward.validUntil), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={
                    reward.remainingQuantity === 0 || user?.rewardPoints < reward.pointsCost
                      ? "outline"
                      : "default"
                  }
                  disabled={
                    reward.remainingQuantity === 0 || user?.rewardPoints < reward.pointsCost
                  }
                  onClick={() => {
                    setSelectedReward(reward);
                    setIsRedeemDialogOpen(true);
                  }}
                >
                  {reward.remainingQuantity === 0
                    ? "Out of Stock"
                    : user?.rewardPoints < reward.pointsCost
                    ? "Insufficient Points"
                    : "Redeem Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Redeem Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedReward.image?.url || "/images/reward-placeholder.png"}
                  alt={selectedReward.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold">{selectedReward.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedReward.description}
                  </p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span>Cost</span>
                  <span className="font-semibold">{selectedReward.pointsCost} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Your Balance</span>
                  <span className="font-semibold">{user?.rewardPoints} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Remaining Balance</span>
                  <span className="font-semibold">
                    {user?.rewardPoints - selectedReward.pointsCost} points
                  </span>
                </div>
              </div>
              {selectedReward.termsAndConditions && (
                <div className="text-sm space-y-2">
                  <h5 className="font-semibold">Terms & Conditions</h5>
                  <p className="text-muted-foreground">
                    {selectedReward.termsAndConditions}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRedeemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedeem}>
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {!loading && rewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Rewards Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later for new rewards.
          </p>
        </div>
      )}
    </div>
  );
};

export default RewardStore;