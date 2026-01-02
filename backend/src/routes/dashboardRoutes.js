const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/authMiddleware');

// Get dashboard statistics
router.get('/stats', auth, dashboardController.getDashboardStats);

// Get recent activities
router.get('/activities', auth, dashboardController.getRecentActivities);

module.exports = router;
