const express = require('express');
const router = express.Router();
const { sendConnectionRequest, acceptConnectionRequest, getMyConnections } = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyConnections);
router.post('/request/:id', protect, sendConnectionRequest);
router.post('/accept/:id', protect, acceptConnectionRequest);

module.exports = router;
