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
