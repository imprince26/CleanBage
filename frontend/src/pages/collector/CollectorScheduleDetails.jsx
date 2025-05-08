import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const rescheduleSchema = z.object({
  newDate: z.date({
    required_error: 'Please select a date',
  }),
  reason: z.string().min(1, 'Please provide a reason for rescheduling'),
});

const completeSchema = z.object({
  fillLevel: z.number().min(0).max(100, 'Fill level must be between 0 and 100'),
  collectionTime: z.number().min(1, 'Collection time is required'),
  notes: z.string().optional(),
});

const CollectorScheduleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [schedule, setSchedule] = React.useState(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = React.useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = React.useState(false);

  const rescheduleForm = useForm({
    resolver: zodResolver(rescheduleSchema),
  });

  const completeForm = useForm({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      fillLevel: 0,
      collectionTime: 30,
      notes: '',
    },
  });

  const fetchSchedule = async () => {
    try {
      const { data } = await api.get(`/schedules/${id}`);
      setSchedule(data.data);
    } catch (error) {
      toast.error('Failed to load schedule details');
      console.error('Error:', error);
      navigate('/collector/schedule');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSchedule();
  }, [id]);

  const handleReschedule = async (values) => {
    try {
      await api.put(`/schedules/${id}/reschedule`, values);
      toast.success('Schedule rescheduled successfully');
      setIsRescheduleDialogOpen(false);
      rescheduleForm.reset();
      fetchSchedule();
    } catch (error) {
      toast.error('Failed to reschedule collection');
      console.error('Error:', error);
    }
  };

  const handleComplete = async (values) => {
    try {
      await api.put(`/schedules/${id}/complete`, values);
      toast.success('Collection marked as completed');
      setIsCompleteDialogOpen(false);
      completeForm.reset();
      fetchSchedule();
    } catch (error) {
      toast.error('Failed to complete collection');
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', label: 'Pending' },
      completed: { variant: 'success', label: 'Completed' },
      missed: { variant: 'destructive', label: 'Missed' },
      rescheduled: { variant: 'warning', label: 'Rescheduled' },
    };
    return variants[status] || variants.pending;
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
            <Button onClick={() => navigate('/collector/schedule')}>
              Back to Schedule
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
            View and manage collection schedule details
          </p>
        </div>
        {schedule.status === 'pending' && (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(true)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
            <Button onClick={() => setIsCompleteDialogOpen(true)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Collection
            </Button>
          </div>
        )}
      </div>

      {/* Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>Schedule and collection information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div>
            <Badge {...getStatusBadge(schedule.status)}>
              {getStatusBadge(schedule.status).label}
            </Badge>
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Scheduled Date</p>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
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
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Fill Level</p>
                <Progress value={schedule.bin.fillLevel} className="h-2" />
                <p className="text-sm">{schedule.bin.fillLevel}% full</p>
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

          {schedule.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Notes</h3>
                <p className="text-sm">{schedule.notes}</p>
              </div>
            </>
          )}

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
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Collection Time</p>
                    <p className="font-medium">{schedule.completionDetails.collectionTime} mins</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Collection</DialogTitle>
            <DialogDescription>
              Select a new date and provide a reason for rescheduling
            </DialogDescription>
          </DialogHeader>
          <Form {...rescheduleForm}>
            <form onSubmit={rescheduleForm.handleSubmit(handleReschedule)} className="space-y-4">
              <FormField
                control={rescheduleForm.control}
                name="newDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Date</FormLabel>
                    <FormControl>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={rescheduleForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Rescheduling</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a reason for rescheduling..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRescheduleDialogOpen(false);
                    rescheduleForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Confirm Reschedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Collection</DialogTitle>
            <DialogDescription>
              Enter collection details to mark this schedule as completed
            </DialogDescription>
          </DialogHeader>
          <Form {...completeForm}>
            <form onSubmit={completeForm.handleSubmit(handleComplete)} className="space-y-4">
              <FormField
                control={completeForm.control}
                name="fillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Fill Level (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={completeForm.control}
                name="collectionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={completeForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about the collection..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCompleteDialogOpen(false);
                    completeForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Complete Collection</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectorScheduleDetails;