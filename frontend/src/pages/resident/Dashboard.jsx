import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/common/StatsCard';
import { Loader } from '../../components/common/Loader';
import { MapPin, Trash2, Award, Gift, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentLocation, getCurrentLocation } = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reportsSubmitted: 0,
    rewardPoints: user?.rewardPoints || 0,
    rewardsRedeemed: 0,
    nearbyBins: 0,
  });
  const [nearbyBins, setNearbyBins] = useState([]);
  const [upcomingCollections, setUpcomingCollections] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get current location
        if (!currentLocation) {
          getCurrentLocation();
        }

        // Fetch dashboard data
        const [reportsRes, nearbyBinsRes, collectionsRes] = await Promise.all([
          api.get('/api/collections?reporter=' + user._id + '&limit=5'),
          api.get('/api/collections/nearby?limit=5'),
          api.get('/api/schedules?limit=3'),
        ]);

        // Update stats
        setStats({
          reportsSubmitted: reportsRes.data.total || 0,
          rewardPoints: user.rewardPoints || 0,
          rewardsRedeemed: 0, // This would come from a rewards API
          nearbyBins: nearbyBinsRes.data.count || 0,
        });

        // Update lists
        setNearbyBins(nearbyBinsRes.data.data || []);
        setUpcomingCollections(collectionsRes.data.data || []);
        setRecentReports(reportsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user._id, currentLocation]);

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
        description="View your waste management dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Reports Submitted"
          value={stats.reportsSubmitted}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatsCard
          title="Reward Points"
          value={stats.rewardPoints}
          icon={<Award className="h-4 w-4" />}
        />
        <StatsCard
          title="Rewards Redeemed"
          value={stats.rewardsRedeemed}
          icon={<Gift className="h-4 w-4" />}
        />
        <StatsCard
          title="Nearby Bins"
          value={stats.nearbyBins}
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nearby Bins</CardTitle>
            <CardDescription>
              Waste bins in your vicinity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nearbyBins.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No bins found nearby. Try updating your location.
              </p>
            ) : (
              <div className="space-y-4">
                {nearbyBins.map((bin) => (
                  <div key={bin._id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{bin.binId}</p>
                          <p className="text-sm text-muted-foreground">
                            {bin.location.address || 'No address available'}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            bin.status === 'full' ? 'bg-destructive/10 text-destructive' :
                            bin.status === 'collected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {bin.distance ? `${bin.distance.toFixed(1)} km away` : 'Distance unknown'}
                        </p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <Link to={`/resident/report-bin?binId=${bin._id}`}>
                            Report
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
              <Link to="/resident/bin-map">
                View All Bins
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Collections</CardTitle>
            <CardDescription>
              Scheduled waste collections in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingCollections.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming collections scheduled.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingCollections.map((collection) => (
                  <div key={collection._id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{collection.title || 'Scheduled Collection'}</p>
                          <p className="text-sm text-muted-foreground">
                            {collection.area || 'Your area'}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                            {collection.type || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(collection.scheduledDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              View Collection Schedule
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Recent Reports</CardTitle>
            <CardDescription>
              Bins you've recently reported
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                You haven't reported any bins yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report._id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{report.binId}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.location?.address || 'No address available'}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Reported on {formatDate(report.reportedAt)}
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
              <Link to="/resident/report-bin">
                Report a Bin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
            <CardDescription>
              Your reward points and available rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold">{stats.rewardPoints}</h3>
                <p className="text-sm text-muted-foreground">Available Points</p>
              </div>
              <p className="text-sm text-center max-w-xs">
                Earn points by reporting bins and participating in clean-up activities. Redeem points for exciting rewards!
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/resident/rewards">
                View Rewards
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