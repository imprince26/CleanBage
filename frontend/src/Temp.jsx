import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import GoogleCallback from '@/components/GoogleCallBack'
import GoogleAuthHandler from '@/components/GoogleAuthHandler'
import { Navigate } from 'react-router-dom'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import ReportBin from './pages/resident/ReportBin'
import CollectionDetails from './pages/resident/CollectionDetails'
import BinMap from './pages/resident/BinMap'
import ResidentDashboard from './pages/resident/ResidentDashboard'
import Profile from './pages/Profile'

const Temp = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Home />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/google/success" element={<GoogleAuthHandler />} />
        <Route path="/auth/google/error" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route path="/resident/dashboard" element={<ResidentDashboard />} />
        <Route path="/resident/report-bin" element={<ReportBin />} />
        <Route path="/resident/bin-map" element={<BinMap />}/>
        <Route path="/resident/collections/:id" element={<CollectionDetails />}/>
      </Route>
    </Routes>
  )
}

export default Temp
