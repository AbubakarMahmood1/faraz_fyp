const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use real email service (SendGrid, Mailgun, etc.)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development: Use Ethereal (temporary test email service)
    // Or Gmail for testing
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} resetURL - Password reset URL
 */
exports.sendPasswordResetEmail = async (email, resetToken, resetURL) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Innovation Platform'} <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your Innovation Platform account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetURL}</p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Innovation Platform. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
Password Reset Request

You requested a password reset for your Innovation Platform account.

Reset your password by visiting this link:
${resetURL}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email after signup
 * @param {string} email - Recipient email
 * @param {string} username - User's username
 */
exports.sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Innovation Platform'} <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Welcome to Innovation Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Innovation Platform!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for joining Innovation Platform. We're excited to have you on board!</p>
          <p>To get started, please complete your profile to unlock all features.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy innovating!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Innovation Platform.
          </p>
        </div>
      `,
      text: `
Welcome to Innovation Platform!

Hi ${username},

Thank you for joining Innovation Platform. We're excited to have you on board!

To get started, please complete your profile to unlock all features.

Visit your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

If you have any questions, feel free to reach out to our support team.

Happy innovating!
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};
