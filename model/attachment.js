const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const attachment = new mongoose.Schema({
    filename: {
        type: String,
        // required: true
    },
    size: {
        type: Number,
        default: 0
    },
    content_type: {
        type: String
    },
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    document : {
        type : ObjectId,
        ref : 'Document'
    },
    storage_id : {
        type : ObjectId,
        ref : 'Storage',
        required : false
    },
    storage : {
        type : Object,
        required : false
    },
    hash: {
        type : String
    },
    csd:{
        nonce : String,
        mac : String
    },
    created_at: { type: Date, default: Date.now }
});

const Attachment = mongoose.model('Attachment', attachment);

module.exports = Attachment;