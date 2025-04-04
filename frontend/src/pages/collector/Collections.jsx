import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCollection } from '../../context/CollectionContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Trash2, MapPin, Timer, CheckCircle,
  AlertTriangle, RefreshCw, Filter, Search,
  Calendar, Scale, Loader, Truck
} from 'lucide-react';

const Collections = () => {
  const { collections, loading, error, fetchCollections, updateCollection } = useCollection();
  const { darkMode } = useTheme();
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    filterCollections();
  }, [collections, filterStatus, searchTerm]);

  const filterCollections = () => {
    let filtered = [...collections];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(col => col.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(col =>
        col.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.location.coordinates.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCollections(filtered);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateCollection(id, { status: newStatus });
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'collected': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'overflow': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (loading && !collections.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0FDF4] dark:bg-[#081C15]">
        <Loader className="w-10 h-10 animate-spin text-[#2D6A4F] dark:text-[#95D5B2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4] dark:bg-[#081C15] transition-colors duration-300 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#2D6A4F] dark:text-[#95D5B2]" />
            <h1 className="text-3xl font-bold text-[#2D6A4F] dark:text-[#95D5B2]">
              Collection Dashboard
            </h1>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your waste collection assignments efficiently
          </p>
        </motion.div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white/80 dark:bg-[#2D6A4F]/10 rounded-xl p-4 shadow-sm border border-[#95D5B2]/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by bin ID, waste type, or coordinates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                         dark:border-[#95D5B2]/30 dark:bg-[#1B4332] dark:text-white 
                         focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/50 
                         transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="text-[#2D6A4F] dark:text-[#95D5B2] w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 
                         dark:border-[#95D5B2]/30 dark:bg-[#1B4332] dark:text-white 
                         focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/50 
                         appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="collected">Collected</option>
                <option value="overflow">Overflow</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <motion.div
              key={collection._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 dark:bg-[#2D6A4F]/30 rounded-xl shadow-md 
                       border border-[#95D5B2]/20 p-6 hover:shadow-lg 
                       transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2D6A4F] dark:text-[#95D5B2]">
                    Bin #{collection.binId}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(collection.status)}`}>
                    {collection.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#2D6A4F] dark:text-[#95D5B2]" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {collection.fillLevel}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm">{collection.wasteType}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm truncate">{collection.location.coordinates.join(', ')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">
                    {new Date(collection.collectionSchedule).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {collection.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(collection._id, 'in-progress')}
                    disabled={updatingId === collection._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                             bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                             disabled:opacity-60 disabled:cursor-not-allowed 
                             transition-colors duration-200"
                  >
                    {updatingId === collection._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Timer className="w-4 h-4" />
                    )}
                    Start
                  </button>
                )}
                {collection.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusUpdate(collection._id, 'collected')}
                    disabled={updatingId === collection._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                             bg-green-600 text-white rounded-lg hover:bg-green-700 
                             disabled:opacity-60 disabled:cursor-not-allowed 
                             transition-colors duration-200"
                  >
                    {updatingId === collection._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Complete
                  </button>
                )}
                {collection.status === 'overflow' && (
                  <button
                    onClick={() => handleStatusUpdate(collection._id, 'pending')}
                    disabled={updatingId === collection._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                             bg-red-600 text-white rounded-lg hover:bg-red-700 
                             disabled:opacity-60 disabled:cursor-not-allowed 
                             transition-colors duration-200"
                  >
                    {updatingId === collection._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    Prioritize
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCollections.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/80 dark:bg-[#2D6A4F]/10 rounded-xl 
                     shadow-sm border border-[#95D5B2]/20 mt-6"
          >
            <Trash2 className="mx-auto h-14 w-14 text-gray-400" />
            <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              No Collections Found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Adjust your filters or check back later for new assignments.
            </p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setSearchTerm('');
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 
                       bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1B4332] 
                       transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          </motion.div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;