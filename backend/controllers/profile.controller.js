const Profile = require('../models/profile.model');
const User = require('../models/user.model');

// Complete profile registration
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        status: 'fail',
        message: 'Profile already completed',
      });
    }

    // Create profile
    const profile = await Profile.create({
      user: userId,
      ...req.body,
    });

    // Update user profileCompleted flag
    await User.findByIdAndUpdate(userId, { profileCompleted: true });

    res.status(200).json({
      status: 'success',
      data: {
        profile,
        user: {
          profileCompleted: true,
        },
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    const profile = await Profile.findOne({ user: userId });

    res.status(200).json({
      status: 'success',
      data: {
        user,
        profile,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { profile },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
