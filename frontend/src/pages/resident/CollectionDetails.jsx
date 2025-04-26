import { useEffect, useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollection } from "@/context/CollectionContext";
import {
  MapPin,
  Calendar,
  Clock,
  Trash2,
  AlertTriangle,
  ImagePlus,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [complaintText, setComplaintText] = useState("");
  const [complaintImages, setComplaintImages] = useState([]);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const { getCollection, submitComplaint } = useCollection();

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = await getCollection(id);
        if (data) {
          setCollection(data);
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
        toast.error("Error fetching collection");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id, getCollection, toast]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setComplaintImages(files);
  };

  const handleSubmitComplaint = async () => {
    if (!complaintText.trim()) {
      toast.error("Please enter a complaint text");
      return;
    }

    setSubmittingComplaint(true);
    try {
      const formData = new FormData();
      formData.append("text", complaintText);
      complaintImages.forEach((image) => {
        formData.append("images", image);
      });

      // Submit complaint API call here
      await submitComplaint(id, formData);

      toast.success("Complaint submitted successfully");
      setComplaintText("");
      setComplaintImages([]);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Error submitting complaint");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!collection) {
    return (
      <div className="container max-w-3xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Bin Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The waste bin you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/resident/bin-map")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bin {collection.binId}</CardTitle>
              <CardDescription>
                View details and status of this waste bin
              </CardDescription>
            </div>
            <Badge
              variant={
                collection.status === "collected"
                  ? "success"
                  : collection.status === "overflow"
                  ? "destructive"
                  : "default"
              }
            >
              {collection.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Section */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Location
            </h3>
            <div className="pl-6 space-y-1">
              <p>{collection.location.address.street}</p>
              <p className="text-sm text-muted-foreground">
                {collection.location.address.area},{" "}
                {collection.location.address.city}
              </p>
              {collection.location.address.landmark && (
                <p className="text-sm text-muted-foreground">
                  Landmark: {collection.location.address.landmark}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Current Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fill Level</span>
                <span>{collection.fillLevel}%</span>
              </div>
              <Progress value={collection.fillLevel} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Waste Type</p>
                <Badge variant="outline">{collection.wasteType}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p>{collection.capacity} liters</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Collection Schedule */}
          <div className="space-y-4">
            <h3 className="font-semibold">Collection Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Frequency
                </div>
                <p className="capitalize">{collection.regularSchedule.frequency}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  Time Slot
                </div>
                <p className="capitalize">
                  {collection.regularSchedule.timeSlot}
                </p>
              </div>
            </div>
            {collection.regularSchedule.days.length > 0 && (
              <div className="flex gap-2">
                {collection.regularSchedule.days.map((day) => (
                  <Badge key={day} variant="outline">
                    {day}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Recent Collections */}
          {collection.collectionHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Recent Collections</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Fill Level</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collection.collectionHistory.map((history, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {format(new Date(history.collectedAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        {history.collectedBy ? history.collectedBy.name : "N/A"}
                      </TableCell>
                      <TableCell>{history.fillLevel}%</TableCell>
                      <TableCell>{history.notes || "No notes"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Submit Complaint */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Complaint</DialogTitle>
                <DialogDescription>
                  Report any issues with this waste bin. Add photos if available.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe the issue..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Add Photos (optional)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSubmitComplaint}
                  disabled={submittingComplaint}
                >
                  {submittingComplaint && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/resident/bin-map")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/resident/report-bin?binId=${collection._id}`)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Report Full
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CollectionDetails;