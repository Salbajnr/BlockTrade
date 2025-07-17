import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Button, IconButton, Chip,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Tooltip
} from '@mui/material';
import { Search, FileDownload, CheckCircle, Cancel, HelpOutline } from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';

const TransactionsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [actionType, setActionType] = useState('approve');
  
  const { transactions, loading, fetchAllTransactions, updateTransactionStatus } = useDashboard();

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const handleUpdateStatus = async (transactionId, status) => {
    try {
      await updateTransactionStatus(transactionId, { status });
      fetchAllTransactions();
      setOpenStatusDialog(false);
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Type', 'Amount', 'Currency', 'Status', 'Date', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.id,
        `"${tx.user?.email || 'N/A'}"`,
        tx.type,
        tx.amount,
        tx.currency,
        tx.status,
        new Date(tx.createdAt).toLocaleString(),
        `"${tx.details || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'primary';
      case 'withdrawal': return 'secondary';
      case 'trade': return 'info';
      case 'fee': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1">Transaction Monitoring</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<FileDownload />}
          onClick={exportToCSV}
        >
          Export to CSV
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="deposit">Deposit</MenuItem>
              <MenuItem value="withdrawal">Withdrawal</MenuItem>
              <MenuItem value="trade">Trade</MenuItem>
              <MenuItem value="fee">Fee</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.transactions ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Tooltip title={tx.id}>
                      <span>{tx.id.substring(0, 8)}...</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{tx.user?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} 
                      color={getTypeColor(tx.type)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {tx.amount} {tx.currency}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)} 
                      color={getStatusColor(tx.status)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewTransaction(tx)}
                        color="primary"
                      >
                        <HelpOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {tx.status === 'pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedTransaction(tx);
                              setActionType('approve');
                              setOpenStatusDialog(true);
                            }}
                            color="success"
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedTransaction(tx);
                              setActionType('reject');
                              setOpenStatusDialog(true);
                            }}
                            color="error"
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Transaction Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <div>
                  <Typography variant="subtitle2">Transaction ID</Typography>
                  <Typography>{selectedTransaction.id}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">User</Typography>
                  <Typography>{selectedTransaction.user?.email || 'N/A'}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Type</Typography>
                  <Chip 
                    label={selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)} 
                    color={getTypeColor(selectedTransaction.type)}
                    size="small" 
                  />
                </div>
                <div>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip 
                    label={selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)} 
                    color={getStatusColor(selectedTransaction.status)}
                    size="small" 
                  />
                </div>
                <div>
                  <Typography variant="subtitle2">Amount</Typography>
                  <Typography>{selectedTransaction.amount} {selectedTransaction.currency}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Fee</Typography>
                  <Typography>{selectedTransaction.fee || '0.00'} {selectedTransaction.currency}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography>{new Date(selectedTransaction.createdAt).toLocaleString()}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Last Updated</Typography>
                  <Typography>{new Date(selectedTransaction.updatedAt).toLocaleString()}</Typography>
                </div>
              </Box>
              
              {selectedTransaction.details && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Additional Details</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                    {selectedTransaction.details}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Transaction' : 'Reject Transaction'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'approve' 
              ? `Are you sure you want to approve this transaction (${selectedTransaction?.id})?`
              : `Are you sure you want to reject this transaction (${selectedTransaction?.id})?`
            }
            {actionType === 'reject' && (
              <TextField
                autoFocus
                margin="dense"
                id="reason"
                label="Reason for rejection"
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
              />
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleUpdateStatus(
              selectedTransaction?.id, 
              actionType === 'approve' ? 'completed' : 'rejected'
            )}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
