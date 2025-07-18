
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ApiError } from '../middleware/error.middleware.js';

class AuthService {
  /**
   * Hash a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT tokens
   * @param {Object} user - User object
   * @returns {Object} Access and refresh tokens
   */
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @param {string} secret - JWT secret
   * @returns {Object} Decoded token payload
   */
  verifyToken(token, secret = process.env.JWT_SECRET) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new ApiError('Invalid or expired token', 401);
    }
  }

  /**
   * Generate random token
   * @param {number} length - Token length in bytes
   * @returns {string} Random hex token
   */
  generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate verification token
   * @returns {Object} Token and expiry
   */
  generateVerificationToken() {
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    return {
      token,
      expiresAt
    };
  }

  /**
   * Generate password reset token
   * @returns {Object} Token and expiry
   */
  generatePasswordResetToken() {
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    return {
      token,
      expiresAt
    };
  }

  /**
   * Generate 2FA code
   * @returns {Object} Code and expiry
   */
  generate2FACode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    return {
      code,
      expiresAt
    };
  }

  /**
   * Exclude sensitive fields from user object
   * @param {Object} user - User object
   * @returns {Object} User object without sensitive fields
   */
  excludeSensitiveFields(user) {
    const {
      password,
      password_reset_token,
      password_reset_expires,
      email_verification_token,
      email_verification_expires,
      two_factor_secret,
      ...userWithoutSensitiveFields
    } = user;

    return userWithoutSensitiveFields;
  }
}

const authService = new AuthService();

export const {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyToken,
  generateRandomToken,
  generateVerificationToken,
  generatePasswordResetToken,
  generate2FACode,
  excludeSensitiveFields
} = authService;

export default authService;
