const jwtDecode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const { sendPasswordResetEmail, sendWelcomeEmail, sendVerificationEmail } = require("../utils/email");
const errorMessages = require("../utils/errorMessages");
function getToken(id, registerAs = "") {
  return jwt.sign({ id, registerAs }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
exports.hello = async(req,res)=>{
  return res.status(200).json({
    message:"hello world"
  })
}
//signup request
exports.signup = async (req, res) => {
  try {
    //first check if same email exist
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(409).json({
        status: "fail",
        data: {
          message: errorMessages.auth.emailExists,
        },
      });
    }
    //then check if same username exist
    user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(409).json({
        status: "fail",
        data: {
          message: errorMessages.auth.usernameExists,
        },
      });
    }
    // console.log(req.body);
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      registerAs: req.body.registerAs,
    });

    // Generate email verification token
    const verificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // Send verification email
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await sendVerificationEmail(
        newUser.email,
        newUser.username,
        verificationToken,
        verificationURL
      );
      console.log('Verification email sent to:', newUser.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail signup if email fails - user can request resend
    }

    const token = getToken(newUser._id);
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
//login request
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //1) check if body contains email and password
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: errorMessages.validation.missingField("Email and Password"),
      });
    }
    //2) check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: errorMessages.auth.invalidCredentials,
      });
    }
    //3) If everything is ok, send token to client
    const token = getToken(user._id, user.registerAs);
    return res.status(200).json({
      status: "success",
      data: {
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Logout
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCorrect = await user.correctPassword(req.body.currentPassword, user.password);
    if (!isCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect',
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Forgot password - sends reset email with token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Don't reveal if email exists or not
      return res.status(200).json({
        status: 'success',
        message: 'If that email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    try {
      // Send email
      await sendPasswordResetEmail(user.email, resetToken, resetURL);

      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to your email',
      });
    } catch (emailError) {
      // If email fails, clean up the reset token
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email send failed:', emailError);

      return res.status(500).json({
        status: 'error',
        message: 'Failed to send reset email. Please try again later.',
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred. Please try again later.',
    });
  }
};

// Reset password - uses token from email
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long',
      });
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // Will trigger password hashing middleware

    // Generate new JWT token
    const jwtToken = getToken(user._id, user.registerAs);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
      token: jwtToken,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          registerAs: user.registerAs,
        },
      },
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred. Please try again later.',
    });
  }
};

// Social login (OAuth) - Google/GitHub
exports.socialLogin = async (req, res) => {
  try {
    const { provider, providerId, email, username, registerAs } = req.body;

    // Validate required fields
    if (!provider || !providerId || !email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Provider, providerId, and email are required',
      });
    }

    // Validate provider
    if (!['google', 'github'].includes(provider)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid provider. Must be google or github',
      });
    }

    // Build search query based on provider
    const searchQuery = provider === 'google'
      ? { googleId: providerId }
      : { githubId: providerId };

    // Check if user exists with this OAuth ID
    let user = await User.findOne(searchQuery);

    if (user) {
      // User exists - return token
      const token = getToken(user._id, user.registerAs);

      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            registerAs: user.registerAs,
            profileCompleted: user.profileCompleted,
            emailVerified: user.emailVerified,
          },
        },
      });
    }

    // Check if user exists with this email (from previous local signup)
    user = await User.findOne({ email });

    if (user) {
      // User exists with email but different provider - link accounts
      if (provider === 'google') {
        user.googleId = providerId;
      } else {
        user.githubId = providerId;
      }

      // If they were using local auth, mark email as verified
      if (user.provider === 'local') {
        user.emailVerified = true;
      }

      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      const token = getToken(user._id, user.registerAs);

      return res.status(200).json({
        status: 'success',
        message: 'Account linked successfully',
        token,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            registerAs: user.registerAs,
            profileCompleted: user.profileCompleted,
            emailVerified: user.emailVerified,
          },
        },
      });
    }

    // User doesn't exist - create new user
    const newUserData = {
      email,
      username: username || email.split('@')[0], // Use email prefix as username if not provided
      provider,
      registerAs: registerAs || 'explorer',
      emailVerified: true, // OAuth emails are pre-verified
      lastLogin: Date.now(),
    };

    // Add provider-specific ID
    if (provider === 'google') {
      newUserData.googleId = providerId;
    } else {
      newUserData.githubId = providerId;
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: newUserData.username });
    if (existingUsername) {
      // Append random suffix to make it unique
      newUserData.username = `${newUserData.username}${Math.floor(Math.random() * 10000)}`;
    }

    user = await User.create(newUserData);

    const token = getToken(user._id, user.registerAs);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          registerAs: user.registerAs,
          profileCompleted: user.profileCompleted,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (err) {
    console.error('Social login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during social login',
    });
  }
};
