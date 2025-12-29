const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    education: {
        type: String,
        required: [true, 'Please add education details'],
    },
    graduationYear: {
        type: Number,
        required: [true, 'Please add graduation year'],
    },
    skills: {
        type: [String],
        default: [],
    },
    interests: {
        type: [String],
        default: [],
    },
    domain: {
        type: String,
        required: [true, 'Please add a professional domain (e.g., Tech, Finance, Arts)'],
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    isMentorAvailable: {
        type: Boolean,
        default: false,
    },
    isMenteeAvailable: {
        type: Boolean,
        default: false,
    },
    schedulingLink: {
        type: String, // e.g., Calendly
    },
    engagementScore: {
        type: Number,
        default: 0,
    },
    profilePicture: {
        type: String, // URL
    },
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
