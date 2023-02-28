const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const deleted_user = new mongoose.Schema({
    old_user_id:{
        type : String,
        required : true
    },
    name : {
        type  : String,
        required : true,
        unique: false
    },
    login : {
        type  : String,
        required : true,
        unique: false
        },
    password : {
        type  : String,
        required : true
    },
    salt: {
        type: String,
        required: true,
    },
    phone : {
        type  : String
    },
    address : {
        type  : String
    },
    is_admin : {
        type : Boolean,
        required : true,
        default : false
    },
    root_folder : {
        type : ObjectId,
        ref:'Folder'
    },
    inbox_folder : {
        type : ObjectId,
        ref:'Folder'
    },
    trash : {
        type : ObjectId,
        ref:'Folder'
    },
    
    starred : {
        type : ObjectId,
        ref:'Folder'
    },

    key: {
        type: ObjectId,
        ref: 'Keystore'
    },
    // storage: {
    //     type: ObjectId,
    //     ref: 'Storage'
    // },
    status : {
        type  : String,
        required : true,
        enum:['WAITING_VALIDATION','PROVISIONED','RECOVERY','ACTIVE','DEACTIVATED','SUSPENDED'],
        default:'WAITING_VALIDATION'
    },
    activities:[{
        type : ObjectId,
        ref : 'Activity'
    }],
    avatar : {
        type  : String
    },
    groups : [{
            name :{
                type : String,
                default: ''
            },
            users:[{
                type : ObjectId ,
                ref : "User"
            }]    
    }]
,    
    created_at: { type: Date, default: Date.now },
    last_connection: { type: Date, default: Date.now },
    configuration: { type: Object }
});


const DeletedUser =  mongoose.model('DeletedUser', deleted_user);
    
module.exports = DeletedUser;
