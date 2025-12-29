const express = require('express');
const router = express.Router();
const { getMyWorkspaces, getWorkspaceMessages, sendMessage, addResource } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyWorkspaces);
router.get('/:id/messages', protect, getWorkspaceMessages);
router.post('/:id/messages', protect, sendMessage);
router.post('/:id/resources', protect, addResource);

module.exports = router;
