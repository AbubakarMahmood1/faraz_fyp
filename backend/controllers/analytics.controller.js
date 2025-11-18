const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const Connection = require('../models/connection.model');
const Message = require('../models/message.model');
const Activity = require('../models/activity.model');
const errorMessages = require('../utils/errorMessages');

/**
 * Get user's personal analytics
 * GET /api/analytics/personal
 */
exports.getPersonalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Get user profile
    const profile = await Profile.findOne({ user: userId });

    // Get connection stats
    const [followersCount, followingCount, newFollowers, newFollowing] = await Promise.all([
      Connection.countDocuments({ following: userId }),
      Connection.countDocuments({ follower: userId }),
      Connection.countDocuments({ following: userId, createdAt: { $gte: daysAgo } }),
      Connection.countDocuments({ follower: userId, createdAt: { $gte: daysAgo } }),
    ]);

    // Get message stats
    const [sentMessages, receivedMessages, totalMessages] = await Promise.all([
      Message.countDocuments({ sender: userId, createdAt: { $gte: daysAgo } }),
      Message.countDocuments({ receiver: userId, createdAt: { $gte: daysAgo } }),
      Message.countDocuments({
        $or: [{ sender: userId }, { receiver: userId }],
        createdAt: { $gte: daysAgo },
      }),
    ]);

    // Get activity stats
    const [totalActivities, recentActivities] = await Promise.all([
      Activity.countDocuments({ user: userId }),
      Activity.countDocuments({ user: userId, createdAt: { $gte: daysAgo } }),
    ]);

    // Get activity breakdown by type
    const activitiesByType = await Activity.aggregate([
      {
        $match: { user: userId, createdAt: { $gte: daysAgo } },
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get daily activity trend (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyActivityTrend = await Activity.aggregate([
      {
        $match: { user: userId, createdAt: { $gte: last7Days } },
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

    // Get message trend (last 7 days)
    const dailyMessageTrend = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          sent: {
            $sum: {
              $cond: [{ $eq: ['$sender', userId] }, 1, 0],
            },
          },
          received: {
            $sum: {
              $cond: [{ $eq: ['$receiver', userId] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get connection growth (last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const connectionGrowth = await Connection.aggregate([
      {
        $match: {
          following: userId,
          createdAt: { $gte: last30Days },
        },
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

    // Profile completeness score
    const profileScore = calculateProfileCompleteness(profile);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          followers: followersCount,
          following: followingCount,
          newFollowers,
          newFollowing,
          sentMessages,
          receivedMessages,
          totalMessages,
          totalActivities,
          recentActivities,
          profileScore,
        },
        trends: {
          dailyActivity: dailyActivityTrend,
          dailyMessages: dailyMessageTrend,
          connectionGrowth,
        },
        breakdown: {
          activitiesByType: activitiesByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      },
    });
  } catch (err) {
    console.error('Get personal analytics error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Get user's engagement metrics
 * GET /api/analytics/engagement
 */
exports.getEngagementMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '7' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Get unique users engaged with
    const uniqueMessagePartners = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $project: {
          partner: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$partner',
        },
      },
      {
        $count: 'count',
      },
    ]);

    const uniquePartners = uniqueMessagePartners[0]?.count || 0;

    // Get response rate (percentage of received messages that were replied to)
    const receivedMessages = await Message.find({
      receiver: userId,
      createdAt: { $gte: daysAgo },
    }).distinct('sender');

    let repliedToCount = 0;
    for (const senderId of receivedMessages) {
      const replied = await Message.findOne({
        sender: userId,
        receiver: senderId,
        createdAt: { $gte: daysAgo },
      });
      if (replied) repliedToCount++;
    }

    const responseRate =
      receivedMessages.length > 0
        ? Math.round((repliedToCount / receivedMessages.length) * 100)
        : 0;

    // Get average messages per conversation
    const messagesPerConversation =
      uniquePartners > 0
        ? Math.round(
            (await Message.countDocuments({
              $or: [{ sender: userId }, { receiver: userId }],
              createdAt: { $gte: daysAgo },
            })) / uniquePartners
          )
        : 0;

    // Get activity engagement (activities in time range)
    const activityEngagement = await Activity.countDocuments({
      user: userId,
      createdAt: { $gte: daysAgo },
    });

    // Get average daily activities
    const avgDailyActivities = Math.round(
      activityEngagement / parseInt(timeRange)
    );

    // Get most active day of week
    const activitiesByDayOfWeek = await Activity.aggregate([
      {
        $match: { user: userId, createdAt: { $gte: daysAgo } },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const mostActiveDay = activitiesByDayOfWeek[0]
      ? dayNames[activitiesByDayOfWeek[0]._id - 1]
      : 'N/A';

    // Get most active hour of day
    const activitiesByHour = await Activity.aggregate([
      {
        $match: { user: userId, createdAt: { $gte: daysAgo } },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    const mostActiveHour = activitiesByHour[0]
      ? `${activitiesByHour[0]._id}:00 - ${activitiesByHour[0]._id + 1}:00`
      : 'N/A';

    res.status(200).json({
      status: 'success',
      data: {
        messaging: {
          uniquePartners,
          responseRate,
          messagesPerConversation,
        },
        activity: {
          totalActivities: activityEngagement,
          avgDailyActivities,
          mostActiveDay,
          mostActiveHour,
        },
      },
    });
  } catch (err) {
    console.error('Get engagement metrics error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Get activity timeline
 * GET /api/analytics/timeline
 */
exports.getActivityTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50 } = req.query;

    // Get recent activities with details
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('targetUser', 'username email');

    res.status(200).json({
      status: 'success',
      results: activities.length,
      data: {
        activities,
      },
    });
  } catch (err) {
    console.error('Get activity timeline error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

/**
 * Helper function to calculate profile completeness
 */
function calculateProfileCompleteness(profile) {
  if (!profile) return 0;

  let score = 0;
  const maxScore = 100;
  const fields = [
    { field: 'bio', weight: 15 },
    { field: 'location', weight: 10 },
    { field: 'expertise', weight: 15, isArray: true },
    { field: 'skills', weight: 15, isArray: true },
    { field: 'experienceLevel', weight: 10 },
    { field: 'linkedinUrl', weight: 10 },
    { field: 'githubUrl', weight: 10 },
    { field: 'websiteUrl', weight: 5 },
    { field: 'projects', weight: 10, isArray: true },
  ];

  fields.forEach(({ field, weight, isArray }) => {
    const value = profile[field];
    if (isArray) {
      if (value && value.length > 0) score += weight;
    } else {
      if (value && value.trim && value.trim() !== '') score += weight;
    }
  });

  return Math.round(score);
}

module.exports = {
  getPersonalAnalytics,
  getEngagementMetrics,
  getActivityTimeline,
};
