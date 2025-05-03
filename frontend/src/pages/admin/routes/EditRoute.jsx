import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Loader2,
  Save,
  Trash2,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";
import api from "@/utils/api";

const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  description: z.string().optional(),
  collector: z.string().min(1, "Collector is required"),
  zone: z.string().min(1, "Zone is required"),
  vehicle: z.string().optional(),
  vehicleCapacity: z.number().min(1, "Capacity must be greater than 0"),
  schedule: z.object({
    repeating: z.boolean(),
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "custom"]),
    days: z.array(z.string()),
    startTime: z.string(),
    endTime: z.string(),
  }),
  bins: z.array(
    z.object({
      bin: z.string(),
      order: z.number(),
      estimated_time: z.number(),
    })
  ).min(1, "At least one bin is required"),
  startLocation: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.string(),
  }),
  endLocation: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.string(),
  }),
});

const ZONES = [
  { value: "north", label: "North Zone" },
  { value: "south", label: "South Zone" },
  { value: "east", label: "East Zone" },
  { value: "west", label: "West Zone" },
  { value: "central", label: "Central Zone" },
];

const EditRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [collectors, setCollectors] = useState([]);
  const [availableBins, setAvailableBins] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      description: "",
      collector: "",
      zone: "",
      vehicle: "",
      vehicleCapacity: 1000,
      schedule: {
        repeating: false,
        frequency: "weekly",
        days: [],
        startTime: "08:00",
        endTime: "17:00",
      },
      bins: [],
      startLocation: {
        coordinates: [23.0225, 72.5714],
        address: "",
      },
      endLocation: {
        coordinates: [23.0225, 72.5714],
        address: "",
      },
    },
  });

  useEffect(() => {
    fetchRouteDetails();
    fetchCollectors();
    fetchAvailableBins();
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const response = await api.get(`/routes/${id}`);
      if (response.data.success) {
        const route = response.data.data;
        form.reset({
          name: route.name,
          description: route.description || "",
          collector: route.collector._id,
          zone: route.zone,
          vehicle: route.vehicle || "",
          vehicleCapacity: route.vehicleCapacity,
          schedule: route.schedule,
          bins: route.bins,
          startLocation: route.startLocation,
          endLocation: route.endLocation,
        });
        setSelectedBins(route.bins);
      }
    } catch (error) {
      toast.error("Failed to fetch route details");
      navigate("/admin/routes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectors = async () => {
    try {
      const response = await api.get("/users", {
        params: { role: "garbage_collector", isActive: true },
      });
      setCollectors(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch collectors");
    }
  };

  const fetchAvailableBins = async () => {
    try {
      const response = await api.get("/collections", {
        params: { status: "active" },
      });
      setAvailableBins(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch available bins");
    }
  };

  const addBin = (binId) => {
    const bin = availableBins.find((b) => b._id === binId);
    if (bin && !selectedBins.find((b) => b.bin === binId)) {
      const newBin = {
        bin: bin._id,
        order: selectedBins.length + 1,
        estimated_time: 5,
      };
      setSelectedBins([...selectedBins, newBin]);
      form.setValue("bins", [...selectedBins, newBin]);
    }
  };

  const removeBin = (index) => {
    const newBins = selectedBins.filter((_, i) => i !== index);
    setSelectedBins(newBins);
    form.setValue("bins", newBins);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/routes/${id}`);
      toast.success("Route deleted successfully");
      navigate("/admin/routes");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete route");
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/routes/${id}`, data);
      if (response.data.success) {
        toast.success("Route updated successfully");
        navigate(`/admin/routes/${id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update route");
    } finally {
      setSubmitting(false);
    }
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
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Route</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Route</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this route? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Route</CardTitle>
          <CardDescription>
            Modify route details and assignments
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter route name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ZONES.map((zone) => (
                              <SelectItem key={zone.value} value={zone.value}>
                                {zone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter route description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Assignment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Assignment Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="collector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Collector</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select collector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {collectors.map((collector) => (
                              <SelectItem
                                key={collector._id}
                                value={collector._id}
                              >
                                {collector.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter vehicle details"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Schedule</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="schedule.frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="schedule.startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schedule.endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bins Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Collection Points</h3>
                  <Select onValueChange={addBin}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Add bin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBins.map((bin) => (
                        <SelectItem key={bin._id} value={bin._id}>
                          #{bin.binId} - {bin.location.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBins.map((bin, index) => (
                      <TableRow key={bin.bin}>
                        <TableCell>
                          #{availableBins.find((b) => b._id === bin.bin)?.binId}
                        </TableCell>
                        <TableCell>
                          {
                            availableBins.find((b) => b._id === bin.bin)?.location
                              .address
                          }
                        </TableCell>
                        <TableCell>{bin.estimated_time} mins</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBin(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Changes to route assignments and schedules will affect the
                  collector's workflow.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default EditRoute;