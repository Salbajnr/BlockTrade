
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment
} from '@mui/material';
import * as FiIcons from 'react-icons/fi';
import { useTheme as useThemeContext } from '../../contexts/ThemeContext';

const features = [
  {
    icon: <FiIcons.FiTrendingUp />,
    title: 'User Friendly',
    description: 'Intuitive UI/UX designed for traders of all levels, from beginners to experts.'
  },
  {
    icon: <FiIcons.FiShield />,
    title: '24/7 Support',
    description: 'Our expert team is available around the clock to help you with any questions or issues.'
  },
  {
    icon: <FiIcons.FiZap />,
    title: 'Ironclad Security',
    description: 'Multi-layer encryption, cold storage, and biometric authentication for your assets.'
  },
  {
    icon: <FiIcons.FiCreditCard />,
    title: 'Exclusive Promotions',
    description: 'Enjoy special offers and merchant promos exclusive to BlockTrade users.'
  }
];

const services = [
  {
    icon: <FiIcons.FiTrendingUp />,
    title: 'Real-time Market Data',
    description: 'Live prices, charts, and market trends for all major cryptocurrencies at your fingertips.'
  },
  {
    icon: <FiIcons.FiCreditCard />,
    title: 'Secure Wallet Integration',
    description: 'Manage your digital assets safely with multi-layer encryption and cold storage options.'
  },
  {
    icon: <FiIcons.FiZap />,
    title: 'Automated Trading Bots',
    description: 'Leverage AI-powered bots to execute trades 24/7 based on your strategies and risk preferences.'
  },
  {
    icon: <FiIcons.FiShield />,
    title: 'Portfolio Management',
    description: 'Track, analyze, and optimize your crypto investments with intuitive dashboards and insights.'
  }
];

const paymentMethods = {
  traditional: [
    {
      name: 'Visa',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png'
    },
    {
      name: 'Mastercard',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png'
    },
    {
      name: 'PayPal',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1280px-PayPal.svg.png'
    },
    {
      name: 'Bank Transfer',
      image: 'https://cdn-icons-png.flaticon.com/512/2838/2838895.png'
    }
  ],
  crypto: [
    {
      name: 'Bitcoin',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1024px-Bitcoin.svg.png'
    },
    {
      name: 'Ethereum',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1024px-Ethereum_logo_2014.svg.png'
    },
    {
      name: 'USDT',
      image: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
    },
    {
      name: 'USDC',
      image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    }
  ],
  alternative: [
    {
      name: 'Apple Pay',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/1024px-Apple_Pay_logo.svg.png'
    },
    {
      name: 'Google Pay',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Google_Pay_Logo.svg/1024px-Google_Pay_Logo.svg.png'
    },
    {
      name: 'Wise',
      image: 'https://wise.com/public-resources/assets/logos/wise/logo.svg'
    },
    {
      name: 'Revolut',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Revolut_logo.svg/1024px-Revolut_logo.svg.png'
    }
  ]
};

const testimonials = [
  {
    quote: "BlockTrade's institutional-grade platform has transformed our trading operations. The execution speed and security features are unmatched in the industry.",
    author: "Sarah Chen",
    role: "Head of Trading, Quantum Capital",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80"
  },
  {
    quote: "The advanced analytics and risk management tools have significantly improved our trading performance. BlockTrade is truly a game-changer.",
    author: "Michael Rodriguez",
    role: "Chief Investment Officer, Global Crypto Fund",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80"
  },
  {
    quote: "As a professional trader, I demand the best. BlockTrade delivers with its cutting-edge technology and exceptional support team.",
    author: "David Kim",
    role: "Senior Trader, Digital Asset Partners",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80"
  }
];

export default function LandingPage() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [email, setEmail] = useState('');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleFeatures((prev) => [...prev, entry.target.dataset.index]);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.feature-card, .service-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/register');
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    alert('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: isDarkMode ? 'dark.bg' : 'background.default',
        color: 'text.primary',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: isDarkMode ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 64
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mr: 1,
                  animation: 'spin 10s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              >
                <FiIcons.FiTrendingUp />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                BlockTrade
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button color="inherit" href="#features">
                  Features
                </Button>
                <Button color="inherit" href="#services">
                  Services
                </Button>
                <Button color="inherit" href="#contact">
                  Contact
                </Button>
                <IconButton onClick={toggleTheme} color="inherit">
                  {isDarkMode ? <FiIcons.FiSun /> : <FiIcons.FiMoon />}
                </IconButton>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleLogin}
                  sx={{ ml: 1 }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSignup}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={toggleTheme} color="inherit">
                  {isDarkMode ? <FiIcons.FiSun /> : <FiIcons.FiMoon />}
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <FiIcons.FiMenu />
                </IconButton>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Mobile Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
            width: 280
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileMenuOpen(false)} color="inherit">
            <FiIcons.FiX />
          </IconButton>
        </Box>
        <List>
          <ListItem button href="#features" component="a">
            <ListItemText primary="Features" />
          </ListItem>
          <ListItem button href="#services" component="a">
            <ListItemText primary="Services" />
          </ListItem>
          <ListItem button href="#contact" component="a">
            <ListItemText primary="Contact" />
          </ListItem>
          <ListItem button onClick={handleLogin}>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button onClick={handleSignup}>
            <ListItemText primary="Sign Up" />
          </ListItem>
        </List>
      </Drawer>

      {/* Hero Section */}
      <Box
        component="section"
        id="hero"
        sx={{
          pt: { xs: 12, md: 20 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(160px)',
            opacity: 0.35,
            zIndex: 0,
            mixBlendMode: 'screen',
            animation: 'float 7s ease-in-out infinite alternate'
          },
          '&::before': {
            width: 420,
            height: 420,
            bgcolor: 'primary.main',
            top: -140,
            left: -140,
            animationName: 'float1'
          },
          '&::after': {
            width: 520,
            height: 520,
            bgcolor: 'secondary.main',
            bottom: -200,
            right: -200,
            animationName: 'float2',
            animationDuration: '9s'
          },
          '@keyframes float1': {
            '0%': { transform: 'translateY(0) translateX(0)' },
            '100%': { transform: 'translateY(25px) translateX(20px)' }
          },
          '@keyframes float2': {
            '0%': { transform: 'translateY(0) translateX(0)' },
            '100%': { transform: 'translateY(30px) translateX(-25px)' }
          }
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '4rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                textShadow: `0 0 20px ${theme.palette.primary.main}`,
                animation: 'fadeInUp 1.2s ease forwards',
                opacity: 0,
                transform: 'translateY(30px)',
                animationDelay: '0.3s',
                '@keyframes fadeInUp': {
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              Elevate Your Trading{' '}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Experience
              </Box>
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                mb: 4,
                maxWidth: 700,
                mx: 'auto',
                animation: 'fadeInUp 1.2s ease forwards',
                opacity: 0,
                transform: 'translateY(30px)',
                animationDelay: '0.6s',
                fontWeight: 500
              }}
            >
              Join the elite ranks of professional traders with BlockTrade's institutional-grade platform. 
              Experience lightning-fast execution, advanced analytics, and enterprise-level security in one seamless ecosystem.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                animation: 'fadeInUp 1.2s ease forwards',
                opacity: 0,
                transform: 'translateY(30px)',
                animationDelay: '0.9s'
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleSignup}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: '9999px',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  boxShadow: `0 14px 32px ${theme.palette.primary.main}40`,
                  '&:hover': {
                    boxShadow: `0 20px 48px ${theme.palette.primary.main}40`
                  }
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="#features"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: '9999px',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        component="section"
        id="features"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDarkMode ? 'dark.card' : 'grey.50'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
                textShadow: `0 0 12px ${theme.palette.primary.main}`
              }}
            >
              Why Choose BlockTrade?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Manage everything from your portfolio to real-time market data with our intuitive and powerful platform.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  className="feature-card"
                  data-index={index}
                  sx={{
                    height: '100%',
                    bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: visibleFeatures.includes(index.toString())
                      ? 'translateY(0)'
                      : 'translateY(20px)',
                    opacity: visibleFeatures.includes(index.toString()) ? 1 : 0,
                    '&:hover': {
                      transform: 'translateY(-14px)',
                      boxShadow: `0 0 48px ${theme.palette.primary.main}40`,
                      borderColor: 'primary.main'
                    },
                    border: '1px solid transparent',
                    outlineOffset: 4
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 2,
                      p: 3
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: `drop-shadow(0 0 6px ${theme.palette.primary.main})`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          filter: `drop-shadow(0 0 10px ${theme.palette.secondary.main})`,
                          color: 'secondary.main'
                        }
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 900,
                        color: 'primary.main',
                        letterSpacing: '0.03em'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box
        component="section"
        id="services"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDarkMode ? 'dark.bg' : 'background.default'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
                textShadow: `0 0 12px ${theme.palette.primary.main}`
              }}
            >
              Advanced Trading Features
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Cutting-edge tools to maximize your trading potential and portfolio growth.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  className="service-card"
                  data-index={index}
                  sx={{
                    height: '100%',
                    bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: visibleFeatures.includes(index.toString())
                      ? 'translateY(0)'
                      : 'translateY(20px)',
                    opacity: visibleFeatures.includes(index.toString()) ? 1 : 0,
                    '&:hover': {
                      boxShadow: `0 0 56px ${theme.palette.primary.main}40`,
                      borderColor: 'primary.main'
                    },
                    border: '1px solid transparent',
                    outlineOffset: 4
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      p: 3
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: `drop-shadow(0 0 6px ${theme.palette.secondary.main})`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          filter: `drop-shadow(0 0 12px ${theme.palette.primary.main})`,
                          bgcolor: 'primary.main'
                        }
                      }}
                    >
                      {service.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h4"
                      sx={{
                        fontWeight: 900,
                        color: 'secondary.main',
                        letterSpacing: '0.03em'
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonial Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDarkMode ? 'dark.card' : 'grey.50'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 900,
              mb: 6,
              fontSize: { xs: '2rem', md: '2.75rem' },
              textShadow: `0 0 12px ${theme.palette.primary.main}`
            }}
          >
            Trusted by Industry Leaders
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                quote: "BlockTrade's institutional-grade platform has transformed our trading operations. The execution speed and security features are unmatched in the industry.",
                author: "Sarah Chen",
                role: "Head of Trading, Quantum Capital",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80"
              },
              {
                quote: "The advanced analytics and risk management tools have significantly improved our trading performance. BlockTrade is truly a game-changer.",
                author: "Michael Rodriguez",
                role: "Chief Investment Officer, Global Crypto Fund",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80"
              },
              {
                quote: "As a professional trader, I demand the best. BlockTrade delivers with its cutting-edge technology and exceptional support team.",
                author: "David Kim",
                role: "Senior Trader, Digital Asset Partners",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80"
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src={testimonial.image}
                      alt={testimonial.author}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid',
                        borderColor: 'primary.main'
                      }}
                    />
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                        {testimonial.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      flexGrow: 1,
                      fontStyle: 'italic',
                      position: 'relative',
                      pl: 2,
                      '&::before': {
                        content: '"""',
                        position: 'absolute',
                        left: -8,
                        top: -20,
                        fontSize: '4rem',
                        color: 'primary.main',
                        opacity: 0.2,
                        fontWeight: 900
                      }
                    }}
                  >
                    {testimonial.quote}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Payment Methods Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDarkMode ? 'dark.card' : 'grey.50'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.75rem' },
              textShadow: `0 0 12px ${theme.palette.primary.main}`
            }}
          >
            Global Payment Solutions
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Access a comprehensive suite of payment methods and cryptocurrencies for seamless trading
          </Typography>

          {Object.entries(paymentMethods).map(([category, methods]) => (
            <Box key={category} sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  color: 'primary.main'
                }}
              >
                {category === 'traditional' ? 'Traditional Payments' :
                 category === 'crypto' ? 'Cryptocurrencies' :
                 'Alternative Payments'}
              </Typography>
              <Grid container spacing={3}>
                {methods.map((method) => (
                  <Grid item xs={6} sm={4} md={3} key={method.name}>
                    <Card
                      sx={{
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src={method.image}
                        alt={method.name}
                        sx={{
                          height: 40,
                          width: 'auto',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          filter: isDarkMode ? 'brightness(0.8)' : 'none'
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDarkMode ? 'dark.card' : 'grey.50'
        }}
      >
        <Container maxWidth="md">
          <Card
            sx={{
              bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
              p: { xs: 3, md: 4 },
              textAlign: 'center',
              boxShadow: `0 0 32px ${theme.palette.primary.main}30`
            }}
          >
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontWeight: 900,
                mb: 3,
                textShadow: `0 0 8px ${theme.palette.primary.main}`
              }}
            >
              Stay Ahead with BlockTrade
            </Typography>
            <Box
              component="form"
              onSubmit={handleNewsletterSubmit}
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              <TextField
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  flex: '1 1 300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'grey.100'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiIcons.FiMail />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<FiIcons.FiSend />}
                sx={{
                  borderRadius: '9999px',
                  px: 4,
                  py: 1.5
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box
        component="section"
        id="contact"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDarkMode ? 'dark.bg' : 'background.default'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
                textShadow: `0 0 12px ${theme.palette.primary.main}`
              }}
            >
              Contact Us
            </Typography>
          </Box>

          <Box
            component="form"
            sx={{
              maxWidth: 520,
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <TextField
              fullWidth
              placeholder="Your Name"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiIcons.FiUser />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              type="email"
              placeholder="Your Email"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiIcons.FiMail />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Your Message"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiIcons.FiMessageSquare />
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                alignSelf: 'center',
                width: '50%',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                py: 1.5
              }}
            >
              Send Message
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: isDarkMode ? 'dark.card' : 'background.paper',
          color: 'text.secondary',
          py: 6,
          px: 3
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                component="h4"
                sx={{
                  color: 'primary.main',
                  mb: 2,
                  fontWeight: 900,
                  letterSpacing: '0.02em'
                }}
              >
                BlockTrade
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Next-generation fintech platform offering secure crypto trading and payments.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  sx={{
                    '&:hover': { color: 'secondary.main' }
                  }}
                >
                  <FiIcons.FiTwitter />
                </IconButton>
                <IconButton
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  sx={{
                    '&:hover': { color: 'secondary.main' }
                  }}
                >
                  <FiIcons.FiFacebook />
                </IconButton>
                <IconButton
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  sx={{
                    '&:hover': { color: 'secondary.main' }
                  }}
                >
                  <FiIcons.FiLinkedin />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="h6"
                component="h4"
                sx={{
                  color: 'primary.main',
                  mb: 2,
                  fontWeight: 900,
                  letterSpacing: '0.02em'
                }}
              >
                Quick Links
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button
                    href="#hero"
                    color="inherit"
                    sx={{
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    Home
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button
                    href="#features"
                    color="inherit"
                    sx={{
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    About Us
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button
                    href="#services"
                    color="inherit"
                    sx={{
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    Services
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button
                    href="#contact"
                    color="inherit"
                    sx={{
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    Contact
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                component="h4"
                sx={{
                  color: 'primary.main',
                  mb: 2,
                  fontWeight: 900,
                  letterSpacing: '0.02em'
                }}
              >
                Support
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button
                    href="mailto:support@blocktrade.com"
                    color="inherit"
                    sx={{
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    support@blocktrade.com
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Button
                    href="tel:+1234567890"
                    color="inherit"
                    sx={{
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    +1 234 567 890
                  </Button>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  24/7 Customer Support
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography
                variant="h6"
                component="h4"
                sx={{
                  color: 'primary.main',
                  mb: 2,
                  fontWeight: 900,
                  letterSpacing: '0.02em'
                }}
              >
                Subscribe to Newsletter
              </Typography>
              <Box
                component="form"
                onSubmit={handleNewsletterSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <TextField
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'grey.100'
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    borderRadius: '9999px',
                    textTransform: 'none'
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  mt: 4,
                  color: 'text.secondary',
                  fontSize: '0.85rem'
                }}
              >
                © {new Date().getFullYear()} BlockTrade. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 
