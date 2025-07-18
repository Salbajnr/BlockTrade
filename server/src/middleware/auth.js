
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from './error.middleware.js';

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // Check if token exists and is in the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError('No authentication token provided', 401));
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new ApiError('Invalid token format', 401));
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new ApiError('Session expired. Please log in again', 401));
      }
      return next(new ApiError('Invalid authentication token', 401));
    }
    
    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: ['role'] // Include role information
    });
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Check if user account is active
    if (user.status !== 'active') {
      return next(new ApiError('Your account has been deactivated. Please contact support.', 403));
    }

    // Attach user to request
    req.user = user.get({ plain: true });
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(new ApiError('Authentication failed', 500));
  }
};

/**
 * Middleware to authorize user roles
 * @param {...string} roles - Allowed roles for the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('User not authenticated', 401));
    }
    
    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to access this resource', 403));
    }
    
    next();
  };
};

/**
 * Middleware to check if user is an admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next(new ApiError('Admin access required', 403));
};

/**
 * Middleware to check if user is a regular user
 */
const isUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    return next();
  }
  next(new ApiError('User access required', 403));
};

/**
 * Generate JWT tokens
 * @param {Object} user - User object
 * @returns {Object} - Access and refresh tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN ? 
      parseInt(process.env.JWT_EXPIRES_IN) : 3600 // Default 1 hour in seconds
  };
};

export {
  authenticate,
  authorize,
  isAdmin,
  isUser,
  generateTokens
};
