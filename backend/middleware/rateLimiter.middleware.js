const rateLimit = require('express-rate-limit');

// Strict rate limiting for authentication endpoints
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    status: 'fail',
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    status: 'fail',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Profile endpoints (more restrictive)
exports.profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 profile updates per 15 min
  message: {
    status: 'fail',
    message: 'Too many profile updates, please try again later',
  },
});
