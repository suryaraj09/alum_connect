const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    resources: [{
        title: String,
        url: String,
        type: {
            type: String,
            enum: ['document', 'spreadsheet', 'meeting', 'file'],
            default: 'file'
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
