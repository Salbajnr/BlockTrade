import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  ContentCopy as CopyIcon, 
  Check as CheckIcon,
  ArrowForward as SendIcon
} from '@mui/icons-material';
import { useWallet } from '../../contexts/WalletContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .typeError('Must be a valid number'),
  address: Yup.string()
    .required('Recipient address is required')
    .min(26, 'Address is too short')
    .max(64, 'Address is too long'),
  fee: Yup.number()
    .required('Fee is required')
    .min(0, 'Fee cannot be negative')
    .typeError('Must be a valid number'),
  note: Yup.string()
    .max(200, 'Note is too long')
});

const SendPage = () => {
  const { walletId } = useParams();
  const navigate = useNavigate();
  const { wallets, selectedWallet, requestWithdrawal, loading, error } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [feeOptions, setFeeOptions] = useState([
    { value: 'slow', label: 'Slow', description: '~10-30 min', multiplier: 1 },
    { value: 'average', label: 'Average', description: '~5-10 min', multiplier: 1.5 },
    { value: 'fast', label: 'Fast', description: '~1-5 min', multiplier: 2 }
  ]);
  const [selectedFee, setSelectedFee] = useState('average');
  const [currentFee, setCurrentFee] = useState(0.0001);

  // Set the selected wallet when the component mounts or walletId changes
  useEffect(() => {
    if (walletId && wallets.length > 0) {
      const wallet = wallets.find(w => w.id === walletId);
      if (wallet) {
        // In a real app, you would fetch recommended fees from an API
        const baseFee = 0.0001; // This would come from an API
        setCurrentFee(baseFee * feeOptions.find(f => f.value === selectedFee)?.multiplier || 1);
      } else {
        navigate('/wallet');
      }
    }
  }, [walletId, wallets, selectedFee, navigate]);

  const formik = useFormik({
    initialValues: {
      amount: '',
      address: '',
      fee: currentFee,
      note: ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!selectedWallet) return;
      
      setIsSubmitting(true);
      setSuccess(false);
      
      try {
        const response = await requestWithdrawal(selectedWallet.id, {
          amount: parseFloat(values.amount),
          address: values.address,
          fee: values.fee,
          description: values.note
        });
        
        setTransactionId(response.id);
        setSuccess(true);
        formik.resetForm();
      } catch (error) {
        console.error('Send transaction failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handle fee selection change
  const handleFeeChange = (event) => {
    const feeType = event.target.value;
    setSelectedFee(feeType);
    const baseFee = 0.0001; // This would come from an API
    const newFee = baseFee * feeOptions.find(f => f.value === feeType)?.multiplier || 1;
    setCurrentFee(newFee);
    formik.setFieldValue('fee', newFee);
  };

  // Handle paste from clipboard
  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      formik.setFieldValue('address', text.trim());
    } catch (err) {
      console.error('Failed to read from clipboard', err);
    }
  };

  // Format balance display
  const formatBalance = (balance, currency) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(balance) + ' ' + currency;
  };

  if (!selectedWallet) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5">
          Send {selectedWallet.currency}
        </Typography>
      </Box>
      
      <Card>
        <CardHeader 
          title={`Available: ${formatBalance(selectedWallet.balance, selectedWallet.currency)}`} 
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
        <Divider />
        <CardContent>
          {success ? (
            <Box textAlign="center" py={4}>
              <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Transaction Sent Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Your {selectedWallet.currency} has been sent to the recipient.
              </Typography>
              <Box textAlign="left" bgcolor="action.hover" p={2} borderRadius={1} mb={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Transaction ID:
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontFamily="monospace">
                    {transactionId || 'Pending...'}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      if (transactionId) {
                        navigator.clipboard.writeText(transactionId);
                      }
                    }}
                    disabled={!transactionId}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                  setSuccess(false);
                  formik.resetForm();
                }}
                sx={{ mr: 2 }}
              >
                Send Another
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/wallet')}
              >
                Back to Wallet
              </Button>
            </Box>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="amount"
                    name="amount"
                    label={`Amount (${selectedWallet.currency})`}
                    type="text"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={formik.touched.amount && formik.errors.amount}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            size="small" 
                            onClick={() => {
                              formik.setFieldValue('amount', selectedWallet.balance - currentFee);
                            }}
                            disabled={!selectedWallet.balance}
                          >
                            MAX
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Recipient Address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            size="small" 
                            onClick={handlePasteAddress}
                            edge="end"
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={formik.touched.feeType && Boolean(formik.errors.feeType)}>
                    <InputLabel id="fee-type-label">Transaction Fee</InputLabel>
                    <Select
                      labelId="fee-type-label"
                      id="feeType"
                      value={selectedFee}
                      label="Transaction Fee"
                      onChange={handleFeeChange}
                    >
                      {feeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}: {option.description} ({option.multiplier}x)
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Estimated fee: {currentFee} {selectedWallet.currency}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="note"
                    name="note"
                    label="Note (Optional)"
                    multiline
                    rows={2}
                    value={formik.values.note}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.note && Boolean(formik.errors.note)}
                    helperText={formik.touched.note && formik.errors.note}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Amount to send
                    </Typography>
                    <Typography variant="body2">
                      {formik.values.amount || '0'} {selectedWallet.currency}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Network Fee
                    </Typography>
                    <Typography variant="body2">
                      {currentFee} {selectedWallet.currency}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="subtitle2">
                      Total
                    </Typography>
                    <Typography variant="subtitle2">
                      {(parseFloat(formik.values.amount || 0) + currentFee).toFixed(8)} {selectedWallet.currency}
                    </Typography>
                  </Box>
                </Grid>
                
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    size="large"
                    disabled={isSubmitting || !formik.isValid || !formik.dirty}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SendPage;
