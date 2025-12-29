const express = require('express');
const router = express.Router();
const { uploadVideo, getVideos, incrementViews } = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVideos)
    .post(protect, uploadVideo);

router.put('/:id/view', protect, incrementViews);

module.exports = router;
