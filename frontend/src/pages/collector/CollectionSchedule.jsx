import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Loader2,
    ListFilter,
    GridIcon,
    AlertCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { format, isToday, isTomorrow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/utils/api";

const rescheduleSchema = z.object({
    newDate: z.date({
        required_error: "Please select a date",
    }),
    reason: z.string().min(1, "Please provide a reason for rescheduling"),
});

const CollectionSchedule = () => {
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const [statusFilter, setStatusFilter] = useState("all");

    const form = useForm({
        resolver: zodResolver(rescheduleSchema),
        defaultValues: { reason: "" },
    });

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Optionally add query params based on selectedDate & statusFilter
            const params = {};
            if(statusFilter !== "all"){
                params.status = statusFilter;
            }
            // You could also send selectedDate if your API supports it
            const { data } = await api.get("/schedules", { params });
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
        fetchSchedules();
    }, [selectedDate, statusFilter]);

    const handleComplete = async (scheduleId) => {
        try {
            // You can pass fillLevel if needed
            const { data } = await api.put(`/schedules/${scheduleId}/complete`, {
                fillLevel: 100, // example value, update as needed
            });
            if (data.success) {
                toast.success("Collection marked as completed");
                fetchSchedules();
            }
        } catch (error) {
            console.error("Error completing schedule:", error);
            toast.error("Failed to complete collection");
        }
    };

    const handleReschedule = async (values) => {
        try {
            const { data } = await api.put(
                `/schedules/${selectedSchedule._id}/reschedule`,
                {
                    newDate: values.newDate,
                    reason: values.reason,
                }
            );
            if (data.success) {
                toast.success("Schedule successfully rescheduled");
                setIsRescheduleDialogOpen(false);
                form.reset();
                fetchSchedules();
            }
        } catch (error) {
            console.error("Error rescheduling:", error);
            toast.error("Failed to reschedule collection");
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: { variant: "secondary", label: "Pending" },
            completed: { variant: "success", label: "Completed" },
            missed: { variant: "destructive", label: "Missed" },
            rescheduled: { variant: "warning", label: "Rescheduled" },
        };
        return variants[status] || variants.pending;
    };

    const formatScheduleDate = (date) => {
        if (!date) return "N/A";
        const dateObj = new Date(date);
        if (isToday(dateObj)) return "Today";
        if (isTomorrow(dateObj)) return "Tomorrow";
        return format(dateObj, "dd MMM yyyy");
    };

    if (loading) {
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
                    <h1 className="text-3xl font-bold tracking-tight">
                        Collection Schedule
                    </h1>
                    <p className="text-muted-foreground">
                        View and manage your upcoming waste collection schedules
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="missed">Missed</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center rounded-lg border bg-card">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="gap-2"
                        >
                            <ListFilter className="h-4 w-4" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === "calendar" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("calendar")}
                            className="gap-2"
                        >
                            <GridIcon className="h-4 w-4" />
                            Calendar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-[300px,1fr] gap-8">
                {/* Calendar Picker */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Select Date
                        </CardTitle>
                        <CardDescription>
                            View schedules for specific dates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                            disabled={(date) => date < new Date()}
                        />
                    </CardContent>
                </Card>

                {/* Schedules List/Calendar View */}
                <ScrollArea className="h-[calc(100vh-300px)]">
                    {schedules.length === 0 ? (
                        <Card className="border-0 shadow-md">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">No Schedules Found</h3>
                                <p className="text-muted-foreground text-center max-w-sm mb-4">
                                    There are no collection schedules for the selected date or filter.
                                </p>
                            </CardContent>
                        </Card>
                    ) : viewMode === "list" ? (
                        <Card className="border-0 shadow-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Fill Level</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((schedule) => (
                                        <TableRow key={schedule._id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {formatScheduleDate(
                                                            schedule.scheduledDate
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(
                                                            new Date(
                                                                schedule.scheduledDate
                                                            ),
                                                            "hh:mm a"
                                                        )}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        Bin #{schedule.bin.binId}
                                                    </p>
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {schedule.bin.location.address.street},{" "}
                                                        {schedule.bin.location.address.area}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-[100px]">
                                                    <Progress
                                                        value={schedule.bin.fillLevel}
                                                        className="h-2"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {schedule.bin.fillLevel}% full
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge {...getStatusBadge(schedule.status)}>
                                                    {getStatusBadge(schedule.status).label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        schedule.priority >= 8
                                                            ? "destructive"
                                                            : schedule.priority >= 5
                                                            ? "warning"
                                                            : "secondary"
                                                    }
                                                >
                                                    P{schedule.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {schedule.status === "pending" && (
                                                        <>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleComplete(schedule._id)
                                                                }
                                                                className="gap-2"
                                                            >
                                                                Complete
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedSchedule(schedule);
                                                                    setIsRescheduleDialogOpen(true);
                                                                }}
                                                                className="gap-2"
                                                            >
                                                                Reschedule
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link to={`/collector/bins/${schedule.bin._id}`}>
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <div className="grid gap-4">
                                    {schedules.map((schedule) => (
                                        <div
                                            key={schedule._id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Clock className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {format(
                                                                new Date(schedule.scheduledDate),
                                                                "hh:mm a"
                                                            )}
                                                        </p>
                                                        <Badge {...getStatusBadge(schedule.status)}>
                                                            {getStatusBadge(schedule.status).label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>Bin #{schedule.bin.binId}</span>
                                                        <Progress
                                                            value={schedule.bin.fillLevel}
                                                            className="h-2 w-20"
                                                        />
                                                        <span>{schedule.bin.fillLevel}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {schedule.status === "pending" && (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleComplete(schedule._id)
                                                            }
                                                        >
                                                            Complete
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedSchedule(schedule);
                                                                setIsRescheduleDialogOpen(true);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </ScrollArea>
            </div>

            {/* Reschedule Dialog */}
            <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule Collection</DialogTitle>
                        <DialogDescription>
                            Select a new date and provide a reason for rescheduling
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleReschedule)} className="space-y-4">
                            <FormField
                                control={form.control}
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
                                control={form.control}
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
                                        form.reset();
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
        </div>
    );
};

export default CollectionSchedule;