import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Clock,
  MapPin,
  ThermometerSun,
  Scale,
  AlertTriangle,
  User,
  Trash2,
  Star,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: "5",
    comment: "",
  });

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${id}`);
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
      toast.error(error.response?.data?.message || "Failed to load report details");
      navigate("/admin/reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      setSubmittingFeedback(true);
      const response = await api.post(`/reports/${id}/feedback`, feedback);
      if (response.data.success) {
        toast.success("Feedback submitted successfully");
        fetchReportDetails();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/reports/${id}`);
      if (response.data.success) {
        toast.success("Report deleted successfully");
        navigate("/admin/reports");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error(error.response?.data?.message || "Failed to delete report");
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "success",
      pending: "warning",
      delayed: "destructive",
      skipped: "secondary",
    };

    const icons = {
      completed: <CheckCircle2 className="h-4 w-4 mr-1" />,
      pending: <Clock className="h-4 w-4 mr-1" />,
      delayed: <AlertTriangle className="h-4 w-4 mr-1" />,
      skipped: <XCircle className="h-4 w-4 mr-1" />,
    };

    return (
      <Badge variant={variants[status]} className="flex items-center">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-8">
        <Card className="text-center py-8">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The report you're looking for might have been removed.
            </p>
            <Button onClick={() => navigate("/admin/reports")}>
              View All Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate("/admin/reports")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Collection Report</CardTitle>
              <CardDescription>
                Report ID: {report._id}
              </CardDescription>
            </div>
            {getStatusBadge(report.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Collection Date</p>
                <p className="font-medium">
                  {format(new Date(report.collectionDate), "PPp")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Collector</p>
                <div className="flex items-center gap-2">
                  {report.collector.avatar ? (
                    <img
                      src={report.collector.avatar.url}
                      alt={report.collector.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 p-2 bg-muted rounded-full" />
                  )}
                  <span className="font-medium">{report.collector.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Bin #{report.bin.binId}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.bin.location.address.street},
                      {report.bin.location.address.area}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Collection Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Collection Details</h3>

            {/* Fill Levels */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fill Level Before</p>
                <div className="flex items-center gap-2">
                  <Progress value={report.fillLevelBefore} className="flex-1" />
                  <span className="text-sm font-medium">
                    {report.fillLevelBefore}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fill Level After</p>
                <div className="flex items-center gap-2">
                  <Progress value={report.fillLevelAfter} className="flex-1" />
                  <span className="text-sm font-medium">
                    {report.fillLevelAfter}%
                  </span>
                </div>
              </div>
            </div>

            {/* Waste Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Waste Volume</p>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {report.wasteVolume} {report.wasteMeasurementUnit}
                  </span>
                </div>
              </div>

              {/* Weather Conditions */}
              {report.weather && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Weather</p>
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">
                      {report.weather.condition}
                      {report.weather.temperature &&
                        ` (${report.weather.temperature}°C)`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Waste Categories */}
            {report.wasteCategories && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Waste Categories</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(report.wasteCategories).map(
                    ([category, amount]) =>
                      amount > 0 && (
                        <div
                          key={category}
                          className="bg-muted p-3 rounded-lg space-y-1"
                        >
                          <p className="text-sm capitalize">{category}</p>
                          <p className="font-medium">
                            {amount} {report.wasteMeasurementUnit}
                          </p>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Issues & Maintenance */}
          {(report.issues || report.maintenanceNeeded) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Issues & Maintenance</h3>
              {report.issues && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Reported Issues</p>
                  <p className="bg-muted p-3 rounded-lg">{report.issues}</p>
                </div>
              )}
              {report.maintenanceNeeded && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Maintenance Details
                  </p>
                  <p className="bg-muted p-3 rounded-lg">
                    {report.maintenanceDetails}
                  </p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Photos */}
          {(report.photoBefore || report.photoAfter) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Collection Photos</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {report.photoBefore && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Before</p>
                    <img
                      src={report.photoBefore.url}
                      alt="Before collection"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  </div>
                )}
                {report.photoAfter && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">After</p>
                    <img
                      src={report.photoAfter.url}
                      alt="After collection"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Feedback Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Feedback</h3>
            {report.feedback ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(report.feedback.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Rated {report.feedback.rating}/5
                  </span>
                </div>
                {report.feedback.comment && (
                  <p className="bg-muted p-3 rounded-lg">
                    {report.feedback.comment}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  value={feedback.rating}
                  onValueChange={(value) =>
                    setFeedback((prev) => ({ ...prev, rating: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating !== 1 && "s"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Add feedback comments..."
                  value={feedback.comment}
                  onChange={(e) =>
                    setFeedback((prev) => ({ ...prev, comment: e.target.value }))
                  }
                />
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback}
                >
                  {submittingFeedback && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Feedback
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportDetails;