const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "User name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() {
      // Password is required only for local authentication
      return this.provider === 'local' || !this.provider;
    },
    minlength: 6,
    select: false,
  },
  registerAs: {
    type: String,
    required: true,
    enum: ["explorer", "expert", "innovator", "investor"],
    default: "explorer",
  },

  // OAuth fields
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local',
  },
  googleId: {
    type: String,
    sparse: true, // Allows null values but enforces uniqueness when present
  },
  githubId: {
    type: String,
    sparse: true,
  },

  // New fields for Phase 2
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Email verification fields
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Hash password before saving (only for local auth)
userSchema.pre("save", async function (next) {
  // Skip hashing if password not modified or using OAuth
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords - fixed typo and use regular function for proper 'this' context
userSchema.methods.correctPassword = async function(enteredPassword, userPassword) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and save to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return unhashed token (to send via email)
  return resetToken;
};

// Method to generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and save to database
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expiration time (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  // Return unhashed token (to send via email)
  return verificationToken;
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ registerAs: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ passwordResetExpires: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ emailVerificationExpires: 1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ provider: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ githubId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
