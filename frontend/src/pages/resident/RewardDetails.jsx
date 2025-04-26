import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Gift,
  Calendar,
  Clock,
  Users,
  Tag,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const RewardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState(null);

  useEffect(() => {
    const fetchRewardDetails = async () => {
      try {
        const response = await fetch(`/api/rewards/items/${id}`);
        const data = await response.json();
        setReward(data.data);
      } catch (error) {
        console.error("Error fetching reward details:", error);
        toast.error("Failed to load reward details");
      } finally {
        setLoading(false);
      }
    };

    fetchRewardDetails();
  }, [id]);

  const handleRedeem = async () => {
    try {
      const response = await fetch(`/api/rewards/items/${id}/redeem`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setRedemptionCode(data.data.code);
        setRedemptionSuccess(true);
        toast.success("Reward redeemed successfully!");
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error(error.response?.data?.message || "Failed to redeem reward");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: reward.name,
        text: `Check out this reward: ${reward.name}`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-[400px] bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="container py-8">
        <Card className="text-center py-8">
          <CardContent>
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Reward Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This reward might have been removed or is no longer available.
            </p>
            <Button onClick={() => navigate("/rewards")}>Back to Rewards</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(reward.validUntil) < new Date();
  const isOutOfStock = reward.remainingQuantity === 0;
  const insufficientPoints = user?.rewardPoints < reward.pointsCost;

  return (
    <div className="container py-8 space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate("/rewards")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Rewards
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img
              src={reward.image?.url || "/images/reward-placeholder.png"}
              alt={reward.name}
              className="w-full h-full object-cover"
            />
            {(isExpired || isOutOfStock) && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg">
                  {isExpired ? "Expired" : "Out of Stock"}
                </Badge>
              </div>
            )}
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleShare}
            disabled={isExpired || isOutOfStock}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Reward
          </Button>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold mb-2">{reward.name}</h1>
                <Badge variant="secondary">{reward.category}</Badge>
              </div>
              <Badge
                variant="outline"
                className="text-lg font-bold"
              >
                {reward.pointsCost} points
              </Badge>
            </div>
            <p className="text-muted-foreground mt-4">{reward.description}</p>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Valid Until</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {format(new Date(reward.validUntil), "dd MMM yyyy")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Remaining</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {reward.remainingQuantity === -1
                    ? "Unlimited"
                    : `${reward.remainingQuantity} left`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Terms and Conditions */}
          {reward.termsAndConditions && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {reward.termsAndConditions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Points Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Points</span>
                  <span className="font-semibold">{user?.rewardPoints || 0}</span>
                </div>
                <Progress
                  value={(user?.rewardPoints / reward.pointsCost) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Required Points</span>
                  <span className="font-semibold">{reward.pointsCost}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Redeem Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={isExpired || isOutOfStock || insufficientPoints}
            onClick={() => setIsRedeemDialogOpen(true)}
          >
            {isExpired
              ? "Reward Expired"
              : isOutOfStock
              ? "Out of Stock"
              : insufficientPoints
              ? `Need ${reward.pointsCost - user?.rewardPoints} more points`
              : "Redeem Now"}
          </Button>
        </div>
      </div>

      {/* Redemption Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {!redemptionSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Redemption</DialogTitle>
                <DialogDescription>
                  You are about to redeem this reward for {reward.pointsCost} points.
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Current Balance</span>
                  <span className="font-semibold">{user?.rewardPoints} points</span>
                </div>
                <div className="flex justify-between">
                  <span>After Redemption</span>
                  <span className="font-semibold">
                    {user?.rewardPoints - reward.pointsCost} points
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRedeemDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRedeem}>Confirm Redemption</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Redemption Successful!</DialogTitle>
                <DialogDescription>
                  Your reward has been successfully redeemed.
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Your redemption code</p>
                  <p className="text-2xl font-mono font-bold">{redemptionCode}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep this code safe. You'll need it to claim your reward.
                </p>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setIsRedeemDialogOpen(false);
                    navigate("/rewards/history");
                  }}
                >
                  View My Rewards
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardDetails;