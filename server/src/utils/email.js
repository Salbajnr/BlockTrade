
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a test account (for development only)
const createTestAccount = async () => {
  return await nodemailer.createTestAccount();
};

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'test@ethereal.email', // generated ethereal user
    pass: process.env.EMAIL_PASSWORD || 'test123' // generated ethereal password
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body
 * @returns {Promise<Object>} Info object with messageId and preview URL
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log('Creating email transport...');
    
    // Create a test account if in development and no SMTP config is provided
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
      console.log('No SMTP config found, creating test account...');
      const testAccount = await createTestAccount();
      
      // Create a new transporter with the test account
      const testTransporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('Test account created:', testAccount.user);
      
      // Send mail with test transport
      console.log('Sending test email...');
      const info = await testTransporter.sendMail({
        from: `"Test Sender" <${testAccount.user}>`,
        to,
        subject: `[TEST] ${subject}`,
        text,
        html
      });
      
      console.log('Test email sent! Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
        testAccount: testAccount
      };
    } else {
      // Use configured SMTP transport
      console.log('Using configured SMTP transport...');
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'BlockTrade'}" <${process.env.EMAIL_FROM || 'noreply@blocktrade.com'}>`,
        to,
        subject,
        text,
        html
      });

      console.log('Email sent! Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    }
  } catch (error) {
    console.error('❌ Error sending email:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command
    });
    throw new Error('Failed to send email: ' + error.message);
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Password reset token
 * @param {string} name - User's name
 * @param {string} resetUrl - The complete reset URL
 * @returns {Promise<Object>} Result of the email sending operation
 */
const sendPasswordResetEmail = async (email, token, name = 'User', resetUrl) => {
  try {
    if (!resetUrl) {
      resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    }
    
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You have requested to reset your password. Please click the button below to set a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><code style="word-break: break-all;">${resetUrl}</code></p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>BlockTrade Team</p>
      </div>
    `;
    
    const text = `Hello ${name},

You have requested to reset your password. Please use the following link to set a new password:

${resetUrl}

If you didn't request this, please ignore this email and your password will remain unchanged.

This link will expire in 1 hour.

Best regards,
BlockTrade Team`;
    
    console.log('Sending password reset email to:', email);
    console.log('Reset URL:', resetUrl);
    
    const info = await sendEmail({
      to: email,
      subject,
      text,
      html
    });
    
    console.log('✅ Password reset email sent successfully');
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return { 
      success: true, 
      messageId: info.messageId, 
      previewUrl: nodemailer.getTestMessageUrl(info) 
    };
  } catch (error) {
    console.error('❌ Error sending password reset email:', {
      message: error.message,
      stack: error.stack,
      email: email,
      hasToken: !!token,
      resetUrl: resetUrl || 'Not provided'
    });
    throw new Error('Failed to send password reset email: ' + error.message);
  }
};

export {
  transporter,
  sendEmail,
  sendPasswordResetEmail,
  createTestAccount // Export for testing purposes
};
