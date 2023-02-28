
var admin = require("firebase-admin");
const Logger = require('winston');
const Configuration = require('../model/configuration');
const Folder = require('../model/folder');
const Document = require('../model/document');
const { getUserId, getUserLogin } = require('../helpers/context')



const User = require('../model/user');
const Errors = require('../helpers/errors');
const Box = require('../model/box');
const DocRequest = require('../model/docrequest');
const Access = require('../model/access');
const Attachment = require('../model/attachment');
const globals = require('./globals');
const mailer = require('../helpers/mail');


var serviceAccount = require("../config/doculock-ef5ff-firebase-adminsdk-2spll-bee8905cdd.json");

const mailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
/*
config.action
config.document // commented document
config.box // commented box & shared box
config.box_name
config.items: shared // user_id
 */
exports.sendNotification = async (config) => {
    try {
        if (config.action == "comment-document") {
            if (config.document) {
                let document = await Document.findById(config.document)
                console.log("1")
                if (document && document.root_box) {
                    let receivers = []
                    let logins = []
                    let id = await getUserId()
                    let access = await Access.find({ box: document.root_box }).populate('user')
                    for (let i = 0; access && i < access.length; i++) {
                        if (access[i].user.id != id) {
                            receivers.push(access[i].user.id)
                            logins.push(access[i].user.login)
                        }
                    }
                    console.log("2")
                    receivers = [...new Set(receivers)]
                    logins = [...new Set(logins)]
                    let sender = await getUserLogin()

                    for (let i = 0; logins && i < logins.length; i++) {
                        if (logins[i] == sender || !mailPattern.test(logins[i])) {
                            logins.splice(i, 1)
                        }
                    }
                    console.log("3")
                    if (receivers) {
                        await this.sendNotificationToDevice(receivers, "New Comment", "Someone Commented Your Document", globals.NOTIFICATION_COMMENT_DOCUMENT)
                    }


                    let opt = {
                        receivers: logins,
                        user: sender,
                        document_name: document.name
                    }
                    await mailer.createCommentDocumentNotification(opt)

                }
            }
        }
        if (config.action == "comment-box") {
            if (config.box) {
                let receivers = []
                let logins = []
                let id = await getUserId()
                console.log("1")
                let access = await Access.find({ box: config.box }).populate('user')
                for (let i = 0; access && i < access.length; i++) {
                    if (access[i].user.id != id) {
                        receivers.push(access[i].user.id)
                        logins.push(access[i].user.login)
                    }
                }
                receivers = [...new Set(receivers)]
                logins = [...new Set(logins)]

                let sender = await getUserLogin()
                console.log("2")

                for (let i = 0; logins && i < logins.length; i++) {
                    if (logins[i] == sender || !mailPattern.test(logins[i])) {
                        logins.splice(i, 1)
                    }
                }
                console.log("3")
                if (receivers) {
                    await this.sendNotificationToDevice(receivers, "New Comment", "Someone Commented Your Box", globals.NOTIFICATION_COMMENT_BOX)
                }


                let opt = {
                    receivers: logins,
                    user: sender,
                    box_name: config.box_name
                }
                await mailer.createCommentBoxNotification(opt)

            }
        }

        if (config.action == "download") {
            if (config.document) {
                let document = await Document.findById(config.document)
                console.log("1")
                if (document && document.root_box) {
                    let receivers = []
                    let logins = []
                    let access = await Access.find({ box: document.root_box }).populate('owner')
                    for (let i = 0; access && i < access.length; i++) {
                        //only owner
                        let _id = await getUserId()
                        if (access[i].owner.id != _id) {
                            receivers.push(access[i].owner.id)
                            logins.push(access[i].owner.login)
                        }
                    }


                    receivers = [...new Set(receivers)]
                    logins = [...new Set(logins)]
                    console.log("2")


                    for (let i = 0; logins && i < logins.length; i++) {
                        if (!mailPattern.test(logins[i])) {
                            logins.splice(i, 1)
                        }
                    }

                    let sender = await getUserLogin()
                    console.log("3")
                    if (receivers) {
                        await this.sendNotificationToDevice(receivers, "New Download", "Someone Downloaded Your Document", globals.NOTIFICATION_DOWNLOAD)
                    }
                    console.log("10")
                    let opt = {
                        receiver: logins,
                        user: sender,
                        document_name: document.name
                    }
                    //await mailer.createDownloadNotification(opt)
                }
                // search owners and send to owners except config.except
            }
        }

        if (config.action == "new_content") {
            if (config.document) {
                // search users and send to them
                let document = await Document.findById(config.document)
                console.log("1")

                if (document && document.root_box) {
                    let receivers = []
                    let logins = []
                    let access = await Access.find({ box: document.root_box }).populate('user')
                    let id = getUserId()
                    for (let i = 0; access && i < access.length; i++) {
                        if (access[i].user.id != id) {
                            receivers.push(access[i].user.id)
                            logins.push(access[i].user.login)
                        }
                    }
                    receivers = [...new Set(receivers)]
                    logins = [...new Set(logins)]

                    console.log("2")

                    let sender = getUserLogin()

                    for (let i = 0; logins && i < logins.length; i++) {
                        if (logins[i] == sender || !mailPattern.test(logins[i])) {
                            logins.splice(i, 1)
                        }
                    }
                    console.log("3")
                    if (receivers) {
                        // sans await
                        await this.sendNotificationToDevice(receivers, "New Content", "Someone Uploaded a new Document", globals.NOTIFICATION_NEW_CONTENT)
                    }


                    let opt = {
                        receivers: logins,
                        user: sender
                    }
                    await mailer.createUploadNotification(opt)
                }
            }
        }


        if (config.action == "share") {
            if (config.box && config.items && config.items.length > 0) {
                // send to new items
                let receivers = []
                let logins = []
                console.log("1")
                for (var i = 0; i < config.items.length; i++) {
                    receivers.push(config.items[i].id)
                    logins.push(config.items[i].login)
                }
                receivers = [...new Set(receivers)]
                logins = [...new Set(logins)]
                console.log("2")

                for (let i = 0; logins && i < logins.length; i++) {
                    if (!mailPattern.test(logins[i])) {
                        logins.splice(i, 1)
                    }
                }
                console.log("3")
                if (receivers) {
                    await this.sendNotificationToDevice(receivers, "New Share", "Someone Shared a new box with you", globals.NOTIFICATION_SHARE)
                }
                let sender = getUserLogin()


                let opt = {
                    receivers: logins,
                    sender: sender,
                    box_name: config.box_name
                }
                await mailer.createShareNotification(opt)

                // search owners and send to owners except config.except
                if (config.except) {
                    let access = await Access.find({ box: config.box }).populate('owner')
                    let owners = []
                    let logins = []
                    console.log("1")
                    for (let i = 0; i < access.length; i++) {

                        if (access[i].owner.id != config.except && !receivers.includes(access[i].owner.id.toString())) {
                            owners.push(access[i].owner.id)
                            logins.push(access[i].owner.login)

                        }
                    }
                    owners = [...new Set(owners)]
                    logins = [...new Set(logins)]
                    console.log("2")


                    for (let i = 0; logins && i < logins.length; i++) {
                        if (!mailPattern.test(logins[i])) {
                            logins.splice(i, 1)
                        }
                    }

                    let sender = getUserLogin()

                    for (let i = 0; logins && i < logins.length; i++) {
                        if (logins[i] == sender) {
                            logins.splice(i, 1)
                        }
                    }
                    console.log("3")
                    if (owners) {
                        await this.sendNotificationToDevice(owners, "Box Shared", "Someone Shared Your box", globals.NOTIFICATION_SHARED)
                    }


                    let opt = {
                        receivers: logins,
                        sender: sender,
                        box_name: config.box_name
                    }
                    await mailer.createSharedNotification(opt)

                }

            }
        }
    } catch (err) {
        throw err
    }
}

exports.sendNotificationToDevice = async (users, title, message, action) => {
    try {
        let tokens = []
        console.log("4")
        for (let i = 0; users && i < users.length; i++) {
            let configuration = await Configuration.findOne({ user: users[i] })
            if (configuration)
                for (let i = 0; configuration.notif_preferences && i < configuration.notif_preferences.length; i++) {
                    if (configuration.notif_preferences[i].event == action)
                        tokens = tokens.concat(configuration.tokens)
                }
        }
        console.log("5")
        tokens.join('').split('');
        tokens = [...new Set(tokens)]
        if (tokens.length > 0) {
            try {
                console.log("6")
                let payload = {
                    notification: {
                        title: title,
                        body: message,
                    }
                }
                console.log("7" , tokens , payload)
                admin.messaging().sendToDevice(tokens, payload) // sans await
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(console.log("8"))

            } catch (error) {
                console.log(error)
            }
            console.log("9")
        }
    }
    catch (e) {
        console.log(e);
    }


}

exports.sendNotificationToGroup = async (group, title, message) => {
    try {
        var payload = {
            notification: {
                title: title,
                body: message,
            }
        }
        await admin.messaging().sendToTopic(group, payload).then(
            console.log("notification sent")
        )
    } catch (error) {
        console.log(error)
    }
}


module.exports.editNotification = async (user_id, update) => {
    if (user_id && update) {
        let currentNotification = await Configuration.findOneAndUpdate({ user: user_id }, update, { new: true });
        if (currentNotification) {
            Logger.info('edit notification', currentNotification)
            return currentNotification
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

module.exports.preferencesNotification = async () => {
    let preferences = await Configuration.schema.path('notif_preferences').options.type[0].enum;
    if (preferences) {
        return preferences;
    } else {
        throw new Errors.NotFoundError('Preferences not found')
    }
}

/// TODO integration notifcation calls

//var admin = require("../services/firebaseNotification");

//admin.sendNotificationToDevice("token/tokens","notification title","notification message")
