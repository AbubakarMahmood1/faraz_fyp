const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');
const { protect } = require('../middleware/auth.middleware');

// Public route - verify email with token
router.get('/verify-email/:token', verificationController.verifyEmail);

// Protected routes - require authentication
router.post('/resend-verification', protect, verificationController.resendVerification);
router.get('/verification-status', protect, verificationController.getVerificationStatus);

module.exports = router;
