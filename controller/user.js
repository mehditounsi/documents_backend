var httpContext = require('express-http-context');
const Logger = require('winston');
const { getUserId } = require('../helpers/context')


const UserService = require('../services/user');
const StorageService = require('../services/storage');
const jwtUtils = require('../helpers/jwt');
const globals = require('../helpers/globals');
const formidable = require('formidable');
const { InvalidDataError } = require('../helpers/errors');



//---------------- Création de user ----------------------------------
exports.register = async (req, res, next) => {
    try {
        Logger.debug(req.body.name, req.body.login)
        let name = req.body.name
        let login = req.body.login
        let password = req.body.password
        let type = req.body.type
        if (!login || !password || !name || !type) {
            res.status(420).send("missing credentials");
        } else {
            if (await this.loginTypeVerification(login, type) == true) {
                let user = await UserService.register(req.body)
                res.status(200).send(user)
            } else {
                res.status(400).send({ error: "invalid login format" })
            }
        }
    } catch (err) {
        console.error(err);
        Logger.error("Error" + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

exports.loginTypeVerification = async (login, type) => {
    if (type === "email") {
        let email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(login)
        return email
    }
    else if (type === "phone") {
        let phone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(login)
        return phone
    } else {
        return false
    }
}


//---------------- Login de user ----------------------------------
exports.login = async (req, res, next) => {
    try {
        Logger.debug(req.body.login)
        let login = req.body.login
        let password = req.body.password
        let fcm_token = req.body.fcm_token
        if (!login || !password) {
            res.status(420).send("missing credential");
        } else {
            let user = await UserService.verifyUser({ login: login, password: password }, fcm_token)
            if (user) {
                user_auth = user.toJSON()
                user_auth.token = jwtUtils.generateTokenForUser(user)
                res.status(200).send(user_auth)
            } else {
                Logger.error("Error " + err)
                res.status(401).send("non authorized");
            }
        }

    } catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

//---------------- display  user Profile ----------------------------------
exports.getUserList = async (req, res, next) => {
    try {
        let users = await UserService.getUser()
        if (users) {
            res.status(200).send(users)
        } else {
            Logger.error("Error " + err)
            res.status(420).send("not found");
        }
    } catch (error) {
        Logger.error(error)
    }
}
//---------------- display  user Profile ----------------------------------
exports.profile = async (req, res, next) => {
    try {
        let id = getUserId()
        let user = await UserService.getUser(id)
        if (user) {
            res.status(200).send(user)
        } else {
            Logger.error("Error " + err)
            res.status(420).send("not found");
        }
    } catch (error) {
        Logger.error(error)
    }
}
//---------------- update  user Profile ----------------------------------
exports.update = async (req, res, next) => {
    try {
        Logger.debug(req.body)
        let datafile
        let context = req.body.context
        if (req.file) {
            datafile = {
                "name": req.file.originalname,
                "path": req.file.path,
                "size": req.file.size,
                "type": req.file.mimetype
            }
        }
        let dataform = req.body
        if (dataform) {
            let user = await UserService.updateUser(dataform, datafile, context)
            res.status(200).send(user);
        } else {
            res.status(420).send({ error: 'missing arguments' });
        }
    } catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

exports.changePassword = async (req, res) => {
    try {
        Logger.debug(req.body.oldpassword, req.body.password, req.body.key)
        if (req.body.oldpassword && req.body.password && req.body.key) {
            let user = await UserService.changePassword(req.body)
            res.status(200).send(user.toJSON())
        } else {
            let err = new InvalidDataError("missing data")
            res.status(420).send({ error: err.message, code: err.code });
        }
    } catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code });
    }

}

//---------------- get user storage ----------------------------------

exports.getUserStorage = async (req, res) => {
    try {
        let id = getUserId()

        let storage = await StorageService.getUserStorage(id)
        storage.params = undefined
        if (storage) {
            res.status(200).send(storage)
        } else {
            Logger.error("Error " + err.message)
            res.status(420).send({ error: err.message, code: err.code });
        }
    } catch (err) {
        Logger.error(err.message)
    }
}



//---------------- display  user Profile ----------------------------------
exports.logout = async (req, res, next) => {
    try {
        Logger.debug(req.body.token)
        let token = req.body.token
        let user_id = getUserId()
        let logout = await UserService.logout(user_id, token)
        res.status(200).send({ message: 'you are logged out' })
    }
    catch (err) {
        Logger.error("Error " + err.message)
        res.status(420).send({ error: err.message, code: err.code })
    }
}

exports.getFriends = async (req, res) => {
    try {
        let user_id = getUserId()
        let friends = await UserService.getFriends(user_id)
        if (user_id && friends) {
            res.status(200).send(friends)

        } else {

            Logger.error("Error " + err)
            res.status(420).send({ error: err.message, code: err.code });
        }
    }
    catch (error) {
        Logger.error(error)
    }

}


exports.searchFriend = async (req, res) => {
    try {
        Logger.debug(req.query.login)
        if (req.query.login[0] == ' ')
            req.query.login = '+' + req.query.login.substr(1)
        let login = req.query.login
        let result = await UserService.searchFriend(login)
        res.status(200).send(result)
    }
    catch (err) {
        Logger.error(err)
        res.status(420).send({ err: err.message, code: err.code });
    }
}


//--------------------------groups ------------------------------

// creates a group 

exports.createGroup = async (req, res) => {
    try {
        Logger.debug(req.body)
        let id = getUserId()
        let group = await UserService.createGroup(req.body, id)
        res.status(200).send(group)
    }
    catch (err) {
        Logger.error(err)
        res.status(420).send({ err: err.message, code: err.code });
    }
}

exports.getGroup = async (req, res) => {
    try {
        let id = getUserId()
        let group = await UserService.getGroup(id)
        if (group) {
            res.status(200).send(group)
        } else {
            Logger.error("Error " + err)
            res.status(420).send("not found");
        }
    } catch (error) {
        Logger.error(error)
    }
}

exports.updateGroup = async (req, res) => {
    try {
        Logger.debug(req.params.id, req.body)
        let id = req.params.id
        if (!id) {
            Logger.error("Error " + err.message)
        } else {
            let group = await UserService.updateGroup(id, req.body);
            res.status(200).send(group)
        }
    }
    catch (err) {
        Logger.error("Error " + err.message)
        res.status(470).json({ error: err.message, code: err.code })

    }
}


exports.deleteGroup = async (req, res) => {
    try {
        Logger.debug(req.params.id)
        let id = req.params.id
        if (id) {
            let content = await UserService.deleteGroup(id)
            res.status(200).send({ message: "The group has been deleted" })
        } else {
            Logger.error("Error " + err)
            res.status(420).send("Missing arguments");
        }
    }
    catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}


//---------------- Send verification code ----------------------------------
exports.sendCode = async (req, res, next) => {
    try {
        Logger.debug(req.query.receiver)
        let receiver = req.query.receiver
        let appSignature = req.query.appSignature ?? ""
        let sent = false
        if (!receiver) {
            res.status(420).send("missing credential");
        }
        else {
            let type
            if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(receiver)) {
                type = "email"
            }
            else if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(receiver)) {
                type = "phone"
            }
            if (type) {
                sent = await UserService.sendCode(receiver, type, appSignature)
            }


            res.status(200).send(sent)

        }

    } catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

//---------------- Verify code ----------------------------------
exports.verifyCode = async (req, res, next) => {
    try {
        Logger.debug(req.query.receiver, " - ", req.query.code)
        let receiver = req.query.receiver
        let code = req.query.code
        if (!receiver && !code) {
            res.status(420).send("missing credential");
        }
        else {
            let isValid = await UserService.verifyCode(receiver, code)
            res.status(200).send(isValid)
        }

    } catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

//-------------- user storage calculation--------------------------------

exports.usedStorage = async (req, res) => {
    try {
        let id = getUserId()
        let usedStorage = await UserService.usedStorage(id)
        res.status(200).send({ result: usedStorage })
    }
    catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

//--------------User Deactivation--------------------------------

exports.deactivateUser = async (req, res) => {
    try {
        Logger.debug(req.body)
        let id = getUserId()
        let password = req.body.password
        let deactivation = await UserService.deactivateUser(id, password)
        res.status(200).send(deactivation)
    }
    catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code })
    }
}

//--------------User Reactivation--------------------------------

exports.reactivateUser = async (req, res) => {
    try {
        Logger.debug(req.body, req.params)
        let fcm_token = req.body.fcm_token
        let password = req.body.password
        let user = await UserService.reactivateUser(req.params.id, fcm_token, password)
        if (user) {
            user_auth = user.toJSON()
            user_auth.token = jwtUtils.generateTokenForUser(user)
            res.status(200).send(user_auth)
        } else {
            Logger.error("Error " + err)
            res.status(420).send("non authorized");
        }
    }
    catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code })
    }
}


//------------------- Delete User--------------------------------

exports.deleteUser = async (req, res) => {
    try {
        Logger.debug(req.body)
        let id = getUserId()
        let password = req.body.password
        let deleteUser = await UserService.deleteUser(id, password)
        res.status(200).send(deleteUser)
    }
    catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code })
    }

}
//---------------Confirm user--------------------------------
exports.confirmUser = async (req, res) => {
    try {
        Logger.debug(req.query)
        let token = req.query.token
        let confirmation = await UserService.confirmUser(token)
        res.status(200).send(confirmation)
    } catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code })
    }
}

//---------------verify login --------------------------------

exports.verifyLogin = async (req, res) => {
    try {
        Logger.debug(req.query)
        if (req.query.login && req.query.login[0] == ' ')
            req.query.login = '+' + req.query.login.substr(1)
        let login = req.query.login
        let verification = await UserService.verifyLogin(login)
        if (verification) {
            res.status(200).send({ result: true })
        } else {
            res.status(200).send({ result: false })
        }
    } catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code, result: false })
    }
}


//----------------Search User --------------------

exports.searchUser = async (req, res) =>{
    try {
        Logger.debug(req.query)
        let search = req.query.login
        let user = await UserService.searchUser(search)
        if (user){
            res.status(200).send(user)
        } else {
            res.status(420).send("User not found");
        }
    }
    catch (err) {
        Logger.error("Error " + err)
        res.status(420).send({ error: err.message, code: err.code})
    }
}