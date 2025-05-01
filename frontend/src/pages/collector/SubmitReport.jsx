import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress"; // Added for upload progress
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Trash2,
  ChevronLeft,
  Loader2,
  Camera,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

// Enhanced validation schema
const reportSchema = z.object({
  fillLevelBefore: z.number().min(0).max(100),
  fillLevelAfter: z.number().min(0).max(100),
  wasteVolume: z.number().min(0.01, "Waste volume must be greater than 0"),
  wasteMeasurementUnit: z.enum(["kg", "liters"]),
  wasteCategories: z.object({
    organic: z.number().min(0),
    recyclable: z.number().min(0),
    nonRecyclable: z.number().min(0),
    hazardous: z.number().min(0),
  }),
  status: z.enum(["completed", "delayed", "skipped"]),
  issues: z.string().optional(),
  maintenanceNeeded: z.boolean().default(false),
  maintenanceDetails: z.string().optional(),
  notes: z.string().optional(),
  weather: z.object({
    condition: z.enum([
      "sunny",
      "cloudy",
      "rainy",
      "stormy",
      "windy",
      "foggy",
      "unknown",
    ]),
    temperature: z.number().nullable(),
  }),
  locationConfirmed: z.boolean(),
  photoBefore: z.any().optional(),
  photoAfter: z.any().optional(),
});

const SubmitReport = () => {
  const { binId } = useParams();
  const navigate = useNavigate();
  const [bin, setBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoBefore, setPhotoBefore] = useState(null);
  const [photoAfter, setPhotoAfter] = useState(null);
  const [photoBeforePreview, setPhotoBeforePreview] = useState(null);
  const [photoAfterPreview, setPhotoAfterPreview] = useState(null);

  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      fillLevelBefore: 0,
      fillLevelAfter: 0,
      wasteVolume: 0,
      wasteMeasurementUnit: "kg",
      wasteCategories: {
        organic: 0,
        recyclable: 0,
        nonRecyclable: 0,
        hazardous: 0,
      },
      status: "completed",
      issues: "",
      maintenanceNeeded: false,
      maintenanceDetails: "",
      notes: "",
      weather: {
        condition: "unknown",
        temperature: null,
      },
      locationConfirmed: false,
      photoBefore: null,
      photoAfter: null,
    },
  });

  useEffect(() => {
    const fetchBinDetails = async () => {
      try {
        const response = await api.get(`/collections/${binId}`);
        if (response.data.success) {
          const binData = response.data.data;
          setBin(binData);
          form.setValue("fillLevelBefore", binData.fillLevel || 0);
          form.setValue("wasteMeasurementUnit", binData.wasteMeasurementUnit || "kg");
          if (binData.wasteType) {
            form.setValue(`wasteCategories.${binData.wasteType}`, 0);
          }
        }
      } catch (error) {
        console.error("Error fetching bin details:", error);
        toast.error("Failed to load bin details");
      } finally {
        setLoading(false);
      }
    };
    fetchBinDetails();
  }, [binId, form]);

  const handlePhotoChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      toast.error("Invalid image type. Please use JPG, JPEG or PNG");
      return;
    }

    if (type === "before") {
      setPhotoBefore(file);
      setPhotoBeforePreview(URL.createObjectURL(file));
      form.setValue("photoBefore", file);
    } else {
      setPhotoAfter(file);
      setPhotoAfterPreview(URL.createObjectURL(file));
      form.setValue("photoAfter", file);
    }
  };

  const removePhoto = (type) => {
    if (type === "before") {
      setPhotoBefore(null);
      if (photoBeforePreview) URL.revokeObjectURL(photoBeforePreview);
      setPhotoBeforePreview(null);
      form.setValue("photoBefore", null);
    } else {
      setPhotoAfter(null);
      if (photoAfterPreview) URL.revokeObjectURL(photoAfterPreview);
      setPhotoAfterPreview(null);
      form.setValue("photoAfter", null);
    }
  };

  const onSubmit = async (data) => {
    if (!data.locationConfirmed) {
      toast.error("Please confirm your location");
      return;
    }

    if (!data.photoBefore || !data.photoAfter) {
      toast.error("Both before and after photos are required");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Append photos first
      formData.append("photoBefore", data.photoBefore);
      formData.append("photoAfter", data.photoAfter);

      // Append bin reference
      formData.append("bin", binId);

      // Append all other form data
      Object.keys(data).forEach((key) => {
        if (key === "wasteCategories" || key === "weather") {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key !== "photoBefore" && key !== "photoAfter") {
          if (typeof data[key] === "boolean") {
            formData.append(key, data[key].toString());
          } else if (data[key] != null) {
            formData.append(key, data[key]);
          }
        }
      });

      const response = await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(Math.round(progress));
        },
      });

      if (response.data.success) {
        toast.success("Collection report submitted successfully");
        navigate(`/collector/bins/${binId}`);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
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
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Submit Collection Report</CardTitle>
          <CardDescription className="text-base">
            Record the collection details for bin #{bin?.binId}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle>Verification Required</AlertTitle>
            <AlertDescription>
              Please take clear photos before and after collection for verification purposes.
              This helps maintain service quality and transparency.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Photos Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Photo */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="photoBefore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo Before Collection</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {photoBeforePreview ? (
                              <div className="relative group">
                                <img
                                  src={photoBeforePreview}
                                  alt="Before collection"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removePhoto("before")}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Take Before Photo</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  Click to capture
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handlePhotoChange(e, "before")}
                                />
                              </label>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* After Photo */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="photoAfter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo After Collection</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {photoAfterPreview ? (
                              <div className="relative group">
                                <img
                                  src={photoAfterPreview}
                                  alt="After collection"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removePhoto("after")}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Take After Photo</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  Click to capture
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handlePhotoChange(e, "after")}
                                />
                              </label>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-8" />

              {/* Collection Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Collection Details</h3>
                
                {/* Fill Levels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fillLevelBefore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fill Level Before (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} disabled />
                        </FormControl>
                        <FormDescription>Auto-filled from bin data</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fillLevelAfter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fill Level After (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Waste Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="wasteVolume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waste Volume</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Total waste volume collected (kg or liters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wasteMeasurementUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Measurement Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="liters">Liters (L)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Waste Categories */}
                <div className="space-y-4">
                  <FormLabel>Waste Categories</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["organic", "recyclable", "nonRecyclable", "hazardous"].map((cat) => (
                      <FormField
                        key={cat}
                        control={form.control}
                        name={`wasteCategories.${cat}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="capitalize">{cat}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem value="skipped">Skipped</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-8" />

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                {/* Issues & Maintenance */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="issues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issues</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any issues encountered..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maintenanceNeeded"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Maintenance Required</FormLabel>
                          <FormDescription>
                            Check if this bin needs maintenance
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("maintenanceNeeded") && (
                    <FormField
                      control={form.control}
                      name="maintenanceDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe maintenance requirements..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Weather Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="weather.condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weather Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select weather" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sunny">Sunny</SelectItem>
                            <SelectItem value="cloudy">Cloudy</SelectItem>
                            <SelectItem value="rainy">Rainy</SelectItem>
                            <SelectItem value="stormy">Stormy</SelectItem>
                            <SelectItem value="windy">Windy</SelectItem>
                            <SelectItem value="foggy">Foggy</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weather.temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional details..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Confirmation */}
                <FormField
                  control={form.control}
                  name="locationConfirmed"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Location Confirmed</FormLabel>
                        <FormDescription>
                          I confirm that I am at the correct bin location
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              <Alert
                className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription>
                  Please ensure all information is accurate before submitting. This report cannot be modified after submission.
                </AlertDescription>
              </Alert>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={submitting}
            className="min-w-[120px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubmitReport;