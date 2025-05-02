import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  AlertTriangle,
  Save,
} from "lucide-react";
import api from "@/utils/api";

// Form validation schema
const binSchema = z.object({
  location: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.object({
      street: z.string().min(1, "Street is required"),
      area: z.string().min(1, "Area is required"),
      landmark: z.string().optional(),
      city: z.string().min(1, "City is required"),
      postalCode: z.string().min(6, "Valid postal code required"),
    }),
  }),
  wasteType: z.enum(["organic", "recyclable", "hazardous", "mixed"]),
  capacity: z.number().min(1, "Capacity must be greater than 0"),
  status: z.enum(["active", "inactive", "maintenance"]),
  assignedCollector: z.string().optional(),
  priority: z.number().min(1).max(10),
});

const WASTE_TYPES = [
  { value: "organic", label: "Organic Waste" },
  { value: "recyclable", label: "Recyclable Waste" },
  { value: "hazardous", label: "Hazardous Waste" },
  { value: "mixed", label: "Mixed Waste" },
];

const BIN_STATUS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
];

const EditBin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [collectors, setCollectors] = useState([]);

  const form = useForm({
    resolver: zodResolver(binSchema),
    defaultValues: {
      location: {
        coordinates: [0, 0],
        address: {
          street: "",
          area: "",
          landmark: "",
          city: "Ahmedabad",
          postalCode: "",
        },
      },
      wasteType: "mixed",
      capacity: 100,
      status: "active",
      assignedCollector: "",
      priority: 5,
    },
  });

  useEffect(() => {
    fetchBinDetails();
    fetchCollectors();
  }, [id]);

  const fetchBinDetails = async () => {
    try {
      const response = await api.get(`/collections/${id}`);
      if (response.data.success) {
        const bin = response.data.data;
        form.reset({
          location: bin.location,
          wasteType: bin.wasteType,
          capacity: bin.capacity,
          status: bin.status,
          assignedCollector: bin.assignedCollector?._id || "",
          priority: bin.priority || 5,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch bin details");
      navigate("/admin/bins");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectors = async () => {
    try {
      const response = await api.get("/users/collectors");
      if (response.data.success) {
        setCollectors(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch collectors");
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/collections/${id}`, data);
      if (response.data.success) {
        toast.success("Bin updated successfully");
        navigate(`/admin/bins/${id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bin");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
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
          <CardTitle>Edit Bin</CardTitle>
          <CardDescription>
            Update waste bin information and settings
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Location Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.address.area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter area name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.address.landmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landmark (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter nearby landmark" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Bin Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bin Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wasteType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waste Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select waste type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WASTE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (Liters)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BIN_STATUS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level (1-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assignedCollector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Collector</FormLabel>
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
                          <SelectItem value="">Unassigned</SelectItem>
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
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Changes to bin location and status will affect ongoing collection
                  routes and schedules.
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

export default EditBin;