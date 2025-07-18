
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Paper,
  InputAdornment,
  useTheme
} from '@mui/material';
import { FiMail } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';

export default function ForgotPasswordForm() {
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

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
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email address and we'll send you a link to reset your password
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Password reset link has been sent to your email address. Please check your inbox.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiMail style={{ color: theme.palette.text.secondary }} />
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
          {loading ? 'Sending...' : success ? 'Email Sent' : 'Send Reset Link'}
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
