const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth.middleware');

// All connection routes require authentication
router.use(protect);

// Follow/unfollow user
router.post('/follow/:userId', connectionController.followUser);
router.delete('/unfollow/:userId', connectionController.unfollowUser);

// Get followers and following
router.get('/followers/:userId', connectionController.getFollowers);
router.get('/following/:userId', connectionController.getFollowing);

// Check follow status
router.get('/status/:userId', connectionController.checkFollowStatus);

// Get connection stats
router.get('/stats/:userId', connectionController.getConnectionStats);

module.exports = router;
