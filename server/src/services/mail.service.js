
import nodemailer from 'nodemailer';
import { ApiError } from '../middleware/error.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

class MailService {
  constructor() {
    // Configure transporter based on environment
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'development') {
      // Use ethereal.email for development
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Use production email service
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  async sendVerificationEmail(email, verificationToken, name) {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verificationUrl = `${clientUrl}/verify-email/${verificationToken}`;
      
      const mailOptions = {
        from: `BlockTrade <${process.env.EMAIL_FROM || 'noreply@blocktrade.com'}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a56db;">Welcome to BlockTrade!</h2>
            <p>Hi ${name},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Verify Email
            </a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email verification sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new ApiError('Failed to send email verification', 500);
    }
  }

  async sendPasswordResetEmail(email, resetToken, name) {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `BlockTrade <${process.env.EMAIL_FROM || 'noreply@blocktrade.com'}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a56db;">Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your BlockTrade password. Click the button below to set a new password:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new ApiError('Failed to send password reset email', 500);
    }
  }

  async sendPasswordChangedEmail(email, name) {
    try {
      const mailOptions = {
        from: `BlockTrade <${process.env.EMAIL_FROM || 'noreply@blocktrade.com'}>`,
        to: email,
        subject: 'Password Changed Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a56db;">Password Changed</h2>
            <p>Hi ${name},</p>
            <p>Your BlockTrade password has been successfully changed.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password changed email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password changed email:', error);
      throw new ApiError('Failed to send password changed email', 500);
    }
  }

  async sendWelcomeEmail(email, name) {
    try {
      const mailOptions = {
        from: `BlockTrade <${process.env.EMAIL_FROM || 'noreply@blocktrade.com'}>`,
        to: email,
        subject: 'Welcome to BlockTrade!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a56db;">Welcome to BlockTrade!</h2>
            <p>Hi ${name},</p>
            <p>Welcome to BlockTrade! Your account has been successfully verified.</p>
            <p>You can now start trading cryptocurrencies on our platform.</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new ApiError('Failed to send welcome email', 500);
    }
  }

  async send2FACode(email, code, name) {
    try {
      const mailOptions = {
        from: `BlockTrade <${process.env.EMAIL_FROM || 'noreply@blocktrade.com'}>`,
        to: email,
        subject: 'Your 2FA Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a56db;">2FA Verification Code</h2>
            <p>Hi ${name},</p>
            <p>Your verification code is: <strong style="font-size: 24px; color: #1a56db;">${code}</strong></p>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('2FA code email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending 2FA code email:', error);
      throw new ApiError('Failed to send 2FA code email', 500);
    }
  }
}

const mailService = new MailService();

export const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  send2FACode
} = mailService;

export default mailService;
