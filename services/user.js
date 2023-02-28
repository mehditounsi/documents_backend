var httpContext = require('express-http-context');
const Logger = require('winston');
const User = require('../model/user');
const DeletedUser = require('../model/deleted_user');
const Keystore = require('../model/keystore');
const Attachment = require('../model/attachment');
const Access = require('../model/access');
const Folder = require('../model/folder');
const Configuration = require('../model/configuration');
const Storage = require('../services/storage');
const Errors = require('../helpers/errors');
const Content = require('../services/content');
const globals = require('../helpers/globals');
const utils = require('../helpers/misc');
const { getUserId } = require('../helpers/context')
var fs = require('fs');
const redis = require('../config/redis')
const fetch = require('node-fetch');
const mailer = require('../helpers/mail');
const configuration = require('../config/config')
const imageThumbnail = require('image-thumbnail');



const validity_code = configuration.sms.validity * 1000 || 10 * 1000 //10 minutes

//--------------------- Création de User

function rand() {
    return Math.random().toString(36).substr(2);
};

function generatetoken() {
    return rand() + rand();
};

exports.register = async (_user) => {
    Logger.debug("user to register : ", _user)
    found = await User.find({ login: _user.login })
    let expiration = new Date()
    expiration = expiration.setHours(expiration.getHours() + configuration.token_expiration)
    if (!found || found.length <= 0 && expiration) {
        root_folder = await Content.createRootFolder();
        inbox_folder = await Content.createRootFolder("inbox");
        trash = await Content.createRootFolder("trash")
        starred = await Content.createRootFolder("starred")
        default_storage = await Storage.getDefaultStorage()

        if (root_folder && inbox_folder && trash && starred) {

            // On crée le cac dans le keystore
            let cac = new Keystore({
                type: _user.key.type,
                cac: {
                    pb: _user.key.cac.pb,
                    pv: _user.key.cac.pv,
                    nonce: _user.key.cac.nonce,
                    mac: _user.key.cac.mac
                }
            })
            try {
                await cac.save()
            } catch (error) {
                throw error
            }

            if (cac) {
                try {
                    let validation_token
                    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(_user.login)) {
                        validation_token = generatetoken()

                        let link = configuration.base_url + '/#/confirm?token=' + validation_token

                        let opt = {
                            login: _user.login,
                            link: link
                        }
                        mailer.createConfirmationMail(opt)
                    }
                    let status = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(_user.login) ? "WAITING_VALIDATION" : "ACTIVE"

                    let user = new User({
                        name: _user.name,
                        login: _user.login,
                        //password: _user.password,
                        salt: _user.salt,
                        status: status,
                        validation_token: validation_token,
                        token_expires_at: expiration,
                        is_admin: false,
                        root_folder: root_folder.id,
                        inbox_folder: inbox_folder.id,
                        trash: trash.id,
                        starred: starred.id,
                        key: cac._id,
                        storage: default_storage
                    })

                    user.hashPassword(_user.password);
                    await user.updateOwnerInFolders()
                    await user.save()
                    Logger.debug("created user", user)
                    let options = {
                        login: _user.login,
                        password: _user.tempPass,
                        attachments: [
                            {
                                filename: 'logo.png',
                                //path: path.join(IMAGE_PATH + 'logo.png'),
                                cid: 'logo' //same cid value as in the html img src

                            },

                            {
                                filename: 'app.png',
                                //path: path.join(IMAGE_PATH + 'app.png'),
                                cid: 'download' //same cid value as in the html img src
                            }
                        ]

                    }
                    Logger.info(`opt: {login: ${options.login}, password:${options.password}}`)
                    if (_user.tempPass) {
                        if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(_user.login)) {
                            let message = `votre mot de passe est : "${_user.tempPass}"`
                            this.sendSMS(_user.login, message)
                        } else if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(_user.login)) {
                            await mailer.createPasswordMail(options)
                        }
                    }



                    utils.trackActivity(globals.ACTION_REGISTER, { user: user.id })
                    Logger.info(`Register: ${user}`)
                    return user.populate('key');

                } catch (error) {
                    throw error
                }

            } else {
                throw new Errors.InvalidDataError('Undefined cac')
            }
        } else {
            throw new Errors.InvalidDataError('Undefined argument root_folder')
        }
    } else {
        throw new Errors.InvalidDataError('login already exists')
    }
}

//--------------------- Validation Email -------------------

//---------------------- vérification de login    
exports.verifyUser = async (_user, fcm_token) => {
    let login = _user.login
    let password = _user.password
    Logger.info("Verify User : ");
    let user = await User.findOne({ login: login }).populate('key')
    if (user) {
        if (user.status != 'ACTIVE') {
            return new User({ status: user.status, id: user.id })
        } else {
            let ok = await user.verifyPassowrd(password)
            if (!ok) {
                throw new Errors.UnAuthorizedError('incorrect password')
            }
            /// 
            /// create starred folder for old accounts which don't have "starred" folder
            if (!user.starred) {
                starred = await Content.createRootFolder("starred")
                user.starred = starred.id
                await user.save()
            }
            /// end
            let configuration = await Configuration.findOne({ user: user.id })
            if (configuration) {
                await configuration.addToken(fcm_token)
            }
            else {
                configuration = new Configuration({
                    user: user.id,
                    tokens: [fcm_token]
                })
                await configuration.save()
            }
            utils.trackActivity(globals.ACTION_LOGIN, { user: user.id })
            // Logger.info('verify user', user)
            user.configuration = configuration
            return (user);
        }

    } else {
        throw new Errors.InvalidDataError('inexistant login')
    }
}

//------------------------ get User  -------------------
exports.getUser = async (user_id) => {
    if (user_id) {
        let user = await User.findById(user_id).populate('key')
        let configuration = await Configuration.findOne({ user: user.id })

        Logger.info('get user', user)
        user.configuration = configuration

        return user;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//------------------------ Activate  User  -------------------
exports.activate = async (_user) => {
    if (_user) {
        let user = await User.findById(_user.id)
        if (["WAITING_VALIDATION", "DEACTIVATED", "SUSPENDED"].includes(user.status)) {
            user.status = "ACTIVE"
            await user.save();
            Logger.info('activate user', user)

            return user.toJSON();
        } else {
            throw new Errors.InvalidDataError('user already active')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}



//------------------------ update User  -------------------
exports.updateUser = async (_user, datafile, context) => {
    try {
        let id = context.gUserID
        if (id && _user) {
            let userdata = {}
            if (_user.name) {
                userdata.name = _user.name
            }
            if (_user.phone) {
                userdata.phone = _user.phone
            }
            if (_user.address) {
                userdata.address = _user.address
            }
            if (datafile) {
                let options = { width: 64, height: 64, responseType: 'base64' }
                const thumb = await imageThumbnail(datafile.path, options)

                options = { width: 256, height: 256, responseType: 'base64' }
                const thumb256 = await imageThumbnail(datafile.path, options)

                userdata.avatar = thumb
                userdata.avatar256 = thumb256
            }
            let user = await User.findByIdAndUpdate(id, userdata, { new: true }).populate('key')
            if (user) {
                Logger.info("update user", _user)
                return user.toJSON();
            } else {
                throw new Errors.InvalidDataError('User Not found')
            }
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    }
    catch (error) {
        Logger.error(error);
    }
}

exports.changePassword = async (data) => {
    if (data.password && data.oldpassword && data.password == data.oldpassword) {
        throw new Errors.InvalidDataError('Already used password')
    }
    let id = getUserId()
    let user = await User.findById(id)
    let ok = await user.verifyPassowrd(data.oldpassword)
    if (!ok) {
        throw new Errors.InvalidDataError('Invalid password')
    }


    let key = await Keystore.findByIdAndUpdate(user.key, {
        cac: {
            pb: data.key.cac.pb,
            pv: data.key.cac.pv,
            nonce: data.key.cac.nonce,
            mac: data.key.cac.mac
        }
    })
    if (key) {
        user.hashPassword(data.password)
        utils.trackActivity(globals.ACTION_CHANGE_PASSWORD, { user: user.id })
        if (user.status == "PROVISIONED")
            user.status = 'ACTIVE'
        await user.save()
        Logger.info('Change password', user)

        utils.trackActivity(globals.ACTION_CHANGE_PASSWORD, { user: user.id })
        return await User.findById(user.id).populate('key')
    }
    throw new Errors.InvalidDataError('Error when updating password')

}

exports.getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}



exports.getFriends = async (user_id) => {
    if (user_id) {
        let friendArray = await getFriendsArray(user_id)
        //populate users/key
        let friendPopulatedArray = await User.find({ $and: [{ _id: { $in: friendArray } }, { $or: [{ status: "ACTIVE" }, { status: "WAITING_VALIDATION" }] }] })
            .select(['-trash', '-root_folder', '-inbox_folder', '-activities', '-groups', '-salt', '-is_admin', '-last_connection', '-validation_token', '-token_expires_at', '-starred'])
            .populate({ path: 'key', select: 'cac.pb' })

        Logger.info('get Friends', friendPopulatedArray)

        return friendPopulatedArray
    } else {
        throw new Errors.InvalidDataError('No Friends found')
    }
}

exports.searchFriend = async (search) => {
    if (search) {
        let user_id = getUserId()
        let friendArray = await getFriendsArray(user_id)
        let user = await User.findOne({ login: search, login: { $in: friendArray } })
            .select(['-trash', '-root_folder', '-inbox_folder', '-activities', '-groups', '-salt', '-is_admin', '-last_connection', '-validation_token', '-token_expires_at', '-starred'])
            .populate({
                path: 'key',
                select: 'cac.pb'
            })
        if (user) {
            Logger.info('search Friends', user)
            return user
        }
        return {}
    } else {
        throw new Errors.InvalidDataError('Nothing to search')
    }
}

exports.createGroup = async (group, id) => {
    if (group && id) {
        let user = await User.findById(id)
        if (user) {
            let groups = await user.addToGroup(group)
            if (groups) {
                Logger.info('create group', groups)
                return groups
            }
            throw new Errors.InvalidDataError('Nothing to add')

        }
        throw new Errors.InvalidDataError('Undefined argument')
    }
    else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

exports.getGroup = async (user_id) => {
    if (user_id) {
        let user = await User.findById(user_id)
            .populate({
                path: 'groups',
                populate: {
                    path: "users",
                    populate: {
                        path: 'key',
                        select: 'cac.pb'

                    },
                    select: ['-trash', '-root_folder', '-inbox_folder', '-activities', '-groups', '-salt', '-is_admin', '-last_connection', '-validation_token', '-token_expires_at', '-starred']
                }
            })
        let groups = user.groups
        if (groups) {
            Logger.info('get group', groups)
            return groups
        }
        throw new Errors.InvalidDataError('Undefined argument')
    }
    throw new Errors.InvalidDataError('Undefined argument')
}

exports.updateGroup = async (group_id, update) => {
    if (group_id && update) {
        let user = await User.findOne({ 'groups._id': group_id }).populate({
            path: 'groups',
            populate: {
                path: "users",
                populate: {
                    path: 'key',
                    select: 'cac.pb'

                },
                select: ['-trash', '-root_folder', '-inbox_folder', '-activities', '-groups', '-salt', '-is_admin', '-last_connection', '-validation_token', '-token_expires_at', '-starred']
            }
        })
        if (user) {
            let group = await user.updateGroup(group_id, update)
            Logger.info('update group', group)
            return group
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}


exports.deleteGroup = async (group_id) => {
    if (group_id) {
        let user = await User.findOne({ 'groups._id': group_id })
        if (user) {
            let group = await user.deleteGroup(group_id)
            Logger.info('delete group')
            return group
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}






exports.logout = async (user_id, token) => {
    if (user_id) {

        let configuration = await Configuration.findOne({ user: user_id })
        Logger.info('logout', configuration.token)

        await configuration.deleteToken(token)
    } else {
        throw new Errors.InvalidDataError('User not found')
    }
}




//------------------------ Send verification code  -------------------
exports.sendCode = async (receiver, type, appSignature) => {
    if (receiver && type) {
        let code = generateCode()
        const appName = configuration.sms.appName

        let message = `${appName}: Your code is ${code} ${appSignature}`
        let isSent = false
        try {
            await redis.SETEX(receiver.toString(), validity_code, code)
        } catch (error) {
            Logger.error(error.message)
        }

        if (type == 'email') {
            /// send email
            let opt = {
                login: receiver,
                code: code
            }

            isSent = await mailer.createConfirmationMail(opt)

        }
        else if (type == 'phone') {
            try {
                isSent = await this.sendSMS(receiver, message)
            } catch (error) {
                console.log(error)
            }
            /// send sms
        }

        if (isSent) {
            Logger.info(`Send code ${code} to receiver ${receiver}`)
        }
        else {
            Logger.info(`error while sending code`)
        }

        return isSent;
    } else {

        return false;
    }
}

//------------------------ Verify code -------------------
exports.verifyCode = async (receiver, code) => {
    if (receiver && code) {
        /// verify code
        Logger.info('Verifying code of', receiver, ' - ', code)
        let _code = await redis.get(receiver);
        if (_code == code.toString())
            return true
        else
            return false
    } else {
        return false;
    }
}
//------------------------Generate Code --------------------
function generateCode(min = 1111, max = 9999) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

///----------------------- Send SMS --------------------------------
exports.sendSMS = async (receiver, message) => {
    try {
        Logger.info("Envoi sms au ", receiver)
        let url = `${configuration.sms.host}?action=send-sms&api_key=${configuration.sms.token}&sms=${message}&from=${configuration.sms.appName}&to=${receiver}`
        var response = await fetch(url)
        Logger.debug(url, response)

        return true
    } catch (error) {
        Logger.error(error)
        return false
    }

}

//---------------- user storage calculation--------------

exports.usedStorage = async (user_id) => {
    if (user_id) {
        let attachments = await Attachment.find({ owner: user_id })
        let total_size = 0
        Logger.debug("file number", attachments.length)
        for (let i = 0; attachments && i < attachments.length; i++) {
            total_size += parseInt(attachments[i].size);
        }
        Logger.debug("used storage", total_size)
        return total_size
    } else {
        throw new Errors.InvalidDataError('User not found')
    }
}
//------------------------ deactivate User --------------------

exports.deactivateUser = async (user_id, password) => {
    if (user_id && password) {
        let currentUser = await this.getUser(user_id)
        if (currentUser.status !== 'DEACTIVATED') {
            let ok = await currentUser.verifyPassowrd(password)
            if (ok) {
                let user = await User.findByIdAndUpdate(user_id, {
                    "$set": {
                        "status": "DEACTIVATED"
                    }
                }, { new: true })
                let a = await Access.updateMany({ $or: [{ owner: user_id }, { user: user_id }] }, {
                    "$set": {
                        "status": "DEACTIVATED"
                    }
                })

                Logger.info(`Deactivated user: ${user.id}, ${user.login}`)
                return user
            } else {
                throw new Errors.UnAuthorizedError('incorrect password')
            }
        } else {
            throw new Errors.InvalidDataError('User already deactivated')
        }
    }
    throw new Errors.InvalidDataError('User not found')
}

//------------------Reactivate user----------------

exports.reactivateUser = async (user_id, fcm_token, password) => {
    if (user_id && password) {
        let user = await User.findById(user_id)
        let ok = await user.verifyPassowrd(password)
        if (ok) {
            let currentUser = await User.findOneAndUpdate({ id: user_id, status: 'DEACTIVATED' }, {
                "$set": {
                    "status": "ACTIVE"
                }
            }, { new: true })
            if (currentUser) {

                await Access.updateMany({ $or: [{ owner: user_id }, { user: user_id }] }, {
                    "$set": {
                        "status": "ACTIVE"
                    }
                })
                Logger.info(`Reactivated user: ${currentUser.id}, ${currentUser.login}`)
                let configuration = await Configuration.findOne({ user: user_id })
                if (configuration) {
                    await configuration.addToken(fcm_token)
                }
                else {
                    configuration = new Configuration({
                        user: user_id,
                        tokens: [fcm_token]
                    })
                    await configuration.save()
                }
                utils.trackActivity(globals.ACTION_LOGIN, { user: user_id })
                Logger.info('verify user', currentUser)
                currentUser.configuration = configuration


                return currentUser.populate('key')
            } else {
                throw new Errors.InvalidDataError('User already activated')
            }
        } else {
            throw new Errors.InvalidDataError('Incorrect Password')
        }
    }
    throw new Errors.InvalidDataError('User not found')
}

//-------------Delete User --------------------

exports.deleteUser = async (user_id, password) => {
    if (user_id && password) {
        let currentUser = await this.getUser(user_id)

        let ok = await currentUser.verifyPassowrd(password)
        if (ok) {
            let user = await User.findById(user_id)
            let deleted_user = new DeletedUser({
                old_user_id: user_id,
                name: user.name,
                login: user.login,
                password: user.password,
                salt: user.salt,
                status: user.status,
                is_admin: false,
                root_folder: user.root_folder,
                inbox_folder: user.inbox_folder,
                trash: user.trash,
                starred: user.starred,
                key: user.key
                // storage: user.storage
            })

            await deleted_user.save()

            await Access.updateMany({ $or: [{ owner: user_id }, { user: user_id }] }, {
                "$set": {
                    "status": "DELETED"
                }
            })

            let deleteUser = await User.findByIdAndDelete(user_id)


            return deleteUser
        } else {
            throw new Errors.UnAuthorizedError('incorrect password')
        }
    }
    throw new Errors.InvalidDataError('User not found')
}


exports.confirmUser = async (token) => {
    if (token) {
        let user = await User.findOne({ validation_token: token })
        if (user) {
            if (user.status === 'WAITING_VALIDATION' && user.token_expires_at >= new Date()) {
                await user.confirm()
                return user
            }
            if (user.status === 'ACTIVE') {
                throw new Errors.InvalidDataError('User Already Active ')
            }
            if (!user.token_expires_at >= new Date()) {
                throw new Errors.InvalidDataError('Validation Token Expired ')
            }
        } else {
            throw new Errors.InvalidDataError("Can not Confirm User")
        }
    }
}

//---------- verify login ----------------------------------------------------

exports.verifyLogin = async (login) => {
    if (login) {
        let user = await User.findOne({ login: login })
        if (user) {
            return true
        } else {
            return false
        }
    } else {
        throw new Errors.InvalidDataError('Can not search login')
    }

}

getFriendsArray = async (user_id) => {
    let friendArray = []
    if (user_id) {
        let friends = await Access.find({
            $or: [{ user: user_id }, { owner: user_id }, { giver: user_id }]
        })

        friends.forEach((element) => {
            if (element.user) friendArray.push(element.user.toString())
            if (element.giver) friendArray.push(element.giver.toString())
            if (element.owner) friendArray.push(element.owner.toString())
        })
        //remove current user
        friendArray = await friendArray.filter(item => !user_id.includes(item))
        //remove duplicated
        friendArray = [...new Set(friendArray)];
    }
    return friendArray
}

//-----------------search user------------------------

exports.searchUser = async (search) => {
    if (search) {
        let user = await User.findOne({ login: search })
            .select(['-trash', '-root_folder', '-inbox_folder', '-activities', '-groups', '-salt', '-is_admin', '-last_connection', '-validation_token', '-token_expires_at', '-starred'])
            .populate({
                path: 'key',
                select: 'cac.pb'
            })
        if (user) {
            Logger.info('Search user', user)
            return user
        } else {
            return {}
        }
    } else {
        throw new Errors.NotFoundError('No element to search')
    }

}