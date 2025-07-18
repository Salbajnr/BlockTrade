
import crypto from 'crypto';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../services/mail.service.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Request a password reset for a user
 */
export const requestReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // For security, don't reveal if the email exists or not
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Save token to user
    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetTokenExpires
    });
    
    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset a user's password using a valid reset token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Find user by reset token
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      throw new ApiError('Invalid or expired reset token', 400);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null
    });
    
    res.json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    next(error);
  }
};
