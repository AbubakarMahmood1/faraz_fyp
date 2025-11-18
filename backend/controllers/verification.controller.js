const crypto = require("crypto");
const User = require("../models/user.model");
const { sendVerificationEmail } = require("../utils/email");
const errorMessages = require("../utils/errorMessages");

/**
 * Verify email with token
 * POST /api/auth/verify-email/:token
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and check expiration
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired verification token',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(200).json({
        status: 'success',
        message: 'Email already verified',
        data: {
          emailVerified: true,
        },
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully!',
      data: {
        emailVerified: true,
      },
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify email',
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
exports.resendVerification = async (req, res) => {
  try {
    const userId = req.user._id; // From protect middleware

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(200).json({
        status: 'success',
        message: 'Email already verified',
        data: {
          emailVerified: true,
        },
      });
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await sendVerificationEmail(
        user.email,
        user.username,
        verificationToken,
        verificationURL
      );

      res.status(200).json({
        status: 'success',
        message: 'Verification email sent successfully',
      });
    } catch (emailError) {
      // Clean up token if email fails
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email. Please try again.',
      });
    }
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification email',
    });
  }
};

/**
 * Check verification status
 * GET /api/auth/verification-status
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user._id; // From protect middleware

    const user = await User.findById(userId).select('emailVerified email');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        emailVerified: user.emailVerified,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Get verification status error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get verification status',
    });
  }
};
