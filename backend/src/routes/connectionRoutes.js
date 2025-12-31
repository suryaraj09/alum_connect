const express = require('express');
const router = express.Router();
const {
    sendConnectionRequest,
    acceptConnectionRequest,
    getMyConnections,
    getPendingRequests,
    getFriendConnections
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyConnections);
router.get('/received', protect, getPendingRequests);
router.get('/friends', protect, getFriendConnections);
router.post('/request/:id', protect, sendConnectionRequest);
router.post('/accept/:id', protect, acceptConnectionRequest);

module.exports = router;
