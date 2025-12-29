const Profile = require('../models/Profile');

// @desc    Get or Create Profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res, next) => {
    try {
        let profile = await Profile.findOne({ user: req.user._id }).populate('user', ['name', 'email']);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        next(error);
    }
};

// @desc    Create or update user profile
// @route   POST /api/profiles
// @access  Private
const upsertProfile = async (req, res, next) => {
    try {
        const profileFields = {
            ...req.body,
            user: req.user._id,
        };

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all profiles (Discovery)
// @route   GET /api/profiles
// @access  Private
const getProfiles = async (req, res, next) => {
    try {
        const { year, skills, domain } = req.query;
        let query = {};

        if (year) query.graduationYear = year;
        if (domain) query.domain = { $regex: domain, $options: 'i' };
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillsArray };
        }

        const profiles = await Profile.find(query).populate('user', ['name']).sort({ engagementScore: -1 });
        res.json(profiles);
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyProfile, upsertProfile, getProfiles };
