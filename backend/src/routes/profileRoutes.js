const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile, getProfiles } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getProfiles)
    .post(protect, upsertProfile);

router.get('/me', protect, getMyProfile);

module.exports = router;
