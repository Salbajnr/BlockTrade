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
  
  // Loading and error states
  const [loading, setLoading] = useState({
    portfolio: false,
    transactions: false,
    priceHistory: false,
    userStats: false,
    adminStats: false,
    recentUsers: false,
    systemStatus: false,
  });
  
  const [error, setError] = useState({
    portfolio: null,
    transactions: null,
    priceHistory: null,
    userStats: null,
    adminStats: null,
    recentUsers: null,
    systemStatus: null,
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
    }
  }, [user]);

  // ===== USER DASHBOARD FUNCTIONS =====
  
  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    if (!user) return;
    
    setLoadingState('portfolio', true);
    try {
      const data = await dashboardService.getPortfolio(user.id);
      setPortfolio(data);
      setErrorState('portfolio', null);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setErrorState('portfolio', err);
    } finally {
      setLoadingState('portfolio', false);
    }
  }, [user, setLoadingState, setErrorState]);

  // Fetch recent transactions
  const fetchRecentTransactions = useCallback(async () => {
    if (!user) return;
    
    setLoadingState('transactions', true);
    try {
      const data = await dashboardService.getRecentTransactions(user.id);
      setRecentTransactions(data);
      setErrorState('transactions', null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setErrorState('transactions', err);
    } finally {
      setLoadingState('transactions', false);
    }
  }, [user, setLoadingState, setErrorState]);

  // ===== ADMIN DASHBOARD FUNCTIONS =====
  
  // Fetch admin stats
  const fetchAdminStats = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoadingState('adminStats', true);
    try {
      const data = await dashboardService.getAdminStats();
      setAdminStats(data);
      setErrorState('adminStats', null);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setErrorState('adminStats', err);
    } finally {
      setLoadingState('adminStats', false);
    }
  }, [user, setLoadingState, setErrorState]);

  // Fetch recent users
  const fetchRecentUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoadingState('recentUsers', true);
    try {
      const data = await dashboardService.getRecentUsers();
      setRecentUsers(data);
      setErrorState('recentUsers', null);
    } catch (err) {
      console.error('Error fetching recent users:', err);
      setErrorState('recentUsers', err);
    } finally {
      setLoadingState('recentUsers', false);
    }
  }, [user, setLoadingState, setErrorState]);

  // Fetch system status
  const fetchSystemStatus = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoadingState('systemStatus', true);
    try {
      const data = await dashboardService.getSystemStatus();
      setSystemStatus(data);
      setErrorState('systemStatus', null);
    } catch (err) {
      console.error('Error fetching system status:', err);
      setErrorState('systemStatus', err);
    } finally {
      setLoadingState('systemStatus', false);
    }
  }, [user, setLoadingState, setErrorState]);

  // ===== PROVIDER VALUE =====
  const value = {
    // State
    portfolio,
    recentTransactions,
    priceHistory,
    userStats,
    adminStats,
    recentUsers,
    systemStatus,
    loading,
    error,
    
    // Functions
    fetchPortfolio,
    fetchRecentTransactions,
    fetchPriceHistory: () => {}, // Implement as needed
    fetchUserStats: () => {},    // Implement as needed
    fetchAdminStats,
    fetchRecentUsers,
    fetchSystemStatus,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
