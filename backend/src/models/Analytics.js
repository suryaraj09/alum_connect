const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    metric: {
        type: String,
        required: true,
        enum: ['connection_count', 'video_view_count', 'workspace_activity', 'login_count'],
    },
    value: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
