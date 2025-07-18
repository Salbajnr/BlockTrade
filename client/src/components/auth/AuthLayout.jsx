
import { Box, Container, IconButton, Typography, useTheme } from '@mui/material';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';
import * as FiIcons from 'react-icons/fi';

export default function AuthLayout({ children, title, subtitle }) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? 'dark.bg' : 'background.default',
        color: isDarkMode ? 'dark.text' : 'text.primary',
        backgroundImage: isDarkMode
          ? 'radial-gradient(circle at 30% 107%, rgba(93, 92, 222, 0.1) 0%, rgba(93, 92, 222, 0.1) 5%, transparent 45%), radial-gradient(circle at 70% 40%, rgba(93, 92, 222, 0.1) 0%, rgba(93, 92, 222, 0.1) 25%, transparent 70%)'
          : 'radial-gradient(circle at 30% 107%, rgba(93, 92, 222, 0.05) 0%, rgba(93, 92, 222, 0.05) 5%, transparent 45%), radial-gradient(circle at 70% 40%, rgba(93, 92, 222, 0.05) 0%, rgba(93, 92, 222, 0.05) 25%, transparent 70%)',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          BlockTrade
        </Typography>
        <IconButton
          onClick={toggleTheme}
          sx={{
            color: isDarkMode ? 'warning.main' : 'text.secondary',
            '&:hover': {
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          {isDarkMode ? <FiIcons.FiSun /> : <FiIcons.FiMoon />}
        </IconButton>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 1
            }}
          >
            BlockTrade
          </Typography>
          {title && (
            <Typography variant="h5" component="h2" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          borderTop: 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} BlockTrade. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography
              component="a"
              href="#"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Terms
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Privacy
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Support
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
