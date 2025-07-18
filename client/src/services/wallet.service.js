
import api from './api';

const WalletService = {
  // Get all wallets for the current user
  async getWallets() {
    try {
      const response = await api.get('/wallets');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get a single wallet by ID
  async getWallet(walletId) {
    try {
      const response = await api.get(`/wallets/${walletId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Create a new wallet
  async createWallet(currency) {
    try {
      const response = await api.post('/wallets', { currency });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get wallet transactions
  async getWalletTransactions(walletId, params = {}) {
    try {
      const response = await api.get(`/wallets/${walletId}/transactions`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Request a deposit address
  async getDepositAddress(walletId) {
    try {
      const response = await api.get(`/wallets/${walletId}/deposit-address`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Request a withdrawal
  async requestWithdrawal(walletId, { amount, address, fee, description = '' }) {
    try {
      const response = await api.post(`/wallets/${walletId}/withdraw`, {
        amount,
        address,
        fee,
        description
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get transaction by ID
  async getTransaction(transactionId) {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get all transactions for the current user
  async getTransactions(params = {}) {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Handle API errors
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
};

export default WalletService;
