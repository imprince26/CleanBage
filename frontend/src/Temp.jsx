import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import Layout from './components/Layout'

import Home from './pages/public/Home'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Services from './pages/public/Services'
import FAQ from './pages/public/FAQ'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsOfService from './pages/public/TermsOfService'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import GoogleCallback from '@/components/GoogleCallBack'
import GoogleAuthHandler from '@/components/GoogleAuthHandler'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'


import Profile from './pages/common/Profile'
import Notifications from './pages/common/Notifications'
import Settings from './pages/common/Settings'
import Help from './pages/common/Help'


import ErrorPage from './pages/error/ErrorPage'
import MaintenancePage from './pages/error/MaintenancePage'
import NotFound from './pages/error/NotFound'


import ReportBin from './pages/resident/ReportBin'
import CollectionDetails from './pages/resident/CollectionDetails'
import CollectionHistory from './pages/resident/CollectionHistory'
import BinMap from './pages/resident/BinMap'
import ResidentDashboard from './pages/resident/ResidentDashboard'
import RewardStore from './pages/resident/RewardStore'
import RewardDetails from './pages/resident/RewardDetails'
import RewardHistory from './pages/resident/RewardHistory'
import Leaderboard from './pages/resident/Leaderboard'
import SubmitFeedback from './pages/resident/SubmitFeedback'
import FeedbackHistory from './pages/resident/FeedbackHistory'
import ResidentSchedule from './pages/resident/ResidentSchedule'
import WasteEducation from './pages/resident/WasteEducation'
import EnvironmentalImpact from './pages/resident/EnvironmentalImpact'


import CollectorDashboard from './pages/collector/CollectorDashboard'
import ActiveRoutes from './pages/collector/ActiveRoutes'
import RouteDetails from './pages/collector/RouteDetails'
import CollectionSchedule from './pages/collector/CollectionSchedule'
import BinDetails from './pages/collector/BinDetails'
import SubmitReport from './pages/collector/SubmitReport'
import ReportHistory from './pages/collector/ReportHistory'
import CollectorReports from './pages/collector/CollectorReports'
import RouteHistory from './pages/collector/RouteHistory'
import AssignedBins from './pages/collector/AssignedBins'
import CollectorCalendar from './pages/collector/CollectorCalendar'
import SafetyGuidelines from './pages/collector/SafetyGuidelines'
import CollectorPerformance from './pages/collector/CollectorPerformance'
import BinCollectionHistory from './pages/collector/BinCollectionHistory'


import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/users/UserManagement'
import CreateUser from './pages/admin/users/CreateUser'
import UserDetails from './pages/admin/users/UserDetails'
import EditUser from './pages/admin/users/EditUser'
import BinManagement from './pages/admin/bins/BinManagement'
import CreateBin from './pages/admin/bins/CreateBin'
import AdminBinDetails from './pages/admin/bins/AdminBinDetails'
import EditBin from './pages/admin/bins/EditBin'
import BinLocationMap from './pages/admin/bins/BinLocationMap'
import RouteManagement from './pages/admin/routes/RouteManagement'
import CreateRoute from './pages/admin/routes/CreateRoute'
import AdminRouteDetails from './pages/admin/routes/AdminRouteDetails'
import EditRoute from './pages/admin/routes/EditRoute'
import RouteOptimization from './pages/admin/routes/RouteOptimization'
import ScheduleManagement from './pages/admin/schedules/ScheduleManagement'
import CreateSchedule from './pages/admin/schedules/CreateSchedule'
import EditSchedule from './pages/admin/schedules/EditSchedule'
import ScheduleCalendar from './pages/admin/schedules/ScheduleCalendar'
import ReportManagement from './pages/admin/reports/ReportManagement'
import ReportDetails from './pages/admin/reports/ReportDetails'
import ReportAnalytics from './pages/admin/reports/ReportAnalytics'
import FeedbackManagement from './pages/admin/feedback/FeedbackManagement'
import FeedbackDetails from './pages/admin/feedback/FeedbackDetails'
import FeedbackAnalytics from './pages/admin/feedback/FeedbackAnalytics'
import RewardManagement from './pages/admin/rewards/RewardManagement'
import CreateReward from './pages/admin/rewards/CreateReward'
import EditReward from './pages/admin/rewards/EditReward'
import RewardAnalytics from './pages/admin/rewards/RewardAnalytics'
import SystemAnalytics from './pages/admin/analytics/SystemAnalytics'
import WasteAnalytics from './pages/admin/analytics/WasteAnalytics'
import PerformanceAnalytics from './pages/admin/analytics/PerformanceAnalytics'
import UserAnalytics from './pages/admin/analytics/UserAnalytics'
import SystemSettings from './pages/admin/settings/SystemSettings'
import NotificationSettings from './pages/admin/settings/NotificationSettings'
import APISettings from './pages/admin/settings/APISettings'

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

        {/* Common Routes (Protected) */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />


        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/google/success" element={<GoogleAuthHandler />} />
        <Route path="/auth/google/error" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />


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
