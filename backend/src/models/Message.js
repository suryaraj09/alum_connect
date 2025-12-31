const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['text', 'file', 'system'],
        default: 'text',
    },
    fileUrl: {
        type: String,
    },
    fileName: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
