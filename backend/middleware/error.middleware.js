// Global error handling middleware
exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode: err.statusCode,
  });

  if (process.env.NODE_ENV === 'development') {
    // Development - detailed error information
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    // Production - don't leak error details
    const isOperational = err.isOperational;

    if (isOperational) {
      // Operational, trusted error: send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or unknown error: don't leak details
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
};

// 404 handler
exports.notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
};

// Async error wrapper
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
