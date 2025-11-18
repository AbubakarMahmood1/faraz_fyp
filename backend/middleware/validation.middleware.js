/**
 * Validation middleware using Joi
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
    });

    if (error) {
      // Format validation errors
      const errorMessages = error.details.map(detail => detail.message);

      return res.status(400).json({
        status: 'fail',
        message: errorMessages.join('. '),
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    next();
  };
};
