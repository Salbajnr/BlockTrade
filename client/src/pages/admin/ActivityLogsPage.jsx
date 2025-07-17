import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, Divider, Tabs, Tab, Badge
} from '@mui/material';
import { 
  Search, FilterList, InfoOutlined, Clear, CheckCircle, 
  Cancel, Security, Lock, LockOpen, Person, Settings, SyncAlt
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useDashboard } from '../../contexts/DashboardContext';

// Mock data for activity logs
const generateMockLogs = (count = 100) => {
  const actions = ['login', 'logout', 'transaction', 'settings_update', 'user_action'];
  const statuses = ['success', 'failed', 'pending'];
  const users = [
    { id: 'user1', email: 'admin@example.com', role: 'admin' },
    { id: 'user2', email: 'user1@example.com', role: 'user' },
    { id: 'user3', email: 'user2@example.com', role: 'user' },
    { id: 'user4', email: 'support@example.com', role: 'support' },
  ];
  
  const logs = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const timestamp = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    logs.push({
      id: `log_${i}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action,
      status,
      timestamp,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      details: {
        message: `${action.replace('_', ' ')} ${status}`,
        ...(action === 'transaction' && {
          txId: `tx_${Math.random().toString(36).substr(2, 9)}`,
          amount: (Math.random() * 1000).toFixed(2),
          currency: 'USD',
          type: Math.random() > 0.5 ? 'deposit' : 'withdrawal'
        }),
        ...(action === 'settings_update' && {
          field: ['email_notifications', 'two_factor', 'api_key', 'password'][Math.floor(Math.random() * 4)],
          oldValue: 'old_value',
          newValue: 'new_value'
        })
      }
    });
  }
  
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

const ActivityLogsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action: 'all',
    status: 'all',
    userRole: 'all',
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // In a real app, you would fetch logs from the API
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { activityLogs, fetchActivityLogs } = useDashboard();

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch logs from the API
        // await fetchActivityLogs();
        // For now, use mock data
        setTimeout(() => {
          setLogs(generateMockLogs(100));
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading activity logs:', error);
        setLoading(false);
      }
    };
    
    loadLogs();
  }, [fetchActivityLogs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      action: 'all',
      status: 'all',
      userRole: 'all',
    });
    setSearchTerm('');
    setActiveTab('all');
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return <LockOpen color="primary" />;
      case 'logout':
        return <Lock color="secondary" />;
      case 'transaction':
        return <SyncAlt color="success" />;
      case 'settings_update':
        return <Settings color="info" />;
      case 'user_action':
        return <Person color="action" />;
      default:
        return <InfoOutlined color="disabled" />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'success':
        return <Chip icon={<CheckCircle />} label="Success" color="success" size="small" />;
      case 'failed':
        return <Chip icon={<Cancel />} label="Failed" color="error" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Filter logs based on search term and filters
  const filteredLogs = logs.filter(log => {
    // Filter by search term (searches in user email and action details)
    const matchesSearch = searchTerm === '' || 
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by action type
    const matchesAction = filters.action === 'all' || log.action === filters.action;
    
    // Filter by status
    const matchesStatus = filters.status === 'all' || log.status === filters.status;
    
    // Filter by user role
    const matchesUserRole = filters.userRole === 'all' || log.userRole === filters.userRole;
    
    // Filter by active tab
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'security' && ['login', 'logout', 'settings_update'].includes(log.action)) ||
      (activeTab === 'transactions' && log.action === 'transaction') ||
      (activeTab === 'users' && ['user_action', 'settings_update'].includes(log.action));
    
    return matchesSearch && matchesAction && matchesStatus && matchesUserRole && matchesTab;
  });

  // Pagination
  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Count logs by category for badges
  const logCounts = logs.reduce((acc, log) => {
    acc.all++;
    
    if (['login', 'logout', 'settings_update'].includes(log.action)) {
      acc.security++;
    }
    
    if (log.action === 'transaction') {
      acc.transactions++;
    }
    
    if (['user_action', 'settings_update'].includes(log.action)) {
      acc.users++;
    }
    
    return acc;
  }, { all: 0, security: 0, transactions: 0, users: 0 });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">Activity Logs</Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>All Activities</span>
                {logCounts.all > 0 && (
                  <Badge 
                    badgeContent={logCounts.all} 
                    color="primary" 
                    sx={{ ml: 1 }} 
                    max={999}
                  />
                )}
              </Box>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 0.5 }} />
                <span>Security</span>
                {logCounts.security > 0 && (
                  <Badge 
                    badgeContent={logCounts.security} 
                    color="primary" 
                    sx={{ ml: 1 }} 
                    max={999}
                  />
                )}
              </Box>
            } 
            value="security" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SyncAlt sx={{ mr: 0.5 }} />
                <span>Transactions</span>
                {logCounts.transactions > 0 && (
                  <Badge 
                    badgeContent={logCounts.transactions} 
                    color="primary" 
                    sx={{ ml: 1 }} 
                    max={999}
                  />
                )}
              </Box>
            } 
            value="transactions" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 0.5 }} />
                <span>User Actions</span>
                {logCounts.users > 0 && (
                  <Badge 
                    badgeContent={logCounts.users} 
                    color="primary" 
                    sx={{ ml: 1 }} 
                    max={999}
                  />
                )}
              </Box>
            } 
            value="users" 
          />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              label="Action Type"
            >
              <MenuItem value="all">All Actions</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="transaction">Transaction</MenuItem>
              <MenuItem value="settings_update">Settings Update</MenuItem>
              <MenuItem value="user_action">User Action</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>User Role</InputLabel>
            <Select
              value={filters.userRole}
              onChange={(e) => handleFilterChange('userRole', e.target.value)}
              label="User Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="support">Support</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={resetFilters}
            sx={{ ml: 'auto' }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Logs Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Loading activity logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No activity logs found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getActionIcon(log.action)}
                        <span style={{ textTransform: 'capitalize' }}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <div>{log.userEmail}</div>
                        <Chip 
                          label={log.userRole} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            height: '20px', 
                            fontSize: '0.7rem',
                            textTransform: 'capitalize'
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {log.details.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(log.status)}
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>
                      <Tooltip title={new Date(log.timestamp).toLocaleString()}>
                        <span>
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(log)}
                        >
                          <InfoOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Log Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Activity Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Log ID</Typography>
                  <Typography>{selectedLog.id}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Action</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getActionIcon(selectedLog.action)}
                    <span style={{ textTransform: 'capitalize' }}>
                      {selectedLog.action.replace('_', ' ')}
                    </span>
                  </Box>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  {getStatusChip(selectedLog.status)}
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Timestamp</Typography>
                  <Typography>{new Date(selectedLog.timestamp).toLocaleString()}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">User</Typography>
                  <Typography>{selectedLog.userEmail} <Chip label={selectedLog.userRole} size="small" /></Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">IP Address</Typography>
                  <Typography>{selectedLog.ipAddress}</Typography>
                </div>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Details</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap', 
                  wordWrap: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </Paper>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">User Agent</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {selectedLog.userAgent}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivityLogsPage;
