import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  User,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'canceled', label: 'Canceled' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High Priority (8-10)' },
  { value: 'medium', label: 'Medium Priority (4-7)' },
  { value: 'low', label: 'Low Priority (0-3)' },
];

const ScheduleManagement = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, schedule: null });
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    missed: 0,
  });

  const fetchSchedules = async () => {
    try {
      const params = {
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search,
      };

      if (priorityFilter !== 'all') {
        switch (priorityFilter) {
          case 'high':
            params.minPriority = 8;
            break;
          case 'medium':
            params.minPriority = 4;
            break;
          case 'low':
            params.minPriority = 0;
            break;
        }
      }

      const [schedulesRes, statsRes] = await Promise.all([
        api.get('/schedules', { params }),
        api.get('/schedules/stats'),
      ]);

      setSchedules(schedulesRes.data.data);
      setTotalSchedules(schedulesRes.data.total);
      setStats({
        pending: statsRes.data.data.pendingSchedules,
        completed: statsRes.data.data.completedSchedules,
        missed: statsRes.data.data.missedSchedules,
      });
    } catch (error) {
      toast.error('Failed to load schedules');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [page, statusFilter, priorityFilter]);

  const handleDelete = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success('Schedule deleted successfully');
      setDeleteDialog({ open: false, schedule: null });
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', label: 'Pending' },
      completed: { variant: 'success', label: 'Completed' },
      missed: { variant: 'destructive', label: 'Missed' },
      rescheduled: { variant: 'warning', label: 'Rescheduled' },
      canceled: { variant: 'outline', label: 'Canceled' },
    };
    return variants[status] || variants.pending;
  };

  const getPriorityBadge = (priority) => {
    if (priority >= 8) return { variant: 'destructive', label: `P${priority}` };
    if (priority >= 4) return { variant: 'warning', label: `P${priority}` };
    return { variant: 'secondary', label: `P${priority}` };
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor waste collection schedules
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/schedules/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <RefreshCcw className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <h3 className="text-2xl font-bold">{stats.completed}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <Clock className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Missed
                </p>
                <h3 className="text-2xl font-bold">{stats.missed}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by bin ID or collector name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule ID</TableHead>
                  <TableHead>Bin Details</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule._id}>
                    <TableCell className="font-medium">
                      #{schedule._id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          Bin #{schedule.bin.binId}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>{schedule.bin.location.address.street}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {schedule.collector.avatar?.url ? (
                            <img
                              src={schedule.collector.avatar.url}
                              alt={schedule.collector.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <span>{schedule.collector.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{format(new Date(schedule.scheduledDate), 'PPP')}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.timeSlot.start} - {schedule.timeSlot.end}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge {...getStatusBadge(schedule.status)}>
                        {getStatusBadge(schedule.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge {...getPriorityBadge(schedule.priority)}>
                        {getPriorityBadge(schedule.priority).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link to={`/admin/schedules/${schedule._id}`}>
                            <Search className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteDialog({ open: true, schedule })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, schedule: open ? deleteDialog.schedule : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, schedule: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteDialog.schedule._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManagement;