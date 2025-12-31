const express = require('express');
const router = express.Router();
const { uploadProfileMedia, uploadPostMediaContent, uploadWorkspaceFileContent } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/profile', protect, uploadProfileMedia);
router.post('/post', protect, uploadPostMediaContent);
router.post('/workspace', protect, uploadWorkspaceFileContent);

module.exports = router;
