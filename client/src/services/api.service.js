import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Wallet API
export const walletAPI = {
  getWallets: () => api.get('/wallets'),
  getWallet: (id) => api.get(`/wallets/${id}`),
  createWallet: (data) => api.post('/wallets', data),
  getTransactions: (walletId) => api.get(`/wallets/${walletId}/transactions`),
  sendTransaction: (data) => api.post('/transactions/send', data),
  getBalance: (walletId) => api.get(`/wallets/${walletId}/balance`)
};

// Trading API
export const tradingAPI = {
  getTradingPairs: () => api.get('/trading/pairs'),
  getMarketData: () => api.get('/trading/market-data'),
  placeOrder: (orderData) => api.post('/trading/orders', orderData),
  getOrders: () => api.get('/trading/orders'),
  cancelOrder: (orderId) => api.delete(`/trading/orders/${orderId}`),
  getOrderHistory: () => api.get('/trading/orders/history'),
  getTrades: () => api.get('/trading/trades')
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTransactions: () => api.get('/admin/transactions'),
  getAnalytics: () => api.get('/admin/analytics'),
  getActivityLogs: () => api.get('/admin/activity-logs'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data)
};

export default api;