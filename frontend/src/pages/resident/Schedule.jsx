import { useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {motion} from "motion/react"


const Schedule = () => {
  const { schedules, fetchSchedules, loading } = useApp();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-emerald-600 mb-6">Collection Schedule</h1>

      {loading ? (
        <div className="text-center">Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center text-gray-500">No scheduled collections found</div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">
                      {formatDate(schedule.scheduledDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <span>{formatTime(schedule.scheduledDate)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    schedule.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : schedule.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500">Collection Details</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bin ID</p>
                    <p className="font-medium">{schedule.bin?.binId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Collector</p>
                    <p className="font-medium">{schedule.collector?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;