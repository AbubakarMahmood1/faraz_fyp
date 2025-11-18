const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const errorMessages = require('../utils/errorMessages');

// Search users by name, username, expertise, or skills
exports.searchUsers = async (req, res) => {
  try {
    const {
      query,
      role,
      expertise, // Can be comma-separated or array
      skills, // Can be comma-separated or array
      experienceLevel,
      city,
      country,
      sortBy = 'createdAt', // createdAt, firstName, experienceLevel
      sortOrder = 'desc', // asc, desc
      page = 1,
      limit = 20,
    } = req.query;

    // Build user search criteria
    const userCriteria = [];

    if (query) {
      // Search in username and email
      userCriteria.push({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      });
    }

    if (role) {
      userCriteria.push({ registerAs: role });
    }

    // Only search for active users with completed profiles
    userCriteria.push({ isActive: true, profileCompleted: true });

    // Find users matching user criteria first
    const userFilter = userCriteria.length > 0 ? { $and: userCriteria } : {};

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map((u) => u._id);

    if (userIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          users: [],
          page: parseInt(page),
          limit: parseInt(limit),
          totalResults: 0,
          totalPages: 0,
        },
      });
    }

    // Build profile search criteria
    const profileCriteria = [{ user: { $in: userIds } }];

    // Expertise filter (supports multiple values)
    if (expertise) {
      const expertiseArray = Array.isArray(expertise)
        ? expertise
        : expertise.split(',').map((e) => e.trim());
      profileCriteria.push({ expertise: { $in: expertiseArray } });
    }

    // Skills filter (supports multiple values)
    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim());
      profileCriteria.push({ skills: { $in: skillsArray } });
    }

    // Experience level filter
    if (experienceLevel) {
      profileCriteria.push({ experienceLevel });
    }

    // Location filters
    if (city) {
      profileCriteria.push({ city: { $regex: city, $options: 'i' } });
    }

    if (country) {
      profileCriteria.push({ country: { $regex: country, $options: 'i' } });
    }

    const profileFilter =
      profileCriteria.length > 0 ? { $and: profileCriteria } : {};

    // Get total count for pagination
    const totalResults = await Profile.countDocuments(profileFilter);
    const totalPages = Math.ceil(totalResults / parseInt(limit));

    // Build sort object
    const sortObject = {};
    if (sortBy === 'firstName' || sortBy === 'lastName') {
      sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'experienceLevel') {
      // Custom sort order for experience level
      const experienceOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
      // MongoDB doesn't support custom sort order directly, so we'll sort by field
      sortObject.experienceLevel = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObject.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    // Get profiles with pagination and sorting
    const profiles = await Profile.find(profileFilter)
      .populate('user', 'username email registerAs profileCompleted')
      .sort(sortObject)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Combine results
    const results = profiles.map((profile) => ({
      userId: profile.user._id,
      username: profile.user.username,
      email: profile.user.email,
      role: profile.user.registerAs,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profileImage: profile.profileImage,
      bio: profile.bio ? profile.bio.substring(0, 150) + '...' : '',
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
        totalResults,
        totalPages,
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

// Get available filter options for dropdowns
exports.getFilterOptions = async (req, res) => {
  try {
    // Get all unique values from profiles
    const [uniqueExpertise, uniqueSkills, uniqueExperienceLevels, uniqueLocations] =
      await Promise.all([
        // Get all unique expertise areas
        Profile.distinct('expertise'),
        // Get all unique skills
        Profile.distinct('skills'),
        // Get all unique experience levels
        Profile.distinct('experienceLevel'),
        // Get all unique city-country combinations
        Profile.aggregate([
          {
            $match: {
              $and: [{ city: { $ne: null } }, { country: { $ne: null } }],
            },
          },
          {
            $group: {
              _id: { city: '$city', country: '$country' },
            },
          },
          {
            $project: {
              _id: 0,
              city: '$_id.city',
              country: '$_id.country',
              label: { $concat: ['$_id.city', ', ', '$_id.country'] },
            },
          },
          {
            $sort: { country: 1, city: 1 },
          },
        ]),
      ]);

    // Filter out null/undefined values
    const expertiseOptions = uniqueExpertise
      .filter((e) => e && e.trim())
      .sort();

    const skillOptions = uniqueSkills
      .filter((s) => s && s.trim())
      .sort();

    const experienceLevelOptions = uniqueExperienceLevels
      .filter((e) => e && e.trim())
      .sort((a, b) => {
        // Sort by experience level order
        const order = ['beginner', 'intermediate', 'advanced', 'expert'];
        return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
      });

    const roleOptions = ['explorer', 'expert', 'innovator', 'investor'];

    const sortByOptions = [
      { value: 'createdAt', label: 'Recently Joined' },
      { value: 'firstName', label: 'Name (A-Z)' },
      { value: 'experienceLevel', label: 'Experience Level' },
    ];

    res.status(200).json({
      status: 'success',
      data: {
        roles: roleOptions,
        expertise: expertiseOptions,
        skills: skillOptions,
        experienceLevels: experienceLevelOptions,
        locations: uniqueLocations,
        sortBy: sortByOptions,
      },
    });
  } catch (err) {
    console.error('Get filter options error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};
