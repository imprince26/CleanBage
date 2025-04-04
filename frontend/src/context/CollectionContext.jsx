import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CollectionContext = createContext();

export const CollectionProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyCollections, setNearbyCollections] = useState([]);

  // Get all collections
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/collections');
      setCollections(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching collections');
    } finally {
      setLoading(false);
    }
  };

  // Report a new bin collection
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

  // Get nearby collections
  const getNearbyCollections = async (latitude, longitude, radius = 1000) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/collections/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
      );
      setNearbyCollections(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching nearby collections');
    } finally {
      setLoading(false);
    }
  };

  // Update collection status
  const updateCollection = async (id, updateData) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/collections/${id}`, updateData);
      setCollections(collections.map(col => 
        col._id === id ? response.data.data : col
      ));
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating collection');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get user's reported collections
  const fetchUserCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/collections/user');
      setUserCollections(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching user collections');
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  const value = {
    collections,
    userCollections,
    nearbyCollections,
    loading,
    error,
    reportBin,
    fetchCollections,
    getNearbyCollections,
    updateCollection,
    fetchUserCollections,
    clearError,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};