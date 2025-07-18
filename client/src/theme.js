
import { createTheme } from '@mui/material/styles';

// Custom palette colors
const colors = {
  primary: {
    main: '#5D5CDE',
    light: '#7A79E5',
    dark: '#4A49B2',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#424242',
    light: '#616161',
    dark: '#212121',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981', // emerald-500
    light: '#34D399', // emerald-400
    dark: '#059669', // emerald-600
  },
  warning: {
    main: '#F59E0B', // amber-500
    light: '#FBBF24', // amber-400
    dark: '#D97706', // amber-600
  },
  error: {
    main: '#EF4444', // red-500
    light: '#F87171', // red-400
    dark: '#DC2626', // red-600
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
  dark: {
    bg: '#181818',
  },
};

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#5D5CDE',
      light: '#7A79E5',
      dark: '#4A49B2',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF8585',
      dark: '#E55A5A',
      contrastText: '#FFFFFF'
    },
    background: {
      default: mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
      paper: mode === 'dark' ? '#282828' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#F2F2F2' : '#1A1A1A',
      secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
    },
    dark: {
      bg: '#1A1A1A',
      card: '#282828',
      text: '#F2F2F2'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 900,
      letterSpacing: '-0.02em',
      fontSize: '3.5rem',
      lineHeight: 1.1
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.01em',
      fontSize: '2.75rem',
      lineHeight: 1.2
    },
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.01em',
      fontSize: '2.25rem',
      lineHeight: 1.2
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.3
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.4
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.5
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.95rem',
      lineHeight: 1.5
    },
    body1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.6
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.02em'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(93, 92, 222, 0.2)'
          }
        },
        contained: {
          background: mode === 'dark' ? 'linear-gradient(45deg, #5D5CDE 30%, #7A79E5 90%)' : 'linear-gradient(45deg, #5D5CDE 30%, #7A79E5 90%)',
          '&:hover': {
            background: mode === 'dark' ? 'linear-gradient(45deg, #4A49B2 30%, #5D5CDE 90%)' : 'linear-gradient(45deg, #4A49B2 30%, #5D5CDE 90%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: mode === 'dark' 
            ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }
        }
      }
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:nth-of-type(odd)': {
              backgroundColor: mode === 'dark' ? colors.grey[800] : colors.grey[50],
            },
            '&:hover': {
              backgroundColor: mode === 'dark' ? colors.grey[700] : colors.grey[100],
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${mode === 'dark' ? colors.grey[700] : colors.grey[200]}`,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'dark' ? colors.grey[800] : colors.grey[100],
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? colors.grey[600] : colors.grey[300],
            borderRadius: '4px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#5D5CDE',
          '&.Mui-checked': {
            color: '#5D5CDE',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
});

export default getTheme;
