const express = require('express');
const router = express.Router();
const { getMyAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyAnalytics);
router.get('/admin', protect, admin, getAdminAnalytics);

module.exports = router;
