import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { walletAPI } from "../services/api.service";
import { useAuth } from "./AuthContext";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all wallets for the current user
  const fetchWallets = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await walletAPI.getWallets();
      setWallets(response.data);

      // Select the first wallet by default if none is selected
      if (response.data.length > 0 && !selectedWallet) {
        setSelectedWallet(response.data[0]);
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      setError(error.message || "Failed to load wallets");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, selectedWallet]);

  // Fetch transactions for the selected wallet
  const fetchTransactions = useCallback(async (walletId, params = {}) => {
    if (!walletId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await walletAPI.getTransactions(walletId, {
        limit: 50,
        ...params,
      });

      setTransactions(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setError(error.message || "Failed to load transactions");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new wallet
  const createWallet = async (currency) => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletAPI.createWallet(currency);
      const newWallet = response.data;

      // Update wallets list
      setWallets((prev) => [...prev, newWallet]);

      // Select the newly created wallet
      setSelectedWallet(newWallet);

      return newWallet;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      setError(error.message || "Failed to create wallet");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Request a withdrawal
  const requestWithdrawal = async (
    walletId,
    { amount, address, fee, description = "" },
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletAPI.requestWithdrawal(walletId, {
        amount,
        address,
        fee,
        description,
      });

      // Refresh transactions
      await fetchTransactions(walletId);

      return response.data;
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setError(error.message || "Withdrawal failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get deposit address for a wallet
  const getDepositAddress = async (walletId) => {
    try {
      const response = await walletAPI.getDepositAddress(walletId);
      return response.data.address;
    } catch (error) {
      console.error("Failed to get deposit address:", error);
      setError(error.message || "Failed to get deposit address");
      throw error;
    }
  };

  // Effect to load wallets when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallets();
    } else {
      // Reset state when user logs out
      setWallets([]);
      setSelectedWallet(null);
      setTransactions([]);
    }
  }, [isAuthenticated, fetchWallets]);

  // Effect to load transactions when selected wallet changes
  useEffect(() => {
    if (selectedWallet?.id) {
      fetchTransactions(selectedWallet.id);
    }
  }, [selectedWallet, fetchTransactions]);

  const value = {
    wallets,
    selectedWallet,
    transactions,
    loading,
    error,
    setSelectedWallet,
    fetchWallets,
    fetchTransactions,
    createWallet,
    requestWithdrawal,
    getDepositAddress,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export default WalletContext;

import { useAuth } from './AuthContext';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    totalProfit: 0,
    totalTrades: 0,
    portfolioValue: 0,
    recentTransactions: [],
    performanceData: [],
    activeWallets: 0,
    pendingTransactions: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolume: 0,
    totalTransactions: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
    systemHealth: 'good'
  });

  // Refresh dashboard data
  const refreshDashboard = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      // Mock data for now - replace with actual API calls
      setDashboardData({
        totalBalance: 12500.50,
        totalProfit: 2450.75,
        totalTrades: 45,
        portfolioValue: 15000.25,
        recentTransactions: [
          {
            id: 1,
            type: 'buy',
            amount: 100,
            currency: 'BTC',
            date: new Date().toISOString(),
            status: 'completed'
          },
          {
            id: 2,
            type: 'sell',
            amount: 0.5,
            currency: 'ETH',
            date: new Date().toISOString(),
            status: 'pending'
          }
        ],
        performanceData: [
          { date: '2024-01-01', value: 10000 },
          { date: '2024-01-02', value: 10500 },
          { date: '2024-01-03', value: 11000 },
          { date: '2024-01-04', value: 10800 },
          { date: '2024-01-05', value: 12500 }
        ],
        activeWallets: 3,
        pendingTransactions: 2
      });

      if (user?.role === 'admin') {
        setStats({
          totalUsers: 1250,
          totalVolume: 5000000,
          totalTransactions: 15600,
          activeUsers: 342,
          pendingWithdrawals: 8,
          systemHealth: 'good'
        });
      }
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on mount and auth changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboard();
    } else {
      // Reset data when user logs out
      setDashboardData({
        totalBalance: 0,
        totalProfit: 0,
        totalTrades: 0,
        portfolioValue: 0,
        recentTransactions: [],
        performanceData: [],
        activeWallets: 0,
        pendingTransactions: 0
      });
      setStats({
        totalUsers: 0,
        totalVolume: 0,
        totalTransactions: 0,
        activeUsers: 0,
        pendingWithdrawals: 0,
        systemHealth: 'good'
      });
    }
  }, [isAuthenticated, user]);

  // Update dashboard data
  const updateDashboardData = (newData) => {
    setDashboardData(prev => ({ ...prev, ...newData }));
  };

  // Add transaction to recent list
  const addRecentTransaction = (transaction) => {
    setDashboardData(prev => ({
      ...prev,
      recentTransactions: [transaction, ...prev.recentTransactions.slice(0, 9)]
    }));
  };

  // Update portfolio value
  const updatePortfolioValue = (newValue) => {
    setDashboardData(prev => ({ ...prev, portfolioValue: newValue }));
  };

  const value = {
    dashboardData,
    stats,
    loading,
    error,
    refreshDashboard,
    updateDashboardData,
    addRecentTransaction,
    updatePortfolioValue,
    setError
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;