const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    required: [true, "Password is required"],
    minlength: 6,
    select: false,
  },
  registerAs: {
    type: String,
    required: true,
    enum: ["explorer", "expert", "innovator", "investor"],
    default: "explorer",
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
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords - fixed typo and use regular function for proper 'this' context
userSchema.methods.correctPassword = async function(enteredPassword, userPassword) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
