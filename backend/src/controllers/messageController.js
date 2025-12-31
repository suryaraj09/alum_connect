const Message = require('../models/Message');
const Workspace = require('../models/Workspace');

// @desc    Get messages for a workspace
// @route   GET /api/messages/:workspaceId
// @access  Private
const getMessages = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const { limit = 50, before } = req.query;

        let query = { workspace: workspaceId };

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'name profilePicture')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(messages.reverse());
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await message.deleteOne();
        res.json({ message: 'Message deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMessages,
    deleteMessage,
};
