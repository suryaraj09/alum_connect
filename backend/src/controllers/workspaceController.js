const Workspace = require('../models/Workspace');
const Message = require('../models/Message');

// @desc    Get user workspaces
// @route   GET /api/workspaces
// @access  Private
const getMyWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Workspace.find({
            members: { $in: [req.user._id] },
        }).populate('members', ['name', 'email']);

        res.json(workspaces);
    } catch (error) {
        next(error);
    }
};

// @desc    Get workspace messages
// @route   GET /api/workspaces/:id/messages
// @access  Private
const getWorkspaceMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ workspace: req.params.id })
            .populate('sender', ['name'])
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Send message in workspace
// @route   POST /api/workspaces/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
    try {
        const { text } = req.body;
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace || !workspace.members.includes(req.user._id)) {
            res.status(401);
            throw new Error('Not authorized to access this workspace');
        }

        const message = await Message.create({
            workspace: req.params.id,
            sender: req.user._id,
            text,
        });

        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

// @desc    Add resource to workspace
// @route   POST /api/workspaces/:id/resources
// @access  Private
const addResource = async (req, res, next) => {
    try {
        const { title, url, type } = req.body;
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace || !workspace.members.includes(req.user._id)) {
            res.status(401);
            throw new Error('Not authorized');
        }

        workspace.resources.push({ title, url, type, uploadedBy: req.user._id });
        await workspace.save();

        res.status(201).json(workspace);
    } catch (error) {
        next(error);
    }
};

// @desc    Get workspace resources
// @route   GET /api/workspaces/:id/resources
// @access  Private
const getWorkspaceResources = async (req, res, next) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .select('resources')
            .populate('resources.uploadedBy', 'name');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        res.json(workspace.resources.reverse());
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyWorkspaces, getWorkspaceMessages, sendMessage, addResource, getWorkspaceResources };
