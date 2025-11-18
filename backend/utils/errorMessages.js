// Centralized error messages for consistent user experience

module.exports = {
  // Authentication Errors
  auth: {
    invalidCredentials: 'Invalid email or password. Please try again.',
    emailExists: 'An account with this email already exists. Please sign in or use a different email.',
    usernameExists: 'This username is already taken. Please choose a different username.',
    unauthorized: 'You must be logged in to access this resource.',
    tokenExpired: 'Your session has expired. Please sign in again.',
    tokenInvalid: 'Invalid authentication token. Please sign in again.',
    accountInactive: 'Your account has been deactivated. Please contact support.',
    incorrectPassword: 'Current password is incorrect. Please try again.',
    weakPassword: 'Password must be at least 6 characters long.',
  },

  // Profile Errors
  profile: {
    notFound: 'Profile not found. Please complete your registration.',
    alreadyCompleted: 'Your profile has already been completed.',
    bioTooShort: 'Bio must be at least 50 characters long.',
    invalidRole: 'Invalid user role specified.',
    updateFailed: 'Failed to update profile. Please try again.',
    requiredField: (field) => `${field} is required.`,
  },

  // Password Reset Errors
  passwordReset: {
    emailNotFound: 'If that email exists, a password reset link has been sent.',
    tokenInvalid: 'Invalid or expired reset token. Please request a new reset link.',
    emailFailed: 'Failed to send reset email. Please try again later or contact support.',
    resetFailed: 'Failed to reset password. Please try again.',
  },

  // Validation Errors
  validation: {
    invalidEmail: 'Please provide a valid email address.',
    invalidUsername: 'Username must be at least 3 characters long and contain only letters, numbers, and underscores.',
    missingField: (field) => `${field} is required.`,
    invalidFormat: (field) => `${field} has an invalid format.`,
    tooShort: (field, length) => `${field} must be at least ${length} characters long.`,
    tooLong: (field, length) => `${field} must not exceed ${length} characters.`,
  },

  // Rate Limiting Errors
  rateLimit: {
    auth: 'Too many login attempts. Please try again in 15 minutes.',
    api: 'Too many requests. Please slow down and try again later.',
    profile: 'Too many profile updates. Please try again in 15 minutes.',
  },

  // Server Errors
  server: {
    generic: 'Something went wrong on our end. Please try again later.',
    database: 'Database connection error. Please try again later.',
    network: 'Network error. Please check your internet connection.',
    maintenance: 'The server is currently under maintenance. Please try again later.',
  },

  // User Errors
  user: {
    notFound: 'User not found.',
    forbidden: 'You do not have permission to perform this action.',
    deleted: 'This user account has been deleted.',
  },

  // Success Messages
  success: {
    signup: 'Account created successfully! Please complete your profile.',
    login: 'Welcome back! Logged in successfully.',
    logout: 'Logged out successfully.',
    profileCompleted: 'Profile completed successfully!',
    profileUpdated: 'Profile updated successfully.',
    passwordUpdated: 'Password updated successfully.',
    passwordResetSent: 'Password reset link sent to your email.',
    passwordResetSuccess: 'Password reset successful! You can now sign in.',
  },
};
