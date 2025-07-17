import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, alpha, styled } from '@mui/material/styles';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  CssBaseline,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  SwapHoriz as SwapHorizIcon,
  AccountBox as AccountBoxIcon,
  ShowChart as ShowChartIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ArrowForward as ArrowForwardIcon,
  FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material';

// Drawer width
const DRAWER_WIDTH = 280;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${DRAWER_WIDTH}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: DRAWER_WIDTH,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// Navigation items
const navItems = [
  { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'users', text: 'Users', icon: <PeopleIcon /> },
  { id: 'transactions', text: 'Transactions', icon: <SwapHorizIcon /> },
  { id: 'kyc', text: 'KYC Verifications', icon: <AccountBoxIcon /> },
  { id: 'reports', text: 'Reports', icon: <ShowChartIcon /> },
  { id: 'settings', text: 'Settings', icon: <SettingsIcon /> },
];

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Handle drawer toggle for mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveMenu(newValue);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle user menu
  const handleUserMenuOpen = (event) => {
    setUserAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
    handleUserMenuClose();
  };
  
  // Toggle theme
  const toggleTheme = () => {
    // Implement theme toggle logic here
    console.log('Toggling theme...');
  };
  
  // Get user initials
  const getUserInitials = (email) => {
    if (!email) return 'A';
    return email.charAt(0).toUpperCase();
  };
  
  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };
  
  // Handle notification click
  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };
  
  // Handle profile click
  const handleProfileClick = () => {
    navigate('/admin/profile');
    setUserAnchorEl(null);
  };
  
  // Handle settings click
  const handleSettingsClick = () => {
    navigate('/admin/settings');
    setUserAnchorEl(null);
  };
  
  // Sidebar content component
  const SidebarContent = () => (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
          BlockTrade Admin
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.id} 
            disablePadding
            onClick={() => handleTabChange(null, item.id)}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
              bgcolor: activeMenu === item.id ? 'action.selected' : 'transparent',
              borderRight: activeMenu === item.id ? `3px solid ${theme.palette.primary.main}` : 'none',
            }}
          >
            <ListItemButton>
              <ListItemIcon sx={{ color: activeMenu === item.id ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: activeMenu === item.id ? 600 : 400,
                  color: activeMenu === item.id ? 'text.primary' : 'text.secondary'
                }} 
              />
              {activeMenu === item.id && (
                <ArrowForwardIcon fontSize="small" color="primary" />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBarStyled 
        position="fixed"
        open={!isMobile}
        sx={{ 
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Search Bar */}
          <Box 
            component="form" 
            onSubmit={handleSearchSubmit}
            sx={{ 
              display: 'flex', 
              flexGrow: 1,
              maxWidth: 600,
              mr: 2
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search users, transactions, etc..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { 
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme Toggle */}
            <Tooltip title={theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit"
                sx={{ mr: 1 }}
              >
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                aria-label="show notifications"
                sx={{ mr: 1 }}
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={userAnchorEl ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={userAnchorEl ? 'true' : undefined}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {getUserInitials('admin@blocktrade.com')}
                </Avatar>
              </IconButton>
              <Menu
                id="account-menu"
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={handleUserMenuClose}
                onClick={handleUserMenuClose}
                PaperProps={{
                  elevation: 2,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleSettingsClick}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
              
              <Box sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                <Typography variant="subtitle2" noWrap>
                  admin@blocktrade.com
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Admin
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBarStyled>
      
      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: DRAWER_WIDTH }, 
          flexShrink: { sm: 0 } 
        }}
        aria-label="sidebar navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
        >
          <SidebarContent />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              position: 'fixed',
              height: '100vh',
              overflowY: 'auto'
            },
          }}
          open
        >
          <SidebarContent />
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Main open={!isMobile}>
        <DrawerHeader />
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          
          {/* Dashboard content goes here */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to BlockTrade Admin Panel
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage your platform's users, transactions, and settings from this dashboard.
            </Typography>
          </Box>
        </Box>
      </Main>
    </Box>
  );
};

export default AdminDashboard;
