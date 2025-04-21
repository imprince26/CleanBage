import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/common/StatsCard';
import { Loader } from '../../components/common/Loader';
import { MapPin, Truck, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentLocation, getCurrentLocation, watchLocation, stopWatchingLocation } = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    routesCompleted: 0,
    binsCollected: 0,
    upcomingRoutes: 0,
    activeRoutes: 0,
  });
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get current location
        if (!currentLocation) {
          getCurrentLocation();
        }

        // Fetch dashboard data
        const [routesRes, schedulesRes, statsRes] = await Promise.all([
          api.get('/api/routes/collector/active'),
          api.get('/api/schedules/collector/upcoming'),
          api.get('/api/users/' + user._id + '/stats'),
        ]);

        // Update stats
        setStats({
          routesCompleted: statsRes.data.data.routesCompleted || 0,
          binsCollected: statsRes.data.data.binsCollected || 0,
          upcomingRoutes: schedulesRes.data.count || 0,
          activeRoutes: routesRes.data.count || 0,
        });

        // Update lists
        setActiveRoutes(routesRes.data.data || []);
        setUpcomingSchedules(schedulesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      // Clean up location tracking
      stopWatchingLocation();
    };
  }, [user._id]);

  const toggleLocationTracking = () => {
    if (isTracking) {
      stopWatchingLocation();
    } else {
      watchLocation();
    }
    setIsTracking(!isTracking);
  };

  const updateCollectorLocation = async () => {
    if (!currentLocation) {
      return;
    }

    try {
      await api.put('/api/users/' + user._id + '/location', {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Update location when tracking is enabled
  useEffect(() => {
    if (isTracking && currentLocation) {
      updateCollectorLocation();
    }
  }, [isTracking, currentLocation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="View your collection dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Routes Completed"
          value={stats.routesCompleted}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatsCard
          title="Bins Collected"
          value={stats.binsCollected}
          icon={<Truck className="h-4 w-4" />}
        />
        <StatsCard
          title="Upcoming Routes"
          value={stats.upcomingRoutes}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard
          title="Active Routes"
          value={stats.activeRoutes}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Tracking</CardTitle>
            <CardDescription>
              Enable location tracking while on duty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isTracking ? 'Location tracking is active' : 'Location tracking is disabled'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isTracking 
                    ? 'Your location is being shared with the system' 
                    : 'Enable tracking to share your location with the system'}
                </p>
              </div>
              <Button 
                variant={isTracking ? "destructive" : "default"}
                onClick={toggleLocationTracking}
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Button>
            </div>
            {currentLocation && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-xs text-muted-foreground">
                  Latitude: {currentLocation.latitude.toFixed(6)}, 
                  Longitude: {currentLocation.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accuracy: {currentLocation.accuracy ? `±${Math.round(currentLocation.accuracy)}m` : 'Unknown'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
            <CardDescription>
              Routes assigned to you today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRoutes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No active routes assigned to you.
              </p>
            ) : (
              <div className="space-y-4">
                {activeRoutes.map((route) => (
                  <div key={route._id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Route #{route._id.toString().slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {route.bins.length} bins to collect
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            route.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            route.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {route.status.replace('_', ' ').charAt(0).toUpperCase() + route.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(route.date)}
                        </p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <Link to={`/collector/routes/${route._id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/collector/routes">
                View All Routes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>
              Your upcoming collection schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming schedules assigned to you.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingSchedules.map((schedule) => (
                  <div key={schedule._id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{schedule.title || 'Collection Schedule'}</p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.area || 'Assigned area'}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                            {schedule.type || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(schedule.scheduledDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/collector/schedule">
                View Full Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;