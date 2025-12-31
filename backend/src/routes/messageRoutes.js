const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages, deleteMessage } = require('../controllers/messageController');

router.get('/:workspaceId', protect, getMessages);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
