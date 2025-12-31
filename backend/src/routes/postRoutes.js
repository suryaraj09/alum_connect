const express = require('express');
const router = express.Router();
const { createPost, getPosts, getUserPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPosts)
    .post(protect, createPost);

router.get('/user/me', protect, (req, res, next) => {
    req.params.id = req.user._id;
    getUserPosts(req, res, next);
});

router.get('/user/:id', protect, getUserPosts);

module.exports = router;
