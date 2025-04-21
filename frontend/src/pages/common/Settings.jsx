import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader } from '../../components/common/Loader';
import { Bell, Moon, Sun, Smartphone } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import api from '../../utils/api';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    pushNotifications: user?.settings?.pushNotifications ?? true,
    collectionReminders: user?.settings?.collectionReminders ?? true,
    reportUpdates: user?.settings?.reportUpdates ?? true,
    rewardAlerts: user?.settings?.rewardAlerts ?? true,
  });
  const { toast } = useToast();

  const handleNotificationToggle = (setting) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put('/api/users/settings', {
        settings: {
          ...notificationSettings,
        },
      });

      if (response.data.success) {
        toast({
          title: 'Settings saved',
          description: 'Your notification settings have been updated',
          variant: 'success',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings');
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your application settings"
      />

      <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light and dark theme
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base" htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base" htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={() => handleNotificationToggle('pushNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base" htmlFor="collectionReminders">Collection Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders about upcoming waste collections
                    </p>
                  </div>
                  <Switch
                    id="collectionReminders"
                    checked={notificationSettings.collectionReminders}
                    onCheckedChange={() => handleNotificationToggle('collectionReminders')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base" htmlFor="reportUpdates">Report Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get updates on your submitted reports
                    </p>
                  </div>
                  <Switch
                    id="reportUpdates"
                    checked={notificationSettings.reportUpdates}
                    onCheckedChange={() => handleNotificationToggle('reportUpdates')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base" htmlFor="rewardAlerts">Reward Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new rewards and points earned
                    </p>
                  </div>
                  <Switch
                    id="rewardAlerts"
                    checked={notificationSettings.rewardAlerts}
                    onCheckedChange={() => handleNotificationToggle('rewardAlerts')}
                  />
                </div>
              </div>

              <Button onClick={saveNotificationSettings} disabled={loading}>
                {loading ? <Loader size="small" className="mr-2" /> : null}
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;