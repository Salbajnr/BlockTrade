import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { dashboardAPI } from "../services/api.service";
import { useAuth } from "./AuthContext";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    totalPortfolioValue: 0,
    totalProfitLoss: 0,
    profitLossPercentage: 0,
    recentTransactions: [],
    portfolioDistribution: [],
    priceAlerts: [],
    marketOverview: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard overview data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await dashboardAPI.getOverview();
      setDashboardData(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getMarketData();
      setDashboardData(prev => ({
        ...prev,
        marketOverview: response.data
      }));
      return response.data;
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      throw error;
    }
  }, []);

  // Fetch portfolio analytics
  const fetchPortfolioAnalytics = useCallback(async (timeframe = '24h') => {
    if (!isAuthenticated) return;

    try {
      const response = await dashboardAPI.getPortfolioAnalytics(timeframe);
      setDashboardData(prev => ({
        ...prev,
        portfolioDistribution: response.data.distribution,
        totalPortfolioValue: response.data.totalValue,
        totalProfitLoss: response.data.profitLoss,
        profitLossPercentage: response.data.profitLossPercentage
      }));
      return response.data;
    } catch (error) {
      console.error("Failed to fetch portfolio analytics:", error);
      throw error;
    }
  }, [isAuthenticated]);

  // Fetch recent transactions
  const fetchRecentTransactions = useCallback(async (limit = 10) => {
    if (!isAuthenticated) return;

    try {
      const response = await dashboardAPI.getRecentTransactions(limit);
      setDashboardData(prev => ({
        ...prev,
        recentTransactions: response.data
      }));
      return response.data;
    } catch (error) {
      console.error("Failed to fetch recent transactions:", error);
      throw error;
    }
  }, [isAuthenticated]);

  // Set price alert
  const setPriceAlert = async (alertData) => {
    try {
      const response = await dashboardAPI.setPriceAlert(alertData);

      // Refresh alerts
      const alertsResponse = await dashboardAPI.getPriceAlerts();
      setDashboardData(prev => ({
        ...prev,
        priceAlerts: alertsResponse.data
      }));

      return response.data;
    } catch (error) {
      console.error("Failed to set price alert:", error);
      throw error;
    }
  };

  // Remove price alert
  const removePriceAlert = async (alertId) => {
    try {
      await dashboardAPI.removePriceAlert(alertId);

      // Update local state
      setDashboardData(prev => ({
        ...prev,
        priceAlerts: prev.priceAlerts.filter(alert => alert.id !== alertId)
      }));
    } catch (error) {
      console.error("Failed to remove price alert:", error);
      throw error;
    }
  };

  // Effect to load dashboard data when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      fetchMarketData();
      fetchPortfolioAnalytics();
      fetchRecentTransactions();
    } else {
      // Reset state when user logs out
      setDashboardData({
        totalBalance: 0,
        totalPortfolioValue: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0,
        recentTransactions: [],
        portfolioDistribution: [],
        priceAlerts: [],
        marketOverview: []
      });
    }
  }, [isAuthenticated, fetchDashboardData, fetchMarketData, fetchPortfolioAnalytics, fetchRecentTransactions]);

  const value = {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    fetchMarketData,
    fetchPortfolioAnalytics,
    fetchRecentTransactions,
    setPriceAlert,
    removePriceAlert,
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
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export default DashboardContext;