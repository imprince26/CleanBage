import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  MapPin,
  User,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

const AdminScheduleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [schedule, setSchedule] = React.useState(null);
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  const fetchSchedule = async () => {
    try {
      const { data } = await api.get(`/schedules/${id}`);
      setSchedule(data.data);
    } catch (error) {
      toast.error('Failed to load schedule details');
      console.error('Error:', error);
      navigate('/admin/schedules');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSchedule();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted successfully');
      navigate('/admin/schedules');
    } catch (error) {
      toast.error('Failed to delete schedule');
      console.error('Error:', error);
    }
    setDeleteDialog(false);
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

  const formatAddress = (address) => {
    if (!address) return '';
    const { street, area, landmark, city, postalCode } = address;
    return [street, area, landmark, city, postalCode].filter(Boolean).join(', ');
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Schedule Not Found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              The schedule you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/admin/schedules')}>
              Back to Schedules
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Details</h1>
          <p className="text-muted-foreground">
            View and manage waste collection schedule
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={`/admin/schedules/edit/${schedule._id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </a>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Schedule Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Overview</CardTitle>
            <CardDescription>Collection schedule details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status and Priority */}
            <div className="flex flex-wrap gap-4">
              <Badge {...getStatusBadge(schedule.status)}>
                {getStatusBadge(schedule.status).label}
              </Badge>
              <Badge {...getPriorityBadge(schedule.priority)}>
                {getPriorityBadge(schedule.priority).label}
              </Badge>
              {schedule.recurrence !== 'none' && (
                <Badge variant="outline" className="capitalize">
                  {schedule.recurrence} Recurrence
                </Badge>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{format(new Date(schedule.scheduledDate), 'PPP')}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Time Slot</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {schedule.timeSlot.start} - {schedule.timeSlot.end}
                  </span>
                </div>
              </div>
              {schedule.recurrence !== 'none' && schedule.recurrenceEndDate && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Recurrence End</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{format(new Date(schedule.recurrenceEndDate), 'PPP')}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Bin Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Bin Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bin ID</p>
                  <p className="font-medium">#{schedule.bin.binId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fill Level</p>
                  <p className="font-medium">{schedule.bin.fillLevel}%</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{formatAddress(schedule.bin.location.address)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Collector Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Collector Details</h3>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {schedule.collector.avatar?.url ? (
                    <img
                      src={schedule.collector.avatar.url}
                      alt={schedule.collector.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{schedule.collector.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {schedule.collector.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {schedule.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Notes</h3>
                  <p className="text-sm">{schedule.notes}</p>
                </div>
              </>
            )}

            {/* Completion Details */}
            {schedule.status === 'completed' && schedule.completionDetails && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium">Completion Details</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Completed At</p>
                      <p className="font-medium">
                        {format(new Date(schedule.completionDetails.completedAt), 'PPp')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Actual Fill Level</p>
                      <p className="font-medium">{schedule.completionDetails.actualFillLevel}%</p>
                    </div>
                    {schedule.completionDetails.collectionTime && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Collection Time</p>
                        <p className="font-medium">{schedule.completionDetails.collectionTime} mins</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
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

export default AdminScheduleDetails;