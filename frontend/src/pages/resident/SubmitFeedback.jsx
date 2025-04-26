import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  MessageSquare,
  Upload,
  Star,
  Trash2,
  Loader2,
  Building2,
  Users,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";

// Form validation schema
const feedbackSchema = z.object({
  type: z.enum(["service", "app", "collector", "bin", "suggestion"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Feedback must be at least 10 characters"),
  isAnonymous: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  relatedTo: z.object({
    bin: z.string().optional(),
    collector: z.string().optional(),
  }).optional(),
});

const SubmitFeedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "service",
      title: "",
      rating: 5,
      comment: "",
      isAnonymous: false,
      isPublic: true,
      relatedTo: {},
    },
  });

  const feedbackTypes = [
    {
      value: "service",
      label: "General Service",
      icon: Building2,
      description: "Overall waste management service",
    },
    {
      value: "app",
      label: "Mobile App",
      icon: ThumbsUp,
      description: "App features and usability",
    },
    {
      value: "collector",
      label: "Waste Collector",
      icon: Users,
      description: "Specific collector feedback",
    },
    {
      value: "bin",
      label: "Waste Bin",
      icon: AlertTriangle,
      description: "Issues with specific bins",
    },
    {
      value: "suggestion",
      label: "Suggestion",
      icon: Lightbulb,
      description: "Ideas for improvement",
    },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
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

    setImages([...images, ...newImages]);
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "relatedTo") {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Feedback submitted successfully!");
        navigate("/feedback/history");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Submit Feedback</h1>
          <p className="text-muted-foreground">
            Help us improve our service with your feedback
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
          <CardDescription>
            Please provide detailed feedback to help us serve you better
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {feedbackTypes.find((t) => t.value === field.value)?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief title for your feedback" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <RadioGroup
                        className="flex gap-4"
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <FormItem
                            key={rating}
                            className="flex items-center space-x-2"
                          >
                            <FormControl>
                              <RadioGroupItem value={rating.toString()} />
                            </FormControl>
                            <Star
                              className={`h-5 w-5 ${
                                rating <= field.value
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed feedback..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="space-y-4">
                <FormLabel>Images (Optional)</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 rounded-lg overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Upload Image
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
                  Upload up to 3 images (max 5MB each)
                </FormDescription>
              </div>

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <FormLabel>Submit Anonymously</FormLabel>
                        <FormDescription>
                          Hide your identity from other users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <FormLabel>Make Public</FormLabel>
                        <FormDescription>
                          Allow other users to view your feedback
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitFeedback;