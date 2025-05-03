import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  ChevronLeft,
  Loader2,
  Plus,
  Save,
  Trash2,
  MapPin,
  Clock,
  Calendar,
  Truck,
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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CreateRoute = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [collectors, setCollectors] = useState([]);
  const [availableBins, setAvailableBins] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);

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
        coordinates: [23.0225, 72.5714], // Default to Ahmedabad
        address: "",
      },
      endLocation: {
        coordinates: [23.0225, 72.5714],
        address: "",
      },
    },
  });

  useEffect(() => {
    fetchCollectors();
    fetchAvailableBins();
  }, []);

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
        params: { status: "active", assignedCollector: null },
      });
      setAvailableBins(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch available bins");
    }
  };

  const addBin = (binId) => {
    const bin = availableBins.find((b) => b._id === binId);
    if (bin) {
      setSelectedBins([
        ...selectedBins,
        {
          bin: bin._id,
          order: selectedBins.length + 1,
          estimated_time: 5,
        },
      ]);
      form.setValue("bins", selectedBins);
    }
  };

  const removeBin = (index) => {
    const newBins = selectedBins.filter((_, i) => i !== index);
    setSelectedBins(newBins);
    form.setValue("bins", newBins);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post("/routes", {
        ...data,
        plannedBy: "admin", // Will be replaced with actual admin ID
      });

      if (response.data.success) {
        toast.success("Route created successfully");
        navigate("/admin/routes");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Route</CardTitle>
          <CardDescription>
            Plan and create a new waste collection route
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
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Create Route
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateRoute;