const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

// All analytics routes require authentication
router.use(protect);

// Personal analytics
router.get('/personal', analyticsController.getPersonalAnalytics);

// Engagement metrics
router.get('/engagement', analyticsController.getEngagementMetrics);

// Activity timeline
router.get('/timeline', analyticsController.getActivityTimeline);

module.exports = router;
