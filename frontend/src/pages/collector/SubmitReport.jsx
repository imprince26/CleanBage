import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Trash2,
  Upload,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ThermometerSun,
  Scale,
  FileCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";

const reportSchema = z.object({
  fillLevelBefore: z.number().min(0).max(100),
  fillLevelAfter: z.number().min(0).max(100),
  wasteVolume: z.number().min(0, "Volume must be positive"),
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
    temperature: z.number().optional(),
  }),
});

const SubmitReport = () => {
  const { binId } = useParams();
  const navigate = useNavigate();
  const [bin, setBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      fillLevelBefore: 0,
      fillLevelAfter: 0,
      wasteVolume: 0,
      wasteCategories: {
        organic: 0,
        recyclable: 0,
        nonRecyclable: 0,
        hazardous: 0,
      },
      status: "completed",
      maintenanceNeeded: false,
      weather: {
        condition: "unknown",
        temperature: null,
      },
    },
  });

  useEffect(() => {
    const fetchBinDetails = async () => {
      try {
        const response = await fetch(`/api/collections/${binId}`);
        const data = await response.json();
        if (data.success) {
          setBin(data.data);
          form.setValue("fillLevelBefore", data.data.fillLevel);
        }
      } catch (error) {
        console.error("Error fetching bin details:", error);
        toast.error("Failed to load bin details");
      } finally {
        setLoading(false);
      }
    };

    fetchBinDetails();
  }, [binId]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }

      newImages.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedImages([...selectedImages, ...newImages]);
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "wasteCategories" || key === "weather") {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      selectedImages.forEach((image) => {
        formData.append("photos", image);
      });

      const response = await fetch(`/api/reports/bin/${binId}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Report submitted successfully");
        navigate(`/collector/bins/${binId}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
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
          <CardTitle>Submit Collection Report</CardTitle>
          <CardDescription>
            Record waste collection details for Bin #{bin?.binId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Fill Levels */}
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fillLevelBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Fill Level (%)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="fillLevelAfter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Fill Level (%)</FormLabel>
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

              <Separator />

              {/* Waste Details */}
              <div className="space-y-4">
                <h3 className="font-medium">Waste Details</h3>
                <FormField
                  control={form.control}
                  name="wasteVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Waste Volume (kg)</FormLabel>
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

                <div className="grid gap-4 md:grid-cols-2">
                  {Object.keys(form.getValues("wasteCategories")).map((category) => (
                    <FormField
                      key={category}
                      control={form.control}
                      name={`wasteCategories.${category}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">
                            {category} Waste (kg)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
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
                  ))}
                </div>
              </div>

              <Separator />

              {/* Collection Status */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Status</FormLabel>
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
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem value="skipped">Skipped</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issues (if any)</FormLabel>
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
              </div>

              <Separator />

              {/* Maintenance Check */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="maintenanceNeeded"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Maintenance Required</FormLabel>
                        <FormDescription>
                          Check if the bin needs maintenance or repairs
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
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Weather Conditions */}
              <div className="space-y-4">
                <h3 className="font-medium">Weather Conditions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="weather.condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weather</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Photos */}
              <div className="space-y-4">
                <FormLabel>Collection Photos</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const newImages = [...selectedImages];
                          const newUrls = [...previewUrls];
                          URL.revokeObjectURL(newUrls[index]);
                          newImages.splice(index, 1);
                          newUrls.splice(index, 1);
                          setSelectedImages(newImages);
                          setPreviewUrls(newUrls);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {previewUrls.length < 3 && (
                    <label className="border-2 border-dashed rounded-lg p-4 hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Upload Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <FormDescription>
                  Upload up to 3 photos (max 5MB each)
                </FormDescription>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubmitReport;