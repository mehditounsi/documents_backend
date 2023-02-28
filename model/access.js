const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const access = new mongoose.Schema({
    box: {
        type: ObjectId,
        ref: 'Box'
    },
    user: {
        type: ObjectId,
        ref: 'User'
    },
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    giver: {
        type: ObjectId,
        ref: 'User'
    },
    starred: {
        type: Boolean,
        default: false
    },
    key: {
        type: ObjectId,
        ref: 'Keystore'
    },
    parent_folder: {
        type: ObjectId,
        ref: 'Folder'
    },
    old_parent_folder: {
        type: ObjectId,
        ref: 'Folder'
    },
    expires_at: { type: Date },
    created_at: { type: Date, default: Date.now },
    clones: [
        {
            type: ObjectId,
            ref: "Access",
        },
    ],
    source: {
        type: ObjectId,
        ref: 'Access'
    },
    deleted_at: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['ACTIVE', 'DEACTIVATED', 'EXPIRED', 'DELETED'],
        default: 'ACTIVE'
    },
    expires_at: {
        type: Date
    }
});


const Access = mongoose.model('Access', access);

module.exports = Access;