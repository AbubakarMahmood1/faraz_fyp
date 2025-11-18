const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin, requireSuperAdmin } = require('../middleware/admin.middleware');

// All admin routes require authentication
router.use(protect);

// Platform statistics (admin and superadmin)
router.get('/stats', requireAdmin, adminController.getPlatformStats);

// System health (admin and superadmin)
router.get('/system-health', requireAdmin, adminController.getSystemHealth);

// User management (admin and superadmin)
router.get('/users', requireAdmin, adminController.getAllUsers);
router.get('/users/:userId', requireAdmin, adminController.getUserDetails);

// User status update (admin and superadmin)
router.patch('/users/:userId/status', requireAdmin, adminController.updateUserStatus);

// User role update (superadmin only)
router.patch('/users/:userId/role', requireSuperAdmin, adminController.updateUserRole);

// User deletion (superadmin only)
router.delete('/users/:userId', requireSuperAdmin, adminController.deleteUser);

module.exports = router;
