const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Socket.io authentication middleware
 * Verifies JWT token and attaches user to socket
 */
module.exports = async (socket, next) => {
  try {
    // Get token from auth or query parameters
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('User not found'));
    }

    if (!user.isActive) {
      return next(new Error('User account is inactive'));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();

    next();
  } catch (err) {
    console.error('Socket authentication error:', err.message);

    if (err.name === 'JsonWebTokenError') {
      return next(new Error('Invalid authentication token'));
    }

    if (err.name === 'TokenExpiredError') {
      return next(new Error('Authentication token expired'));
    }

    next(new Error('Authentication failed'));
  }
};
