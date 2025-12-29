const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Video = require('../models/Video');

// @desc    Get user-level analytics
// @route   GET /api/analytics/me
// @access  Private
const getMyAnalytics = async (req, res, next) => {
    try {
        const connectionCount = await Connection.countDocuments({
            $or: [{ requester: req.user._id }, { recipient: req.user._id }],
            status: 'accepted',
        });

        const videoViews = await Video.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);

        res.json({
            connections: connectionCount,
            totalVideoViews: videoViews.length > 0 ? videoViews[0].totalViews : 0,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get platform-wide analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalConnections = await Connection.countDocuments({ status: 'accepted' });
        const totalVideos = await Video.countDocuments();

        res.json({
            totalUsers,
            totalConnections,
            totalVideos,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyAnalytics, getAdminAnalytics };
