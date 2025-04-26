// import { useEffect, Suspense, lazy } from 'react';
// import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import { Toaster } from './components/ui/toaster';
// import { Loader } from './components/Loader';
// import Layout from './components/Layout';
// import ProtectedRoute from './components/ProtectedRoute';
// import RoleRoute from './components/RoleRoute';

// // Lazy loaded pages
// const Home = lazy(() => import('./pages/Home'));
// const Login = lazy(() => import('./pages/auth/Login'));
// const Register = lazy(() => import('./pages/auth/Register'));
// const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
// const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
// const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

// // Resident pages
// const ResidentDashboard = lazy(() => import('./pages/resident/Dashboard'));
// const ReportBin = lazy(() => import('./pages/resident/ReportBin'));
// const BinMap = lazy(() => import('./pages/resident/BinMap'));
// const RewardStore = lazy(() => import('./pages/resident/RewardStore'));
// const RewardDetails = lazy(() => import('./pages/resident/RewardDetails'));
// const RewardHistory = lazy(() => import('./pages/resident/RewardHistory'));
// const Leaderboard = lazy(() => import('./pages/resident/Leaderboard'));
// const SubmitFeedback = lazy(() => import('./pages/resident/SubmitFeedback'));

// // Collector pages
// const CollectorDashboard = lazy(() => import('./pages/collector/Dashboard'));
// const ActiveRoutes = lazy(() => import('./pages/collector/ActiveRoutes'));
// const RouteDetails = lazy(() => import('./pages/collector/RouteDetails'));
// const CollectionSchedule = lazy(() => import('./pages/collector/CollectionSchedule'));
// const BinDetails = lazy(() => import('./pages/collector/BinDetails'));
// const SubmitReport = lazy(() => import('./pages/collector/SubmitReport'));

// // Admin pages
// const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
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

// // Common pages
// const Profile = lazy(() => import('./pages/common/Profile'));
// const Notifications = lazy(() => import('./pages/common/Notifications'));
// const Settings = lazy(() => import('./pages/common/Settings'));
// const NotFound = lazy(() => import('./pages/NotFound'));

// function App() {
//   const { isAuthenticated, user, loading } = useAuth();
//   const location = useLocation();

//   useEffect(() => {
//     // Scroll to top on route change
//     window.scrollTo(0, 0);
//   }, [location.pathname]);

//   if (loading) {
//     return <Loader fullScreen />;
//   }

//   return (
//     <>
//       <Suspense fallback={<Loader fullScreen />}>
//         <Routes>
//           {/* Public routes */}
//           <Route path="/" element={<Home />} />
//           {/* <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
//           <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//           <Route path="/verify-email/:token" element={<VerifyEmail />} /> */}

//           {/* Protected routes */}
//           <Route element={<ProtectedRoute />}>
//             <Route element={<Layout />}>
//               {/* Dashboard redirect based on role */}
//               <Route path="/dashboard" element={
//                 user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
//                 user?.role === 'garbage_collector' ? <Navigate to="/collector/dashboard" /> :
//                 <Navigate to="/resident/dashboard" />
//               } />

//               {/* Common routes */}
//               <Route path="/profile" element={<Profile />} />
//               <Route path="/notifications" element={<Notifications />} />
//               <Route path="/settings" element={<Settings />} />

//               {/* Resident routes */}
//               <Route element={<RoleRoute allowedRoles={['resident']} />}>
//                 <Route path="/resident/dashboard" element={<ResidentDashboard />} />
//                 <Route path="/resident/report-bin" element={<ReportBin />} />
//                 {/* <Route path="/resident/bin-map" element={<BinMap />} />
//                 <Route path="/resident/rewards" element={<RewardStore />} />
//                 <Route path="/resident/rewards/:id" element={<RewardDetails />} />
//                 <Route path="/resident/reward-history" element={<RewardHistory />} />
//                 <Route path="/resident/leaderboard" element={<Leaderboard />} />
//                 <Route path="/resident/feedback" element={<SubmitFeedback />} /> */}
//               </Route>

//               {/* Collector routes */}
//               <Route element={<RoleRoute allowedRoles={['garbage_collector']} />}>
//                 <Route path="/collector/dashboard" element={<CollectorDashboard />} />
//                 {/* <Route path="/collector/routes" element={<ActiveRoutes />} />
//                 <Route path="/collector/routes/:id" element={<RouteDetails />} />
//                 <Route path="/collector/schedule" element={<CollectionSchedule />} />
//                 <Route path="/collector/bins/:id" element={<BinDetails />} />
//                 <Route path="/collector/submit-report/:binId" element={<SubmitReport />} /> */}
//               </Route>

//               {/* Admin routes */}
//               <Route element={<RoleRoute allowedRoles={['admin']} />}>
//                 <Route path="/admin/dashboard" element={<AdminDashboard />} />
//                 {/* <Route path="/admin/users" element={<UserManagement />} />
//                 <Route path="/admin/bins" element={<BinManagement />} />
//                 <Route path="/admin/routes" element={<RouteManagement />} />
//                 <Route path="/admin/schedules" element={<ScheduleManagement />} />
//                 <Route path="/admin/reports" element={<ReportManagement />} />
//                 <Route path="/admin/feedback" element={<FeedbackManagement />} />
//                 <Route path="/admin/rewards" element={<RewardManagement />} />
//                 <Route path="/admin/routes/create" element={<CreateRoute />} />
//                 <Route path="/admin/routes/edit/:id" element={<EditRoute />} />
//                 <Route path="/admin/bins/create" element={<CreateBin />} />
//                 <Route path="/admin/bins/edit/:id" element={<EditBin />} /> */}
//               </Route>
//             </Route>
//           </Route>

//           {/* 404 route */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Suspense>
//       <Toaster />
//     </>
//   );
// }

// export default App;



//===========================================//

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

const Temp = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/google/success" element={<GoogleAuthHandler />} />
        <Route path="/auth/google/error" element={<Navigate to="/login" />} />

        {/* Common Routes (Protected) */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />

        {/* Resident Routes */}
        <Route path="/resident">
          <Route path="dashboard" element={<ResidentDashboard />} />
          <Route path="report-bin" element={<ReportBin />} />
          <Route path="bin-map" element={<BinMap />} />
          <Route path="collections">
            <Route index element={<CollectionHistory />} />
            <Route path=":id" element={<CollectionDetails />} />
          </Route>
          <Route path="rewards">
            <Route index element={<RewardStore />} />
            <Route path=":id" element={<RewardDetails />} />
            <Route path="history" element={<RewardHistory />} />
          </Route>
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="feedback">
            <Route index element={<SubmitFeedback />} />
            <Route path="history" element={<FeedbackHistory />} />
          </Route>
          <Route path="schedule" element={<ResidentSchedule />} />
          <Route path="impact" element={<EnvironmentalImpact />} />
          <Route path="education" element={<WasteEducation />} />
        </Route>

        {/* Collector Routes */}
        <Route path="/collector">
          <Route path="dashboard" element={<CollectorDashboard />} />
          <Route path="routes">
            <Route index element={<ActiveRoutes />} />
            <Route path=":id" element={<RouteDetails />} />
            <Route path="history" element={<RouteHistory />} />
          </Route>
          <Route path="schedule">
            <Route index element={<CollectionSchedule />} />
            <Route path="calendar" element={<CollectorCalendar />} />
          </Route>
          <Route path="bins">
            <Route index element={<AssignedBins />} />
            <Route path=":id" element={<BinDetails />} />
            <Route path=":id/history" element={<BinCollectionHistory />} />
          </Route>
          <Route path="reports">
            <Route index element={<CollectorReports />} />
            <Route path="submit/:binId" element={<SubmitReport />} />
            <Route path="history" element={<ReportHistory />} />
          </Route>
          <Route path="performance" element={<CollectorPerformance />} />
          <Route path="safety" element={<SafetyGuidelines />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users">
            <Route index element={<UserManagement />} />
            <Route path="create" element={<CreateUser />} />
            <Route path=":id" element={<UserDetails />} />
            <Route path=":id/edit" element={<EditUser />} />
          </Route>
          <Route path="bins">
            <Route index element={<BinManagement />} />
            <Route path="create" element={<CreateBin />} />
            <Route path=":id" element={<AdminBinDetails />} />
            <Route path=":id/edit" element={<EditBin />} />
            <Route path="map" element={<BinLocationMap />} />
          </Route>
          <Route path="routes">
            <Route index element={<RouteManagement />} />
            <Route path="create" element={<CreateRoute />} />
            <Route path=":id" element={<AdminRouteDetails />} />
            <Route path=":id/edit" element={<EditRoute />} />
            <Route path="optimize" element={<RouteOptimization />} />
          </Route>
          <Route path="schedules">
            <Route index element={<ScheduleManagement />} />
            <Route path="create" element={<CreateSchedule />} />
            <Route path=":id/edit" element={<EditSchedule />} />
            <Route path="calendar" element={<ScheduleCalendar />} />
          </Route>
          <Route path="reports">
            <Route index element={<ReportManagement />} />
            <Route path=":id" element={<ReportDetails />} />
            <Route path="analytics" element={<ReportAnalytics />} />
          </Route>
          <Route path="feedback">
            <Route index element={<FeedbackManagement />} />
            <Route path=":id" element={<FeedbackDetails />} />
            <Route path="analytics" element={<FeedbackAnalytics />} />
          </Route>
          <Route path="rewards">
            <Route index element={<RewardManagement />} />
            <Route path="create" element={<CreateReward />} />
            <Route path=":id/edit" element={<EditReward />} />
            <Route path="analytics" element={<RewardAnalytics />} />
          </Route>
          <Route path="analytics">
            <Route index element={<SystemAnalytics />} />
            <Route path="waste" element={<WasteAnalytics />} />
            <Route path="performance" element={<PerformanceAnalytics />} />
            <Route path="user" element={<UserAnalytics />} />
          </Route>
          <Route path="settings">
            <Route index element={<SystemSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="api" element={<APISettings />} />
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default Temp