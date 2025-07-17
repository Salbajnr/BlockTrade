import { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  People as PeopleIcon,
  SwapHoriz as SwapHorizIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      padding: theme.spacing(1),
    },
  })
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const userMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Markets', icon: <BarChartIcon />, path: '/markets' },
  { text: 'Wallet', icon: <WalletIcon />, path: '/wallet' },
  { text: 'Transactions', icon: <HistoryIcon />, path: '/transactions' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const adminMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Trades', icon: <SwapHorizIcon />, path: '/admin/trades' },
  { text: 'Transactions', icon: <ReceiptIcon />, path: '/admin/transactions' },
  { text: 'Security', icon: <SecurityIcon />, path: '/admin/security' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

export default function DashboardLayout({ isAdmin = false }) {
  const theme = useMuiTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your BTC order was executed', time: '2 hours ago', read: false },
    { id: 2, text: 'New login from Chrome on Windows', time: '5 hours ago', read: false },
    { id: 3, text: 'ETH price increased by 5%', time: '1 day ago', read: true },
  ]);

  useEffect(() => {
    // Close drawer on mobile when route changes
    if (isMobile) {
      setOpen(false);
    }
  }, [location, isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Button
              color="inherit"
              onClick={handleProfileMenuOpen}
              startIcon={
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontSize: '0.875rem'
                  }}
                >
                  {userInitials}
                </Avatar>
              }
            >
              {user?.name || 'User'}
            </Button>
          </Box>
        </Toolbar>
      </AppBarStyled>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap component="div" sx={{ ml: 2, fontWeight: 'bold' }}>
              {isAdmin ? 'Admin Panel' : 'BlockTrade'}
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
        </DrawerHeader>
        
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              mb: 1,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {userInitials}
          </Avatar>
          <Typography variant="subtitle1" noWrap>
            {user?.name || 'User Name'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email || 'user@example.com'}
          </Typography>
          {isAdmin && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AdminIcon color="primary" fontSize="small" />
              <Typography variant="caption" color="primary">
                Administrator
              </Typography>
            </Box>
          )}
        </Box>
        
        <Divider />
        
        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding
              component={RouterLink}
              to={item.path}
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                '&.active': {
                  backgroundColor: theme.palette.action.selected,
                  '& .MuiListItemButton-root': {
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                  },
                },
              }}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <ListItemButton>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      
      <Main open={open}>
        <DrawerHeader />
        <Box sx={{ p: isMobile ? 0 : 2, pt: 0 }}>
          <Outlet />
        </Box>
      </Main>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
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
        <MenuItem onClick={() => navigate('/profile')}>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <Avatar> <SettingsIcon fontSize="small" /> </Avatar> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
