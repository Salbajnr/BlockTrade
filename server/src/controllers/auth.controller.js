
import { User } from '../models/User.js';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/error.middleware.js';
import { generateTokens } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mail.service.js';

// Helper function to exclude sensitive fields from user object
const excludeSensitiveFields = (user) => {
  const { password, password_reset_token, email_verification_token, ...userWithoutSensitiveFields } = user;
  return userWithoutSensitiveFields;
};

const register = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { email, password, firstName, lastName, country } = req.body;

    // Validate password strength
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
      await transaction.rollback();
      return next(new ApiError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email },
      transaction
    });
    
    if (existingUser) {
      await transaction.rollback();
      return next(new ApiError('Email already registered', 400));
    }

    // Check if admin user already exists
    const adminUser = await User.findOne({
      where: { role: 'admin' },
      transaction
    });

    // Set role based on whether admin exists
    const role = adminUser ? 'user' : 'admin';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      country,
      role,
      status: 'active',
      is_email_verified: false
    }, { transaction });

    // Generate verification token
    const verificationToken = await user.generateVerificationToken();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, `${firstName} ${lastName}`);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Commit transaction
    await transaction.commit();

    // Return response
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: excludeSensitiveFields(user),
      accessToken,
      refreshToken
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find user with matching verification token
    const user = await User.findOne({
      where: {
        email_verification_token: token,
        email_verification_expires: {
          [sequelize.literal('>')]: new Date()
        }
      }
    });

    if (!user) {
      return next(new ApiError('Invalid or expired verification token', 400));
    }

    // Verify email
    await user.verifyEmail();

    res.json({
      success: true,
      message: 'Email verified successfully!',
      user: excludeSensitiveFields(user)
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: {
        email,
        is_email_verified: false
      }
    });

    if (!user) {
      return next(new ApiError('User not found or email already verified', 404));
    }

    // Generate new verification token
    const verificationToken = await user.generateVerificationToken();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, `${user.first_name} ${user.last_name}`);

    res.json({
      success: true,
      message: 'Verification email sent successfully!'
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: {
        email
      }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset email'
      });
    }

    // Generate reset token
    const resetToken = await user.generateResetToken();

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken, `${user.first_name} ${user.last_name}`);

    res.json({
      success: true,
      message: 'Password reset email sent successfully!'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate password match
    if (password !== confirmPassword) {
      return next(new ApiError('Passwords do not match', 400));
    }

    // Validate password strength
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
      return next(new ApiError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 400));
    }

    // Find user with matching reset token
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          [sequelize.literal('>')]: new Date()
        }
      }
    });

    if (!user) {
      return next(new ApiError('Invalid or expired password reset token', 400));
    }

    // Reset password
    await user.resetPassword(password);

    res.json({
      success: true,
      message: 'Password reset successfully!'
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new ApiError('Invalid email or password', 401));
    }

    // Check if account is active
    if (user.status !== 'active') {
      return next(new ApiError('Your account has been deactivated. Please contact support.', 403));
    }

    // Generate tokens
    const tokens = generateTokens(user);
    
    // Get user data without sensitive fields
    const userData = excludeSensitiveFields(user.get({ plain: true }));

    res.json({
      success: true,
      data: {
        user: userData,
        tokens: tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(new ApiError('Login failed', 500));
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Get user data without sensitive fields
    const userData = excludeSensitiveFields(user);
    
    res.json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    next(new ApiError('Error fetching profile', 500));
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ApiError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Generate new tokens
    const tokens = generateTokens(user);
    
    res.json({
      success: true,
      data: {
        tokens
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Refresh token expired', 401));
    }
    next(new ApiError('Error refreshing token', 500));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new ApiError('Current password is incorrect', 401));
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return next(new ApiError('New password must be at least 8 characters', 400));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await User.update(
      { password: hashedPassword },
      { where: { id: user.id } }
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    next(new ApiError('Error changing password', 500));
  }
};

const logout = async (req, res, next) => {
  try {
    // In a real application, you would invalidate the token here
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(new ApiError('Error logging out', 500));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, country } = req.body;
    const user = req.user;

    // Validate required fields
    if (!firstName || !lastName || !country) {
      return next(new ApiError('First name, last name, and country are required', 400));
    }

    // Update user
    await User.update(
      { 
        first_name: firstName,
        last_name: lastName,
        country
      },
      { where: { id: user.id } }
    );

    // Get updated user data
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!updatedUser) {
      return next(new ApiError('User not found', 404));
    }

    res.json({
      success: true,
      data: {
        user: excludeSensitiveFields(updatedUser)
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    next(new ApiError('Error updating profile', 500));
  }
};

export {
  register,
  login,
  getProfile,
  refreshToken,
  changePassword,
  logout,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
};
