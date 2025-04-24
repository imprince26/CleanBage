import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import GoogleCallback from '@/components/GoogleCallBack'
import GoogleAuthHandler from '@/components/GoogleAuthHandler'
import { Navigate } from 'react-router-dom'

const Temp = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/google/success" element={<GoogleAuthHandler />} />
        <Route path="/auth/google/error" element={<Navigate to="/login" />} />
      </Route>
    </Routes>
  )
}

export default Temp
