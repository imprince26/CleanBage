import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@/context/UserContext";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { toast } from "react-hot-toast";
import {
  Search,
  Plus,
  Filter,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
} from "lucide-react";

const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "resident", label: "Residents" },
  { value: "garbage_collector", label: "Garbage Collectors" },
  { value: "admin", label: "Administrators" },
];

const UserManagement = () => {
  const { users, loading, getUsers, deleteUser } = useUser();
  const [filters, setFilters] = useState({
    role: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [sort, setSort] = useState({
    field: "createdAt",
    direction: "desc",
  });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch users on mount and when filters/pagination/sort change
  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page, sort]);

  const fetchUsers = async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      role: filters.role !== "all" ? filters.role : undefined,
      search: filters.search || undefined,
      sortBy: `${sort.field}:${sort.direction}`,
    };

    const result = await getUsers(params);
    if (result) {
      setPagination((prev) => ({
        ...prev,
        total: result.total,
      }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDeleteUser = async (userId) => {
    const success = await deleteUser(userId);
    if (success) {
      setConfirmDelete(null);
      fetchUsers();
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/users/create">
            <Plus className="mr-2 h-4 w-4" />
            Create User
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
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.role}
              onValueChange={(value) => handleFilterChange("role", value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            Total {pagination.total} user{pagination.total !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort("role")}
                      >
                        Role
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort("createdAt")}
                      >
                        Joined
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {user.avatar?.url ? (
                              <AvatarImage
                                src={user.avatar.url}
                                alt={user.name}
                              />
                            ) : (
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.address?.city && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {user.address.street}, {user.address.area},
                                {user.address.city}, {user.address.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge {...getRoleBadge(user.role)}>
                          {getRoleBadge(user.role).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.verified ? "success" : "warning"}
                        >
                          {user.verified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/users/${user._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/users/${user._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDelete(user)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {confirmDelete && (
            <div className="flex items-center gap-4 py-4">
              <Avatar>
                {confirmDelete.avatar?.url ? (
                  <AvatarImage
                    src={confirmDelete.avatar.url}
                    alt={confirmDelete.name}
                  />
                ) : (
                  <AvatarFallback>
                    {confirmDelete.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h4 className="font-semibold">{confirmDelete.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {confirmDelete.email}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(confirmDelete._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;