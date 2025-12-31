const Profile = require('../models/Profile');

// @desc    Get or Create Profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res, next) => {
    try {
        console.log(`Fetching profile for user: ${req.user._id}`);
        let profile = await Profile.findOne({ user: req.user._id }).populate('user', ['name', 'email']);
        if (!profile) {
            console.log(`Profile not found for user: ${req.user._id}`);
            return res.status(404).json({ message: 'Profile not found' });
        }
        console.log(`Profile found: ${profile._id}`);
        res.json(profile);
    } catch (error) {
        console.error('Error in getMyProfile:', error);
        next(error);
    }
};

// @desc    Create or update user profile
// @route   POST /api/profiles
// @access  Private
const upsertProfile = async (req, res, next) => {
    try {
        console.log('Upserting profile with data:', JSON.stringify(req.body, null, 2));
        const profileFields = {
            ...req.body,
            user: req.user._id,
        };

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            console.log(`Updating existing profile: ${profile._id}`);
            profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        console.log('Creating new profile for user:', req.user._id);
        profile = new Profile(profileFields);
        await profile.save();
        console.log(`Profile created: ${profile._id}`);
        res.json(profile);
    } catch (error) {
        console.error('Error in upsertProfile:', error);
        next(error);
    }
};

// @desc    Get all profiles (Discovery)
// @route   GET /api/profiles
// @access  Private
const getProfiles = async (req, res, next) => {
    try {
        const { year, skills, domain } = req.query;
        let query = { user: { $ne: req.user._id } }; // Exclude self

        if (year) query.graduationYear = year;
        if (domain) query.domain = { $regex: domain, $options: 'i' };
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillsArray };
        }

        const profiles = await Profile.find(query)
            .populate('user', ['name', 'profilePicture'])
            .sort({ engagementScore: -1 });
        res.json(profiles);
    } catch (error) {
        next(error);
    }
};

// @desc    Get profile by USER ID
// @route   GET /api/profiles/:id
// @access  Private
const getProfileById = async (req, res, next) => {
    try {
        // Try finding by user field first (most common for frontend navigation)
        let profile = await Profile.findOne({ user: req.params.id })
            .populate('user', ['name', 'email', 'profilePicture']);

        // Fallback to finding by profile ID (for direct links or legacy/dummy data)
        if (!profile) {
            profile = await Profile.findById(req.params.id)
                .populate('user', ['name', 'email', 'profilePicture']);
        }

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Profile not found' });
        }
        next(error);
    }
};

module.exports = { getMyProfile, upsertProfile, getProfiles, getProfileById };
