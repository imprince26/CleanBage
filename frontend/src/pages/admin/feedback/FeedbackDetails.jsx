import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Star,
  Building2,
  Users,
  AlertTriangle,
  Lightbulb,
  ChevronLeft,
  Trash2,
  Loader2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const FEEDBACK_TYPES = {
  service: { icon: Building2, label: "Service" },
  app: { icon: MessageSquare, label: "App" },
  collector: { icon: Users, label: "Collector" },
  bin: { icon: AlertTriangle, label: "Bin" },
  suggestion: { icon: Lightbulb, label: "Suggestion" },
};

const FeedbackDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchFeedbackDetails();
  }, [id]);

  const fetchFeedbackDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/feedback/${id}`);
      if (response.data.success) {
        setFeedback(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback details");
      navigate("/admin/feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/feedback/${id}/respond`, {
        comment: responseText,
      });

      if (response.data.success) {
        toast.success("Response submitted successfully");
        fetchFeedbackDetails();
        setResponseText("");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/feedback/${id}`);
      if (response.data.success) {
        toast.success("Feedback deleted successfully");
        navigate("/admin/feedback");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
    setShowDeleteDialog(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
      />
    ));
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      reviewed: "default",
      addressed: "success",
      archived: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
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

  if (!feedback) {
    return (
      <div className="container py-8">
        <Card className="text-center py-8">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Feedback Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The feedback you're looking for might have been removed.
            </p>
            <Button onClick={() => navigate("/admin/feedback")}>
              Back to Feedback List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate("/admin/feedback")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Feedback
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Feedback
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{feedback.title || "Untitled Feedback"}</CardTitle>
              <CardDescription>
                Feedback ID: {feedback._id}
              </CardDescription>
            </div>
            {getStatusBadge(feedback.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {feedback.user.avatar ? (
                <img
                  src={feedback.user.avatar.url}
                  alt={feedback.user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">
                {feedback.isAnonymous ? "Anonymous User" : feedback.user.name}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  {renderStars(feedback.rating)}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({feedback.rating}/5)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(feedback.createdAt), "PPpp")}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Feedback Type */}
          <div className="flex items-center gap-2">
            {(() => {
              const feedbackType = FEEDBACK_TYPES[feedback.type];
              if (feedbackType?.icon) {
                const Icon = feedbackType.icon;
                return (
                  <>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Feedback Type</p>
                      <p className="font-medium">{feedbackType.label}</p>
                    </div>
                  </>
                );
              }
              return (
                <div>
                  <p className="text-sm text-muted-foreground">Feedback Type</p>
                  <p className="font-medium">Unknown</p>
                </div>
              );
            })()}
          </div>

          {/* Feedback Content */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Feedback Details
              </h4>
              <p className="mt-2">{feedback.comment}</p>
            </div>

            {/* Images if any */}
            {feedback.images?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Attached Images
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {feedback.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Feedback image ${index + 1}`}
                      className="rounded-lg object-cover aspect-video w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Response Section */}
          {feedback.status === "pending" ? (
            <div className="space-y-4">
              <h4 className="font-medium">Respond to Feedback</h4>
              <Textarea
                placeholder="Type your response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleResponse} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit Response"
                )}
              </Button>
            </div>
          ) : (
            feedback.response && (
              <div className="space-y-2">
                <h4 className="font-medium">Admin Response</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p>{feedback.response.comment}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span>
                      Responded by {feedback.response.respondedBy.name}
                    </span>
                    <span>•</span>
                    <span>
                      {format(
                        new Date(feedback.response.respondedAt),
                        "PPp"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feedback? This action cannot be
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
              Delete Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackDetails;