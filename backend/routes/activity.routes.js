const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth.middleware');

// All activity routes require authentication
router.use(protect);

// Get activity feed
router.get('/feed', activityController.getActivityFeed);

// Get activities for a specific user
router.get('/user/:userId', activityController.getUserActivities);

module.exports = router;
