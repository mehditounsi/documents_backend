const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const {getUserId} = require('../helpers/context')



const document = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['file', 'form']
    },

    content_type: {
        type: String
    },
    size: {
        type: Number,
        default: 0
    },

    // formcontent : {
    //     type  : String
    // },
    // formtemplate : {
    //     type  : String
    // },
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    activities: [{
        type: ObjectId,
        ref: 'Activity'
    }],
    root_box: {
        type: ObjectId,
        ref: 'Box'
    },
    parent_box: {
        type: ObjectId,
        ref: 'Box'
    },
    old_parent_box: {
        type: ObjectId,
        ref: 'Box'
    },
    parent_folder: {
        type: ObjectId,
        ref: 'Folder'
    },
    old_parent_folder :{
        type : ObjectId,
        ref : 'Folder'
    },
    current_version: {
        version: Number,
        attachment: {
            type: ObjectId,
            ref: 'Attachment'
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    versions: [{
        version: {
            type: Number,
            default: 0
        },
        attachment: {
            type: ObjectId,
            ref: 'Attachment'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        comment: {
            type: String,
            default: ''
        },
        owner: {
            type: ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        },
        modified_at: {
            type: Date,
            default: null
        },
        nonce: String,
        mac: String

    }],
    status: {
        type: String,
        required: true,
        enum: ['UPLOADING', 'ACTIVE', 'DEACTIVATED', 'SUSPENDED' , 'DELETED'],
        default: 'ACTIVE'
    },
    created_at: { type: Date, default: Date.now },
    last_modified: {
        modified_at: {
            type: Date,
            default: Date.now
        },
        modifier: {
            type: ObjectId,
            ref: 'User'
        }
    },
    deleted_at: { type: Date }
});


document.methods.addComment = async function (data) {

    if (data) {
        this.comments.push({
            comment: data.comment,
            mac: data.mac,
            nonce: data.nonce,
            owner: getUserId()
        })
        await this.save()
        return this.comments[this.comments.length - 1]
    }

}

document.methods.updateComment = async function (comment_id, data) {
    let id = getUserId()
    for (var i = 0; this.comments && i < this.comments.length; i++) {
        if (this.comments[i]._id.toString() == comment_id && this.comments[i].owner.toString() == id) {
            this.comments[i].comment = data.comment
            this.comments[i].nonce = data.nonce
            this.comments[i].mac = data.mac
            this.comments[i].modified_at = Date.now()
            await this.save()

            return this.comments[i]
        }
    }

}

document.methods.deleteComment = async function (comment_id) {
    let id = getUserId()
    for (var i = 0; this.comments && i < this.comments.length; i++) {
        if (this.comments[i]._id.toString() == comment_id && this.comments[i].owner.toString() == id) {
            this.comments.splice(i, 1)
            await this.save()

            return this.comments
        }
    }

}


const Document = mongoose.model('Document', document);

module.exports = Document;
