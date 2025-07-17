import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Update with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions if you're using them
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Format error message
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const walletAPI = {
  getWallets: () => api.get('/wallets'),
  getWallet: (walletId) => api.get(`/wallets/${walletId}`),
  createWallet: (currency) => api.post('/wallets', { currency }),
  getDepositAddress: (walletId) => api.get(`/wallets/${walletId}/deposit-address`),
  requestWithdrawal: (walletId, data) => api.post(`/wallets/${walletId}/withdraw`, data),
  getTransactions: (walletId, params) => 
    api.get(walletId ? `/wallets/${walletId}/transactions` : '/transactions', { params }),
  getTransaction: (transactionId) => api.get(`/transactions/${transactionId}`),
};

export const tradingAPI = {
  getMarketData: (pair = 'BTC/USDT') => api.get(`/markets/${pair}`),
  getOrderBook: (pair = 'BTC/USDT') => api.get(`/markets/${pair}/orderbook`),
  getTrades: (pair = 'BTC/USDT', params) => api.get(`/markets/${pair}/trades`, { params }),
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  cancelOrder: (orderId) => api.delete(`/orders/${orderId}`),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getKYCStatus: () => api.get('/users/me/kyc'),
  submitKYC: (data) => api.post('/users/me/kyc', data),
  getSecurityLogs: () => api.get('/users/me/security-logs'),
  enable2FA: () => api.post('/users/me/enable-2fa'),
  verify2FA: (code) => api.post('/users/me/verify-2fa', { code }),
  disable2FA: (code) => api.post('/users/me/disable-2fa', { code }),
};

export default api;
