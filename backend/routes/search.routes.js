const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

// All search routes require authentication
router.use(protect);

// Search users
router.get('/users', searchController.searchUsers);

// Get user suggestions
router.get('/suggestions', searchController.getUserSuggestions);

module.exports = router;
