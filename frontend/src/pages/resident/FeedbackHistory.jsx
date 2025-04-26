import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Star,
  Building2,
  Users,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Eye,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const FeedbackHistory = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const feedbackTypes = {
    service: { icon: Building2, label: "General Service" },
    app: { icon: ThumbsUp, label: "Mobile App" },
    collector: { icon: Users, label: "Waste Collector" },
    bin: { icon: AlertTriangle, label: "Waste Bin" },
    suggestion: { icon: Lightbulb, label: "Suggestion" },
  };

  const statusVariants = {
    pending: "default",
    reviewed: "warning",
    addressed: "success",
    archived: "secondary",
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch("/api/feedback/me");
        const data = await response.json();
        
        if (data.success) {
          setFeedbacks(data.data);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        toast.error("Failed to load feedback history");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Feedback History</h1>
          <p className="text-muted-foreground">
            Track your submitted feedback and responses
          </p>
        </div>
        <Button asChild>
          <Link to="/resident/feedback/new">
            <MessageSquare className="mr-2 h-4 w-4" />
            Submit New Feedback
          </Link>
        </Button>
      </div>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Feedback Yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              You haven't submitted any feedback yet. Share your thoughts to help us improve!
            </p>
            <Button asChild>
              <Link to="/resident/feedback/new">Submit Your First Feedback</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => {
            const TypeIcon = feedbackTypes[feedback.type]?.icon || MessageSquare;
            return (
              <Card key={feedback._id} className="group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <TypeIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold truncate">{feedback.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {feedbackTypes[feedback.type]?.label}
                          </p>
                        </div>
                        <Badge variant={statusVariants[feedback.status] || "default"}>
                          {feedback.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {renderStars(feedback.rating)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(feedback.createdAt), "PPp")}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {feedback.comment}
                      </p>
                      {feedback.response && (
                        <div className="mt-4 pl-4 border-l-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Admin Response</span>
                            <span className="text-muted-foreground">
                              ({format(new Date(feedback.response.respondedAt), "PP")})
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{feedback.response.comment}</p>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        className="mt-4"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Feedback Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedFeedback && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
              <DialogDescription>
                Submitted on {format(new Date(selectedFeedback.createdAt), "PPpp")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Rating</h4>
                <div className="flex items-center gap-1">
                  {renderStars(selectedFeedback.rating)}
                </div>
              </div>
              
              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Details</h4>
                <p className="text-sm">{selectedFeedback.comment}</p>
              </div>

              {selectedFeedback.images?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Attached Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedFeedback.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Feedback image ${index + 1}`}
                          className="rounded-lg object-cover aspect-video w-full"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedFeedback.response && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Admin Response</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(selectedFeedback.response.respondedAt), "PP")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{selectedFeedback.response.comment}</p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default FeedbackHistory;