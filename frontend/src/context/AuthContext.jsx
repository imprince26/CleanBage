import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/ui/use-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user from localStorage on initial render
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set default headers for all requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get current user
        const res = await api.get('/api/auth/me');
        
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const res = await api.post('/api/auth/register', userData);
      
      if (res.data.success) {
        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account.',
          variant: 'success',
        });
        navigate('/login');
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      setAuthError(message);
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        setUser(res.data.user);
        setIsAuthenticated(true);
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${res.data.user.name}!`,
          variant: 'success',
        });
        
        // Redirect based on role
        if (res.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.data.user.role === 'garbage_collector') {
          navigate('/collector/dashboard');
        } else {
          navigate('/resident/dashboard');
        }
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      setAuthError(message);
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.get('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    
    try {
      const res = await api.put('/api/auth/updatedetails', userData);
      
      if (res.data.success) {
        setUser(res.data.data);
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
          variant: 'success',
        });
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast({
        title: 'Update Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    setLoading(true);
    
    try {
      const res = await api.put('/api/auth/updatepassword', passwordData);
      
      if (res.data.success) {
        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully updated.',
          variant: 'success',
        });
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Password update failed';
      toast({
        title: 'Update Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    
    try {
      const res = await api.post('/api/auth/forgotpassword', { email });
      
      if (res.data.success) {
        toast({
          title: 'Email Sent',
          description: 'Please check your email for password reset instructions.',
          variant: 'success',
        });
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Request failed';
      toast({
        title: 'Request Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    setLoading(true);
    
    try {
      const res = await api.put(`/api/auth/resetpassword/${token}`, { password });
      
      if (res.data.success) {
        toast({
          title: 'Password Reset',
          description: 'Your password has been successfully reset. You can now login.',
          variant: 'success',
        });
        navigate('/login');
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Reset failed';
      toast({
        title: 'Reset Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    setLoading(true);
    
    try {
      const res = await api.get(`/api/auth/verify-email/${token}`);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        setUser(res.data.user);
        setIsAuthenticated(true);
        
        toast({
          title: 'Email Verified',
          description: 'Your email has been successfully verified.',
          variant: 'success',
        });
        
        // Redirect based on role
        if (res.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.data.user.role === 'garbage_collector') {
          navigate('/collector/dashboard');
        } else {
          navigate('/resident/dashboard');
        }
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Verification failed';
      toast({
        title: 'Verification Failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        authError,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};