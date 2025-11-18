const Connection = require('../models/connection.model');
const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const Activity = require('../models/activity.model');
const errorMessages = require('../utils/errorMessages');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId } = req.params;

    // Can't follow yourself
    if (followerId.toString() === userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot follow yourself',
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        status: 'fail',
        message: errorMessages.user.notFound,
      });
    }

    // Check if already following
    const existingConnection = await Connection.findOne({
      follower: followerId,
      following: userId,
    });

    if (existingConnection) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are already following this user',
      });
    }

    // Create connection
    const connection = await Connection.create({
      follower: followerId,
      following: userId,
      status: 'accepted',
    });

    // Create activity
    await Activity.create({
      user: followerId,
      type: 'connection_made',
      description: `Started following ${userToFollow.username}`,
      metadata: {
        connectionId: connection._id,
        followingUser: userId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        connection,
      },
    });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId } = req.params;

    const connection = await Connection.findOneAndDelete({
      follower: followerId,
      following: userId,
    });

    if (!connection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Connection not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Unfollowed successfully',
    });
  } catch (err) {
    console.error('Unfollow error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get user's followers
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const connections = await Connection.find({
      following: userId,
      status: 'accepted',
    })
      .populate('follower', 'username email registerAs profileCompleted')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const followerIds = connections.map((c) => c.follower._id);

    // Get profiles
    const profiles = await Profile.find({ user: { $in: followerIds } });

    const results = connections.map((connection) => {
      const profile = profiles.find(
        (p) => p.user.toString() === connection.follower._id.toString()
      );

      return {
        userId: connection.follower._id,
        username: connection.follower.username,
        role: connection.follower.registerAs,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        profileImage: profile?.profileImage,
        followedAt: connection.createdAt,
      };
    });

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: {
        followers: results,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get followers error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get users that a user is following
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const connections = await Connection.find({
      follower: userId,
      status: 'accepted',
    })
      .populate('following', 'username email registerAs profileCompleted')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const followingIds = connections.map((c) => c.following._id);

    // Get profiles
    const profiles = await Profile.find({ user: { $in: followingIds } });

    const results = connections.map((connection) => {
      const profile = profiles.find(
        (p) => p.user.toString() === connection.following._id.toString()
      );

      return {
        userId: connection.following._id,
        username: connection.following.username,
        role: connection.following.registerAs,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        profileImage: profile?.profileImage,
        followedAt: connection.createdAt,
      };
    });

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: {
        following: results,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get following error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Check if current user follows a specific user
exports.checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId } = req.params;

    const connection = await Connection.findOne({
      follower: followerId,
      following: userId,
      status: 'accepted',
    });

    res.status(200).json({
      status: 'success',
      data: {
        isFollowing: !!connection,
      },
    });
  } catch (err) {
    console.error('Check follow status error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get connection stats for a user
exports.getConnectionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [followersCount, followingCount] = await Promise.all([
      Connection.countDocuments({ following: userId, status: 'accepted' }),
      Connection.countDocuments({ follower: userId, status: 'accepted' }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        followers: followersCount,
        following: followingCount,
      },
    });
  } catch (err) {
    console.error('Get connection stats error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};
