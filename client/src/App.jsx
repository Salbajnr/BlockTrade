
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { AuthProvider } from './hooks/useAuth.jsx';
import { DashboardProvider } from './contexts/DashboardContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import LandingPage from './components/landing/LandingPage';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardPage from './pages/dashboard/DashboardPage';
import WalletPage from './pages/wallet/WalletPage';
import SendPage from './pages/wallet/SendPage';
import ReceivePage from './pages/wallet/ReceivePage';
import TransactionsPage from './pages/wallet/TransactionsPage';
import Trade from './pages/Trade';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import AdminTransactionsPage from './pages/admin/TransactionsPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#0a0e27',
      paper: '#1a1d3a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    },
  },
});

function App() {
  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token validity
      import('./services/api.service').then(({ authAPI }) => {
        authAPI.getProfile().catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <DashboardProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/wallet" element={
                  <ProtectedRoute>
                    <Layout>
                      <WalletPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/wallet/send" element={
                  <ProtectedRoute>
                    <Layout>
                      <SendPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/wallet/receive" element={
                  <ProtectedRoute>
                    <Layout>
                      <ReceivePage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/wallet/transactions" element={
                  <ProtectedRoute>
                    <Layout>
                      <TransactionsPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/trade" element={
                  <ProtectedRoute>
                    <Layout>
                      <Trade />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminDashboardPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <UsersPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/analytics" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AnalyticsPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/transactions" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminTransactionsPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/settings" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/logs" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <ActivityLogsPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </DashboardProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
