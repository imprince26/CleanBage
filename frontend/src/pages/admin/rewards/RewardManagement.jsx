import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Gift,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "voucher", label: "Vouchers" },
  { value: "discount", label: "Discounts" },
  { value: "freebie", label: "Freebies" },
  { value: "experience", label: "Experiences" },
  { value: "donation", label: "Donations" },
];

const RewardManagement = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    fetchRewards();
  }, [filters, sortConfig]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        sortBy: `${sortConfig.key}:${sortConfig.direction}`,
      });

      const response = await api.get(`/rewards/items?${queryParams}`);
      
      if (response.data.success) {
        setRewards(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRewardStatus = async (rewardId, currentStatus) => {
    try {
      await api.put(`/rewards/items/${rewardId}`, {
        isActive: !currentStatus,
      });
      
      toast.success("Reward status updated");
      fetchRewards();
    } catch (error) {
      toast.error("Failed to update reward status");
    }
  };

  const handleDelete = async (rewardId) => {
    try {
      await api.delete(`/rewards/items/${rewardId}`);
      toast.success("Reward deleted successfully");
      setConfirmDelete(null);
      fetchRewards();
    } catch (error) {
      toast.error("Failed to delete reward");
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reward Management</h1>
          <p className="text-muted-foreground">
            Create and manage reward items for users
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/rewards/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Reward
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rewards..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
          <CardDescription>
            Manage your reward items and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rewards Found</h3>
              <p className="text-muted-foreground">
                Start by creating your first reward item
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reward</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded overflow-hidden">
                            <img
                              src={reward.image?.url || "/images/reward-placeholder.png"}
                              alt={reward.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{reward.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {reward.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{reward.category}</Badge>
                      </TableCell>
                      <TableCell>{reward.pointsCost}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>From: {format(new Date(reward.validFrom), "PP")}</p>
                          <p>Until: {format(new Date(reward.validUntil), "PP")}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {reward.totalQuantity === -1 ? (
                          "Unlimited"
                        ) : (
                          <span>
                            {reward.remainingQuantity}/{reward.totalQuantity}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={reward.isActive}
                          onCheckedChange={() =>
                            toggleRewardStatus(reward._id, reward.isActive)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/rewards/${reward._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/rewards/${reward._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDelete(reward)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reward? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {confirmDelete && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="h-16 w-16 rounded overflow-hidden">
                <img
                  src={confirmDelete.image?.url || "/images/reward-placeholder.png"}
                  alt={confirmDelete.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold">{confirmDelete.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {confirmDelete.description}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(confirmDelete._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardManagement;