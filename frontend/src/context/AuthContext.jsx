import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      setUser(data.data);
      setIsAuthenticated(true);
      toast.success('Logged in successfully');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      toast.success('Registration successful. Please verify your email.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post('/api/auth/forgotpassword', { email });
      toast.success('Password reset link sent to your email');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
      return false;
    }
  };

  const resetPassword = async (token, passwords) => {
    try {
      const { data } = await axios.put(`/api/auth/resetpassword/${token}`, passwords);
      toast.success('Password reset successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put('/api/auth/updatedetails', userData);
      setUser(data.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  const updatePassword = async (passwords) => {
    try {
      await axios.put('/api/auth/updatepassword', passwords);
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}