const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    url: {
        type: String,
        required: true,
    },
    thumbnailUrl: String,
    views: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
