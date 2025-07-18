
import api from './api';

const AuthService = {
  // Register a new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return this.handleAuthResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return this.handleAuthResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/me', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Change password
  async changePassword(passwords) {
    try {
      const response = await api.put('/auth/change-password', passwords);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  },

  // Handle authentication response (login/register)
  handleAuthResponse(response) {
    const { token, user } = response.data;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return { user, token };
  },

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'An error occurred');
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default AuthService;
