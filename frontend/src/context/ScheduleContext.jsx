import { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [schedules, setSchedules] = useState([]);
    const [collectorSchedules, setCollectorSchedules] = useState([]);
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create new schedule
    const createSchedule = async (scheduleData) => {
        try {
            setLoading(true);
            const response = await api.post('/api/schedules', scheduleData);
            setSchedules([...schedules, response.data.data]);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating schedule');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Get all schedules
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

    // Get collector's schedules
    const fetchCollectorSchedules = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/schedules/collector');
            setCollectorSchedules(response.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching collector schedules');
        } finally {
            setLoading(false);
        }
    };

    // Get single schedule
    const getScheduleById = async (id) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/schedules/${id}`);
            setCurrentSchedule(response.data.data);
            return response.data.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching schedule');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update schedule
    const updateSchedule = async (id, updateData) => {
        try {
            setLoading(true);
            const response = await api.put(`/api/schedules/${id}`, updateData);
            setSchedules(schedules.map(schedule =>
                schedule._id === id ? response.data.data : schedule
            ));
            return response.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating schedule');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Delete schedule
    const deleteSchedule = async (id) => {
        try {
            setLoading(true);
            await api.delete(`/api/schedules/${id}`);
            setSchedules(schedules.filter(schedule => schedule._id !== id));
        } catch (error) {
            setError(error.response?.data?.message || 'Error deleting schedule');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Get schedules by date range
    const getSchedulesByDateRange = async (startDate, endDate) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/schedules/range?startDate=${startDate}&endDate=${endDate}`);
            return response.data.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching schedules by date range');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Get upcoming schedules
    const getUpcomingSchedules = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/schedules/upcoming');
            return response.data.data;
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching upcoming schedules');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Clear errors
    const clearError = () => setError(null);

    const value = {
        schedules,
        collectorSchedules,
        currentSchedule,
        loading,
        error,
        createSchedule,
        fetchSchedules,
        fetchCollectorSchedules,
        getScheduleById,
        updateSchedule,
        deleteSchedule,
        getSchedulesByDateRange,
        getUpcomingSchedules,
        clearError,
    };

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
};

export default ScheduleContext;