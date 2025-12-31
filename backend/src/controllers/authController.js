const User = require('../models/User');
const Profile = require('../models/Profile');
const generateToken = require('../utils/generateToken');

const ALLOWED_DOMAIN = 'ahduni.edu.in';

const checkProfileComplete = async (userId) => {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return false;

    // Check required fields for gatekeeping
    const isComplete =
        profile.education && profile.education.length > 0 &&
        profile.domain &&
        profile.skills && profile.skills.length > 0;

    return !!isComplete;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Domain Check
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            res.status(400);
            throw new Error(`Only university accounts (@${ALLOWED_DOMAIN}) are allowed`);
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                isProfileComplete: false,
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                isProfileComplete: await checkProfileComplete(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile (Basic User Info)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
    try {
        const { email, name, googleId, profilePicture } = req.body;

        // Domain Check
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            res.status(401);
            throw new Error(`Only university accounts (@${ALLOWED_DOMAIN}) are allowed`);
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Create user if doesn't exist (Registration via Google)
            user = await User.create({
                name,
                email,
                password: Math.random().toString(36).slice(-10), // Random password for social login
                profilePicture
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            isProfileComplete: await checkProfileComplete(user._id),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, googleLogin, getMe };
