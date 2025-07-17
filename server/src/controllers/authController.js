import { User } from '../models/index.js';
import { generateTokens } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

export const register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      country
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registration successful',
      user: userResponse,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      user: userResponse,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    next(error);
  }
};

export const logout = async (req, res) => {
  // Since we're using JWT, we don't need to do anything server-side
  // The client should remove the tokens
  res.json({ message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
  // User is already attached to req by auth middleware
  const userResponse = req.user.toJSON();
  delete userResponse.password;
  res.json(userResponse);
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, country } = req.body;
    const user = req.user;

    // Update user
    await user.update({
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      country: country || user.country
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
}; 