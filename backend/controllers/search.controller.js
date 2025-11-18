const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const errorMessages = require('../utils/errorMessages');

// Search users by name, username, expertise, or skills
exports.searchUsers = async (req, res) => {
  try {
    const { query, role, expertise, page = 1, limit = 20 } = req.query;

    if (!query && !role && !expertise) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a search query, role, or expertise',
      });
    }

    // Build search criteria
    const searchCriteria = [];

    if (query) {
      // Search in username and email
      searchCriteria.push({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      });
    }

    if (role) {
      searchCriteria.push({ registerAs: role });
    }

    // Find users
    const userFilter = searchCriteria.length > 0 ? { $and: searchCriteria } : {};

    const users = await User.find(userFilter)
      .select('_id username email registerAs profileCompleted isActive')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const userIds = users.map((u) => u._id);

    // Get profiles
    const profileFilter = { user: { $in: userIds } };

    if (expertise) {
      profileFilter.expertise = { $in: [expertise] };
    }

    const profiles = await Profile.find(profileFilter)
      .populate('user', 'username email registerAs profileCompleted');

    // Combine results
    const results = profiles.map((profile) => ({
      userId: profile.user._id,
      username: profile.user.username,
      email: profile.user.email,
      role: profile.user.registerAs,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profileImage: profile.profileImage,
      bio: profile.bio ? profile.bio.substring(0, 100) + '...' : '',
      expertise: profile.expertise,
      skills: profile.skills,
      experienceLevel: profile.experienceLevel,
      city: profile.city,
      country: profile.country,
    }));

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: {
        users: results,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get user suggestions based on role and expertise
exports.getUserSuggestions = async (req, res) => {
  try {
    const currentUser = req.user;

    // Get current user's profile to find their interests
    const currentProfile = await Profile.findOne({ user: currentUser._id });

    if (!currentProfile) {
      return res.status(404).json({
        status: 'fail',
        message: errorMessages.profile.notFound,
      });
    }

    // Find users with similar expertise/interests
    const suggestions = await Profile.find({
      user: { $ne: currentUser._id }, // Exclude current user
      $or: [
        { expertise: { $in: currentProfile.expertise || [] } },
        { skills: { $in: currentProfile.skills || [] } },
      ],
    })
      .populate('user', 'username email registerAs')
      .limit(10);

    const results = suggestions.map((profile) => ({
      userId: profile.user._id,
      username: profile.user.username,
      role: profile.user.registerAs,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profileImage: profile.profileImage,
      bio: profile.bio ? profile.bio.substring(0, 100) + '...' : '',
      expertise: profile.expertise,
      experienceLevel: profile.experienceLevel,
    }));

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: {
        suggestions: results,
      },
    });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};
