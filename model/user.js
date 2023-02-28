const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const crypto = require('crypto');
const Folder = require('./folder');
const Password_iterations = 1000 ;
const password_keylen = 64 ;
const password_digest = 'sha512' ;


const user = new mongoose.Schema({
    name : {
        type  : String,
        required : true
    },
    login : {
        type  : String,
        required : true,
        unique: true,
        lowercase: true,
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
    storage: {
        type: ObjectId,
        ref: 'Storage'
    },
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
    avatar256 : {
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
    pbkdf:{
        prf: { //pseudo random function sha512 by default
            type: String,
            required: true
        },
        salt: {
            type: String,
            required: true
        },
        dklen: {
            type:Number,
            required: true
        }  
    },    
    created_at: { type: Date, default: Date.now },
    last_connection: { type: Date, default: Date.now },
    configuration: { type: Object },
    validation_token : { type: String },
    token_expires_at:{
        type : Date
    }
});


// todo : penser à enregisterer les params de hash et les rendre random pour éviter la cryptoanalyse
//---------------------- VErify if is password is valid -------------------
user.methods.verifyPassowrd = async function(_password) { 
    var hashedPassword = crypto.pbkdf2Sync(_password,  
        this.pbkdf.salt, Password_iterations, password_keylen, password_digest).toString('hex'); 
        return this.password === hashedPassword; 
    };
    
    //----------------- hash & set password ----------------------------------
    user.methods.hashPassword = async function(_password){
        const salt = await crypto.randomBytes(16).toString("hex");
        //this.salt = salt;
        this.password = crypto.pbkdf2Sync(_password, salt,Password_iterations, password_keylen, password_digest).toString('hex');
        // pbkdf params
        this.pbkdf.salt = salt //await crypto.randomBytes(16).toString("hex");
        this.pbkdf.prf = password_digest 
        this.pbkdf.dklen = Password_iterations 
    };
    
    
    
    
    // -------------- Convert Object to JSON without password & RSA key -----------------
    user.methods.toJSON = function() {
    
        const myuser = this;
        
        const userObject = myuser.toObject();
        
        delete userObject.password;
        //delete userObject.salt;
        delete userObject.rsa;
        delete userObject.pbkdf;
        
        return userObject;
    }
    // -------------- Convert Object to JSON without password & RSA key -----------------
    user.methods.toSecretJSON = function() {
        const myuser = this;
        
        let userObject = {}
        
        userObject.rsa = myuser.rsa;
        userObject.pbkdf =myuser.pbkdf;
        
        return userObject;
    }

    //----------------- add to user group ----------------

    user.methods.addToGroup = async function (group) {
        if (group) {
            if (!this.groups){
                this.groups = [];
            }
            this.groups.push(group)
            await this.save()
        }
        return this.groups
    }

    //------------------ update group ------------------------

    user.methods.updateGroup = async function (group_id, update) {
        for (var i = 0; this.groups && i < this.groups.length; i++) {
            if (this.groups[i]._id.toString() == group_id) {
                this.groups[i].name = update.name
                this.groups[i].users = update.users
                await this.save()
    
                return this.groups[i]
            }
        }
    }

    //-----------------delete group ------------------

    user.methods.deleteGroup = async function (group_id) {
        for (var i = 0; this.groups && i < this.groups.length; i++) {
            if (this.groups[i]._id.toString() == group_id) {
                this.groups.splice(i, 1)
                await this.save()
                return this.groups
            }
        }
    }
    //-----------------confirm user ----------------
    user.methods.confirm = async function () {
         this.status = 'ACTIVE'
         this.validation_token = undefined
         this.token_expires_at = undefined
         this.save()
    }

//----------------- Update Owner ----------------
user.methods.updateOwnerInFolders = async function () {
    let folder = await Folder.findByIdAndUpdate(this.root_folder.toString(), { owner: this.id });
    folder = await Folder.findByIdAndUpdate(this.inbox_folder.toString(), { owner: this.id });
    folder = await Folder.findByIdAndUpdate(this.trash.toString(), { owner: this.id });
    folder = await Folder.findByIdAndUpdate(this.starred.toString(), { owner: this.id });
}
    
    const User =  mongoose.model('User', user);
    
    module.exports = User;
