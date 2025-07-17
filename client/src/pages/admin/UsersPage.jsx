import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Button, IconButton, Chip,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import { Search, MoreVert, Lock, LockOpen, FileDownload, Visibility } from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false);
  
  const { users, loading, fetchUsers, updateUserStatus } = useDashboard();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleSuspendUser = async (userId, suspend) => {
    try {
      await updateUserStatus(userId, { isSuspended: suspend });
      fetchUsers();
      setOpenSuspendDialog(false);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !user.isSuspended) ||
      (statusFilter === 'suspended' && user.isSuspended);
    
    return matchesSearch && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = ['ID', 'Name', 'Email', 'Status', 'KYC Status', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.firstName} ${user.lastName}"`,
        user.email,
        user.isSuspended ? 'Suspended' : 'Active',
        user.kycStatus || 'Not Submitted',
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1">User Management</Typography>
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
            placeholder="Search users..."
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
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>KYC Status</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.users ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isSuspended ? 'Suspended' : 'Active'} 
                      color={user.isSuspended ? 'error' : 'success'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.kycStatus || 'Not Submitted'} 
                      color={
                        user.kycStatus === 'verified' ? 'success' : 
                        user.kycStatus === 'pending' ? 'warning' : 'default'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewUser(user)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenSuspendDialog(true);
                      }}
                    >
                      {user.isSuspended ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* User Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <div>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography>{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography>{selectedUser.email}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip 
                    label={selectedUser.isSuspended ? 'Suspended' : 'Active'} 
                    color={selectedUser.isSuspended ? 'error' : 'success'} 
                    size="small" 
                  />
                </div>
                <div>
                  <Typography variant="subtitle2">KYC Status</Typography>
                  <Chip 
                    label={selectedUser.kycStatus || 'Not Submitted'} 
                    color={
                      selectedUser.kycStatus === 'verified' ? 'success' : 
                      selectedUser.kycStatus === 'pending' ? 'warning' : 'default'
                    } 
                    size="small" 
                  />
                </div>
                <div>
                  <Typography variant="subtitle2">Registration Date</Typography>
                  <Typography>{new Date(selectedUser.createdAt).toLocaleString()}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Last Login</Typography>
                  <Typography>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</Typography>
                </div>
              </Box>
              
              {/* Add more user details here */}
              
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Suspend/Activate Confirmation Dialog */}
      <Dialog open={openSuspendDialog} onClose={() => setOpenSuspendDialog(false)}>
        <DialogTitle>
          {selectedUser?.isSuspended ? 'Activate User Account' : 'Suspend User Account'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.isSuspended 
              ? `Are you sure you want to activate ${selectedUser?.email}?`
              : `Are you sure you want to suspend ${selectedUser?.email}? This will prevent the user from logging in.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuspendDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleSuspendUser(selectedUser?.id, !selectedUser?.isSuspended)}
            color={selectedUser?.isSuspended ? 'success' : 'error'}
            variant="contained"
          >
            {selectedUser?.isSuspended ? 'Activate' : 'Suspend'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
