import { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';

const CollectionContext = createContext();

export const useCollection = () => useContext(CollectionContext);

export function CollectionProvider({ children }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get all collections with pagination and filters
  const getCollections = async (params = {}) => {
    try {
      const { data } = await api.get('/collections', { params });
      setCollections(data.data);
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching collections');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get single collection by ID
  const getCollection = async (id) => {
    try {
      const { data } = await api.get(`/collections/${id}`);
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching collection');
      return null;
    }
  };

  // Create new collection
  const createCollection = async (collectionData) => {
    try {
      const { data } = await api.post('/collections', collectionData);
      setCollections([...collections, data.data]);
      toast.success('Collection created successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating collection');
      return null;
    }
  };

  // Update collection
  const updateCollection = async (id, updateData) => {
    try {
      const { data } = await api.put(`/collections/${id}`, updateData);
      setCollections(collections.map(c => c._id === id ? data.data : c));
      toast.success('Collection updated successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating collection');
      return null;
    }
  };

  // Delete collection
  const deleteCollection = async (id) => {
    try {
      await api.delete(`/collections/${id}`);
      setCollections(collections.filter(c => c._id !== id));
      toast.success('Collection deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting collection');
      return false;
    }
  };

  // Assign collector to collection
  const assignCollector = async (id, collectorId) => {
    try {
      const { data } = await api.put(`/collections/${id}/assign`, { collectorId });
      setCollections(collections.map(c => c._id === id ? data.data : c));
      toast.success('Collector assigned successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error assigning collector');
      return null;
    }
  };

  // Get nearby collections
  const getNearbyCollections = async (coordinates, distance, wasteType) => {
    try {
      const { data } = await api.get('/collections/nearby', {
        params: {
          lat: coordinates[1],
          lng: coordinates[0],
          distance,
          wasteType
        }
      });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching nearby collections');
      return [];
    }
  };

  // Get collection statistics
  const getCollectionStats = async () => {
    try {
      const { data } = await api.get('/collections/stats');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching collection stats');
      return null;
    }
  };

  const value = {
    collections,
    loading,
    getCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    assignCollector,
    getNearbyCollections,
    getCollectionStats
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}