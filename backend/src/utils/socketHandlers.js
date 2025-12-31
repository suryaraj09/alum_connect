const Message = require('../models/Message');
const Workspace = require('../models/Workspace');

module.exports = (io) => {
    // Store active users in workspaces
    const activeUsers = new Map();

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join a workspace room
        socket.on('join-workspace', async ({ workspaceId, userId }) => {
            try {
                socket.join(workspaceId);

                // Track active user
                if (!activeUsers.has(workspaceId)) {
                    activeUsers.set(workspaceId, new Set());
                }
                activeUsers.get(workspaceId).add(userId);

                // Notify others in the workspace
                socket.to(workspaceId).emit('user-joined', {
                    userId,
                    activeCount: activeUsers.get(workspaceId).size
                });

                // Send active users list to the joining user
                socket.emit('active-users', {
                    users: Array.from(activeUsers.get(workspaceId))
                });

                console.log(`User ${userId} joined workspace ${workspaceId}`);
            } catch (error) {
                console.error('Error joining workspace:', error);
                socket.emit('error', { message: 'Failed to join workspace' });
            }
        });

        // Leave workspace
        socket.on('leave-workspace', ({ workspaceId, userId }) => {
            socket.leave(workspaceId);

            if (activeUsers.has(workspaceId)) {
                activeUsers.get(workspaceId).delete(userId);

                // Notify others
                socket.to(workspaceId).emit('user-left', {
                    userId,
                    activeCount: activeUsers.get(workspaceId).size
                });
            }

            console.log(`User ${userId} left workspace ${workspaceId}`);
        });

        // Send message
        socket.on('send-message', async ({ workspaceId, userId, content, type = 'text', fileUrl, fileName }) => {
            try {
                // Save message to database
                const message = await Message.create({
                    workspace: workspaceId,
                    sender: userId,
                    content,
                    type,
                    fileUrl,
                    fileName
                });

                // Populate sender info
                await message.populate('sender', 'name profilePicture');

                // Broadcast to all users in the workspace
                io.to(workspaceId).emit('new-message', message);

                console.log(`Message sent in workspace ${workspaceId}`);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', ({ workspaceId, userId, isTyping }) => {
            socket.to(workspaceId).emit('user-typing', { userId, isTyping });
        });

        // Document collaboration
        socket.on('doc-change', ({ workspaceId, content }) => {
            socket.to(workspaceId).emit('doc-update', content);
        });

        // Resource sharing
        socket.on('resource-shared', ({ workspaceId, resource }) => {
            io.to(workspaceId).emit('new-resource', { workspaceId, resource });
        });

        // Video call signaling
        socket.on('call-user', ({ workspaceId, to, offer }) => {
            socket.to(workspaceId).emit('incoming-call', {
                from: socket.id,
                offer
            });
        });

        socket.on('call-accepted', ({ to, answer }) => {
            io.to(to).emit('call-accepted', {
                answer
            });
        });

        socket.on('ice-candidate', ({ to, candidate }) => {
            io.to(to).emit('ice-candidate', {
                candidate
            });
        });

        socket.on('end-call', ({ workspaceId }) => {
            socket.to(workspaceId).emit('call-ended');
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            // Remove user from all workspaces
            activeUsers.forEach((users, workspaceId) => {
                users.forEach(userId => {
                    socket.to(workspaceId).emit('user-left', {
                        userId,
                        activeCount: users.size - 1
                    });
                });
            });
        });
    });
};
