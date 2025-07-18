import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { CircularProgress, Alert, Snackbar } from '@mui/material';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Divider, 
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Format price history data for the chart
const formatPriceHistory = (history) => {
  if (!history || !history.length) {
    return {
      labels: [],
      datasets: [{
        label: 'BTC/USDT',
        data: [],
        borderColor: '#5D5CDE',
        backgroundColor: 'rgba(93, 92, 222, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0
      }]
    };
  }
  
  return {
    labels: history.map(item => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit' })),
    datasets: [{
      label: 'BTC/USDT',
      data: history.map(item => item.price),
      borderColor: '#5D5CDE',
      backgroundColor: 'rgba(93, 92, 222, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0
    }]
  };
};

const priceChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8
      }
    },
    y: {
      position: 'right',
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};

// Data for the portfolio distribution
const portfolioData = {
  labels: ['Bitcoin', 'Ethereum', 'USDC', 'Solana', 'Other'],
  datasets: [
    {
      data: [45, 30, 15, 7, 3],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)', // yellow
        'rgba(99, 102, 241, 0.8)',  // indigo
        'rgba(16, 185, 129, 0.8)',  // emerald
        'rgba(139, 92, 246, 0.8)',  // purple
        'rgba(239, 68, 68, 0.8)'    // red
      ],
      borderColor: [
        'rgba(245, 158, 11, 1)',
        'rgba(99, 102, 241, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 1,
    },
  ],
};

const portfolioOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.label}: ${context.raw}%`;
        }
      }
    }
  },
  cutout: '70%',
};

// Format transactions data
const formatTransactions = (txs = []) => {
  return txs.map(tx => ({
    ...tx,
    date: tx.createdAt || tx.date
  }));
};

const DashboardPage = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('24h');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Get data from dashboard context
  const {
    portfolio,
    recentTransactions: txs,
    priceHistory,
    loading,
    error,
    fetchPortfolio,
    fetchRecentTransactions,
    fetchPriceHistory
  } = useDashboard();
  
  // Show error in snackbar if any
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error.message || 'An error occurred while loading data');
      setSnackbarOpen(true);
    }
  }, [error]);
  
  // Format data
  const assets = portfolio?.assets || [];
  const transactions = formatTransactions(txs);
  const priceChartData = formatPriceHistory(priceHistory);
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchPortfolio(),
          fetchRecentTransactions(5),
          fetchPriceHistory('BTC/USDT', timeRange)
        ]);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    
    loadData();
  }, [fetchPortfolio, fetchRecentTransactions, fetchPriceHistory, timeRange]);
  
  // Handle time range change
  const handleTimeRangeChange = useCallback((event) => {
    setTimeRange(event.target.value);
    fetchPriceHistory('BTC/USDT', event.target.value);
  }, [fetchPriceHistory]);
  
  // Calculate totals
  const totalValue = portfolio?.totalValue || assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const portfolioChange24h = portfolio?.change24h || assets.reduce((sum, asset) => {
    const assetChange = ((asset.value || 0) * (asset.change24h || 0)) / 100;
    return sum + assetChange;
  }, 0);
  
  const portfolioChangePercent = portfolio?.change24h || (portfolioChange24h / (totalValue - portfolioChange24h)) * 100 || 0;
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Show loading state
  if (loading.portfolio || loading.priceHistory) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      {/* Header with portfolio value */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ typography: { xs: 'h5', sm: 'h4' } }}>
          Dashboard
        </Typography>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', sm: '2.4rem' } }}>
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography 
                variant="body1" 
                sx={{ 
                  color: portfolioChange24h >= 0 ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {portfolioChange24h >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                {portfolioChange24h >= 0 ? '+' : ''}{portfolioChangePercent.toFixed(2)}% (${Math.abs(portfolioChange24h).toFixed(2)})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Last 24h
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Buy / Sell
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Deposit
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Withdraw
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        {/* Stats cards content will go here */}
      </Grid>

      {/* Charts and Tables */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ '& .MuiGrid-item': { minWidth: 0 } }}>
        {/* Price Chart and other components will go here */}
      </Grid>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '400px' } }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
