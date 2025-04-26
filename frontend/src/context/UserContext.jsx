import { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Get all users with pagination and filters
  const getUsers = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params });
      setUsers(data.data);
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching users');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get single user by ID
  const getUser = async (id) => {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching user');
      return null;
    }
  };

  // Create new user (admin only)
  const createUser = async (userData) => {
    try {
      const { data } = await api.post('/users', userData);
      setUsers((prev) => [...prev, data.data]);
      toast.success('User created successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating user');
      return null;
    }
  };

  // Update user
  const updateUser = async (id, userData) => {
    try {
      const { data } = await api.put(`/users/${id}`, userData);
      setUsers(users.map(user => user._id === id ? data.data : user));
      toast.success('User updated successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user');
      return null;
    }
  };

  // Delete user (admin only)
  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
      return false;
    }
  };

  // Upload avatar
  const uploadAvatar = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.put(`/users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUsers(users.map(user => user._id === id ? data.data : user));
      toast.success('Avatar uploaded successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading avatar');
      return null;
    }
  };

  // Get user statistics
  const getUserStats = async (id) => {
    try {
      const { data } = await api.get(`/users/${id}/stats`);
      setStats(data.data);
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching user stats');
      return null;
    }
  };

  // Get leaderboard
  const getLeaderboard = async (limit = 10) => {
    try {
      const { data } = await api.get('/users/leaderboard', {
        params: { limit }
      });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching leaderboard');
      return [];
    }
  };

  const value = {
    users,
    loading,
    stats,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
    getUserStats,
    getLeaderboard
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserProvider;