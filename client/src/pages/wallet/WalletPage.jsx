import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Tabs, 
  Tab, 
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon, 
  Add as AddIcon, 
  ContentCopy as CopyIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  SwapHoriz as SwapIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    wallets, 
    selectedWallet, 
    transactions, 
    loading, 
    error,
    setSelectedWallet,
    fetchWallets,
    createWallet,
    requestWithdrawal,
    getDepositAddress
  } = useWallet();
  
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [depositAddress, setDepositAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const open = Boolean(anchorEl);

  // Fetch wallets on component mount
  useEffect(() => {
    if (user) {
      fetchWallets();
    }
  }, [user, fetchWallets]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle wallet selection
  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  // Handle create new wallet
  const handleCreateWallet = async (currency = 'BTC') => {
    try {
      await createWallet(currency);
      setSnackbar({
        open: true,
        message: `New ${currency} wallet created successfully`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create wallet',
        severity: 'error'
      });
    }
  };

  // Handle copy to clipboard
  const handleCopyAddress = async () => {
    if (selectedWallet) {
      try {
        await navigator.clipboard.writeText(selectedWallet.address);
        setSnackbar({
          open: true,
          message: 'Address copied to clipboard',
          severity: 'success'
        });
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  // Handle get deposit address
  const handleGetDepositAddress = async () => {
    if (!selectedWallet) return;
    
    setIsLoadingAddress(true);
    try {
      const address = await getDepositAddress(selectedWallet.id);
      setDepositAddress(address);
      setSnackbar({
        open: true,
        message: 'Deposit address generated',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to get deposit address:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to generate deposit address',
        severity: 'error'
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format balance
  const formatBalance = (balance, currency) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(balance) + ' ' + currency;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && wallets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Wallets Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">My Wallets</Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateWallet('BTC')}
                >
                  New
                </Button>
              </Box>
              
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {wallets.map((wallet) => (
                  <Card 
                    key={wallet.id}
                    sx={{ 
                      mb: 1, 
                      cursor: 'pointer',
                      bgcolor: selectedWallet?.id === wallet.id ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleWalletSelect(wallet)}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1">
                            {wallet.currency} Wallet
                            {wallet.is_default && (
                              <Typography component="span" variant="caption" color="primary" ml={1}>
                                Default
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {wallet.balance} {wallet.currency}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleWalletSelect(wallet);
                          handleMenuOpen(e);
                        }}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet Details */}
        <Grid item xs={12} md={8}>
          {selectedWallet ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {selectedWallet.currency} Wallet
                  </Typography>
                  <Box>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<SendIcon />}
                      sx={{ mr: 1 }}
                      onClick={() => navigate(`/wallet/send/${selectedWallet.id}`)}
                    >
                      Send
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<SwapIcon />}
                      onClick={() => navigate(`/wallet/swap/${selectedWallet.id}`)}
                    >
                      Swap
                    </Button>
                  </Box>
                </Box>

                
                <Box textAlign="center" py={4}>
                  <Typography variant="h4" gutterBottom>
                    {selectedWallet.balance} {selectedWallet.currency}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    ≈ ${(selectedWallet.balance * 30000).toFixed(2)} USD
                  </Typography>
                  
                  <Box display="flex" justifyContent="center" gap={2} mt={3}>
                    <Button 
                      variant="outlined" 
                      startIcon={<ReceiptIcon />}
                      onClick={handleGetDepositAddress}
                      disabled={isLoadingAddress}
                    >
                      {isLoadingAddress ? 'Generating...' : 'Receive'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<HistoryIcon />}
                      onClick={() => navigate(`/wallet/transactions/${selectedWallet.id}`)}
                    >
                      History
                    </Button>
                  </Box>
                  
                  {depositAddress && (
                    <Box mt={3} p={2} bgcolor="action.hover" borderRadius={1}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Your {selectedWallet.currency} deposit address:
                      </Typography>
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="space-between"
                        bgcolor="background.paper" 
                        p={1} 
                        borderRadius={1}
                      >
                        <Typography variant="body2" fontFamily="monospace">
                          {depositAddress}
                        </Typography>
                        <IconButton size="small" onClick={handleCopyAddress}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    aria-label="wallet tabs"
                    sx={{ mb: 2 }}
                  >
                    <Tab label="Transactions" />
                    <Tab label="Send & Receive" />
                    <Tab label="Swap" />
                  </Tabs>
                  
                  {activeTab === 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        Recent Transactions
                      </Typography>
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <Box key={tx.id} mb={2} p={2} bgcolor="action.hover" borderRadius={1}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">
                                {tx.type === 'deposit' ? 'Received' : 'Sent'} {tx.amount} {tx.currency}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color={tx.type === 'deposit' ? 'success.main' : 'error.main'}
                              >
                                {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(tx.created_at)}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                          No transactions yet
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {activeTab === 1 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body1" color="text.secondary" mb={3}>
                        Send and receive {selectedWallet.currency} with ease
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate(`/wallet/send/${selectedWallet.id}`)}
                        sx={{ mr: 2 }}
                      >
                        Send {selectedWallet.currency}
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={handleGetDepositAddress}
                        disabled={isLoadingAddress}
                      >
                        {isLoadingAddress ? 'Generating...' : 'Receive'}
                      </Button>
                    </Box>
                  )}
                  
                  {activeTab === 2 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="h6" gutterBottom>
                        Swap {selectedWallet.currency} to other cryptocurrencies
                      </Typography>
                      <Typography variant="body1" color="text.secondary" mb={3}>
                        Instantly exchange between different cryptocurrencies at the best rates
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigate(`/wallet/swap/${selectedWallet.id}`)}
                      >
                        Start Swap
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <WalletIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No wallet selected
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    Select a wallet from the sidebar or create a new one to get started.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleCreateWallet('BTC')}
                  >
                    Create New Wallet
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Wallet Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate(`/wallet/receive/${selectedWallet?.id}`)}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Receive</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate(`/wallet/send/${selectedWallet?.id}`)}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate(`/wallet/swap/${selectedWallet?.id}`)}>
          <ListItemIcon>
            <SwapIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Swap</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (selectedWallet?.address) {
            navigator.clipboard.writeText(selectedWallet.address);
            handleCloseSnackbar();
            setSnackbar({
              open: true,
              message: 'Wallet address copied to clipboard',
              severity: 'success'
            });
          }
        }}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Address</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          // Implement view on blockchain explorer
          const explorerUrl = `https://blockchain.info/address/${selectedWallet?.address}`;
          window.open(explorerUrl, '_blank');
        }}>
          <ListItemText>View on Explorer</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WalletPage;
