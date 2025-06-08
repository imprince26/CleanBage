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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Bell,
  Shield,
  User,
  AlertTriangle,
  Loader2,
  KeyRound,
  LogOut
} from "lucide-react";
import { toast } from "react-hot-toast";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
import api from "@/utils/api";

// const passwordSchema = z.object({
//   currentPassword: z.string().min(6, "Current password is required"),
//   newPassword: z.string().min(6, "Password must be at least 6 characters"),
//   confirmPassword: z.string()
// }).refine((data) => data.newPassword === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

const Settings = () => {
  const { user, logout, updateUserSettings } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    notifications: {
      email: user?.notification?.email ?? true,
      important: true,
      collectionReminders: true,
      binUpdates: true,
      systemAnnouncements: true,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
    }
  });

  // const passwordForm = useForm({
  //   resolver: zodResolver(passwordSchema),
  //   defaultValues: {
  //     currentPassword: "",
  //     newPassword: "",
  //     confirmPassword: ""
  //   }
  // });

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await updateUserSettings(settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  // const onPasswordSubmit = async (data) => {
  //   try {
  //     await api.put("/auth/updatepassword", {
  //       currentPassword: data.currentPassword,
  //       newPassword: data.newPassword
  //     });
  //     toast.success("Password updated successfully");
  //     setShowPasswordDialog(false);
  //     passwordForm.reset();
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to update password");
  //   }
  // };

  const handleDeactivateAccount = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      try {
        await api.delete("/auth/me");
        toast.success("Account deactivated successfully");
        logout();
      } catch (error) {
        toast.error("Failed to deactivate account");
      }
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your basic account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <p className="text-sm font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control what notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", "email", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label>Collection Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming collections
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.collectionReminders}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", "collectionReminders", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label>Bin Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates about bin status changes
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.binUpdates}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", "binUpdates", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                  {/* <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <KeyRound className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                              {passwordForm.formState.isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Password"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog> */}
                  <Button variant="outline" onClick={ () => navigate('/forgot-password')} >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Login Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.loginAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("security", "loginAlerts", checked)
                    }
                  />
                </div>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  Once you deactivate your account, there is no going back.
                </AlertDescription>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={handleDeactivateAccount}
                >
                  Deactivate Account
                </Button>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full md:w-auto"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save Changes</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;