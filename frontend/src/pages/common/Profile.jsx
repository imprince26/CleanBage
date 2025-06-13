import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Camera,
  Shield,
  Award,
  Gift,
  Activity,
  Trash2,
  Calendar,
  AlertTriangle,
  Loader2,
  TreeDeciduous,
  Recycle,
  Trophy,
  Clock,
  Upload,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter valid phone number"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    area: z.string().min(1, "Area is required"),
    landmark: z.string().optional(),
    city: z.string().default("Jamnagar"),
    state: z.string().default("Gujarat"),
    postalCode: z.string().min(6, "Valid postal code required"),
  }),
  notification: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }),
});

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { getUserStats, uploadAvatar } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userStats, setUserStats] = useState(null);


  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: {
        street: user?.address?.street || "",
        area: user?.address?.area || "",
        landmark: user?.address?.landmark || "",
        city: user?.address?.city || "Ahmedabad",
        state: user?.address?.state || "Gujarat",
        postalCode: user?.address?.postalCode || "",
      },
      notification: {
        email: user?.notification?.email ?? true,
        push: user?.notification?.push ?? true,
      },
    },
  });

  // Fetch user stats on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      if (user?._id) {
        const stats = await getUserStats(user._id);
        if (stats) {
          setUserStats(stats);
        }
      }
    };
    fetchUserStats();
  }, [user?._id, getUserStats]);

  // Simulate upload progress
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    return interval;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image")) {
        toast.error("Please upload an image file");
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) {
      toast.error("Please select an image first");
      return;
    }
    setIsLoading(true);
    const progressInterval = simulateProgress();
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("avatar", avatar);
      await uploadAvatar(user._id, formData);
      setAvatar(null);
      setAvatarPreview(user?.avatar?.url);

      setUploadProgress(100);
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview !== user?.avatar?.url) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, user?.avatar?.url]);

  const achievements = [
    {
      title: "Eco Warrior",
      description: "Report waste bins consistently",
      progress: Math.min(100, ((userStats?.reportsCount || 0) / 100) * 100),
      icon: TreeDeciduous,
      color: "text-green-500",
      target: 100,
      current: userStats?.reportsCount || 0,
    },
    {
      title: "Recycling Champion",
      description: "Maintain high recycling rate",
      progress: Math.min(100, ((userStats?.totalWasteCollected || 0) / 1000) * 100),
      icon: Recycle,
      color: "text-blue-500",
      target: 1000,
      current: userStats?.totalWasteCollected || 0,
    },
    {
      title: "Streak Master",
      description: "Maintain reporting streak",
      progress: Math.min(100, ((user?.streakCount || 0) / 30) * 100),
      icon: Trophy,
      color: "text-yellow-500",
      target: 30,
      current: user?.streakCount || 0,
    },
  ];

  const activityStats = [
    {
      title: "Total Reports",
      value: userStats?.reportsCount || "0",
      change: userStats?.reportsChange || "+0%",
      icon: Activity,
    },
    {
      title: "Waste Collected",
      value: `${Math.round(userStats?.totalWasteCollected || 0)}kg`,
      change: userStats?.wasteChange || "+0%",
      icon: Trash2,
    },
    {
      title: "Reward Points",
      value: user?.rewardPoints || "0",
      change: userStats?.pointsChange || "+0%",
      icon: Gift,
    },
  ];

  return (
    <div className="container py-8 space-y-8">
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid md:max-w-2xl md:mx-auto w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Profile Overview */}
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3">
            <Card className="md:col-span-1 col-span-2 space-y-6">
              <CardHeader className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={avatarPreview || user?.avatar?.url || "/images/default-avatar.png"}
                    alt={user?.name}
                    className="rounded-full w-full h-full object-cover"
                  />
                  <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                          Choose a new avatar to represent your profile
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <img
                            src={avatarPreview || "/images/default-avatar.png"}
                            alt="Preview"
                            className="w-40 h-40 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Upload className="h-4 w-4" />
                            <span>Choose File</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </label>
                        </div>
                        {uploadProgress > 0 && (
                          <div className="space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-sm text-center text-muted-foreground">
                              {uploadProgress < 100
                                ? `Uploading: ${uploadProgress}%`
                                : "Upload Complete!"}
                            </p>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAvatarDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAvatarUpload} disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardTitle className="mt-4">{user?.name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                <Badge variant="outline" className="mt-2 capitalize">
                  {user?.role?.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {activityStats.map((stat) => (
                    <div key={stat.title} className="text-center">
                      <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                      <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.address?.street || "Address not set"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Security */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Account Security</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Two-Factor Auth</span>
                      </div>
                      <Badge variant="outline" className="text-yellow-500">
                        Coming Soon
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Last Login</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user?.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Cards */}
            <div className="col-span-2 md:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold">Recent Achievements</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => (
                  <Card key={achievement.title}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress.toPrecision(2)}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Address</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="address.street"
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
                        name="address.area"
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


                      <FormField
                        control={form.control}
                        name="address.landmark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landmark (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter nearest landmark" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.postalCode"
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
                    <h4 className="font-semibold">Notifications</h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="notification.email"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel>Email Notifications</FormLabel>
                              <FormDescription>
                                Receive updates and alerts via email
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
                        name="notification.push"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel>Push Notifications</FormLabel>
                              <FormDescription>
                                Receive instant updates on your device
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
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                Track your progress and unlock new achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {achievements.map((achievement) => (
                  <Card key={achievement.title}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress.toPrecision(2)}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;