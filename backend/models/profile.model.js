const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Personal Information
  firstName: {
    type: String,
    required: true,
  },
  lastName: String,
  gender: String,
  dateOfBirth: Date,
  phoneNo: String,
  country: String,
  city: String,
  bio: {
    type: String,
    required: true,
    minlength: 50,
  },
  profileImage: String,

  // Professional (Experts & Innovators)
  expertise: [String],
  skills: [String],
  experienceLevel: String,

  // Investor-specific
  organizationName: String,
  investingExperience: [String],

  // Metadata
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', profileSchema);
