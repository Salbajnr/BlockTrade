import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { rateLimit } from 'express-rate-limit';
import { Sequelize } from 'sequelize';
import { sequelize, testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/index.js';
import passwordResetRoutes from './routes/passwordReset.js';
import './models/User.js';
import './models/Wallet.js';
import './models/Transaction.js';
import { setupAssociations } from './models/associations.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/reset', passwordResetRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting server initialization...');

    // Test database connection
    console.log('🔌 Testing database connection...');
    try {
      await testConnection();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }

    // Import and initialize models
    console.log('🔄 Initializing models...');
    try {
      const { initModels } = await import('./models/index.js');
      await initModels();
      console.log('✅ Models initialized successfully');
    } catch (error) {
      console.error('❌ Model initialization failed:', error);
      throw error;
    }

    // Sync database
    console.log('🔄 Syncing database...');
    try {
      await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
      console.log('✅ Database synced successfully');
    } catch (error) {
      console.error('❌ Database sync failed:', error);
      throw error;
    }

    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

    // Enhanced error handling for server startup
    server.on('error', (error) => {
      console.error('❌ Server error:', error);

      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error('❌ Error: ' + bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error('❌ Error: ' + bind + ' is already in use');
          process.exit(1);
          break;
        default:
          console.error('❌ Unhandled server error:', error);
          throw error;
      }
    });

    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('📡 API is ready to accept connections');
      console.log('💡 Press CTRL-C to stop the server\n');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      server.close(() => process.exit(1));
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server stopped successfully');
        process.exit(0);
      });
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server stopped successfully');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('\n❌ Fatal error during server startup:', error);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
};

// Start the server
startServer();