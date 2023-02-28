const Logger = require("winston");
const createAndSendEmail = require("./nodemailer");
const { mailtemplates } = require('../config/constants');
const { getLanguage } = require('./context')

exports.createPasswordMail = async (opt) => {
    try {
        if (opt && opt.login && opt.password) {
            let subject = mailtemplates[getLanguage()].PASSWORD_CREATE_SUBJECT
            let content = mailtemplates[getLanguage()].PASSWORD_CREATE

            content = content.replace("%LOGIN%", opt.login)
            content = content.replace("%PASSWORD%", opt.password)

            const mailOpts = {
                from: '',
                to: opt.login,
                subject: subject,
                html: content,
                attachments: opt.attachments
            };
            createAndSendEmail(mailOpts);
        } else {
            Logger.error("Missing arguments", opt??undefined);
        }
    } catch (err) {
        Logger.error("Error " + err);
    }

}

exports.createConfirmationMail = async (opt) => {
    try {
        if (opt && opt.login && opt.link) {
            let subject = mailtemplates[getLanguage()].MAIL_CONFIRMATION_SUBJECT
            let content = mailtemplates[getLanguage()].MAIL_CONFIRMATION_CREATE

            content = content.replace("%LOGIN%", opt.login)
            content = content.replace("%LINK%", opt.link)

            const mailOpts = {
                from: '',
                to: opt.login,
                subject: subject,
                html: content
            };
            createAndSendEmail(mailOpts);
            return true
        } else {
            Logger.error("Missing arguments");
        }
    } catch (err) {
        Logger.error("Error " + err);
        return false
    }
}

exports.createShareNotification = async (opt) => {
    try {
        if (opt && opt.receivers && opt.sender && opt.box_name) {
            let subject = mailtemplates[getLanguage()].SHARE_NOTIFICATION_SUBJECT
            let content = mailtemplates[getLanguage()].SHARE_NOTIFICATION_CREATE

            content = content.replace("%SENDER%", opt.sender)
            content = content.replace("%BOX_NAME%", opt.box_name)
            
            for (let i = 0; opt.receivers && i < opt.receivers.length; i++) {
                const mailOpts = {
                    from: '',
                    to: opt.receivers[i],
                    subject: subject,
                    html: content
                };
            createAndSendEmail(mailOpts);
            }
        } else {
            Logger.error("Missing arguments", opt ?? undefined)
        }
    } catch (err) {
        Logger.error("Error " + err)
    }
}

exports.createSharedNotification = async (opt) => {
    try {
        if (opt && opt.sender && opt.receivers && opt.box_name) {
            let subject = mailtemplates[getLanguage()].SHARED_NOTIFICATION_SUBJECT
            let content = mailtemplates[getLanguage()].SHARED_NOTIFICATION_CREATE

            content = content.replace("%SENDER%", opt.sender)
            content = content.replace("%RECEIVERS%", opt.receivers)
            content = content.replace("%BOX_NAME%", opt.box_name)
            for (let i = 0; opt.receivers && i < opt.receivers.length; i++) {
                const mailOpts = {
                    from: '',
                    to: opt.receivers[i],
                    subject: subject,
                    html: content
                };
                createAndSendEmail(mailOpts);
            }
        } else {
            Logger.error("Missing arguments")
        }
    } catch (err) {
        Logger.error("Error " + err)
    }
}

exports.createCommentDocumentNotification = async (opt) => {
    try {
        if (opt && opt.receivers && opt.user && opt.document_name) {
            let subject = mailtemplates[getLanguage()].COMMENT_DOCUMENT_NOTIFICATION_SUBJECT
            let content = mailtemplates[getLanguage()].COMMENT_DOCUMENT_NOTIFICATION_CREATE

            content = content.replace("%USER%", opt.user)
            content = content.replace("%DOCUMENT_NAME%", opt.document_name)

            for (let i = 0; opt.receivers && i < opt.receivers.length; i++) {
                const mailOpts = {
                    from: '',
                    to: opt.receivers[i],
                    subject: subject,
                    html: content
                };
                createAndSendEmail(mailOpts);
            }
        } else {
            Logger.error("Missing arguments")
        }
    } catch (err) {
        Logger.error("Error " + err)
    }
}

exports.createCommentBoxNotification = async (opt) => {
    try {
        if (opt && opt.receivers && opt.user && opt.box_name) {
            let subject = mailtemplates[getLanguage()].COMMENT_BOX_NOTIFICATION_SUBJECT
            let content = mailtemplates[getLanguage()].COMMENT_BOX_NOTIFICATION_CREATE

            content = content.replace("%USER%", opt.user)
            content = content.replace("%BOX_NAME%", opt.box_name)

            for (let i = 0; opt.receivers && i < opt.receivers.length; i++) {
                const mailOpts = {
                    from: '',
                    to: opt.receivers[i],
                    subject: subject,
                    html: content
                };
                createAndSendEmail(mailOpts);
            }
        } else {
            Logger.error("Missing arguments")
        }
    } catch (err) {
        Logger.error("Error " + err)
    }
}

exports.createUploadNotification = async (opt) => {
    try {
        if (opt && opt.receivers && opt.user) {
            let subject = mailtemplates[getLanguage()].UPLOAD_NOTIFICATION_SUBJECT
            let content = mailtemplates[getLanguage()].UPLOAD_NOTIFICATION_CREATE

            content = content.replace("%USER%", opt.user)
             for (let i = 0; opt.receivers && i < opt.receivers.length; i++) {
                const mailOpts = {
                    from: '',
                    to: opt.receivers[i],
                    subject: subject,
                    html: content
                };
                createAndSendEmail(mailOpts);
            }
        } else {
            Logger.error("Missing arguments")
        }
    } catch (err) {
        Logger.error("Error " + err)
    }
}

exports.createDownloadNotification = async (opt) => {
    try {
        if (opt && opt.receiver && opt.user && opt.document_name) {
            let subject = mailtemplates[getLanguage()].DOWNLOAD_NOTIFICATION_SUBJECT
            let content = mailtemplates[getLanguage()].DOWNLOAD_NOTIFICATION_CREATE

            content = content.replace("%USER%", opt.user)
            content = content.replace("%DOCUMENT_NAME%", opt.document_name)
            for (let i = 0; opt.receivers && i < opt.receivers.length; i++) {
                const mailOpts = {
                    from: '',
                    to: opt.receivers[i],
                    subject: subject,
                    html: content
                };
                createAndSendEmail(mailOpts);
            }
        } else {
            Logger.error("Missing arguments")
        }
    } catch (err) {
        Logger.error("Error " + err)
    }
}