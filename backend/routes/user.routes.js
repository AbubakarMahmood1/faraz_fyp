const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

// Public
router.get('/:username', userController.getUser);

module.exports = router;
