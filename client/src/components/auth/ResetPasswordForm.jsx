
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';

export default function ResetPasswordForm() {
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { resetPassword, validateResetToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError('Invalid or missing reset token');
        return;
      }

      try {
        const result = await validateResetToken(token);
        if (!result.valid) {
          setTokenValid(false);
          setError('This password reset link has expired or is invalid');
        }
      } catch (err) {
        setTokenValid(false);
        setError('Error validating reset token');
      }
    };

    validateToken();
  }, [token, validateResetToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!tokenValid) {
      setError('Invalid or expired reset token');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, formData.password);
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          mx: 'auto',
          bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'error.main', fontWeight: 700 }}>
            Invalid Reset Link
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This password reset link has expired or is invalid. Please request a new password reset link.
          </Typography>
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
          >
            Request New Reset Link
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        width: '100%',
        mx: 'auto',
        bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
        animation: 'fadeIn 0.5s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your new password below
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your password has been reset successfully. You will be redirected to the login page shortly.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="New Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading || success}
          placeholder="••••••••"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiLock style={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading || success}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number
        </Typography>

        <TextField
          fullWidth
          label="Confirm New Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading || success}
          placeholder="••••••••"
          sx={{ mt: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiLock style={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading || success}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? 'Resetting Password...' : success ? 'Password Reset' : 'Reset Password'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" component="span" color="text.secondary">
            Remember your password?{' '}
          </Typography>
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Sign in
          </Link>
        </Box>
      </Box>
    </Paper>
  );
}
