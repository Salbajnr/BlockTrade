import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';

const DashboardContext = createContext({
  // User Dashboard
  portfolio: null,
  recentTransactions: [],
  priceHistory: [],
  userStats: null,
  
  // Admin Dashboard
  adminStats: null,
  recentUsers: [],
  allRecentTransactions: [],
  systemStatus: {},
  
  // Loading states
  loading: {
    portfolio: false,
    transactions: false,
    priceHistory: false,
    userStats: false,
    adminStats: false,
    recentUsers: false,
    systemStatus: false,
  },
  
  // Error states
  error: {
    portfolio: null,
    transactions: null,
    priceHistory: null,
    userStats: null,
    adminStats: null,
    recentUsers: null,
    systemStatus: null,
  },
  
  // Functions
  fetchPortfolio: () => {},
  fetchRecentTransactions: () => {},
  fetchPriceHistory: () => {},
  fetchUserStats: () => {},
  fetchAdminStats: () => {},
  fetchRecentUsers: () => {},
  fetchSystemStatus: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  // Get the current user from auth context
  const { user } = useAuth();
  
  // User Dashboard State
  const [portfolio, setPortfolio] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [userStats, setUserStats] = useState(null);
  
  // Admin dashboard states
  const [adminStats, setAdminStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    portfolio: false,
    recentTransactions: false,
    priceHistory: false,
    userStats: false,
    adminStats: false,
    recentUsers: false,
    systemStatus: false,
    users: false,
    allTransactions: false,
    activityLogs: false,
    analytics: false
  });
  
  const [error, setError] = useState({
    portfolio: null,
    recentTransactions: null,
    priceHistory: null,
    userStats: null,
    adminStats: null,
    recentUsers: null,
    systemStatus: null,
    users: null,
    allTransactions: null,
    activityLogs: null,
    analytics: null
  });
  
  // Set loading state for a specific data type
  const setLoadingState = useCallback((type, isLoading) => {
    setLoading(prev => ({
      ...prev,
      [type]: isLoading
    }));
  }, []);

  // Set error state for a specific data type
  const setErrorState = useCallback((type, error) => {
    setError(prev => ({
      ...prev,
      [type]: error ? error.message || 'An error occurred' : null
    }));
  }, []);
  
  // Reset all states when user logs out
  useEffect(() => {
    if (!user) {
      setPortfolio(null);
      setRecentTransactions([]);
      setPriceHistory([]);
      setUserStats(null);
      setAdminStats(null);
      setRecentUsers([]);
      setSystemStatus(null);
      setUsers([]);
      setAllTransactions([]);
      setActivityLogs([]);
      setAnalytics(null);
    }
  }, [user]);

  // ===== USER DASHBOARD FUNCTIONS =====
  
  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setLoadingState('portfolio', true);
      setErrorState('portfolio', null);
      const data = await dashboardService.getPortfolio();
      setPortfolio(data);
      return data;
    } catch (err) {
      setErrorState('portfolio', err);
      throw err;
    } finally {
      setLoadingState('portfolio', false);
    }
  };

  // Fetch recent transactions for the current user
  const fetchRecentTransactions = async (limit = 10) => {
    try {
      setLoadingState('transactions', true);
      setErrorState('transactions', null);
      const data = await dashboardService.getRecentTransactions(limit);
      setRecentTransactions(data);
      return data;
    } catch (err) {
      setErrorState('transactions', err);
      throw err;
    } finally {
      setLoadingState('transactions', false);
    }
  };

  // Fetch price history for a specific asset
  const fetchPriceHistory = async (asset, days = 7) => {
    try {
      setLoadingState('priceHistory', true);
      setErrorState('priceHistory', null);
      const data = await dashboardService.getPriceHistory(asset, days);
      setPriceHistory(data);
      return data;
    } catch (err) {
      setErrorState('priceHistory', err);
      throw err;
    } finally {
      setLoadingState('priceHistory', false);
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      setLoadingState('userStats', true);
      setErrorState('userStats', null);
      const data = await dashboardService.getUserStats();
      setUserStats(data);
      return data;
    } catch (err) {
      setErrorState('userStats', err);
      throw err;
    } finally {
      setLoadingState('userStats', false);
    }
  };

  // ===== ADMIN DASHBOARD FUNCTIONS =====
  
  // Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      setLoadingState('adminStats', true);
      setErrorState('adminStats', null);
      const data = await dashboardService.getAdminStats();
      setAdminStats(data);
      return data;
    } catch (err) {
      setErrorState('adminStats', err);
      throw err;
    } finally {
      setLoadingState('adminStats', false);
    }
  };

  // Fetch recent users (admin)
  const fetchRecentUsers = async (limit = 5) => {
    try {
      setLoadingState('recentUsers', true);
      setErrorState('recentUsers', null);
      const data = await dashboardService.getRecentUsers(limit);
      setRecentUsers(data);
      return data;
    } catch (err) {
      setErrorState('recentUsers', err);
      throw err;
    } finally {
      setLoadingState('recentUsers', false);
    }
  };

  // Fetch all users with pagination and filters (admin)
  const fetchUsers = async (params = {}) => {
    try {
      setLoadingState('users', true);
      setErrorState('users', null);
      const data = await dashboardService.getUsers(params);
      setUsers(data);
      return data;
    } catch (err) {
      setErrorState('users', err);
      throw err;
    } finally {
      setLoadingState('users', false);
    }
  };

  // Update user status (admin)
  const updateUserStatus = async (userId, statusData) => {
    try {
      setLoadingState('users', true);
      setErrorState('users', null);
      const data = await dashboardService.updateUserStatus(userId, statusData);
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...statusData } : user
        )
      );
      // Also update in recentUsers if present
      setRecentUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...statusData } : user
        )
      );
      return data;
    } catch (err) {
      setErrorState('users', err);
      throw err;
    } finally {
      setLoadingState('users', false);
    }
  };

  // Fetch all transactions with pagination and filters (admin)
  const fetchAllTransactions = async (params = {}) => {
    try {
      setLoadingState('allTransactions', true);
      setErrorState('allTransactions', null);
      const data = await dashboardService.getAllTransactions(params);
      setAllTransactions(data);
      return data;
    } catch (err) {
      setErrorState('allTransactions', err);
      throw err;
    } finally {
      setLoadingState('allTransactions', false);
    }
  };

  // Update transaction status (admin)
  const updateTransactionStatus = async (transactionId, statusData) => {
    try {
      setLoadingState('allTransactions', true);
      setErrorState('allTransactions', null);
      const data = await dashboardService.updateTransactionStatus(transactionId, statusData);
      // Update the transaction in the local state
      setAllTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.id === transactionId ? { ...tx, ...statusData } : tx
        )
      );
      // Also update in recentTransactions if present
      setRecentTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.id === transactionId ? { ...tx, ...statusData } : tx
        )
      );
      return data;
    } catch (err) {
      setErrorState('allTransactions', err);
      throw err;
    } finally {
      setLoadingState('allTransactions', false);
    }
  };

  // Fetch system status (admin)
  const fetchSystemStatus = async () => {
    try {
      setLoadingState('systemStatus', true);
      setErrorState('systemStatus', null);
      const data = await dashboardService.getSystemStatus();
      setSystemStatus(data);
      return data;
    } catch (err) {
      setErrorState('systemStatus', err);
      throw err;
    } finally {
      setLoadingState('systemStatus', false);
    }
  };

  // Fetch activity logs with filters (admin)
  const fetchActivityLogs = async (params = {}) => {
    try {
      setLoadingState('activityLogs', true);
      setErrorState('activityLogs', null);
      const data = await dashboardService.getActivityLogs(params);
      setActivityLogs(data);
      return data;
    } catch (err) {
      setErrorState('activityLogs', err);
      throw err;
    } finally {
      setLoadingState('activityLogs', false);
    }
  };

  // Fetch analytics data (admin)
  const fetchAnalytics = async (timeRange = '30d') => {
    try {
      setLoadingState('analytics', true);
      setErrorState('analytics', null);
      const data = await dashboardService.getAnalytics(timeRange);
      setAnalytics(data);
      return data;
    } catch (err) {
      setErrorState('analytics', err);
      throw err;
    } finally {
      setLoadingState('analytics', false);
    }
  };

  // Create a backup (admin)
  const createBackup = async (backupName) => {
    try {
      setLoadingState('backup', true);
      setErrorState('backup', null);
      const data = await dashboardService.createBackup(backupName);
      return data;
    } catch (err) {
      setErrorState('backup', err);
      throw err;
    } finally {
      setLoadingState('backup', false);
    }
  };

  // Restore a backup (admin)
  const restoreBackup = async (backupId) => {
    try {
      setLoadingState('backup', true);
      setErrorState('backup', null);
      const data = await dashboardService.restoreBackup(backupId);
      return data;
    } catch (err) {
      setErrorState('backup', err);
      throw err;
    } finally {
      setLoadingState('backup', false);
    }
  };

  // Update system settings (admin)
  const updateSystemSettings = async (settings) => {
    try {
      setLoadingState('settings', true);
      setErrorState('settings', null);
      const data = await dashboardService.updateSystemSettings(settings);
      // Update system status if it includes status-related settings
      if (settings.maintenanceMode !== undefined || settings.marketStatus) {
        fetchSystemStatus();
      }
      return data;
    } catch (err) {
      setErrorState('settings', err);
      throw err;
    } finally {
      setLoadingState('settings', false);
    }
  };

  // Reset all states when user logs out
  useEffect(() => {
    if (!user) {
      setPortfolio(null);
      setRecentTransactions([]);
      setPriceHistory([]);
      setUserStats(null);
      setAdminStats(null);
      setRecentUsers([]);
      setSystemStatus(null);
      setUsers([]);
      setAllTransactions([]);
      setActivityLogs([]);
      setAnalytics(null);
    }
  }, [user]);

  return (
    <DashboardContext.Provider
      value={{
        // State
        // User dashboard
        portfolio,
        recentTransactions,
        priceHistory,
        userStats,
        
        // Admin dashboard
        adminStats,
        recentUsers,
        systemStatus,
        users,
        transactions: allTransactions,
        activityLogs,
        analytics,
        
        // Loading and error states
        loading,
        error,
        
        // User dashboard methods
        fetchPortfolio,
        fetchRecentTransactions,
        fetchPriceHistory,
        fetchUserStats,
        
        // Admin dashboard methods
        fetchAdminStats,
        fetchRecentUsers,
        fetchSystemStatus,
        fetchUsers,
        updateUserStatus,
        fetchAllTransactions,
        updateTransactionStatus,
        fetchActivityLogs,
        fetchAnalytics,
        createBackup,
        restoreBackup,
        updateSystemSettings,
        
        // Utility methods
        setLoadingState,
        setErrorState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
