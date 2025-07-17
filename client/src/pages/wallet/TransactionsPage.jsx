import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  ArrowDownward as InIcon,
  ArrowUpward as OutIcon,
  SwapHoriz as SwapIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as SuccessIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useWallet } from '../../contexts/WalletContext';
import { format } from 'date-fns';

const statusColors = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  confirmed: 'info',
};

const transactionTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'transfer', label: 'Transfers' },
  { value: 'swap', label: 'Swaps' },
  { value: 'trade', label: 'Trades' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'confirmed', label: 'Confirmed' },
];

const TransactionsPage = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const { 
    wallets, 
    selectedWallet, 
    transactions: allTransactions, 
    fetchTransactions,
    loading 
  } = useWallet();
  
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Set selected wallet when component mounts or walletId changes
  useEffect(() => {
    if (walletId && wallets.length > 0) {
      const wallet = wallets.find(w => w.id === walletId);
      if (wallet) {
        // In a real app, you would fetch transactions for this specific wallet
        fetchTransactions(wallet.id);
      }
    }
  }, [walletId, wallets, fetchTransactions]);
  
  // Filter and sort transactions
  useEffect(() => {
    let result = [...allTransactions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.id.toLowerCase().includes(query) ||
        (tx.address && tx.address.toLowerCase().includes(query)) ||
        (tx.txid && tx.txid.toLowerCase().includes(query)) ||
        (tx.description && tx.description.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(tx => tx.status === filterStatus);
    }
    
    // Sort transactions
    result.sort((a, b) => {
      let comparison = 0;
      
      if (orderBy === 'date') {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else if (orderBy === 'amount') {
        comparison = parseFloat(a.amount) - parseFloat(b.amount);
      } else if (orderBy === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (orderBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    setTransactions(result);
  }, [allTransactions, searchQuery, filterType, filterStatus, orderBy, order]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset filters when changing tabs
    setFilterType('all');
    setFilterStatus('all');
    setSearchQuery('');
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle sort
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    if (!selectedWallet) return;
    
    setIsRefreshing(true);
    try {
      await fetchTransactions(selectedWallet.id);
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return <SuccessIcon color={statusColors[status]} />;
      case 'pending':
        return <PendingIcon color={statusColors[status]} />;
      case 'failed':
        return <ErrorIcon color={statusColors[status]} />;
      default:
        return null;
    }
  };
  
  // Get transaction icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <InIcon color="success" />;
      case 'withdrawal':
        return <OutIcon color="error" />;
      case 'transfer':
      case 'swap':
        return <SwapIcon color="info" />;
      default:
        return <ReceiptIcon color="action" />;
    }
  };
  
  // Format amount with sign
  const formatAmount = (tx) => {
    const amount = parseFloat(tx.amount);
    const isReceived = tx.type === 'deposit' || tx.direction === 'in';
    const sign = isReceived ? '+' : '-';
    const color = isReceived ? 'success.main' : 'error.main';
    
    return (
      <Typography variant="body2" color={color}>
        {sign} {amount} {tx.currency}
      </Typography>
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  if (loading && !isRefreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5">
          Transaction History
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isRefreshing}
          sx={{ ml: 2 }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      <Card>
        <CardHeader 
          title={
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Transactions" />
              <Tab label="Deposits" />
              <Tab label="Withdrawals" />
              <Tab label="Transfers" />
              <Tab label="Swaps" />
            </Tabs>
          }
          action={
            <>
              <Box display="flex" alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mr: 2, minWidth: 250 }}
                />
                <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    {transactionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton onClick={handleMenuOpen}>
                  <FilterListIcon />
                </IconButton>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <DownloadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export CSV</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <ReceiptIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export for Taxes</ListItemText>
                </MenuItem>
              </Menu>
            </>
          }
          sx={{ 
            p: 0,
            '& .MuiCardHeader-content': {
              flex: '1 1 auto',
            },
            '& .MuiCardHeader-action': {
              m: 0,
              alignSelf: 'center',
            },
          }}
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'desc'}
                      onClick={() => handleRequestSort('date')}
                    >
                      Date & Time
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'amount'}
                      direction={orderBy === 'amount' ? order : 'desc'}
                      onClick={() => handleRequestSort('amount')}
                    >
                      Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'desc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(tx.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getTransactionIcon(tx.type)}
                            <Box ml={1}>
                              <Typography variant="body2" textTransform="capitalize">
                                {tx.type}
                              </Typography>
                              {tx.direction && (
                                <Typography variant="caption" color="text.secondary">
                                  {tx.direction === 'in' ? 'Incoming' : 'Outgoing'}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {tx.description || 'Transaction'}
                          </Typography>
                          {tx.txid && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                              ID: {tx.txid}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatAmount(tx)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(tx.status)}
                            label={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            size="small"
                            variant="outlined"
                            color={statusColors[tx.status] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No transactions found
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        sx={{ mt: 2 }}
                        onClick={() => {
                          setSearchQuery('');
                          setFilterType('all');
                          setFilterStatus('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {transactions.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={transactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionsPage;
