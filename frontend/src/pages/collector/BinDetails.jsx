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
import { Progress } from "@/components/ui/progress";
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
import {
  Trash2,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Camera,
  FileText,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const reportSchema = z.object({
  fillLevel: z.number().min(0).max(100, "Fill level must be between 0 and 100"),
  status: z.enum(["collected", "pending", "skipped"]),
  notes: z.string().optional(),
  photos: z.array(z.any()).optional(),
  issueTags: z.array(z.string()).optional(),
});

const BinDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bin, setBin] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      fillLevel: 0,
      status: "collected",
      notes: "",
      issueTags: [],
    },
  });

  useEffect(() => {
    const fetchBinDetails = async () => {
      try {
        const response = await api.get(`/collections/${id}`);

        if (response.data.success) {
          setBin(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching bin details:", error);
        toast.error("Failed to load bin details");
      } finally {
        setLoading(false);
      }
    };

    fetchBinDetails();
  }, [id]);

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
    form.setValue("photos", [...selectedImages, ...newImages]);
  };

  const onSubmit = async (data) => {
    setIsSubmittingReport(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "photos") {
          selectedImages.forEach((image) => {
            formData.append("photos", image);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await api.post(`/reports/bin/${id}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Collection report submitted successfully");
        setIsReportDialogOpen(false);
        // Refresh bin details
        const updatedBin = await api.get(`/collections/${id}`).then((res) =>
          res.json()
        );
        setBin(updatedBin.data);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit collection report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bin) {
    return (
      <div className="container py-8">
        <Card className="text-center py-8">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Bin Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The waste bin you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/collector/routes")}>
              Back to Routes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Back Button */}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bin {bin.binId}</CardTitle>
              <CardDescription>Waste bin collection details</CardDescription>
            </div>
            <Badge
              variant={
                bin.status === "collected"
                  ? "success"
                  : bin.status === "overflow"
                    ? "destructive"
                    : "default"
              }
            >
              {bin.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Info */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <div className="pl-6 space-y-1">
              <p>{bin.location.address.street}</p>
              <p className="text-sm text-muted-foreground">
                {bin.location.address.area}, {bin.location.address.city}
              </p>
              {bin.location.address.landmark && (
                <p className="text-sm text-muted-foreground">
                  Landmark: {bin.location.address.landmark}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Status Info */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Current Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fill Level</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{bin.fillLevel}%</span>
                  </div>
                  <Progress value={bin.fillLevel} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Waste Type</p>
                <Badge variant="outline" className="capitalize">
                  {bin.wasteType}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p>{bin.capacity} liters</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge
                  variant={bin.priority >= 8 ? "destructive" : "secondary"}
                >
                  P{bin.priority}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Collection History */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Collection History
            </h3>
            {bin.collectionHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fill Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bin.collectionHistory.map((history, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {format(new Date(history.collectedAt), "PPp")}
                      </TableCell>
                      <TableCell>{history.fillLevel}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            history.status === "collected"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {history.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {history.notes || "No notes"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No collection history available
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/collector/routes/${bin.route}`)}
          >
            <MapPin className="mr-2 h-4 w-4" />
            View Route
          </Button>
          <Button onClick={() => setIsReportDialogOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Submit Collection Report
          </Button>
        </CardFooter>
      </Card>

      {/* Report Collection Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Collection Report</DialogTitle>
            <DialogDescription>
              Record the collection details for this bin
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the bin's fill level after collection
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="collected">Collected</SelectItem>
                        <SelectItem value="skipped">Skipped</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about the collection"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Photos</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                <FormDescription>
                  Upload up to 3 photos (max 5MB each)
                </FormDescription>
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            const newImages = [...selectedImages];
                            const newUrls = [...previewUrls];
                            URL.revokeObjectURL(newUrls[index]);
                            newImages.splice(index, 1);
                            newUrls.splice(index, 1);
                            setSelectedImages(newImages);
                            setPreviewUrls(newUrls);
                            form.setValue("photos", newImages);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReportDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingReport}>
                  {isSubmittingReport && (
                    <Loader2 className="mr-2 h-4 w-4 animate

-spin" />
                  )}
                  Submit Report
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BinDetails;