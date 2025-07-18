
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function SplashScreen() {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const SPLASH_DURATION = 1000; // 1 second
    const ANIMATION_STEPS = 20;
    const STEP_DURATION = SPLASH_DURATION / ANIMATION_STEPS;

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 / ANIMATION_STEPS);
        return Math.min(newProgress, 100);
      });
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        animation: 'fadeIn 0.3s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 }
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' }
          }
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.1,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'expand 1s ease-out infinite',
            '@keyframes expand': {
              '0%': { width: 120, height: 120, opacity: 0.1 },
              '100%': { width: 200, height: 200, opacity: 0 }
            }
          }}
        />
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            boxShadow: theme => `0 0 20px ${theme.palette.primary.main}40`
          }}
        >
          <i className="fas fa-chart-line" />
        </Box>
      </Box>

      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: 1,
          background: theme => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        BlockTrade
      </Typography>

      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Advanced Cryptocurrency Trading
      </Typography>

      <Box
        sx={{
          width: 200,
          height: 4,
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: `${progress}%`,
            height: '100%',
            bgcolor: 'primary.main',
            transition: 'width 0.1s ease-out'
          }}
        />
      </Box>
    </Box>
  );
}
