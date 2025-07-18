
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // You might want to redirect to login or refresh token here
      console.error('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

// Dashboard API functions
export const dashboardService = {
  // ===== USER DASHBOARD =====
  
  // Get user dashboard data
  getUserDashboardData: async () => {
    try {
      const response = await api.get('/dashboard/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
      throw error;
    }
  },

  // Get user's portfolio
  getPortfolio: async () => {
    try {
      const response = await api.get('/portfolio');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  // Get recent transactions for the current user
  getRecentTransactions: async (limit = 10) => {
    try {
      const response = await api.get(`/transactions/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  // Get price history for a symbol
  getPriceHistory: async (symbol, days = 7) => {
    try {
      const response = await api.get(`/market/price-history?symbol=${symbol}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  },

  // Get user stats
  getUserStats: async () => {
    try {
      const response = await api.get('/users/me/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // ===== ADMIN DASHBOARD =====
  
  // Get admin dashboard data
  getAdminDashboardData: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  },

  // Get admin stats
  getAdminStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Get all users with pagination and filters
  getUsers: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, search, sortBy, sortOrder } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      });
      
      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user status (suspend/activate)
  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Get all transactions with pagination and filters
  getAllTransactions: async (params = {}) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type, 
        status, 
        userId, 
        startDate, 
        endDate,
        sortBy,
        sortOrder
      } = params;
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(type && { type }),
        ...(status && { status }),
        ...(userId && { userId }),
        ...(startDate && { startDate: new Date(startDate).toISOString() }),
        ...(endDate && { endDate: new Date(endDate).toISOString() }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      });
      
      const response = await api.get(`/admin/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId, statusData) => {
    try {
      const response = await api.patch(`/admin/transactions/${transactionId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },

  // Get activity logs with filters
  getActivityLogs: async (params = {}) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        action, 
        status, 
        userId, 
        startDate, 
        endDate,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = params;
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(action && { action }),
        ...(status && { status }),
        ...(userId && { userId }),
        ...(startDate && { startDate: new Date(startDate).toISOString() }),
        ...(endDate && { endDate: new Date(endDate).toISOString() }),
        sortBy,
        sortOrder,
      });
      
      const response = await api.get(`/admin/activity-logs?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async (timeRange = '30d') => {
    try {
      const response = await api.get(`/admin/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get system status
  getSystemStatus: async () => {
    try {
      const response = await api.get('/admin/system/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  },

  // Update system settings
  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/admin/system/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  // Create a backup
  createBackup: async (backupName) => {
    try {
      const response = await api.post('/admin/system/backup', { name: backupName });
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  },

  // Restore a backup
  restoreBackup: async (backupId) => {
    try {
      const response = await api.post(`/admin/system/restore/${backupId}`);
      return response.data;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  },

  // Get recent users (for admin)
  getRecentUsers: async (limit = 5) => {
    try {
      const response = await api.get(`/admin/users/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent users:', error);
      throw error;
    }
  },

  // Export users to CSV
  exportUsersToCSV: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/users/export?${queryParams}`, {
        responseType: 'blob',
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error exporting users to CSV:', error);
      throw error;
    }
  },

  // Export transactions to CSV
  exportTransactionsToCSV: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/transactions/export?${queryParams}`, {
        responseType: 'blob',
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error exporting transactions to CSV:', error);
      throw error;
    }
  },
};

export default dashboardService;
