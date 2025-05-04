import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Gift,
  Clock,
  Award,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUser, getUserStats, deleteUser } = useUser();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUser(id);
        if (userData) {
          setUser(userData);
          const userStats = await getUserStats(id);
          setStats(userStats);
        }
      } catch (error) {
        toast.error("Failed to load user data");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [id, getUser, getUserStats, navigate]);

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      navigate("/admin/users");
    } catch (error) {
      toast.error("Failed to delete user");
      setConfirmDelete(false);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      resident: { variant: "secondary", label: "Resident" },
      garbage_collector: { variant: "default", label: "Garbage Collector" },
      admin: { variant: "destructive", label: "Administrator" },
    };
    return variants[role] || variants.resident;
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(`/admin/users/${id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit User
          </Button>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete User
          </Button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {user?.avatar?.url ? (
                <AvatarImage src={user.avatar.url} alt={user.name} />
              ) : (
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge {...getRoleBadge(user?.role)}>
                  {getRoleBadge(user?.role).label}
                </Badge>
                <Badge variant={user?.verified ? "success" : "warning"}>
                  {user?.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.phone || "Not provided"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {user?.address?.street
                      ? `${user.address.street}, ${user.address.area || ""}`
                      : "Address not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Joined {format(new Date(user?.createdAt), "PPP")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Statistics */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Statistics
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {user?.role === "garbage_collector"
                          ? "Total Collections"
                          : "Total Reports"}
                      </p>
                      <p className="text-2xl font-bold">
                        {stats?.reportsCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <Gift className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Reward Points
                      </p>
                      <p className="text-2xl font-bold">
                        {user?.rewardPoints || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <Award className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Streak
                      </p>
                      <p className="text-2xl font-bold">
                        {user?.streakCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          {stats?.rewardPointsHistory?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Activity
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.rewardPointsHistory.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {format(new Date(transaction.createdAt), "PPp")}
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.type}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              transaction.type === "earned"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.type === "earned" ? "+" : "-"}
                            {transaction.points}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetails;