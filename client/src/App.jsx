
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext.jsx';
import { DashboardProvider } from './contexts/NewDashboardC.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import getTheme from './theme';

// Layouts
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';

// Pages
import SplashScreen from './components/splash/SplashScreen';
import LandingPage from './components/landing/LandingPage';
import AuthLayout from './components/auth/AuthLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Wallet Pages
import { WalletPage, SendPage, ReceivePage, TransactionsPage } from './pages/wallet';

// Protected route component with enhanced role-based access control
const ProtectedRoute = ({ children, requiredRole = null, redirectTo = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    const from = location.pathname !== '/login' ? location.pathname + location.search : '/dashboard';
    return <Navigate to={`/login?redirect=${encodeURIComponent(from)}`} state={{ from: location }} replace />;
  }
  
  // If role is required but user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const defaultRedirect = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  // If authenticated and has required role, render children
  return children;
};

// Dashboard layout wrapper with role-based access control
const DashboardLayoutWrapper = ({ children, requiredRole = null }) => {
  // Set default redirect based on required role
  const defaultRedirect = requiredRole === 'admin' ? '/dashboard' : '/admin';
  
  return (
    <ProtectedRoute requiredRole={requiredRole} redirectTo={defaultRedirect}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  // Handle initial authentication check and redirection
  useEffect(() => {
    // Hide splash screen after 1 second
    const timer = setTimeout(() => {
      setShowSplash(false);
      
      // If user is already authenticated and on the login/register page, redirect to appropriate dashboard
      if (isAuthenticated && ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)) {
        const redirectTo = user?.role === 'admin' ? '/admin' : '/';
        navigate(redirectTo, { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, location, navigate, user?.role]);

  const theme = getTheme(isDarkMode ? 'dark' : 'light');

  return (
    <CustomThemeProvider value={{ isDarkMode, setIsDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DashboardProvider>
          {showSplash ? (
            <SplashScreen />
          ) : (
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={
                <AuthLayout>
                  <LoginForm />
                </AuthLayout>
              } />
              <Route path="/register" element={
                <AuthLayout>
                  <RegisterForm />
                </AuthLayout>
              } />
              <Route path="/forgot-password" element={
                <AuthLayout>
                  <ForgotPasswordForm />
                </AuthLayout>
              } />
              <Route path="/reset-password" element={
                <AuthLayout>
                  <ResetPasswordForm />
                </AuthLayout>
              } />
              
              {/* Protected user routes */}
              <Route path="/dashboard/*" element={
                <DashboardLayoutWrapper requiredRole="user">
                  <DashboardPage />
                </DashboardLayoutWrapper>
              } />
              
              {/* Wallet routes */}
              <Route path="/wallet" element={
                <DashboardLayoutWrapper requiredRole="user">
                  <WalletPage />
                </DashboardLayoutWrapper>
              } />
              <Route path="/wallet/send/:walletId" element={
                <DashboardLayoutWrapper requiredRole="user">
                  <SendPage />
                </DashboardLayoutWrapper>
              } />
              <Route path="/wallet/receive/:walletId" element={
                <DashboardLayoutWrapper requiredRole="user">
                  <ReceivePage />
                </DashboardLayoutWrapper>
              } />
              <Route path="/wallet/transactions/:walletId" element={
                <DashboardLayoutWrapper requiredRole="user">
                  <TransactionsPage />
                </DashboardLayoutWrapper>
              } />
              
              {/* Protected admin routes */}
              <Route path="/admin/*" element={
                <DashboardLayoutWrapper requiredRole="admin">
                  <AdminDashboardPage />
                </DashboardLayoutWrapper>
              } />
              
              {/* Catch all other routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </DashboardProvider>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}

// Main App component with Router
function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
