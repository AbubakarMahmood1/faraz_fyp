const Activity = require('../models/activity.model');
const Connection = require('../models/connection.model');
const Profile = require('../models/profile.model');
const errorMessages = require('../utils/errorMessages');

// Get activity feed for current user
exports.getActivityFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Get users that current user follows
    const connections = await Connection.find({
      follower: currentUserId,
      status: 'accepted',
    }).select('following');

    const followingIds = connections.map((c) => c.following);
    followingIds.push(currentUserId); // Include current user's activities

    // Get activities from followed users and current user
    const activities = await Activity.find({
      user: { $in: followingIds },
      visibility: { $in: ['public', 'connections'] },
    })
      .populate('user', 'username registerAs')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    // Get profiles for activity users
    const userIds = activities.map((a) => a.user._id);
    const profiles = await Profile.find({ user: { $in: userIds } }).select(
      'user firstName lastName profileImage'
    );

    // Enrich activities with profile data
    const enrichedActivities = activities.map((activity) => {
      const profile = profiles.find(
        (p) => p.user.toString() === activity.user._id.toString()
      );

      return {
        _id: activity._id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
        user: {
          _id: activity.user._id,
          username: activity.user.username,
          role: activity.user.registerAs,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          profileImage: profile?.profileImage,
        },
      };
    });

    res.status(200).json({
      status: 'success',
      results: enrichedActivities.length,
      data: {
        activities: enrichedActivities,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get activity feed error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get activities for a specific user
exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user._id;

    // Check if viewing own profile or following the user
    const isOwnProfile = userId === currentUserId.toString();
    const isFollowing = await Connection.findOne({
      follower: currentUserId,
      following: userId,
      status: 'accepted',
    });

    // Determine visibility filter
    let visibilityFilter;
    if (isOwnProfile) {
      visibilityFilter = { $in: ['public', 'connections', 'private'] };
    } else if (isFollowing) {
      visibilityFilter = { $in: ['public', 'connections'] };
    } else {
      visibilityFilter = 'public';
    }

    const activities = await Activity.find({
      user: userId,
      visibility: visibilityFilter,
    })
      .populate('user', 'username registerAs')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    // Get profile
    const profile = await Profile.findOne({ user: userId }).select(
      'firstName lastName profileImage'
    );

    const enrichedActivities = activities.map((activity) => ({
      _id: activity._id,
      type: activity.type,
      description: activity.description,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      user: {
        _id: activity.user._id,
        username: activity.user.username,
        role: activity.user.registerAs,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        profileImage: profile?.profileImage,
      },
    }));

    res.status(200).json({
      status: 'success',
      results: enrichedActivities.length,
      data: {
        activities: enrichedActivities,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get user activities error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Create a new activity (called internally by other controllers)
exports.createActivity = async (userId, type, description, metadata = {}, visibility = 'public') => {
  try {
    const activity = await Activity.create({
      user: userId,
      type,
      description,
      metadata,
      visibility,
    });
    return activity;
  } catch (err) {
    console.error('Create activity error:', err);
    return null;
  }
};
