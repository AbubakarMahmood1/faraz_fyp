const errorMessages = require('../utils/errorMessages');

/**
 * Middleware to check if user has admin or superadmin role
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (protect middleware should run first)
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: errorMessages.auth.unauthorized,
      });
    }

    // Check if user has admin or superadmin role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (err) {
    console.error('requireAdmin middleware error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Authorization check failed',
    });
  }
};

/**
 * Middleware to check if user has superadmin role
 */
exports.requireSuperAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (protect middleware should run first)
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: errorMessages.auth.unauthorized,
      });
    }

    // Check if user has superadmin role
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Superadmin privileges required.',
      });
    }

    next();
  } catch (err) {
    console.error('requireSuperAdmin middleware error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Authorization check failed',
    });
  }
};
