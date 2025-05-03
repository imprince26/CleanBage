import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        if (mounted) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
}, []);
  
  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      setUser(data.data);
      setIsAuthenticated(true);
      navigate('/');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      toast.success('Registration successful. Please verify your email.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
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
      const { data } = await api.post('/auth/forgotpassword', { email });
      toast.success('Password reset link sent to your email');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
      return false;
    }
  };

  const resetPassword = async (token, passwords) => {
    try {
      const { data } = await api.put(`/auth/resetpassword/${token}`, passwords);
      toast.success('Password reset successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await api.put('/auth/updatedetails', userData);
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
      await api.put('/auth/updatepassword', passwords);
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
      return false;
    }
  };
  const initiateGoogleAuth = () => {
    // Use the full Google OAuth URL with all required parameters
    const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  // Update the Google callback handler
  const handleGoogleCallback = async (code) => {
    try {
      const { data } = await api.get(`/auth/google/callback?code=${code}`);
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Successfully logged in with Google!');
        return true;
      }
    } catch (error) {
      console.error('Google callback error:', error);
      toast.error(error.response?.data?.message || 'Failed to authenticate with Google');
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
    initiateGoogleAuth,
    handleGoogleCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}