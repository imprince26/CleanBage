import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import * as z from "zod";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Info,
  MapPin,
  Loader2,
  Navigation,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCollection } from "@/context/CollectionContext";

const reportSchema = z.object({
  location: z.object({
    coordinates: z.array(z.number()).length(2, "Coordinates must contain longitude and latitude"),
    address: z.object({
      street: z.string().min(1, "Street is required"),
      area: z.string().min(1, "Area is required"),
      landmark: z.string().optional(),
      city: z.string().default("Jamnagar"),
      postalCode: z.string().min(6, "Valid postal code required"),
    }),
  }),
  wasteType: z.enum(["organic", "recyclable", "non-recyclable", "hazardous", "mixed"]),
  fillLevel: z.number().min(0).max(100).optional(),
  capacity: z.number().min(0).optional(),
  notes: z.string().optional(),
  regularSchedule: z
    .object({
      frequency: z
        .enum(["daily", "alternate", "weekly", "biweekly", "monthly", "custom"])
        .default("weekly"),
      days: z.array(z.string()).optional(),
      timeSlot: z.string().default("morning"),
    })
    .optional(),
  images: z.array(z.any()).optional(),
});

const WASTE_TYPES = [
  {
    value: "organic",
    label: "Organic Waste",
    description: "Food waste, garden waste, biodegradable items",
    color: "bg-green-500",
  },
  {
    value: "recyclable",
    label: "Recyclable Waste",
    description: "Paper, plastic, glass, metal",
    color: "bg-blue-500",
  },
  {
    value: "non-recyclable",
    label: "Non-Recyclable",
    description: "Items that cannot be recycled",
    color: "bg-gray-500",
  },
  {
    value: "hazardous",
    label: "Hazardous Waste",
    description: "Batteries, chemicals, medical waste",
    color: "bg-red-500",
  },
  {
    value: "mixed",
    label: "Mixed Waste",
    description: "Combination of different waste types",
    color: "bg-purple-500",
  },
];

const SCHEDULE_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "alternate", label: "Alternate Days" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom Schedule" },
];

const TIME_SLOTS = [
  { value: "morning", label: "Morning (6 AM - 10 AM)" },
  { value: "afternoon", label: "Afternoon (11 AM - 3 PM)" },
  { value: "evening", label: "Evening (4 PM - 8 PM)" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ReportBin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [locationAddress, setLocationAddress] = useState(null);
  const [nearbyBins, setNearbyBins] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const {createCollection} = useCollection();

  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      location: {
        coordinates: [0, 0],
        address: {
          street: "",
          area: "",
          landmark: "",
          city: "Jamnagar",
          postalCode: "",
        },
      },
      wasteType: "mixed",
      fillLevel: 50,
      capacity: 100,
      notes: "",
      regularSchedule: {
        frequency: "weekly",
        days: [],
        timeSlot: "morning",
      },
      images: [],
    },
  });

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const coordinates = [longitude, latitude];
      form.setValue("location.coordinates", coordinates);
      await getAddressFromCoordinates(latitude, longitude);
      toast.success("Location obtained successfully");
    } catch (error) {
      let errorMessage = "Failed to get location";
      if (error.code === 1) {
        errorMessage = "Location access denied. Please enable location services";
      } else if (error.code === 2) {
        errorMessage = "Location unavailable. Please try again";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again";
      }
      toast.error(errorMessage);
      console.error("Location error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      if (!response.ok) throw new Error("Failed to fetch address");

      const data = await response.json();

      const address = {
        street: data.address.road || data.address.street || "",
        area: data.address.suburb || data.address.neighbourhood || "",
        landmark: data.address.landmark || "",
        city: "Jamnagar",
        postalCode: data.address.postcode || "",
      };

      setLocationAddress(data.display_name);
      form.setValue("location.address", address);

      await checkNearbyBins(latitude, longitude);
    } catch (error) {
      console.error("Error getting address:", error);
      toast.error("Failed to get address details. Please enter manually");
    }
  };

  const checkNearbyBins = async (latitude, longitude) => {
    try {
      const response = await api.get("/collections/nearby", {
        params: {
          longitude,
          latitude,
          distance: 1000,
          wasteType: form.getValues("wasteType"),
        },
      });

      const bins = response.data.data;
      setNearbyBins(bins);

      if (bins.length > 0) {
        toast.custom(
          (t) => (
            <div className="bg-background border rounded-lg p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Nearby Bins Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Found {bins.length} bins within 1km. Please check if your bin is already reported.
                  </p>
                  <Button
                    variant="link"
                    className="px-0 text-primary"
                    onClick={() => navigate("/resident/bin-map")}
                  >
                    View on Map
                  </Button>
                </div>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Error checking nearby bins:", error);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    if (files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    const validFiles = [];
    const validUrls = [];

    for (const file of files) {
      try {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max size is 5MB`);
          continue;
        }

        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        const url = URL.createObjectURL(file);
        validUrls.push(url);
        validFiles.push(file);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    console.log('Valid files:', validFiles); // Debug: Log valid files
    setSelectedImages(validFiles);
    setPreviewUrls(validUrls);
    form.setValue("images", validFiles);
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setUploadProgress(0);
    try {
      if (data.location.coordinates[0] === 0 && data.location.coordinates[1] === 0) {
        toast.error("Please provide valid location coordinates");
        setIsLoading(false);
        return;
      }
  
      const formData = new FormData();
      
      // Properly append all selected images
      if (selectedImages && selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
      }
  
      formData.append("location", JSON.stringify(data.location));
      formData.append("wasteType", data.wasteType);
      formData.append("fillLevel", data.fillLevel.toString());
      formData.append("capacity", data.capacity.toString());
      if (data.notes) formData.append("notes", data.notes);
      formData.append(
        "regularSchedule",
        JSON.stringify({
          frequency: data.regularSchedule.frequency,
          days: data.regularSchedule.days,
          timeSlot: data.regularSchedule.timeSlot,
        })
      );

      const response = await createCollection(formData);

      toast.success("Report submitted successfully!");
      form.reset();
      setSelectedImages([]);
      setPreviewUrls([]);
      setLocationAddress(null);
      setNearbyBins([]);
      setUploadProgress(0);
      // navigate(`/resident/collections/${response}`);
    } catch (error) {
      console.error("Error reporting bin:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to report bin";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Waste Bin</CardTitle>
          <CardDescription>
            Help keep our city clean by reporting waste bins that need attention. You'll earn reward
            points for accurate reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Please ensure you are at the bin location when reporting. Accurate reporting helps us
              maintain efficiency and earns you more reward points.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Location Details</h3>
                    {locationAddress && (
                      <p className="text-sm text-muted-foreground mt-1">{locationAddress}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="mr-2 h-4 w-4" />
                    )}
                    Get Current Location
                  </Button>
                </div>

                {nearbyBins.length > 0 && (
                  <ScrollArea className="h-[100px] rounded-md border p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Nearby Bins:</h4>
                      {nearbyBins.map((bin) => (
                        <div key={bin._id} className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>
                            Bin {bin.binId} - {bin.location.address.street}
                          </span>
                          <Badge variant="outline">{bin.wasteType}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

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

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Waste Details</h3>

                <FormField
                  control={form.control}
                  name="wasteType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select waste type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WASTE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${type.color}`} />
                                <div className="flex flex-col">
                                  <span>{type.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {type.description}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fillLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fill Level (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Enter fill level"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Estimate how full the bin is (0-100%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bin Capacity (Liters)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Enter bin capacity"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Collection Schedule</h3>

                <FormField
                  control={form.control}
                  name="regularSchedule.frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SCHEDULE_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
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
                  name="regularSchedule.timeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time Slot</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("regularSchedule.frequency") === "custom" && (
                  <FormField
                    control={form.control}
                    name="regularSchedule.days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Days</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {DAYS.map((day) => (
                            <Badge
                              key={day}
                              variant={field.value?.includes(day) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                const days = field.value || [];
                                const newDays = days.includes(day)
                                  ? days.filter((d) => d !== day)
                                  : [...days, day];
                                field.onChange(newDays);
                              }}
                            >
                              {day}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional information about the bin"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Images (Up to 3)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormDescription>Upload up to 3 images of the bin (Max 5MB each)</FormDescription>
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="rounded-md object-cover h-24 w-full"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newImages = [...selectedImages];
                              const newUrls = [...previewUrls];
                              URL.revokeObjectURL(newUrls[index]);
                              newImages.splice(index, 1);
                              newUrls.splice(index, 1);
                              setSelectedImages(newImages);
                              setPreviewUrls(newUrls);
                              form.setValue("images", newImages);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormItem>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}