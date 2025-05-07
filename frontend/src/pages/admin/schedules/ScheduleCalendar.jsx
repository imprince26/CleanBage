import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
  Calendar as CalendarIcon,
  User,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatAddress = (address) => {
  if (!address) return '';
  const { street, area, city } = address;
  return [street, area, city].filter(Boolean).join(', ');
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'canceled', label: 'Canceled' },
];

const ScheduleCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Fetch schedules
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search,
      };

      const { data } = await api.get('/schedules', { params });
      setSchedules(data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentDate, statusFilter, search]);

  // Get schedules for a specific day
  const getDaySchedules = (date) => {
    return schedules.filter((schedule) =>
      isSameDay(new Date(schedule.scheduledDate), date)
    );
  };

  // Navigate between months
  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
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

  // Render a single day cell
  const renderDay = (date) => {
    const daySchedules = getDaySchedules(date);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isCurrentDay = isToday(date);

    return (
      <div
        key={date.toString()}
        className={`min-h-[120px] p-2 border-r border-b ${
          !isCurrentMonth ? 'bg-muted/50' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              isCurrentDay
                ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                : !isCurrentMonth
                ? 'text-muted-foreground'
                : ''
            }`}
          >
            {format(date, 'd')}
          </span>
          {daySchedules.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {daySchedules.length}
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[80px]">
          {daySchedules.map((schedule) => (
            <div key={schedule._id} className="mb-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start text-left text-xs truncate',
                  schedule.priority >= 8 ? 'border-l-2 border-destructive' : ''
                )}
                onClick={() => {
                  setSelectedSchedule(schedule);
                  setIsDetailsOpen(true);
                }}
              >
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(schedule.scheduledDate), 'HH:mm')} - Bin #{schedule.bin.binId}
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Calendar</h1>
          <p className="text-muted-foreground">
            View and manage all waste collection schedules
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/schedules/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[150px] text-center font-medium">
                {format(currentDate, 'MMMM yyyy')}
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search schedules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-sm font-medium text-center border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date) => renderDay(date))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <DialogTitle>Schedule Details</DialogTitle>
                <DialogDescription>
                  Collection schedule for Bin #{selectedSchedule.bin.binId}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedSchedule.scheduledDate), 'PPP')}
                    </p>
                    <p className="text-sm">
                      {selectedSchedule.timeSlot.start} - {selectedSchedule.timeSlot.end}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      <Badge {...getStatusBadge(selectedSchedule.status)}>
                        {getStatusBadge(selectedSchedule.status).label}
                      </Badge>
                      <Badge {...getPriorityBadge(selectedSchedule.priority)}>
                        {getPriorityBadge(selectedSchedule.priority).label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Collector</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {selectedSchedule.collector.avatar?.url ? (
                        <img
                          src={selectedSchedule.collector.avatar.url}
                          alt={selectedSchedule.collector.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span>{selectedSchedule.collector.name}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{formatAddress(selectedSchedule.bin.location.address)}</p>
                  </div>
                </div>

                {selectedSchedule.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{selectedSchedule.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link to={`/admin/schedules/${selectedSchedule._id}`}>
                    View Details
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleCalendar;