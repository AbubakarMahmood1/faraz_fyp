const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

// All message routes require authentication
router.use(protect);

// Send a message
router.post('/send', messageController.sendMessage);

// Get conversation with a specific user
router.get('/conversation/:userId', messageController.getConversation);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get unread message count
router.get('/unread/count', messageController.getUnreadCount);

// Mark message as read
router.patch('/:messageId/read', messageController.markAsRead);

module.exports = router;
