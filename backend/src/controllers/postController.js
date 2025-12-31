const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
    try {
        const { text, media, mediaType } = req.body;
        const post = await Post.create({
            user: req.user._id,
            text,
            media: media ? { url: media, type: mediaType } : undefined
        });
        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        next(error);
    }
};

// @desc    Get posts by user
// @route   GET /api/posts/user/:id
// @access  Private
const getUserPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ user: req.params.id })
            .populate('user', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        next(error);
    }
};

module.exports = { createPost, getPosts, getUserPosts };
