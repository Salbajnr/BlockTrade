import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' 
    ? './test-db.sqlite' 
    : './blocktrade.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Define User model
class User extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

// Add static method to hash password
User.hashPassword = async function(user) {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
};

// Initialize User model
User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: User.hashPassword,
    beforeUpdate: User.hashPassword
  }
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app and HTTP server
const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      country,
      is_admin: false,
      is_verified: false
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_admin: user.is_admin,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_admin: user.is_admin,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  console.log('\n=== Forgot Password Request ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ Email is required');
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    console.log('🔍 Looking for user with email:', email);
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      // For security, don't reveal that the email doesn't exist
      return res.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent' 
      });
    }
    
    console.log('✅ User found:', user.id);
    
    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Set token expiry (1 hour from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    
    console.log('Generated token:', token);
    console.log('Hashed token:', hashedToken);
    console.log('Token expires at:', expiryDate);
    
    // Update user with reset token and expiry
    user.reset_password_token = hashedToken;
    user.reset_password_expires = expiryDate;
    
    await user.save();
    
    console.log('✅ Reset token saved to user');
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&id=${user.id}`;
    
    console.log('Reset URL:', resetUrl);
    
    // In a real app, you would send an email here with the reset URL
    console.log('📧 Sending password reset email to:', user.email);
    console.log('Reset URL:', resetUrl);
    
    // For now, we'll just return the reset URL in the response
    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email',
      resetUrl // In production, don't return this in the response
    });
    
  } catch (error) {
    console.error('❌ Error in forgot password:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Error processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify reset token endpoint
app.get('/api/auth/verify-reset-token/:token', async (req, res) => {
  console.log('\n=== Verify Reset Token Request ===');
  console.log('Token:', req.params.token);
  console.log('Query params:', req.query);
  
  try {
    const { token } = req.params;
    const { userId } = req.query;
    
    if (!token || !userId) {
      console.log('❌ Missing token or userId');
      return res.status(400).json({ 
        valid: false, 
        message: 'Token and user ID are required',
        details: 'Token or user ID is missing in the request'
      });
    }
    
    console.log('🔍 Looking for user with ID:', userId);
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log('❌ User not found with ID:', userId);
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired token',
        details: 'No user found with the provided ID'
      });
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      hasResetToken: !!user.reset_password_token,
      tokenExpiry: user.reset_password_expires
    });
    
    if (!user.reset_password_token) {
      console.log('❌ No reset token found for user');
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired token',
        details: 'No reset token found for user'
      });
    }
    
    // Check if token is expired first
    const now = new Date();
    if (user.reset_password_expires && now > new Date(user.reset_password_expires)) {
      console.log('❌ Token expired');
      console.log('Current time:', now);
      console.log('Token expiry:', user.reset_password_expires);
      
      return res.status(400).json({ 
        valid: false, 
        message: 'Token has expired',
        details: `Token expired at ${user.reset_password_expires}`
      });
    }
    
    // Hash the token from the request
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    console.log('🔑 Token verification:');
    console.log('- Hashed token from DB:', user.reset_password_token);
    console.log('- Hashed token from request:', hashedToken);
    
    if (user.reset_password_token !== hashedToken) {
      console.log('❌ Token mismatch');
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired token',
        details: 'Token does not match the one in the database'
      });
    }
    
    console.log('✅ Token is valid');
    res.json({ 
      valid: true, 
      message: 'Token is valid',
      details: {
        userId: user.id,
        email: user.email,
        expires: user.reset_password_expires
      }
    });
    
  } catch (error) {
    console.error('❌ Error verifying reset token:', {
      message: error.message,
      stack: error.stack,
      token: req.params.token,
      userId: req.query.userId
    });
    
    res.status(500).json({ 
      valid: false, 
      message: 'Error verifying token',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password/:token', async (req, res) => {
  console.log('\n=== Reset Password Request ===');
  console.log('Token:', req.params.token);
  console.log('Request body:', req.body);
  
  try {
    const { token } = req.params;
    const { password, userId } = req.body;
    
    if (!token || !password || !userId) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Token, user ID and new password are required',
        details: 'One or more required fields are missing'
      });
    }
    
    console.log('🔍 Looking for user with ID:', userId);
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log('❌ User not found with ID:', userId);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token',
        details: 'No user found with the provided ID'
      });
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      hasResetToken: !!user.reset_password_token,
      tokenExpiry: user.reset_password_expires
    });
    
    if (!user.reset_password_token) {
      console.log('❌ No reset token found for user');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token',
        details: 'No reset token found for user'
      });
    }
    
    // Check if token is expired
    const now = new Date();
    if (user.reset_password_expires && now > new Date(user.reset_password_expires)) {
      console.log('❌ Token expired');
      console.log('Current time:', now);
      console.log('Token expiry:', user.reset_password_expires);
      
      return res.status(400).json({ 
        success: false, 
        message: 'Token has expired',
        details: `Token expired at ${user.reset_password_expires}`
      });
    }
    
    // Hash the token from the request
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    console.log('🔑 Token verification:');
    console.log('- Hashed token from DB:', user.reset_password_token);
    console.log('- Hashed token from request:', hashedToken);
    
    if (user.reset_password_token !== hashedToken) {
      console.log('❌ Token mismatch');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token',
        details: 'Token does not match the one in the database'
      });
    }
    
    // Update the user's password and clear the reset token
    console.log('🔄 Updating user password...');
    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    
    // Save the user (this will trigger the password hashing)
    await user.save();
    
    console.log('✅ Password updated successfully');
    
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully',
      details: {
        userId: user.id,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Error resetting password:', {
      message: error.message,
      stack: error.stack,
      token: req.params.token,
      userId: req.body.userId
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('\n🔁 Database synced');
    
    // Start the HTTP server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      
      // Log all available routes
      console.log('\n🛣️  Available routes:');
      app._router.stack
        .filter(r => r.route)
        .map(r => {
          const method = Object.keys(r.route.methods)[0].toUpperCase();
          const path = r.route.path;
          console.log(`  ${method.padEnd(6)} ${path}`);
        });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Start the server
startServer();
