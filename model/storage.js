const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const storage = new mongoose.Schema({
    storage: {
        type: String,
        required: true
    },
    type : {
        type  : String,
        required : true,
        enum:['FS','MIO','S3','GCP','Azure'],
        default:'MIO'
    },
    params: {
        type:Object
    },    
    status : {
        type  : String,
        required : true,
        enum:['ACTIVE','DESACTIVATED'],
        default:'ACTIVE'
    },
    default_storage :{
        type : Boolean,
        default : false,
        required : true
    },
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    created_at: { type: Date, default: Date.now }
});

const Storage = mongoose.model('Storage', storage);

module.exports = Storage;