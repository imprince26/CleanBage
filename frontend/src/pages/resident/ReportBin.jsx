import { useState } from 'react';
import { MapPin, Trash2, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ReportBin = () => {
  const { reportBin, loading, error } = useApp();
  const [formData, setFormData] = useState({
    binId: '',
    location: '',
    wasteType: 'general',
    fillLevel: 0,
    description: '',
  });
  const [coordinates, setCoordinates] = useState(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportBin({
        ...formData,
        location: coordinates ? {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude],
        } : formData.location,
      });
      setFormData({
        binId: '',
        location: '',
        wasteType: 'general',
        fillLevel: 0,
        description: '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-emerald-600 mb-6">Report a Bin</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bin ID</label>
            <input
              type="text"
              value={formData.binId}
              onChange={(e) => setFormData({...formData, binId: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={coordinates ? `${coordinates.latitude}, ${coordinates.longitude}` : formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Location
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Waste Type</label>
            <select
              value={formData.wasteType}
              onChange={(e) => setFormData({...formData, wasteType: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="general">General Waste</option>
              <option value="recyclable">Recyclable</option>
              <option value="organic">Organic</option>
              <option value="hazardous">Hazardous</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fill Level (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.fillLevel}
              onChange={(e) => setFormData({...formData, fillLevel: parseInt(e.target.value)})}
              className="mt-1 block w-full"
            />
            <span className="text-sm text-gray-500">{formData.fillLevel}%</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              rows="3"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {loading ? (
            'Submitting...'
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Submit Report
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportBin;