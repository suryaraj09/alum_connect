const Connection = require('../models/Connection');
const Workspace = require('../models/Workspace');

// @desc    Send connection request
// @route   POST /api/connections/request/:id
// @access  Private
const sendConnectionRequest = async (req, res, next) => {
    try {
        const recipientId = req.params.id;
        const requesterId = req.user._id;

        if (recipientId === requesterId.toString()) {
            res.status(400);
            throw new Error('Cannot connect with yourself');
        }

        const existingConnection = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId },
            ],
        });

        if (existingConnection) {
            res.status(400);
            throw new Error('Connection or request already exists');
        }

        const connection = await Connection.create({
            requester: requesterId,
            recipient: recipientId,
        });

        res.status(201).json(connection);
    } catch (error) {
        next(error);
    }
};

// @desc    Accept connection request
// @route   POST /api/connections/accept/:id
// @access  Private
const acceptConnectionRequest = async (req, res, next) => {
    try {
        const connection = await Connection.findById(req.params.id);

        if (!connection) {
            res.status(404);
            throw new Error('Connection request not found');
        }

        if (connection.recipient.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to accept this request');
        }

        connection.status = 'accepted';
        await connection.save();

        // Automatically create a workspace
        const workspace = await Workspace.create({
            connection: connection._id,
            members: [connection.requester, connection.recipient],
        });

        res.json({ connection, workspace });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user connections
// @route   GET /api/connections
// @access  Private
const getMyConnections = async (req, res, next) => {
    try {
        const connections = await Connection.find({
            $or: [{ requester: req.user._id }, { recipient: req.user._id }],
            status: 'accepted',
        }).populate('requester recipient', ['name', 'email']);

        res.json(connections);
    } catch (error) {
        next(error);
    }
};

// @desc    Get received pending requests
// @route   GET /api/connections/received
// @access  Private
const getPendingRequests = async (req, res, next) => {
    try {
        const requests = await Connection.find({
            recipient: req.user._id,
            status: 'pending',
        }).populate('requester', ['name', 'email']);

        // Mocking the 'role' for now as it might be in Profile
        const enrichedRequests = requests.map(req => ({
            _id: req._id,
            from: {
                name: req.requester.name,
                role: 'Alum_Connect Member' // Fallback
            },
            type: 'Mentorship' // Default
        }));

        res.json(enrichedRequests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get accepted connections with workspaces
// @route   GET /api/connections/friends
// @access  Private
const getFriendConnections = async (req, res, next) => {
    try {
        const connections = await Connection.find({
            $or: [{ requester: req.user._id }, { recipient: req.user._id }],
            status: 'accepted',
        }).populate('requester recipient', ['name', 'email']);

        const friends = await Promise.all(connections.map(async (conn) => {
            const friend = conn.requester._id.toString() === req.user._id.toString() ? conn.recipient : conn.requester;
            const workspace = await Workspace.findOne({ connection: conn._id });
            return {
                _id: conn._id,
                user: friend,
                workspaceId: workspace ? workspace._id : null
            };
        }));

        res.json(friends);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendConnectionRequest,
    acceptConnectionRequest,
    getMyConnections,
    getPendingRequests,
    getFriendConnections
};
