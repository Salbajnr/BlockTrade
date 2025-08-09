import { create } from 'zustand';
import axios from 'axios';
import { authAPI } from '../services/api.service';

// Set base API URL from environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password, rememberMe = false) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default Authorization header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update auth state
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false
      });

      return { 
        success: true,
        user,
        role: user.role
      };
    } catch (error) {
      console.error('Login error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update auth state
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false
      });

      return { 
        success: true,
        user
      };
    } catch (error) {
      console.error('Registration error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      };
    }
  },

  logout: async () => {
    try {
      // Optional: Call backend logout endpoint if you have one
      // await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side cleanup even if backend logout fails
    } finally {
      // Clear client-side auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];

      // Reset auth state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      });

      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const { user } = response.data;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));

      // Update auth state
      set({ 
        user,
        loading: false 
      });

      return { 
        success: true,
        user 
      };
    } catch (error) {
      console.error('Update profile error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update profile. Please try again.'
      };
    }
  }
}));

// Initialize auth state from localStorage and verify with server
const initializeAuth = async () => {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  if (token && storedUser) {
    try {
      // Set auth header for the verification request
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify token and get fresh user data
      const response = await authAPI.getCurrentUser();
      const user = response.data;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));

      // Update auth state
      useAuthStore.setState({
        user,
        token,
        isAuthenticated: true,
        loading: false
      });
    } catch (error) {
      console.error('Auth verification failed:', error);
      // Clear invalid auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];

      // Reset auth state
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      });
    }
  } else {
    // No stored auth data
    useAuthStore.setState({ loading: false });
  }
};

// Initialize auth state on app load
if (typeof window !== 'undefined') {
  initializeAuth();
}

export const useAuth = () => useAuthStore();