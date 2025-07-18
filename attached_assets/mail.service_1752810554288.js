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
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Use production email service
      this.transporter = nodemailer.createTransport({
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
      const verificationUrl = `${config.clientUrl}/verify-email/${verificationToken}`;
      
      const mailOptions = {
        from: `BlockTrade <${config.email.from}>`,
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
      const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `BlockTrade <${config.email.from}>`,
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
}

const mailService = new MailService();
const { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendWelcomeEmail, send2FACode } = mailService;

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  send2FACode
};
