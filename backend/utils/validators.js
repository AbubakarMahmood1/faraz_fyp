const Joi = require('joi');

// Signup validation schema
exports.signupSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  registerAs: Joi.string()
    .valid('explorer', 'expert', 'innovator', 'investor')
    .required()
    .messages({
      'any.only': 'Please select a valid role: explorer, expert, innovator, or investor',
      'any.required': 'Role is required',
    }),
});

// Login validation schema
exports.loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// Profile completion validation schema
exports.completeProfileSchema = Joi.object({
  // Required for all
  firstName: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'any.required': 'First name is required',
    }),
  bio: Joi.string()
    .min(50)
    .required()
    .messages({
      'string.min': 'Bio must be at least 50 characters long',
      'any.required': 'Bio is required',
    }),

  // Optional common fields
  lastName: Joi.string().min(2).optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not').optional(),
  dateOfBirth: Joi.date().optional(),
  phoneNo: Joi.string().optional(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  profileImage: Joi.string().uri().optional(),

  // Professional fields (for experts and innovators)
  expertise: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  experienceLevel: Joi.string().optional(),

  // Investor fields
  organizationName: Joi.string().optional(),
  investingExperience: Joi.array().items(Joi.string()).optional(),
});
