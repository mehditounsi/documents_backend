
exports.ACTION_CREATE = "create"
exports.ACTION_RENAME = "rename"
exports.ACTION_MOVE = "move"
exports.ACTION_ACCESS = "access"
exports.ACTION_SHARE = "share"
exports.ACTION_DELETE = "delete"
exports.ACTION_REGISTER = "register"
exports.ACTION_EDIT = "edit"
exports.ACTION_LOGIN = "login"
exports.ACTION_LOGOUT = "logout"
exports.ACTION_UPLOAD = "upload"
exports.ACTION_DOWNLOAD = "download"
exports.ACTION_CHANGE_PASSWORD = "change-pwd"
exports.ACTION_USER_UPDATE = "update-user"
exports.ACTION_DISPLAY_ACCESS = "display-access"
exports.ACTION_DELETE_ACCESS = "delete-access"
exports.ACTION_EDIT_ACCESS = "edit-access"
exports.ACTION_CREATE_COMMENT = "create-comment"
exports.ACTION_EDIT_COMMENT = "edit-comment"
exports.ACTION_DELETE_COMMENT = "delete-comment"

exports.ACTION_ANONYMOUS_SHARE = "external-user-share"
exports.ACTION_ANONYMOUS_CREATE = "external-user-create"
exports.ACTION_ANONYMOUS_UPLOAD = "external-user-upload"


exports.NOTIFICATION_COMMENT_DOCUMENT = "comment-document";
exports.NOTIFICATION_COMMENT_BOX = "comment-box";
exports.NOTIFICATION_SHARE = "share";
exports.NOTIFICATION_SHARED = "shared";
exports.NOTIFICATION_NEW_CONTENT = "new_content";
exports.NOTIFICATION_DOWNLOAD = "download";


exports.MIO = "MIO"
exports.F3S = "F3S"
exports.AWS = "AWS"
exports.GCP = "GCP"

exports.Resources = createEnum(['Folder', 'Box', 'Access' ,'Document', 'Docrequest', 'Storage', 'Group','Comment']);




//------ create enumeration object from values ------------
function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
        enumObject[val] = val;
    }
    return Object.freeze(enumObject);
}