import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import { Loader } from './components/Loader';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
// const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
// const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
// const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

// Resident pages
const ResidentDashboard = lazy(() => import('./pages/resident/Dashboard'));
const ReportBin = lazy(() => import('./pages/resident/ReportBin'));
// const BinMap = lazy(() => import('./pages/resident/BinMap'));
const RewardStore = lazy(() => import('./pages/resident/RewardStore'));
// const RewardDetails = lazy(() => import('./pages/resident/RewardDetails'));
// const RewardHistory = lazy(() => import('./pages/resident/RewardHistory'));
// const Leaderboard = lazy(() => import('./pages/resident/Leaderboard'));
// const SubmitFeedback = lazy(() => import('./pages/resident/SubmitFeedback'));

// Collector pages
const CollectorDashboard = lazy(() => import('./pages/collector/Dashboard'));
// const ActiveRoutes = lazy(() => import('./pages/collector/ActiveRoutes'));
// const RouteDetails = lazy(() => import('./pages/collector/RouteDetails'));
// const CollectionSchedule = lazy(() => import('./pages/collector/CollectionSchedule'));
// const BinDetails = lazy(() => import('./pages/collector/BinDetails'));
// const SubmitReport = lazy(() => import('./pages/collector/SubmitReport'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
// const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
// const BinManagement = lazy(() => import('./pages/admin/BinManagement'));
// const RouteManagement = lazy(() => import('./pages/admin/RouteManagement'));
// const ScheduleManagement = lazy(() => import('./pages/admin/ScheduleManagement'));
// const ReportManagement = lazy(() => import('./pages/admin/ReportManagement'));
// const FeedbackManagement = lazy(() => import('./pages/admin/FeedbackManagement'));
// const RewardManagement = lazy(() => import('./pages/admin/RewardManagement'));
// const CreateRoute = lazy(() => import('./pages/admin/CreateRoute'));
// const EditRoute = lazy(() => import('./pages/admin/EditRoute'));
// const CreateBin = lazy(() => import('./pages/admin/CreateBin'));
// const EditBin = lazy(() => import('./pages/admin/EditBin'));

// Common pages
const Profile = lazy(() => import('./pages/common/Profile'));
const Notifications = lazy(() => import('./pages/common/Notifications'));
const Settings = lazy(() => import('./pages/common/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          {/* <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} /> */}

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard redirect based on role */}
              <Route path="/dashboard" element={
                user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
                user?.role === 'garbage_collector' ? <Navigate to="/collector/dashboard" /> :
                <Navigate to="/resident/dashboard" />
              } />

              {/* Common routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />

              {/* Resident routes */}
              <Route element={<RoleRoute allowedRoles={['resident']} />}>
                <Route path="/resident/dashboard" element={<ResidentDashboard />} />
                <Route path="/resident/report-bin" element={<ReportBin />} />
                {/* <Route path="/resident/bin-map" element={<BinMap />} />
                <Route path="/resident/rewards" element={<RewardStore />} />
                <Route path="/resident/rewards/:id" element={<RewardDetails />} />
                <Route path="/resident/reward-history" element={<RewardHistory />} />
                <Route path="/resident/leaderboard" element={<Leaderboard />} />
                <Route path="/resident/feedback" element={<SubmitFeedback />} /> */}
              </Route>

              {/* Collector routes */}
              <Route element={<RoleRoute allowedRoles={['garbage_collector']} />}>
                <Route path="/collector/dashboard" element={<CollectorDashboard />} />
                {/* <Route path="/collector/routes" element={<ActiveRoutes />} />
                <Route path="/collector/routes/:id" element={<RouteDetails />} />
                <Route path="/collector/schedule" element={<CollectionSchedule />} />
                <Route path="/collector/bins/:id" element={<BinDetails />} />
                <Route path="/collector/submit-report/:binId" element={<SubmitReport />} /> */}
              </Route>

              {/* Admin routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                {/* <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/bins" element={<BinManagement />} />
                <Route path="/admin/routes" element={<RouteManagement />} />
                <Route path="/admin/schedules" element={<ScheduleManagement />} />
                <Route path="/admin/reports" element={<ReportManagement />} />
                <Route path="/admin/feedback" element={<FeedbackManagement />} />
                <Route path="/admin/rewards" element={<RewardManagement />} />
                <Route path="/admin/routes/create" element={<CreateRoute />} />
                <Route path="/admin/routes/edit/:id" element={<EditRoute />} />
                <Route path="/admin/bins/create" element={<CreateBin />} />
                <Route path="/admin/bins/edit/:id" element={<EditBin />} /> */}
              </Route>
            </Route>
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;