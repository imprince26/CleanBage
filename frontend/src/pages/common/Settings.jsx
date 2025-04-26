import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Globe,
  MapPin,
  Volume2,
  Languages,
  Shield,
  Clock,
  Palette,
  Save,
  Radio,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

const Settings = () => {
  const { user, updateUserSettings } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: user?.notification?.email ?? true,
      push: user?.notification?.push ?? true,
      sound: true,
      collectionReminders: true,
      binUpdates: true,
      systemAnnouncements: true,
    },
    appearance: {
      theme: theme,
      language: "en",
      fontSize: "medium",
      colorScheme: "default",
    },
    privacy: {
      locationTracking: true,
      dataSharing: true,
      analytics: true,
    },
    preferences: {
      defaultView: "list",
      timeFormat: "12h",
      distanceUnit: "km",
      weightUnit: "kg",
    },
  });

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
      // Update theme if changed
      if (settings.appearance.theme !== theme) {
        setTheme(settings.appearance.theme);
      }
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your app experience and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you want to receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label>Email Notifications</Label>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", "email", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label>Push Notifications</Label>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", "push", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Label>Notification Sounds</Label>
                </div>
                <Switch
                  checked={settings.notifications.sound}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", "sound", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) =>
                    handleSettingChange("appearance", "theme", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) =>
                    handleSettingChange("appearance", "language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Control your data and privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Label>Location Tracking</Label>
                </div>
                <Switch
                  checked={settings.privacy.locationTracking}
                  onCheckedChange={(checked) =>
                    handleSettingChange("privacy", "locationTracking", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label>Data Sharing</Label>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) =>
                    handleSettingChange("privacy", "dataSharing", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Set your preferred display and measurement options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select
                  value={settings.preferences.timeFormat}
                  onValueChange={(value) =>
                    handleSettingChange("preferences", "timeFormat", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Distance Unit</Label>
                <Select
                  value={settings.preferences.distanceUnit}
                  onValueChange={(value) =>
                    handleSettingChange("preferences", "distanceUnit", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select distance unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">Kilometers</SelectItem>
                    <SelectItem value="mi">Miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;