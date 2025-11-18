const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const Connection = require('../models/connection.model');
const Message = require('../models/message.model');
const Activity = require('../models/activity.model');
const errorMessages = require('../utils/errorMessages');
const os = require('os');

/**
 * Get platform statistics
 * GET /api/admin/stats
 */
exports.getPlatformStats = async (req, res) => {
  try {
    const { timeRange = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Get total counts
    const [
      totalUsers,
      totalProfiles,
      totalConnections,
      totalMessages,
      totalActivities,
      activeUsers,
      verifiedUsers,
      oauthUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments(),
      Connection.countDocuments(),
      Message.countDocuments(),
      Activity.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ emailVerified: true }),
      User.countDocuments({ provider: { $ne: 'local' } }),
    ]);

    // Get new users in time range
    const newUsers = await User.countDocuments({
      createdAt: { $gte: daysAgo },
    });

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$registerAs',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get users by provider
    const usersByProvider = await User.aggregate([
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent signups (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const signupTrend = await User.aggregate([
      {
        $match: { createdAt: { $gte: last7Days } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          totalProfiles,
          totalConnections,
          totalMessages,
          totalActivities,
          activeUsers,
          verifiedUsers,
          oauthUsers,
          newUsers,
        },
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usersByProvider: usersByProvider.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        signupTrend,
      },
    });
  } catch (err) {
    console.error('Get platform stats error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Get all users with pagination
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      registerAs,
      provider,
      isActive,
      emailVerified,
      search,
    } = req.query;

    // Build filter
    const filter = {};

    if (role) filter.role = role;
    if (registerAs) filter.registerAs = registerAs;
    if (provider) filter.provider = provider;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (emailVerified !== undefined) filter.emailVerified = emailVerified === 'true';
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
        page: parseInt(page),
        limit: parseInt(limit),
        totalUsers,
        totalPages,
      },
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Get user details by ID
 * GET /api/admin/users/:userId
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Get user's profile
    const profile = await Profile.findOne({ user: userId });

    // Get user's connection stats
    const [followersCount, followingCount] = await Promise.all([
      Connection.countDocuments({ following: userId }),
      Connection.countDocuments({ follower: userId }),
    ]);

    // Get user's activity count
    const activityCount = await Activity.countDocuments({ user: userId });

    // Get user's message count
    const messageCount = await Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
        profile,
        stats: {
          followers: followersCount,
          following: followingCount,
          activities: activityCount,
          messages: messageCount,
        },
      },
    });
  } catch (err) {
    console.error('Get user details error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Update user status (activate/deactivate)
 * PATCH /api/admin/users/:userId/status
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        status: 'fail',
        message: 'isActive field is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user },
    });
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Update user role
 * PATCH /api/admin/users/:userId/role
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid role is required (user, admin, or superadmin)',
      });
    }

    // Prevent users from demoting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot change your own role',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role}`,
      data: { user },
    });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Delete user (superadmin only)
 * DELETE /api/admin/users/:userId
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent users from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Delete associated data
    await Promise.all([
      Profile.deleteOne({ user: userId }),
      Connection.deleteMany({
        $or: [{ follower: userId }, { following: userId }],
      }),
      Message.deleteMany({
        $or: [{ sender: userId }, { receiver: userId }],
      }),
      Activity.deleteMany({ user: userId }),
    ]);

    res.status(200).json({
      status: 'success',
      message: 'User and associated data deleted successfully',
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Get system health
 * GET /api/admin/system-health
 */
exports.getSystemHealth = async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const systemInfo = {
      uptime: {
        seconds: uptime,
        formatted: formatUptime(uptime),
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        processUsed: memoryUsage.heapUsed,
        processTotal: memoryUsage.heapTotal,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        cores: os.cpus().length,
      },
      platform: os.platform(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };

    // Database health check
    const dbHealth = await checkDatabaseHealth();

    res.status(200).json({
      status: 'success',
      data: {
        system: systemInfo,
        database: dbHealth,
      },
    });
  } catch (err) {
    console.error('Get system health error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Helper function to format uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

/**
 * Helper function to check database health
 */
async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await User.findOne().limit(1);
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      error: err.message,
    };
  }
}
