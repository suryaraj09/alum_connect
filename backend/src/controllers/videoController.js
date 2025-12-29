const Video = require('../models/Video');
const Profile = require('../models/Profile');

// @desc    Upload video link
// @route   POST /api/videos
// @access  Private
const uploadVideo = async (req, res, next) => {
    try {
        const { title, description, url, thumbnailUrl } = req.body;

        const video = await Video.create({
            user: req.user._id,
            title,
            description,
            url,
            thumbnailUrl,
        });

        // Update engagement score for the user
        await Profile.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { engagementScore: 5 } }
        );

        res.status(201).json(video);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all videos (Feed)
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res, next) => {
    try {
        const videos = await Video.find().populate('user', ['name']).sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        next(error);
    }
};

// @desc    Increment video views
// @route   PUT /api/videos/:id/view
// @access  Private
const incrementViews = async (req, res, next) => {
    try {
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        res.json(video);
    } catch (error) {
        next(error);
    }
};

module.exports = { uploadVideo, getVideos, incrementViews };
