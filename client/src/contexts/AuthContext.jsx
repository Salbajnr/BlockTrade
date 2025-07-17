import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = AuthService.getStoredUser();
        
        if (token && storedUser) {
          // Verify token is still valid
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const { user, token } = await AuthService.login(credentials);
      setUser(user);
      return { success: true };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const { user, token } = await AuthService.register(userData);
      setUser(user);
      return { success: true };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    setUser(null);
    navigate('/login');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const updatedUser = await AuthService.updateProfile(userData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwords) => {
    try {
      setError(null);
      await AuthService.changePassword(passwords);
      return { success: true };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = AuthService.isAuthenticated();

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
