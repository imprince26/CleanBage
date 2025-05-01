import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

// Helper function to convert a location address object into a formatted string
const formatAddress = (address) => {
  if (!address) return "";
  const { street, area, landmark, city, postalCode } = address;
  return [street, area, landmark, city, postalCode].filter(Boolean).join(", ");
};

const CollectorCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Calculate a full calendar grid covering entire weeks for the current month:
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Fetch upcoming schedules for the collector using api utils
  const fetchMonthSchedules = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      const { data } = await api.get("/schedules/collector/upcoming", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthSchedules();
  }, [currentDate]);

  // Returns a badge configuration for a given status
  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", label: "Pending" },
      completed: { variant: "success", label: "Completed" },
      missed: { variant: "destructive", label: "Missed" },
      rescheduled: { variant: "warning", label: "Rescheduled" },
    };
    return variants[status] || variants.pending;
  };

  // Get all schedules falling on a specific date
  const getDaySchedules = (date) => {
    return schedules.filter((schedule) =>
      isSameDay(new Date(schedule.scheduledDate), date)
    );
  };

  // Navigate month by specified direction (-1 for previous, 1 for next)
  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Render a single day cell with the number, count badge, and list of schedule buttons
  const renderDay = (date) => {
    const daySchedules = getDaySchedules(date);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isCurrentDay = isToday(date);
    return (
      <div
        key={date.toString()}
        className={`min-h-[120px] p-2 border-r border-b ${
          !isCurrentMonth ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              isCurrentDay
                ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                : !isCurrentMonth
                ? "text-muted-foreground"
                : ""
            }`}
          >
            {format(date, "d")}
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
                className={`w-full justify-start text-left text-xs truncate ${
                  schedule.priority >= 8 ? "border-l-2 border-destructive" : ""
                }`}
                onClick={() => {
                  setSelectedSchedule(schedule);
                  setIsDetailsOpen(true);
                }}
              >
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(schedule.scheduledDate), "HH:mm")} - {schedule.bin.binId}
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collection Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your collection schedules
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[150px] text-center font-medium">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="w-full">
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
                      {format(new Date(selectedSchedule.scheduledDate), "PPp")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge {...getStatusBadge(selectedSchedule.status)}>
                      {getStatusBadge(selectedSchedule.status).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{formatAddress(selectedSchedule.bin.location.address)}</p>
                  </div>
                </div>
                {selectedSchedule.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{selectedSchedule.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link to={`/collector/bins/${selectedSchedule.bin._id}`}>View Bin Details</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectorCalendar;