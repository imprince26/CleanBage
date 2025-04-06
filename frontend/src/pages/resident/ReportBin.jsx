import { useState } from 'react';
import { MapPin, Trash2, Upload, AlertCircle, CheckCircle ,Scale, } from 'lucide-react';
import { useCollection } from '@/context/CollectionContext';
import { useTheme } from '@/context/ThemeContext';
import {motion} from "motion/react"


const BinSVG = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 40h80l10 160H50L60 40z" className="stroke-[#2D6A4F] dark:stroke-[#95D5B2]" strokeWidth="4"/>
    <path d="M40 40h120v10H40z" className="fill-[#2D6A4F] dark:fill-[#95D5B2]"/>
    <path d="M90 20h20v20H90z" className="fill-[#2D6A4F] dark:fill-[#95D5B2]"/>
    <path d="M70 60v120M100 60v120M130 60v120" className="stroke-[#2D6A4F]/30 dark:stroke-[#95D5B2]/30" strokeWidth="2" strokeDasharray="4 4"/>
  </svg>
);

const ReportBin = () => {
  const { reportBin, loading, error } = useCollection();
  const { darkMode } = useTheme();
  const [success, setSuccess] = useState(false);
  
  // Updated formData to match collectionModel fields
  const [formData, setFormData] = useState({
    binId: '',
    location: {
      type: 'Point',
      coordinates: []
    },
    fillLevel: 0,
    wasteType: 'non-recyclable',
    status: 'pending',
  });

  const [coordinates, setCoordinates] = useState(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCoordinates(coords);
        setFormData(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [coords.longitude, coords.latitude]
          }
        }));
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await reportBin(formData);
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          binId: '',
          location: {
            type: 'Point',
            coordinates: []
          },
          fillLevel: 0,
          wasteType: 'non-recyclable',
          status: 'pending',
        });
        setCoordinates(null);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    return (
      formData.binId &&
      formData.location.coordinates.length === 2 &&
      formData.fillLevel >= 0 &&
      formData.fillLevel <= 100
    );
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] dark:bg-[#081C15] transition-colors duration-300 pt-20">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Form Column */}
          <div className="bg-white/80 dark:bg-[#2D6A4F]/20 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-[#95D5B2]/20">
            <h1 className="text-3xl font-bold text-[#2D6A4F] dark:text-[#95D5B2] mb-6">
              Report Bin Collection
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Bin ID Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bin ID *
                  </label>
                  <input
                    type="text"
                    value={formData.binId}
                    onChange={(e) => setFormData({...formData, binId: e.target.value})}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-[#95D5B2]/20 
                             dark:bg-[#1B4332] dark:text-white shadow-sm focus:border-[#2D6A4F] 
                             focus:ring-[#2D6A4F] dark:focus:border-[#95D5B2] dark:focus:ring-[#95D5B2]"
                    required
                    placeholder="Enter unique bin ID"
                  />
                </div>

                {/* Waste Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Waste Type *
                  </label>
                  <select
                    value={formData.wasteType}
                    onChange={(e) => setFormData({...formData, wasteType: e.target.value})}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-[#95D5B2]/20 
                             dark:bg-[#1B4332] dark:text-white shadow-sm focus:border-[#2D6A4F] 
                             focus:ring-[#2D6A4F] dark:focus:border-[#95D5B2] dark:focus:ring-[#95D5B2]"
                    required
                  >
                    <option value="organic">Organic</option>
                    <option value="recyclable">Recyclable</option>
                    <option value="non-recyclable">Non-Recyclable</option>
                    <option value="hazardous">Hazardous</option>
                  </select>
                </div>

                {/* Fill Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fill Level (%) *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.fillLevel}
                      onChange={(e) => setFormData({...formData, fillLevel: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                               dark:bg-[#1B4332] accent-[#2D6A4F] dark:accent-[#95D5B2]"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.fillLevel}%
                      </span>
                      <Scale className="w-5 h-5 text-[#2D6A4F] dark:text-[#95D5B2]" />
                    </div>
                    {/* Fill Level Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-[#2D6A4F] dark:bg-[#95D5B2] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${formData.fillLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location *
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={coordinates ? `${coordinates.latitude}, ${coordinates.longitude}` : ''}
                      readOnly
                      className="block w-full rounded-lg border-gray-300 dark:border-[#95D5B2]/20 
                               dark:bg-[#1B4332] dark:text-white shadow-sm"
                      placeholder="Click 'Get Location' to set coordinates"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleGetLocation}
                      className="inline-flex items-center px-4 py-2 border border-transparent 
                               rounded-lg text-sm font-medium text-white bg-[#2D6A4F] 
                               hover:bg-[#2D6A4F]/90 dark:bg-[#95D5B2]/20 dark:hover:bg-[#95D5B2]/30"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Location
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center p-4 text-[#2D6A4F] dark:text-[#95D5B2] bg-[#2D6A4F]/10 dark:bg-[#95D5B2]/10 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Bin reported successfully!</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || !validateForm()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent 
                         rounded-lg shadow-sm text-sm font-medium text-white bg-[#2D6A4F] 
                         hover:bg-[#2D6A4F]/90 dark:bg-[#95D5B2]/20 dark:hover:bg-[#95D5B2]/30
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Illustration Column */}
          <div className="lg:flex flex-col justify-center items-center hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <BinSVG />
            </motion.div>
            
            <div className="space-y-4 text-center max-w-md">
              <h2 className="text-xl font-semibold text-[#2D6A4F] dark:text-[#95D5B2]">
                Help Keep Our City Clean
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Report waste bins to help maintain cleanliness and efficiency in waste collection.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-[#2D6A4F]/10 dark:bg-[#95D5B2]/10 rounded-lg">
                  <Trash2 className="w-6 h-6 text-[#2D6A4F] dark:text-[#95D5B2] mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Segregate Waste</p>
                </div>
                <div className="p-4 bg-[#2D6A4F]/10 dark:bg-[#95D5B2]/10 rounded-lg">
                  <Scale className="w-6 h-6 text-[#2D6A4F] dark:text-[#95D5B2] mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Monitor Fill Level</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportBin;