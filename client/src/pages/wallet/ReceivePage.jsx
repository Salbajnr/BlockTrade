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
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tab,
  Tabs,
  Alert,
  Link,
  Paper
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  ContentCopy as CopyIcon, 
  Check as CheckIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useWallet } from '../../contexts/WalletContext';
import QRCode from 'qrcode.react';

const ReceivePage = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const { wallets, getDepositAddress, loading } = useWallet();
  const [depositAddress, setDepositAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState(null);
  
  const selectedWallet = wallets.find(w => w.id === walletId) || wallets[0];
  
  // Generate deposit address when component mounts or wallet changes
  useEffect(() => {
    const fetchDepositAddress = async () => {
      if (!selectedWallet) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const address = await getDepositAddress(selectedWallet.id);
        setDepositAddress(address);
      } catch (err) {
        console.error('Failed to get deposit address:', err);
        setError('Failed to generate deposit address. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDepositAddress();
  }, [selectedWallet, getDepositAddress]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle copy to clipboard
  const handleCopyAddress = async () => {
    if (!depositAddress) return;
    
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };
  
  // Generate payment request URI
  const generatePaymentUri = () => {
    if (!selectedWallet || !depositAddress) return '';
    
    let uri = `${selectedWallet.currency.toLowerCase()}:${depositAddress}`;
    const params = [];
    
    if (amount) {
      params.push(`amount=${encodeURIComponent(amount)}`);
    }
    
    if (memo) {
      params.push(`message=${encodeURIComponent(memo)}`);
    }
    
    if (params.length > 0) {
      uri += `?${params.join('&')}`;
    }
    
    return uri;
  };
  
  // Handle share functionality
  const handleShare = async () => {
    const paymentUri = generatePaymentUri();
    const shareData = {
      title: `My ${selectedWallet.currency} Address`,
      text: `Send ${selectedWallet.currency} to my wallet`,
      url: paymentUri,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(paymentUri);
        alert('Payment link copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };
  
  // Handle download QR code
  const handleDownloadQrCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${selectedWallet.currency}-address-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/wallet')}
          startIcon={<BackIcon />}
        >
          Back to Wallet
        </Button>
      </Box>
    );
  }
  
  const paymentUri = generatePaymentUri();
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5">
          Receive {selectedWallet?.currency}
        </Typography>
      </Box>
      
      <Card>
        <CardHeader 
          title={`Deposit ${selectedWallet?.currency}`}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <Divider />
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Address" />
          <Tab label="Payment Request" />
        </Tabs>
        
        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="center" mb={3}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'white',
                    borderRadius: 2
                  }}
                >
                  {depositAddress ? (
                    <QRCode 
                      id="qr-code-canvas"
                      value={depositAddress}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <CircularProgress />
                  )}
                </Paper>
              </Box>
              
              <Typography variant="body2" color="text.secondary" align="center" mb={1}>
                Scan the QR code or copy the address below
              </Typography>
              
              <Box 
                sx={{
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 2,
                  position: 'relative',
                  minHeight: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  wordBreak: 'break-all',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                }}
              >
                {depositAddress || 'Generating address...'}
                {copied && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'success.main',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Copied!
                  </Box>
                )}
              </Box>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={handleCopyAddress}
                    disabled={!depositAddress}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadQrCode}
                    disabled={!depositAddress}
                  >
                    Save QR
                  </Button>
                </Grid>
              </Grid>
              
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Important:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Only send {selectedWallet?.currency} to this address.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Ensure the network is {selectedWallet?.currency}.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Transactions typically require 1-3 network confirmations.
                </Typography>
              </Box>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="center" mb={3}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'white',
                    borderRadius: 2
                  }}
                >
                  {paymentUri ? (
                    <QRCode 
                      value={paymentUri}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <CircularProgress />
                  )}
                </Paper>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {selectedWallet?.currency}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Memo (Optional)"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    helperText="Add a note to identify this payment"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                    disabled={!paymentUri}
                  >
                    Share Payment Request
                  </Button>
                </Grid>
              </Grid>
              
              {paymentUri && (
                <Box mt={3} p={2} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Payment Request URI:
                  </Typography>
                  <Box 
                    sx={{
                      p: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      wordBreak: 'break-all',
                      maxHeight: 80,
                      overflow: 'auto',
                    }}
                  >
                    {paymentUri}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Box mt={2}>
        <Alert severity="info" variant="outlined">
          <Typography variant="body2">
            <strong>Note:</strong> This address can only be used to receive {selectedWallet?.currency}.
            Sending any other digital assets will result in permanent loss.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default ReceivePage;
