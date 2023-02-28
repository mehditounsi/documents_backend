const Activity = require('../model/activity');
const globals = require('../helpers/globals');
const {getUserId , getUserIpAddress} = require('../helpers/context')


exports.trackActivity = async (action, object)=>{
    let id = getUserId()
    let ip = getUserIpAddress()
    let activity = new Activity({
        action: action,
        ip: ip,
        folder: 'folder' in object ? object.folder : null,
        box: 'box' in object ? object.box : null,
        document: 'document' in object ? object.document : null,
        docrequest: 'docrequest' in object ? object.docrequest : null,
        user: (action == globals.ACTION_ANONYMOUS_SHARE || action == globals.ACTION_ANONYMOUS_CREATE || action == globals.ACTION_ANONYMOUS_UPLOAD)
            ? null
            : 'user' in object ? object.user : id !== "" ? id : null,
        comment: 'comment' in object ? object.comment : null,
        externalUser: 'externalUser' in object ? object.externalUser : null,
        attachment: 'attachment' in object ? object.attachment : null
    })
    activity.save()  // without wait
}