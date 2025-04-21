import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/common/StatsCard';
import { Loader } from '../../components/common/Loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, Trash2, Route, Calendar, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBins: 0,
    totalRoutes: 0,
    pendingReports: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [collectors, setCollectors] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard data
        const [usersRes, binsRes, routesRes, reportsRes, collectorsRes] = await Promise.all([
          api.get('/api/users?limit=1'),
          api.get('/api/collections?limit=1'),
          api.get('/api/routes?limit=1'),
          api.get('/api/collections?status=reported&limit=5'),
          api.get('/api/users?role=garbage_collector&limit=5'),
        ]);

        // Update stats
        setStats({
          totalUsers: usersRes.data.total || 0,
          totalBins: binsRes.data.total || 0,
          totalRoutes: routesRes.data.total || 0,
          pendingReports: reportsRes.data.total || 0,
        });

        // Update lists
        setRecentReports(reportsRes.data.data || []);
        setCollectors(collectorsRes.data.data || []);

        // Fetch active routes
        const activeRoutesRes = await api.get('/api/routes?status=in_progress&limit=5');
        setActiveRoutes(activeRoutesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        title="Admin Dashboard"
        description="Overview of the waste management system"
        actionLabel="Create Route"
        actionOnClick={() => window.location.href = '/admin/routes/create'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Bins"
          value={stats.totalBins}
          icon={<Trash2 className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Routes"
          value={stats.totalRoutes}
          icon={<Route className="h-4 w-4" />}
        />
        <StatsCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={stats.pendingReports > 5 ? 'up' : 'down'}
          trendValue={stats.pendingReports > 5 ? 'High' : 'Low'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Recently reported bins that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending reports at the moment.
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
                          <span className="px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive">
                            Reported
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Reported on {formatDate(report.reportedAt)}
                        </p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <Link to={`/admin/bins/edit/${report._id}`}>
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
              <Link to="/admin/bins?status=reported">
                View All Reports
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
            <CardDescription>
              Currently active collection routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRoutes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No active routes at the moment.
              </p>
            ) : (
              <div className="space-y-4">
                {activeRoutes.map((route) => (
                  <div key={route._id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Route className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Route #{route._id.toString().slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {route.collector?.name || 'Unassigned'} • {route.bins.length} bins
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            In Progress
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Started {route.startedAt ? formatDate(route.startedAt) : 'N/A'}
                        </p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <Link to={`/admin/routes/edit/${route._id}`}>
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
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/admin/routes">
                View All Routes
              </Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link to="/admin/routes/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Route
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Garbage Collectors</CardTitle>
          <CardDescription>
            Overview of garbage collectors and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collectors.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No garbage collectors registered in the system.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Routes Completed</th>
                    <th className="text-left py-3 px-4 font-medium">Bins Collected</th>
                    <th className="text-left py-3 px-4 font-medium">Last Active</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collectors.map((collector) => (
                    <tr key={collector._id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-foreground font-medium">
                            {collector.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{collector.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          collector.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          {collector.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{collector.stats?.routesCompleted || 0}</td>
                      <td className="py-3 px-4">{collector.stats?.binsCollected || 0}</td>
                      <td className="py-3 px-4">{collector.lastActive ? formatDate(collector.lastActive) : 'Never'}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/users/edit/${collector._id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/admin/users?role=garbage_collector">
              View All Collectors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;