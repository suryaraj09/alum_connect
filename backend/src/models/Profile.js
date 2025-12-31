const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    education: {
        type: [
            {
                school: String,
                degree: String,
                fieldOfStudy: String,
                from: String,
                to: String,
                current: Boolean,
                description: String,
            }
        ],
        default: [],
    },
    experience: {
        type: [
            {
                title: String,
                company: String,
                location: String,
                from: String,
                to: String,
                current: Boolean,
                description: String,
            }
        ],
        default: [],
    },
    graduationYear: {
        type: Number,
    },
    skills: {
        type: [
            {
                name: String,
                endorsements: { type: Number, default: 0 },
                projects: [String],
            }
        ],
        default: [],
    },
    interests: {
        type: [String],
        default: [],
    },
    mentorshipRole: {
        type: String,
        enum: ['mentor', 'mentee', 'both'],
        default: 'mentee',
    },
    userType: {
        type: String,
        enum: ['student', 'faculty', 'alumni', 'other'],
        default: 'student',
    },
    skillsToLearn: {
        type: [String],
        default: [],
    },
    skillsToTeach: {
        type: [String],
        default: [],
    },
    domain: {
        type: String,
        required: [true, 'Please add a professional domain (e.g., Tech, Finance, Arts)'],
    },
    title: {
        type: String,
        required: [true, 'Please add a professional title (e.g., Senior Software Engineer)'],
    },
    location: {
        type: String,
        default: 'Distributed',
    },
    languages: {
        type: [String],
        default: ['English'],
    },
    bio: {
        type: String,
        maxlength: 1000,
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
        type: String,
    },
    engagementScore: {
        type: Number,
        default: 0,
    },
    profilePicture: {
        type: String, // URL
    },
    coverPicture: {
        type: String, // URL
    },
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
