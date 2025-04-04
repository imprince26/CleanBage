import { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);

  // Create new report
  const createReport = async (reportData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/reports', reportData);
      setReports([...reports, response.data.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating report');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get all reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/reports');
      setReports(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  // Get collector's reports
  const fetchCollectorReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/reports/collector');
      setUserReports(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching collector reports');
    } finally {
      setLoading(false);
    }
  };

  // Get single report
  const getReportById = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reports/${id}`);
      setCurrentReport(response.data.data);
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching report');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update report
  const updateReport = async (id, updateData) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/reports/${id}`, updateData);
      setReports(reports.map(report => 
        report._id === id ? response.data.data : report
      ));
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating report');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete report
  const deleteReport = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/reports/${id}`);
      setReports(reports.filter(report => report._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting report');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  const value = {
    reports,
    userReports,
    currentReport,
    loading,
    error,
    createReport,
    fetchReports,
    fetchCollectorReports,
    getReportById,
    updateReport,
    deleteReport,
    clearError,
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};