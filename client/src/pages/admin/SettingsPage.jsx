import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardHeader, Divider,
  TextField, Button, Switch, FormControlLabel, FormGroup, FormControl,
  InputLabel, Select, MenuItem, Snackbar, Alert, Tabs, Tab, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Chip, Tooltip
} from '@mui/material';
import { 
  Save, Security, SettingsBackupRestore, Lock, LockOpen, 
  Add, Delete, Edit, CloudUpload, CloudDownload, Refresh
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    twoFactorAuth: true,
    apiRateLimit: 100,
    sessionTimeout: 30,
    emailNotifications: true,
    securityAlerts: true,
    marketStatus: 'active',
    tradingFees: {
      maker: 0.1,
      taker: 0.2
    },
    withdrawalLimits: {
      daily: 10000,
      monthly: 100000
    },
    kycRequired: true
  });

  const [backups, setBackups] = useState([
    { id: 1, name: 'backup_20230501', date: '2023-05-01T12:00:00Z', size: '24.5 MB' },
    { id: 2, name: 'backup_20230415', date: '2023-04-15T08:30:00Z', size: '22.1 MB' },
    { id: 3, name: 'backup_20230401', date: '2023-04-01T10:15:00Z', size: '21.8 MB' },
  ]);

  const { systemStatus, loading, updateSystemSettings, createBackup, restoreBackup } = useDashboard();

  useEffect(() => {
    // In a real app, you would fetch current settings from the API
    // fetchSystemSettings().then(data => setSettings(data));
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // In a real app, you would save the settings to the API
      // await updateSystemSettings(settings);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    }
  };

  const handleCreateBackup = async () => {
    try {
      // In a real app, you would call the API to create a backup
      // const backup = await createBackup(backupName);
      const newBackup = {
        id: Date.now(),
        name: backupName || `backup_${new Date().toISOString().split('T')[0]}`,
        date: new Date().toISOString(),
        size: '0.0 MB'
      };
      setBackups(prev => [newBackup, ...prev]);
      setBackupDialogOpen(false);
      setBackupName('');
      setSnackbar({
        open: true,
        message: 'Backup created successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create backup',
        severity: 'error'
      });
    }
  };

  const handleRestoreBackup = async (backupId) => {
    if (window.confirm('Are you sure you want to restore this backup? This action cannot be undone.')) {
      try {
        // In a real app, you would call the API to restore a backup
        // await restoreBackup(backupId);
        setSnackbar({
          open: true,
          message: 'Backup restored successfully',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to restore backup',
          severity: 'error'
        });
      }
    }
  };

  const handleDeleteBackup = (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      setSnackbar({
        open: true,
        message: 'Backup deleted successfully',
        severity: 'success'
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // General
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="General Settings" />
                <Divider />
                <CardContent>
                  <FormGroup sx={{ gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Maintenance Mode"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.registrationEnabled}
                          onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="User Registration"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Email Notifications"
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel id="market-status-label">Market Status</InputLabel>
                      <Select
                        labelId="market-status-label"
                        value={settings.marketStatus}
                        onChange={(e) => handleSettingChange('marketStatus', e.target.value)}
                        label="Market Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="paused">Paused</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="API Rate Limit (requests/min)"
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                    <TextField
                      label="Session Timeout (minutes)"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Trading Settings" />
                <Divider />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Trading Fees (%)</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Maker Fee"
                        type="number"
                        value={settings.tradingFees.maker}
                        onChange={(e) => handleNestedSettingChange('tradingFees', 'maker', parseFloat(e.target.value))}
                        fullWidth
                        InputProps={{
                          endAdornment: <span>%</span>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Taker Fee"
                        type="number"
                        value={settings.tradingFees.taker}
                        onChange={(e) => handleNestedSettingChange('tradingFees', 'taker', parseFloat(e.target.value))}
                        fullWidth
                        InputProps={{
                          endAdornment: <span>%</span>,
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>Withdrawal Limits (USD)</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Daily Limit"
                        type="number"
                        value={settings.withdrawalLimits.daily}
                        onChange={(e) => handleNestedSettingChange('withdrawalLimits', 'daily', parseFloat(e.target.value))}
                        fullWidth
                        InputProps={{
                          startAdornment: <span>$</span>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Monthly Limit"
                        type="number"
                        value={settings.withdrawalLimits.monthly}
                        onChange={(e) => handleNestedSettingChange('withdrawalLimits', 'monthly', parseFloat(e.target.value))}
                        fullWidth
                        InputProps={{
                          startAdornment: <span>$</span>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      case 1: // Security
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Security Settings" />
                <Divider />
                <CardContent>
                  <FormGroup sx={{ gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.twoFactorAuth}
                          onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Require Two-Factor Authentication"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.securityAlerts}
                          onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Email Security Alerts"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.kycRequired}
                          onChange={(e) => handleSettingChange('kycRequired', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Require KYC Verification"
                    />
                    <TextField
                      label="Failed Login Attempts Before Lockout"
                      type="number"
                      value={5}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled
                    />
                    <TextField
                      label="Account Lockout Duration (minutes)"
                      type="number"
                      value={30}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Lock />}
                      sx={{ mt: 2, alignSelf: 'flex-start' }}
                    >
                      View Security Logs
                    </Button>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="API Security" />
                <Divider />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Manage API keys and access controls for your account.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    sx={{ mb: 2 }}
                  >
                    Create New API Key
                  </Button>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Trading API" 
                        secondary="Created: 2023-05-15 • Last used: 2023-06-01" 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Read-Only API" 
                        secondary="Created: 2023-04-10 • Last used: 2023-06-10" 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      case 2: // Backup & Restore
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Backup & Restore" 
                  action={
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<Add />}
                      onClick={() => setBackupDialogOpen(true)}
                    >
                      Create Backup
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    Create and manage database backups. Backups include all system data and settings.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownload />}
                      onClick={() => setSnackbar({ open: true, message: 'Exporting database...', severity: 'info' })}
                    >
                      Export Database
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      component="label"
                    >
                      Import Database
                      <input type="file" hidden />
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => setSnackbar({ open: true, message: 'Refreshing backup list...', severity: 'info' })}
                    >
                      Refresh
                    </Button>
                  </Box>

                  <Typography variant="h6" gutterBottom>Available Backups</Typography>
                  {backups.length === 0 ? (
                    <Typography color="textSecondary">No backups available</Typography>
                  ) : (
                    <List>
                      {backups.map((backup) => (
                        <ListItem key={backup.id} divider>
                          <ListItemText 
                            primary={backup.name} 
                            secondary={`${new Date(backup.date).toLocaleString()} • ${backup.size}`} 
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Restore Backup">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleRestoreBackup(backup.id)}
                                color="primary"
                              >
                                <SettingsBackupRestore />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Backup">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleDeleteBackup(backup.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">System Settings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Save Changes
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="General" />
          <Tab label="Security" />
          <Tab label="Backup & Restore" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <Typography>Loading settings...</Typography>
        </Box>
      ) : (
        renderTabContent()
      )}

      {/* Backup Creation Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Backup</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new backup. If left empty, a default name with the current date will be used.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Backup Name"
            fullWidth
            variant="outlined"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder={`backup_${new Date().toISOString().split('T')[0]}`}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBackup} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
