import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronLeft,
  Edit,
  Trash2,
  Gift,
  Calendar,
  Users,
  Tag,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const RewardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchRewardDetails();
  }, [id]);

  const fetchRewardDetails = async () => {
    try {
      setLoading(true);
      // Fetch reward details and redemptions in parallel
      const [rewardRes, redemptionsRes] = await Promise.all([
        api.get(`/rewards/items/${id}`),
        api.get(`/rewards/items/${id}/redemptions`),
      ]);

      if (rewardRes.data.success) {
        setReward(rewardRes.data.data);
        setRedemptions(redemptionsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reward details:", error);
      toast.error(error.response?.data?.message || "Failed to load reward details");
      navigate("/admin/rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/rewards/items/${id}`);
      
      if (response.data.success) {
        toast.success("Reward deleted successfully");
        // Redirect after successful deletion
        navigate("/admin/rewards");
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error(error.response?.data?.message || "Failed to delete reward");
      setConfirmDelete(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found state
  if (!reward) {
    return (
      <div className="container py-8">
        <Card className="text-center py-8">
          <CardContent>
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Reward Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The reward you're looking for might have been removed.
            </p>
            <Button onClick={() => navigate("/admin/rewards")}>
              View All Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(reward.validUntil) < new Date();

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate("/admin/rewards")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Rewards
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/admin/rewards/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Reward
            </a>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Image & Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <img
                  src={reward.image?.url || "/images/reward-placeholder.png"}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
                {isExpired && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg">
                      Expired
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{reward.name}</p>
                </div>
                <Badge>{reward.category}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{reward.description}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Points Cost</p>
                <p className="font-medium">{reward.pointsCost} points</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Details */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Redeemed</p>
                    <p className="text-2xl font-bold">{redemptions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Tag className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">
                      {reward.totalQuantity === -1 ? "∞" : reward.remainingQuantity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valid From</p>
                  <p className="font-medium">
                    {format(new Date(reward.validFrom), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">
                    {format(new Date(reward.validUntil), "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          {reward.termsAndConditions && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {reward.termsAndConditions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Redemption History */}
          <Card>
            <CardHeader>
              <CardTitle>Redemption History</CardTitle>
              <CardDescription>
                Recent redemptions for this reward
              </CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No redemptions recorded yet
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption._id}>
                        <TableCell>
                          <div className="font-medium">{redemption.user.name}</div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(redemption.redeemedAt), "PPp")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              redemption.status === "used"
                                ? "default"
                                : redemption.status === "expired"
                                ? "destructive"
                                : "success"
                            }
                          >
                            {redemption.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {redemption.code}
                          </code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reward? This action cannot be
              undone. All redemption records will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardDetails;