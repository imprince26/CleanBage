import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch nearby collections
  const fetchNearbyCollections = async (latitude, longitude) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/collections/nearby?latitude=${latitude}&longitude=${longitude}&radius=1000`);
      setCollections(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching collections');
    } finally {
      setLoading(false);
    }
  };

  // Report a bin
  const reportBin = async (binData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/collections', binData);
      setCollections([...collections, response.data.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error reporting bin');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get user schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/schedules');
      setSchedules(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching schedules');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    collections,
    schedules,
    reports,
    loading,
    error,
    fetchNearbyCollections,
    reportBin,
    fetchSchedules,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};