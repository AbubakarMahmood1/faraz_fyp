const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { completeProfileSchema } = require('../utils/validators');

router.post('/complete', protect, validate(completeProfileSchema), profileController.completeProfile);
router.get('/me', protect, profileController.getMyProfile);
router.put('/', protect, validate(completeProfileSchema), profileController.updateProfile);

module.exports = router;
