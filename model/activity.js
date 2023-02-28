const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const activity = new mongoose.Schema({
    action : {
        type : String,
        enum : ['create','rename','move','access','share','external-user-share','external-user-create','external-user-upload','delete','register','edit','login','logout','upload','download','change-pwd','update-user','display-access','delete-access','edit-access','create-comment','edit-comment','delete-comment']
    },
    ip : {
        type : String
    },
    externalUser : {
        type : String
    },
    user : {
        type : ObjectId,
        ref : 'User'
    },
    folder : {
        type : ObjectId,
        ref : 'Folder'
    },
    box : {
        type : ObjectId,
        ref : 'Box'
    },
    docrequest : {  
        type : ObjectId,
        ref : 'DocRequest'
    },
    document : {
        type : ObjectId,
        ref : 'Document'
    },
    attachment : {
        version: Number,
        attachment: {
            type: ObjectId,
            ref: 'Attachment'
        },
    },
    comment : {
        type : String
    },    
    created_at: { type: Date, default: Date.now }
});


const Activity =  mongoose.model('Activity', activity);

module.exports = Activity;