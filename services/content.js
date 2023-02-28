require('dotenv').config();
var fs = require('fs');
const Logger = require('winston');
const Folder = require('../model/folder');
const Document = require('../model/document');
const Configuration = require('../model/configuration');

const User = require('../model/user');
const Box = require('../model/box');
const DocRequest = require('../model/docrequest');
const Access = require('../model/access');
const Attachment = require('../model/attachment');
const Storage = require('../model/storage');
const Keystore = require('../model/keystore');
const Errors = require('../helpers/errors');
const utils = require('../helpers/misc');
const globals = require('../helpers/globals');
const Activity = require('../model/activity');
const storage_service = require('../services/storage');
var httpContext = require('express-http-context');
const configuration = require('../config/config')
const { getUserId, getUserTrashFolder, getUserRootFolder, getUserInboxFolder, getUser, getUserStarredFolder } = require('../helpers/context')


const notificationService = require("../helpers/notification");
const { captureRejections } = require('stream');

const storage_path = configuration.storage.path || '/storage/';
const tmp_dir = configuration.storage.tmp || '/storage/tmp/'

//--------------------- Création de répertoire
exports.createFolder = async (_folder) => {
    let found = false
    if (_folder.parent_box) {
        let parent_box = await Box.findById(_folder.parent_box)
        if (parent_box) {
            found = true
            let currentFolder = new Folder({
                name: _folder.name,
                parent_box: _folder.parent_box,
                inbox: _folder.inbox,
                owner: parent_box.owner
            });
            currentFolder = await currentFolder.save();
            parent_box.folders.push(currentFolder.id);
            await parent_box.save();
            utils.trackActivity(globals.ACTION_CREATE, { folder: currentFolder.id })
            return currentFolder;
        }
    }
    if (!found) {
        if (_folder.parent_folder) {
            const parent_folder = await Folder.findById(_folder.parent_folder)
            if (parent_folder) {
                let id = getUserId()
                let currentFolder = new Folder({
                    name: _folder.name,
                    parent_folder: _folder.parent_folder,
                    path: parent_folder.path + '|' + _folder.name,
                    inbox: _folder.inbox,
                    owner: id,
                    last_modified: { modifier: getUserId(), modified_at: Date.now() }
                });
                currentFolder = await currentFolder.save();
                Logger.info('create Folder', currentFolder)

                parent_folder.folders.push(currentFolder.id);
                await parent_folder.save();

                utils.trackActivity(globals.ACTION_CREATE, { folder: currentFolder.id })
                return currentFolder;
            } else {
                throw new Errors.InvalidDataError('parent container not found ' + _folder.parent_folder)
            }
        } else {
            throw new Errors.InvalidDataError('parent container undefined')
        }
    }
}
//---------------------- Initialisation de Root    
exports.createRootFolder = async (name = "root") => {
    Logger.info("initRoot : ");
    let currentFolder = new Folder({ name: name, path: name });
    Logger.info(`createFolder : Insertion ${name} ` + currentFolder);
    currentFolder = await currentFolder.save();

    utils.trackActivity(globals.ACTION_CREATE, { folder: currentFolder.id })
    return currentFolder
}


//------------------------ is Empty -------------------
exports.isEmptyFolder = async (_folder) => {
    if (_folder) {
        let folder = await Folder.findById(_folder.id)  // .populate("files");
        Logger.info('Empty Folder', folder)
        return folder.folders.length <= 0 && folder.boxes.length;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//------------------------ Liste des activities -------------------
exports.getFolderActivity = async (folder_id) => {
    if (folder_id) {
        let activities = await Activity.find({ folder: folder_id }).populate({ path: 'user', select: ['login', 'name'] })
        Logger.info('get Folder Activities', activities)
        return activities;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//------------------------ Sous repertoires -------------------
exports.getFolderContent = async (_folder) => {
    if (_folder && _folder.id) {
        let folder = await Folder.findById(_folder.id)
            .populate({
                path: 'folders', populate: {
                    path: 'owner', select: ['login', 'name']
                }
            })
            .populate({
                path: 'folders', populate: {
                    path: 'last_modified', populate: { path: 'modifier', select: ['login', 'name'] }
                }
            })
            .populate({
                path: 'documents', populate: {
                    path: 'last_modified', populate: { path: 'modifier', select: ['login', 'name'] }
                }
            })
            .populate({
                path: 'documents', populate: {
                    path: 'comments', populate: { path: 'owner', select: ['login', 'name'] }
                }
            })
            .populate({
                path: 'boxes', populate: {
                    path: 'box',
                    populate: {
                        path: 'comments', populate: { path: 'owner', select: ['login', 'name'] },

                    }
                }
            })
            .populate({
                path: 'boxes', populate: {
                    path: 'owner', select: ['login', 'name']
                }
            })
            .populate({
                path: 'boxes', populate: {
                    path: 'key'
                }
            })
            .populate({
                path: 'boxes', populate: {
                    path: 'box', populate: {
                        path: 'last_modified',
                        populate: {
                            path: 'modifier',
                            select: ['login', 'name']
                        }
                    }
                }
            })
            .populate({
                path: 'docrequests', populate: {
                    path: 'owner', select: ['login', 'name']
                }
            })
            .populate({
                path: 'docrequests', populate: {
                    path: 'last_modified', populate: { path: 'modifier' , select: ['login', 'name'] }
                }
            })
            .populate('parent_folder');

        Logger.info('get Folder Content')

        if (folder && folder.id) {
            for (let i = folder.boxes.length - 1; i >= 0; i--) {
                if (folder.boxes[i].status == 'DEACTIVATED') {
                    folder.boxes.splice(i, 1)
                }
            }
            utils.trackActivity(globals.ACTION_ACCESS, { folder: folder.id })
        }
        return folder;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//--------------------- Rename Folder --------------    
exports.editFolder = async (_folder) => {
    if (!_folder || !_folder.id) {
        throw new Errors.InvalidDataError('Undefined argument')
    } else {
        let old_name = ""
        let id = getUserId()
        _folder.last_modified = { modifier: id, modified_at: Date.now() }
        let currentFolder = await Folder.findById(_folder.id)
        if (currentFolder) {
            old_name = currentFolder.name
            if (_folder.name && currentFolder.name != _folder.name) {
                currentFolder.name = _folder.name
                currentFolder.last_modified = {
                    modifier: id,
                    modified_at: Date.now()
                }
            }
            await currentFolder.save()
            Logger.info('edit Folder', currentFolder)
            utils.trackActivity(globals.ACTION_RENAME, {
                folder: currentFolder.id,
                comment: `from ${old_name} to ${currentFolder.name}`
            })

            return currentFolder

        } else {
            throw new Errors.UnAuthorizedError('Unauthorized user')
        }
    }
}
// --------------------- Delete Folder ---------------
exports.deleteFolder = async (_folder) => {
    if (!_folder || !_folder.id) {
        throw new Errors.InvalidDataError('Undefined argument')
    } else {
        let currentFolder = await Folder.findById(_folder.id)
        if (!currentFolder) {
            throw new Errors.NotFoundError('Folder not found')
        }
        if (!currentFolder.parent_folder) {
            throw new Errors.UnAuthorizedError('root Folder can\'t be deleted')
        }
        const parent_folder = await Folder.findById(currentFolder.parent_folder.toString())
        if (parent_folder) {
            parent_folder.folders = parent_folder.folders.filter((el) => {
                return el.toString() != _folder.id.toString();
            })
            await parent_folder.save();

            Logger.info('delete Folder', parent_folder)
        }

        // remove from starred
        let starred_folder = await Folder.findById(getUserStarredFolder())
        if (starred_folder) {
            starred_folder.deleteFolder(_folder.id)
        }

        utils.trackActivity(globals.ACTION_DELETE, { folder: _folder.id })
        return await Folder.findByIdAndRemove(_folder.id)

    }
}

//----------------------Search inside Folder



exports.getChildren = async (data) => {
    let childrenArray = []
    if (data.type === "folder") {
        let folder = await Folder.findById(data.id)
        if (folder) {
            let children = folder.folders
            let boxchildren = folder.boxes
            let docreqchildren = folder.docrequests
            let documentchildren = folder.documents
            for (let i = 0; children && i < children.length; i++) {
                let child = {
                    id: children[i].toString(),
                    type: "folder",
                }
                childrenArray.push(child)
                ch = await this.getChildren(child)
                if (ch) {
                    childrenArray = [...childrenArray, ...ch]
                }
            }
            for (let i = 0; docreqchildren && i < docreqchildren.length; i++) {
                let child = {
                    id: docreqchildren[i].toString(),
                    type: "docrequest"
                }
                childrenArray.push(child)
                ch = await this.getChildren(child)
                if (ch) {
                    childrenArray = [...childrenArray, ...ch]
                }
            }
            if (folder.inbox) {
                for (let i = 0; documentchildren && i < documentchildren.length; i++) {
                    let child = {
                        id: documentchildren[i].toString(),
                        type: "document"
                    }
                    childrenArray.push(child)
                    ch = await this.getChildren(child)
                    if (ch) {
                        childrenArray = [...childrenArray, ...ch]
                    }
                }
            }
            for (let i = 0; boxchildren && i < boxchildren.length; i++) {
                let accessbox = await Access.findById({ _id: boxchildren[i].toString() })
                let child = {
                    id: accessbox.box.toString(),
                    type: "box"
                }

                childrenArray.push(child)
                ch = await this.getChildren(child)
                if (ch) {
                    childrenArray = [...childrenArray, ...ch]
                }
            }
        }
        return childrenArray
    }
    if (data.type === "box") {
        let access = await Access.findById(data.id).populate('box')
        if (access) {
            let children = access.box.folders
            let documents = access.box.documents
            for (let i = 0; children && i < children.length; i++) {
                let child = {
                    id: children[i].toString(),
                    type: "folder"

                }
                childrenArray.push(child)
                ch = await this.getChildren(child)
                if (ch) {
                    childrenArray = [...childrenArray, ...ch]
                }
            }
            for (let i = 0; documents && i < documents.length; i++) {
                let child = {
                    id: documents[i].toString(),
                    type: "document"
                }
                childrenArray.push(child)
                ch = await this.getChildren(child)
                if (ch) {
                    childrenArray = [...childrenArray, ...ch]
                }
            }
        }
        return childrenArray
    }
}

exports.searchInsideFolder = async (folder_id, search, type) => {
    try {
        if (folder_id) {
            let data = { id: folder_id, type: type }
            let folder = await this.getChildren(data)
            let folderArray = []
            let boxArray = []
            let documentArray = []
            let docrequestArray = []

            folder.forEach((element) => {
                if (element.id && element.type === "folder") folderArray.push(element.id.toString())
                if (element.id && element.type === "box") boxArray.push(element.id.toString())
                if (element.id && element.type === "document") documentArray.push(element.id.toString())
                if (element.id && element.type === "docrequest") docrequestArray.push(element.id.toString())
            })

            let folder_children = await Folder.find({
                $and: [
                    { _id: { $in: folderArray } },
                    { name: { $regex: new RegExp(search, "i") } }

                ]
            }).populate({
                path: 'folders', populate: {
                    path: 'owner', select: ['login', 'name']
                }
            })
                .populate({
                    path: 'folders', populate: {
                        path: 'last_modified', populate: { path: 'modifier' , select: ['login', 'name'] }
                    }
                })
                .populate({
                    path: 'documents', populate: {
                        path: 'last_modified', populate: { path: 'modifier' , select: ['login', 'name']}
                    }
                })
                .populate({
                    path: 'boxes', populate: {
                        path: 'box'
                    }
                })
                .populate({
                    path: 'boxes', populate: {
                        path: 'owner', select: ['login', 'name']
                    }
                })
                .populate({
                    path: 'boxes', populate: {
                        path: 'key'
                    }
                })
                .populate({
                    path: 'boxes', populate: {
                        path: 'box', populate: {
                            path: 'last_modified',
                            populate: {
                                path: 'modifier',
                                select: ['login', 'name']
                            }
                        }
                    }
                })
                .populate({
                    path: 'docrequests', populate: {
                        path: 'owner', select: ['login', 'name']
                    }
                })
                .populate({
                    path: 'docrequests', populate: {
                        path: 'last_modified', populate: { path: 'modifier' , select: ['login', 'name']}
                    }
                })
                .populate('parent_folder');
            for (let j = 0; j < folder_children.length; j++) {
                for (let i = folder_children[j].boxes.length - 1; i >= 0; i--) {
                    if (folder_children[j].boxes[i].status == 'DEACTIVATED' || folder_children[j].boxes[i].status == 'DELETED')
                        folder_children[j].boxes.splice(i, 1)
                }
            }

            let box_children = await Box.find({
                $and: [
                    { _id: { $in: boxArray } },
                    { name: { $regex: new RegExp(search, "i") } }
                ]
            })
                .populate({
                    path: 'folders', populate: {
                        path: 'owner', select: ['login', 'name']
                    }
                })
                .populate({
                    path: 'folders', populate: {
                        path: 'last_modified', populate: { path: 'modifier', select: ['login', 'name']}
                    }
                })
                .populate({
                    path: 'documents', populate: {
                        path: 'owner', select: ['login', 'name']
                    }
                })
                .populate({
                    path: 'documents', populate: {
                        path: 'last_modified', populate: { path: 'modifier', select: ['login', 'name'] }
                    }
                })
                .populate({
                    path: 'documents', populate: {
                        path: 'last_modified', populate: { path: 'modifier', select: ['login', 'name'] }
                    }
                })
            let access_children = []
            let id = getUserId()
            if (box_children) {
                for (let i = 0; i < box_children.length; i++) {
                    access_children.push(await Access.findOne({
                        $and: [
                            { box: box_children[i]._id.toString() },
                            { status: 'ACTIVE' },
                            {
                                $or: [{ user: id }, { owner: id }]
                            }
                        ]
                    })
                        .populate('key')
                        .populate('box')
                        .populate({ path: 'owner', select: ['login', 'name'] })

                        .populate({
                            path: 'box', populate: {
                                path: 'last_modified',
                                populate: {
                                    path: 'modifier',
                                    select: ['login', 'name']
                                }
                            }
                        })
                    )
                }
            }




            let document_children = await Document.find({
                $and: [
                    { _id: { $in: documentArray } },
                    { name: { $regex: new RegExp(search, "i") } }
                ]
            })

            let docrequest_children = await DocRequest.find({
                $and: [
                    { _id: { $in: docrequestArray } },
                    { title: { $regex: new RegExp(search, "i") } }
                ]
            })

            Logger.info('search inside Folder and Box')

            return {
                folders: folder_children,
                boxes: access_children,
                documents: document_children,
                docrequests: docrequest_children
            }
        }
        throw new Errors.InvalidDataError('Undefined argument')
    } catch (err) {
        Logger.error(err.message)
    }
}

//----------------------Move Folder

exports.moveFolder = async (id, destination, type) => {
    try {
        if (id && destination) {
            let old_parent_name
            let new_parent_name
            let folder = await Folder.findById(id)
            let box_dest
            let folder_dest
            if (type === 'box') {
                box_dest = await Box.findById(destination)
            } else if (type === 'folder') {
                folder_dest = await Folder.findById(destination)
            }
            let parent
            if (folder.parent_folder && !folder.parent_box) {
                let parent_id = folder.parent_folder.toString()
                parent = await Folder.findById(parent_id)
                old_parent_name = parent.name
                if (parent) {
                    await parent.deleteFolder(folder._id.toString())
                }
            }
            if (!folder.parent_folder && folder.parent_box) {
                let parent_id = folder.parent_box.toString()
                parent = await Box.findById(parent_id)
                old_parent_name = parent.name
                if (parent) {
                    await parent.deleteFolder(folder._id.toString())
                }
            }
            await parent.save()
            if (type === 'folder') {
                new_parent_name = folder_dest.name
                await folder_dest.addFolder(folder._id)
                folder.old_parent_folder = folder.parent_folder
                folder.old_parent_box = folder.parent_box
                folder.parent_folder = folder_dest._id
                folder.parent_box = null
                await folder.save()
                await folder_dest.save()
            }
            if (type === 'box') {
                new_parent_name = box_dest.name
                await box_dest.addFolder(folder._id)
                folder.old_parent_box = folder.parent_box
                folder.old_parent_folder = folder.parent_folder
                folder.parent_box = box_dest._id
                folder.parent_folder = null
                await folder.save()
                await box_dest.save()
            }

            // Delete from Starred
            if (type === 'folder' && destination.toString() === getUserTrashFolder().toString()) {
                let starred_folder = await Folder.findById(getUserStarredFolder())
                if (starred_folder) {
                    starred_folder.deleteFolder(id.toString())
                }
            }

            utils.trackActivity(globals.ACTION_MOVE,
                {
                    folder: folder.id,
                    comment: `from ${old_parent_name} to ${new_parent_name}`
                })
            Logger.info("Move folder", folder)
            return folder
        }
        throw new Errors.InvalidDataError('Undefined argument')
    } catch (err) {
        Logger.error(err.message)
    }

}


//--------------------- Création de Box
exports.createBox = async (_Box) => {
    if (_Box.parent_folder && _Box.name) {
        const parent_folder = await Folder.findById(_Box.parent_folder)
        let id = getUserId()
        if (parent_folder) {
            // Ajout du nouvau Folder
            let currentBox = new Box({
                name: _Box.name,
                owner: id,
                sender: _Box.sender,
                last_modified: { modifier: id, modified_at: Date.now() }
            });
            if (_Box.comment != null) {
                await currentBox.addComment(_Box.comment)
            }
            currentBox = await currentBox.save();
            Logger.info('create Box', currentBox)
            if (currentBox) {
                // On crée le cac dans le keystore
                let csd = new Keystore({
                    type: _Box.key.type,
                    csd: {
                        key: _Box.key.csd.key,
                    }
                })
                csd = await csd.save()
                if (csd) {
                    // Add Owner Access
                    let id = getUserId()
                    let currentAccess = new Access({
                        box: currentBox._id,
                        user: id,
                        owner: id,
                        parent_folder: _Box.parent_folder,
                        key: csd._id

                    })
                    currentAccess = await currentAccess.save()
                    Logger.info('Access', currentAccess)

                    if (currentAccess) {
                        //Add to Parent Folder    
                        parent_folder.boxes.push(currentAccess.id);
                        await parent_folder.save();

                        utils.trackActivity(_Box.sender ? globals.ACTION_ANONYMOUS_CREATE : globals.ACTION_CREATE, { box: currentBox.id, externalUser: _Box.sender })
                        return await Access.findById(currentAccess.id).populate('key').populate('box')
                        //return currentAccess.
                    }

                } else {
                    throw new Errors.InvalidDataError('Error when creating the csd')
                }
            }
            throw new Errors.InvalidDataError('Error during creation')

        } else {
            throw new Errors.InvalidDataError('parent_folder not found ' + _Box.parent_folder)
        }
    }
    else {
        throw new Errors.InvalidDataError('missing argument: parent_folder||name ')
    }
}
//------------------------ Sous repertoires -------------------
exports.getBoxContent = async (_box) => {
    if (_box) {
        let currentbox = await Box.findById(_box.id)
            .populate({
                path: 'folders', populate: {
                    path: 'owner', select: ['login', 'name']
                }
            })
            .populate({
                path: 'folders', populate: {
                    path: 'last_modified', populate: { path: 'modifier' , select: ['login', 'name'] }
                }
            })
            .populate({
                path: 'documents', populate: {
                    path: 'owner', select: ['login', 'name']
                }
            })
            .populate({
                path: 'documents', populate: {
                    path: 'last_modified', populate: { path: 'modifier' , select: ['login', 'name']}
                }
            })
            .populate({
                path: 'documents', populate: {
                    path: 'comments', populate: { path: 'owner', select: ['login', 'name'] }
                }
            })
            .populate({
                path: 'documents', populate: {
                    path: 'last_modified', populate: { path: 'modifier' , select: ['login', 'name'] }
                }
            })
            .populate({
                path: 'comments', populate: { path: 'owner', select: ['login', 'name'] }
            })
        //.populate('parent_folder');


        Logger.info('get Box Content')

        utils.trackActivity(globals.ACTION_ACCESS, { box: currentbox.id })
        return currentbox;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//------------------------ Liste des activities -------------------
exports.getBoxActivity = async (box_id) => {
    if (box_id) {
        let activities = await Activity.find({ box: box_id }).populate({ path: 'user', select: ['login', 'name'] })
        Logger.info('get Box Activity', activities)
        return activities;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//------------------------ Liste des access -------------------
exports.getBoxAccesses = async (box_id) => {
    if (box_id) {
        let accesses = await Access.find({ $and: [{ box: box_id }, { status: "ACTIVE" }] })
            .populate({ path: 'user', select: ['login', 'name'] })
            .populate({ path: 'giver', select: ['login', 'name'] })
            .populate({ path: 'owner', select: ['login', 'name'] })
            .select(['login', 'name'])

        Logger.info('get Box Accesses', accesses)

        // utils.trackActivity(globals.ACTION_DISPLAY_ACCESS, { box: box_id })
        return accesses;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ get box access -------------------
exports.getBoxAccess = async (box_id) => {
    if (box_id) {
        let access = await Access.findOne({ box: box_id, user: getUserId() })
            .populate('key')
            .populate({ path: 'user', select: ['login', 'name'] })
            .populate({ path: 'giver', select: ['login', 'name'] })
            .populate({ path: 'owner', select: ['login', 'name'] })

        Logger.info('get Box Access', access)

        // utils.trackActivity(globals.ACTION_DISPLAY_ACCESS, { box: box_id })
        return access;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//---------------get access------------------------

exports.getAccess = async (access_id) => {
    if (access_id) {
        let access = await Access.findById(access_id).populate('key')
        Logger.info('get Access', access)

        return access

    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//--------------------- Rename Folder --------------    
exports.editBox = async (_box) => {
    if (!_box || !_box.id) {
        throw new Errors.InvalidDataError('Undefined argument')
    } else {
        _box.last_modified = { modifier: getUserId(), modified_at: Date.now() }
        let currentBox = await Box.findByIdAndUpdate(_box.id, {
            "$set": {
                "name": _box.name
            }
        }, { new: true })
        Logger.info('edit Box', currentBox)

        utils.trackActivity(globals.ACTION_RENAME, { box: currentBox.id })
        return currentBox
    }
}
// --------------------- Delete Box ---------------
exports.deleteBox = async (_box) => {
    if (!_box || !_box.id) {
        throw new Errors.InvalidDataError('Undefined argument')
    } else {
        const access = await Access.find({ box: _box.id })
            .populate({ path: 'user', select: ['login', 'name'] })
        let k = 0
        let id = getUserId()
        let user = getUser()
        let deleted_items = []
        for (let i = 0; access && i < access.length; i++) {
            if (access[i].owner.toString() == id || access[i].user.toString() == id || access[i].owner.toString() != access[i].user.toString()) {
                const parent_folder = await Folder.findById(access[i].parent_folder)
                if (parent_folder) {
                    parent_folder.boxes = parent_folder.boxes.filter((el) => {
                        return el.toString() != access[i].id.toString();
                    })

                    await parent_folder.save();
                    // Logger.info('delete access', parent_folder)
                }
                // utils.trackActivity(globals.ACTION_DELETE, { access: access[i]._id })
                await Access.findByIdAndRemove(access[i]._id)
                deleted_items.push(access[i]._id)
                utils.trackActivity(globals.ACTION_DELETE_ACCESS, {
                    box: access.box,
                    comment: `access of ${access.user.name} revoked by ${user.name}`
                })
                k++
            }
        }
        // remove from starred
        let starred_folder = await Folder.findById(getUserStarredFolder())
        if (starred_folder) {
            for (let i = 0; i < deleted_items.length; i++) {
                starred_folder.deleteBox(deleted_items[i])
            }
        }

        if (access.length == k) {
            let box = await Box.findById(_box.id)
            box = await box.deleteDocs()
            box = await box.deleteFolderChildren()

            await Box.findByIdAndRemove(_box.id)
        }
    }
}

//----------------------Move Box

exports.moveBox = async (id, destination) => {
    try {
        if (id && destination) {
            let old_parent_name
            let new_parent_name
            let access = await Access.findById(id)
            let dest_folder = await Folder.findById(destination)
            let parent
            if (access) {
                let parent_id = access.parent_folder.toString()
                parent = await Folder.findById(parent_id)
                old_parent_name = parent.name
                if (parent) {
                    await parent.deleteBox(access._id.toString())
                }
                new_parent_name = dest_folder.name
                await dest_folder.addBox(access._id.toString())
                access.old_parent_folder = access.parent_folder
                access.parent_folder = dest_folder._id
                access.save()
                parent.save()

                // Delete from Starred
                if (destination.toString() === getUserTrashFolder().toString()) {
                    let starred_folder = await Folder.findById(getUserStarredFolder())
                    if (starred_folder) {
                        starred_folder.deleteBox(id.toString())
                    }
                }
            }
            else {
                throw new Errors.NotFoundError('Access not found')
            }
            utils.trackActivity(globals.ACTION_MOVE, {
                box: access.id,
                comment: `from ${old_parent_name} to ${new_parent_name}`
            })
            Logger.info("Move Box", access)
            return access
        }
        throw new Errors.InvalidDataError('Undefined argument')
    }
    catch (err) {
        Logger.error("Error " + err.message)
    }
}
// --------------------- Delete Access ---------------
exports.deleteAccess = async (access_id) => {
    if (!access_id) {
        throw new Errors.InvalidDataError('Undefined argument')
    } else {
        let access = await Access.findById(access_id).populate({ path: 'user', select: ['login', 'name'] })
        Logger.info('delete access')
        if (access) {
            let id = getUserId()
            let user = getUser()
            if ((access.owner && (access.owner).toString() == id) ||
                (access.giver && (access.giver).toString() == id)) {
                utils.trackActivity(globals.ACTION_DELETE_ACCESS, {
                    box: access.box,
                    comment: `access of ${access.user.name} revoked by ${user.name}`
                })
                //update Access Number
                let box = await Box.findById(access.box)
                let delete_access = await Access.findByIdAndRemove(access_id)
                box.updateAccessNumber()
                return delete_access
            } else {
                throw new Errors.UnAuthorizedError('Unauthorized action')
            }
        } else {
            throw new Errors.NotFoundError('Share not found')
        }
    }
}
// --------------------- edit Access ---------------
exports.editAccess = async (access_id, update) => {
    if (!access_id && !update) {
        throw new Errors.InvalidDataError('Undefined argument')
    } else {
        let access = await Access.findByIdAndUpdate(access_id, update, { new: true })
            .populate({ path: 'user', select: ['login', 'name'] })
        if (access) {
            Logger.info('edit access', access)
            utils.trackActivity(globals.ACTION_EDIT_ACCESS, {
                box: access.box,
                comment: `${access.user.name} is now owner`
            })
            return access
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    }
}
// --------------------- upload Document ---------------
exports.uploadAnonymousDocument = async (datafile, link) => {
    if (link) {
        let currentRequest = await DocRequest.findOne({ link: link })
        if (currentRequest) {
            const parent_folder = await Folder.findById(currentRequest.parent_folder)
            if (parent_folder) {
                let box = {
                    name: currentRequest.title,
                    parent_folder: currentRequest.parent_folder,
                    owner: currentRequest.owner
                }
                Logger.info("current request : ", currentRequest.owner);

                let currentBox = new Box(box)
                await currentBox.save()
                if (currentBox) {
                    box_id = currentBox.id
                    if (!box_id) {
                        throw new Errors.InvalidDataError('Undefined argument')
                    } else {
                        const currentbox = await Box.findById(box_id)
                        if (currentbox) {
                            let document = new Document({
                                name: datafile.name,
                                size: datafile.size,
                                contenttype: datafile.type,
                                type: 'file',
                                parent_box: box_id
                            })
                            await document.save()
                            Logger.info('upload anonymous Doc', document)

                            if (!fs.existsSync(storage_path)) {
                                fs.mkdirSync(storage_path)
                            }
                            fs.renameSync(datafile.path, storage_path + document.id)

                            await currentbox.documents.push(document.id)
                        }
                        await currentbox.save();
                        parent_folder.boxes.push(currentBox.id);
                        await parent_folder.save();
                        utils.trackActivity(globals.ACTION_UPLOAD, { box: currentbox.id })
                        return currentbox
                    }
                }
            } else {
                throw new Errors.InvalidDataError('parent_folder not found ' + _Box.parent_folder)
            }
        }
    }
}
// --------------------- Delete Folder ---------------
exports.editDocument = async (document_id, update) => {
    if (document_id && update) {
        let currentDocument = await Document.findByIdAndUpdate(document_id, update, { new: true });
        if (currentDocument) {
            Logger.info('edit document', currentDocument)
            return currentDocument
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }

}
// --------------------- Delete Folder ---------------
exports.deleteDocument = async (_document) => {
    if (_document && _document.id) {
        Logger.info('delete document')
        let document = await Document.findById(_document.id)
        if (document) {
            const parent_folder = await Folder.findById(document.parent_folder)
            if (parent_folder) {
                parent_folder.boxes = parent_folder.documents.filter((el) => {
                    return el.toString() != document.id.toString();
                })
                await parent_folder.save();
            }

            const parent_box = await Box.findById(document.parent_box)
            if (parent_box) {
                parent_box.boxes = parent_box.documents.filter((el) => {
                    return el.toString() != document.id.toString();
                })
                await parent_box.save();
            }
            return await Document.findByIdAndRemove(document.id)
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    }
}
//----------------------------- Share Box -------------------------
exports.shareBox = async (box_id, items) => {
    if (box_id && items) {
        let accesses = Array()
        let box = await Box.findById(box_id)
        Logger.info('Share box', box)
        if (box) {
            for (var i = 0; i < items.length; i++) {
                const user = await User.findById(items[i].id)
                if (user) {
                    let access = await Access.findOne({ user: user.id, box: box_id })
                    if (access) {
                        if (items[i].isOwner == true) {
                            if (access.owner != access.user) {
                                access.owner = access.user
                                await access.save()
                            }
                        }
                        accesses.push(access)
                    }
                    else {
                        let csd = new Keystore({
                            type: items[i].key.type,
                            csd: {
                                key: items[i].key.csd.key,
                                iv: items[i].key.csd.iv,
                                nonce_length: items[i].key.csd.nonce_length,
                                mac_length: items[i].key.csd.mac_length
                            }
                        })
                        csd = await csd.save()
                        if (csd) {
                            const user = await User.findById(items[i].id)

                            let access = await Access.findOne({ user: user.id,box: box_id })
                            if (access && items[i].isOwner == true && getUserId() == access.owner) {
                                const access = new Access({
                                    box: box_id,
                                    user: items[i].id,
                                    key: csd.id,
                                    owner: items[i].id,
                                    giver: getUserId(), // Recupérer l'utilisateur courant
                                    expires_at: items[i].expires_at,
                                    parent_folder: (user.inbox_folder).toString()
                                })
                                await access.save()
                                box.updateAccessNumber()
                                accesses.push(access)
                                if (access) {
                                    let inbox_folder = await Folder.findById(user.inbox_folder.toString())
                                    if (inbox_folder) {
                                        inbox_folder.boxes.push(access.id)
                                        await inbox_folder.save()
                                    }
                                }
                                utils.trackActivity(globals.ACTION_SHARE, {
                                    box: box.id,
                                    comment: `shared to ${user.name}`
                                })
                            } else {
                                const access = new Access({
                                    box: box_id,
                                    user: items[i].id,
                                    key: csd.id,
                                    owner: box.owner,
                                    giver: getUserId(), // Recupérer l'utilisateur courant
                                    expires_at: items[i].expires_at,
                                    parent_folder: (user.inbox_folder).toString()
                                })
                                await access.save()
                                box.updateAccessNumber()
                                accesses.push(access)
                                if (access) {
                                    let inbox_folder = await Folder.findById(user.inbox_folder.toString())
                                    if (inbox_folder) {
                                        inbox_folder.boxes.push(access.id)
                                        await inbox_folder.save()
                                    }
                                }
                                utils.trackActivity(globals.ACTION_SHARE, {
                                    box: box.id,
                                    comment: `shared to ${user.name}`
                                })
                            }
                        }
                    }
                }
            }
            notificationService.sendNotification({ action: "share", box: box.id, box_name: box.name, except: getUserId(), items: items })
            Logger.info('accesses', accesses)
            return accesses
        } else {
            throw new Errors.InvalidDataError('Undefined Box')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument box_id')
    }
}
//------------------------ Liste des activities -------------------
exports.getDocumentActivity = async (document_id) => {
    if (document_id) {
        let activities = await Activity.find({ document: document_id }).populate({ path: 'user', select: ['login', 'name'] })
        Logger.info('get Document Activities', activities)
        return activities;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//------------------------ getDocument -------------------
exports.createDocument = async (data, parent_box = null, parent_folder = null, external_User = null) => {
    if (!parent_box && !parent_folder)
        throw new Errors.NotFoundError('Neither parent folder nor box provided')
    let found = null
    if (parent_box) {
        found = await Document.findOne({ name: data.filename, parent_box: parent_box })
    }
    if (parent_folder) {
        found = await Document.findOne({ name: data.filename, parent_folder: parent_folder })
    }
    let id = getUserId()
    let storage = await storage_service.getUserStorage(id)
    if (storage) {
        let attachment = new Attachment({
            filename: data.filename,
            size: data.size,
            content_type: data.content_type,
            csd: {
                mac: data.mac,
                nonce: data.nonce
            },
            hash : data.hash,
            owner: id,
            storage_id: storage.storage_id,
            storage: storage.params
        })
        await attachment.save()

    }
    let attachment = new Attachment({
        filename: data.filename,
        size: data.size,
        content_type: data.content_type,
        csd: {
            mac: data.mac,
            nonce: data.nonce
        },
        hash : data.hash,
        owner: id,
    })
    await attachment.save()


    Logger.info('create attachment', attachment)

    if (attachment) {
        if (!found) {
            let version = {
                version: 1,
                attachment: attachment.id
            }
            let id = getUserId()
            let document = new Document({
                name: data.filename,
                type: 'file',
                size: data.size,
                content_type: data.content_type,
                root_box: data.root_box,
                parent_box: parent_box ? parent_box : null,
                parent_folder: parent_folder ? parent_folder : null,
                current_version: version,
                versions: [version],
                last_modified: {
                    modifier: id
                },
                owner: id
            })


            document = await document.save()
            Logger.info('create document', document)

            if (document) {
                if (parent_box) {
                    const box = await Box.findById(parent_box)
                    if (box) {
                        box.documents.push(document.id);
                        await box.save();
                    }
                }
                if (parent_folder) {
                    const folder = await Folder.findById(parent_folder)
                    if (folder) {
                        folder.documents.push(document.id);
                        await folder.save();
                    }
                }

                attachment.document = document.id
                await attachment.save()
            }


            utils.trackActivity(external_User ? globals.ACTION_ANONYMOUS_UPLOAD : globals.ACTION_UPLOAD, { document: document.id, attachment: version, externalUser: external_User })

        } else {
            let version = {
                version: ++(found.current_version.version),
                attachment: attachment.id
            }
            let id = getUserId()
            found.current_version = version;
            (found.versions).push(version)
            found.last_modified.modifier = id
            found = await found.save()
            if (found) {
                attachment.document = found.id
                await attachment.save()
                Logger.info('create attachment', attachment)
            }

            utils.trackActivity(globals.ACTION_UPLOAD, { document: found.id, attachment: version })


        }
        if (attachment) {
            let url = await storage_service.getPreparedUploadURL(attachment.id)
            notificationService.sendNotification({ action: "new_content", document: attachment.document })

            return {
                url: url,
                attachment: attachment
            }
        }

    }

    throw new Errors.InvalidDataError('Undefined argument')
}
//------------------------ getDocument -------------------
exports.getDocument = async (document_id) => {
    if (document_id) {
        let currentDocument = await Document.findById(document_id).populate({
            path: 'comments', populate: { path: 'owner', select: ['login', 'name'] }
        })
        if (currentDocument) {
            utils.trackActivity(globals.ACTION_ACCESS, { document: currentDocument.id })
            return currentDocument;
        } else {
            throw new Errors.NotFoundError('document not found')
        }

    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
//------------------------ comment document/box -------------------
exports.addComment = async (content_id, data) => {
    if (content_id && data) {
        let document = await Document.findById(content_id)
        if (document) {
            let commentary = await document.addComment(data)

            utils.trackActivity(globals.ACTION_CREATE_COMMENT, { document: document.id })
            notificationService.sendNotification({ action: "comment-document", document: document._id })

            return commentary
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    }
    else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ update comment -------------------
exports.updateComment = async (comment_id, data) => {
    if (comment_id && data) {
        let document = await Document.findOne({ 'comments._id': comment_id })
        if (document) {
            let commentary = await document.updateComment(comment_id, data)
            Logger.info('update comment', commentary)

            utils.trackActivity(globals.ACTION_EDIT_COMMENT, { document: document.id })
            return commentary
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ delete document -------------------
exports.deleteComment = async (comment_id) => {
    if (comment_id) {
        let document = await Document.findOne({ 'comments._id': comment_id })
        if (document) {
            let commentary = await document.deleteComment(comment_id)
            utils.trackActivity(globals.ACTION_DELETE_COMMENT, { document })
            Logger.info('delete comment')

            return commentary
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ move document -------------------

exports.moveDocument = async (id, destination, type) => {
    try {
        if (id && destination && type) {
            let old_parent_name;
            let new_parent_name;
            let document = await Document.findById(id)

            let box_dest
            let folder_dest
            if (type === 'box') {
                box_dest = await Box.findById(destination)
            } else if (type === 'folder') {
                folder_dest = await Folder.findById(destination)
            }
            let parent
            if (document.parent_folder && !document.parent_box) {
                let parent_id = document.parent_folder.toString()
                parent = await Folder.findById(parent_id)
                old_parent_name = parent.name

                if (parent) {
                    await parent.deleteDocument(document._id.toString())
                }
            }
            if (!document.parent_folder && document.parent_box) {
                let parent_id = document.parent_box.toString()
                parent = await Box.findById(parent_id)
                old_parent_name = parent.name
                if (parent) {
                    await parent.deleteDocument(document._id.toString())
                }

            }
            await parent.save()
            if (type === 'folder') {
                new_parent_name = folder_dest.name
                await folder_dest.addDocument(document._id)
                document.old_parent_folder = document.parent_folder
                document.old_parent_box = document.parent_box
                document.parent_folder = folder_dest._id
                document.parent_box = null
                await document.save()
                await folder_dest.save()
            }
            if (type === 'box') {
                await box_dest.addDocument(document._id)
                new_parent_name = box_dest.name
                document.old_parent_box = document.parent_box
                document.old_parent_folder = document.parent_folder
                document.parent_box = box_dest._id
                document.parent_folder = null
                await document.save()
                await box_dest.save()
            }

            utils.trackActivity(globals.ACTION_MOVE, {
                document: document.id,
                comment: `from ${old_parent_name} to ${new_parent_name}`
            })

            Logger.info("Move Document", document)
            return document
        }
        throw new Errors.InvalidDataError('Undefined argument')
    } catch (err) {
        Logger.error(err.message)
    }

}

//------------------------ getDocument -------------------
exports.downloadAttachment = async (attachment_id) => {
    if (attachment_id) {
        let currentAttachment = await Attachment.findById(attachment_id)
        Logger.info(`download attachment: ${currentAttachment.filename}`)

        // todo verify rights
        if (currentAttachment) {
            let url = await storage_service.getPreparedDownloadURL(attachment_id)

            notificationService.sendNotification({ action: "download", document: currentAttachment.document })

            utils.trackActivity(globals.ACTION_DOWNLOAD, { document: currentAttachment.document })

            return {
                url: url,
                attachment: currentAttachment
            }
        } else {
            throw new Errors.NotFoundError('Attachment not found')
        }

    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}


// ===================== DocRequests ===============
//===================================================
//------------------------ getDocrequest -------------------
exports.editDocrequest = async (_docrequest) => {
    if (_docrequest && _docrequest.id) {

        _docrequest.last_modified = { modifier: getUserId(), modified_at: Date.now() }
        if (_docrequest.max_sending && _docrequest.sending_count) {
            if (_docrequest.max_sending !== 0 && _docrequest.max_sending <= _docrequest.sending_count) {
                _docrequest.status = "EXPIRED"
            }
            if (_docrequest.max_sending > _docrequest.sending_count) {
                _docrequest.status = "ACTIVE"
            }
        }
        let currentRequest = await DocRequest.findByIdAndUpdate(_docrequest.id, _docrequest, { new: true })
        Logger.info('edit Docrequest', currentRequest)
        utils.trackActivity(globals.ACTION_EDIT, { docrequest: currentRequest.id })
        return currentRequest;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ delete Docrequest -------------------
exports.deleteDocrequest = async (_docRequest) => {
    if (!_docRequest || !_docRequest.id) {
        throw new Errors.InvalidDataError('Undefined argument')
    } else {
        Logger.info('delete Docrequest')
        let docRequest = await DocRequest.findById(_docRequest.id)
        if (docRequest && docRequest.parent_folder) {
            const parent_folder = await Folder.findById(docRequest.parent_folder)
            if (parent_folder) {
                parent_folder.docrequests = parent_folder.docrequests.filter((el) => {
                    return el.toString() != _docRequest.id.toString();
                })
                await parent_folder.save();
            }
            utils.trackActivity(globals.ACTION_DELETE, { docrequest: docRequest.id })
            return await Box.findByIdAndRemove(docRequest.id)  // .populate("files");
        } else {
            throw new Errors.NotFoundError('document not found')
        }
    }
}
//------------------------ getDocrequestData -------------------    
exports.getDocrequestData = async (_link) => {
    if (_link) {
        let currentRequest = await DocRequest.findOne({ link: _link, status: 'ACTIVE' })
            .select('owner')
            .select('allow_anonymous')
            .populate({
                path: 'owner',
                populate: {
                    path: "key",
                    select: 'cac.pb'
                },
                select: ['-trash', '-root_folder', '-inbox_folder', '-activities', '-groups', '-salt', '-is_admin', '-last_connection']
            })

        if (currentRequest) {
            Logger.info('get Docrequest Data', currentRequest)
            return currentRequest;
        }
        else {
            Logger.info('No active Docrequest found')
            throw new Errors.InvalidDataError('Doc request expired')
        }

    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//-----------------Move docrequest data -------------------

exports.moveDocrequest = async (id, destination) => {
    try {
        if (id && destination) {
            let old_parent_name
            let new_parent_name
            let docrequest = await DocRequest.findById(id)
            let dest_folder = await Folder.findById(destination)
            let parent
            if (docrequest) {
                let parent_id = docrequest.parent_folder.toString()
                parent = await Folder.findById(parent_id)
                old_parent_name = parent.name
                if (parent) {
                    await parent.deleteDocrequest(docrequest._id.toString())
                }
                new_parent_name = dest_folder.name
                await dest_folder.addDocrequest(docrequest._id.toString())
                docrequest.old_parent_folder = docrequest.parent_folder
                docrequest.parent_folder = dest_folder._id
                docrequest.save()
                parent.save()
            }
            utils.trackActivity(globals.ACTION_MOVE, {
                box: docrequest.id,
                comment: `from ${old_parent_name} to ${new_parent_name}`
            })
            Logger.info("Move Docrequest", docrequest)
            return docrequest
        }
        throw new Errors.InvalidDataError('Undefined argument')
    }
    catch (err) {
        Logger.error("Error " + err.message)
    }
}





//----------------------- upload doc request --------

exports.docRequestUpload = async (_link, data) => {
    if (_link) {
        let currentRequest = await DocRequest.findOne({ link: _link, status: "ACTIVE" });
        if (currentRequest) {

            if (currentRequest.sending_count) {
                currentRequest.sending_count = currentRequest.sending_count + 1;
            }
            else {
                currentRequest.sending_count = 1
            }
            if (currentRequest.sending_count === currentRequest.max_sending) {
                currentRequest.status = "EXPIRED"
            }

            let currentBox = {
                name: currentRequest.title + '_' + currentRequest.sending_count,
                owner: currentRequest.owner,
                parent_folder: currentRequest.parent_folder,
                sender: data.sender,
                comment: data.comment,
                key: {
                    type: data.key.type,
                    csd: {
                        key: data.key.csd.key
                    }
                }
            }
            //simulate isAuthorized
            httpContext.set('gUserID', currentRequest.owner)
            let box = await this.createBox(currentBox);
            let docs = []
            if (box) {
                //loop sur les files
                for (let i = 0; i < data.files.length; i++) {
                    let doc = await this.createDocument(data.files[i], box.box, null, data.sender);
                    docs.push(doc);
                }
                //notif receiving data

                utils.trackActivity(globals.ACTION_ANONYMOUS_SHARE, {
                    docrequest: currentRequest.id,
                    externalUser: data.sender,
                    comment: `${data.sender} sent you ${box.box.name}`,
                    anonymous: data.sender
                })

                currentRequest.save() //sans await

            }
            return docs
        }
        throw new Errors.InvalidDataError('Doc request expired')

    }
}

//--------------------- Création Docrequest
exports.createDocrequest = async (_Docrequest) => {
    if (_Docrequest.parent_folder) {
        const parent_folder = await Folder.findById(_Docrequest.parent_folder)
        if (parent_folder) {
            // Ajout du nouvau Folder
            let id = getUserId()
            let currentRequest = new DocRequest({
                name: _Docrequest.name,
                link: _Docrequest.link,
                title: _Docrequest.title,
                max_sending: _Docrequest.max_sending,
                sending_count: 0,
                expires_at: _Docrequest.expires_at,
                description: _Docrequest.description,
                parent_folder: _Docrequest.parent_folder,
                owner: id !== "" ? id : null,
                last_modified: { modifier: id, modified_at: Date.now() },
                allow_anonymous: _Docrequest.allow_anonymous
            });
            currentRequest = await currentRequest.save();
            //Ajout dans le parent    
            parent_folder.docrequests.push(currentRequest.id);
            await parent_folder.save();

            utils.trackActivity(globals.ACTION_CREATE, { docrequest: currentRequest.id })
            Logger.info('Current Request', currentRequest)
            return currentRequest
        } else {
            throw new Errors.InvalidDataError('parent_folder not found ' + _Docrequest.parent_folder)
        }
    } else {
        throw new Errors.InvalidDataError('parent_folder undefined')
    }
}
//------------------------ getDocrequest -------------------

exports.getDocrequest = async (_docrequest) => {
    if (_docrequest) {
        let currentRequest = await DocRequest.findById(_docrequest.id).populate({ path: 'owner', select: ['login', 'name'] })
        Logger.info('get request', currentRequest)

        utils.trackActivity(globals.ACTION_ACCESS, { docrequest: currentRequest.id })
        return currentRequest;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ getDocrequest -------------------


exports.getDocrequestActivity = async (docrequest_id) => {
    if (docrequest_id) {
        let activities = await Activity.find({ docrequest: docrequest_id })
        Logger.info('get Docrequest Activities', activities)
        return activities;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ docrequest activity -------------------


exports.docrequestActivation = async (docrequest_id) => {
    if (docrequest_id) {
        let docrequest = await DocRequest.findById(docrequest_id)
        if (docrequest.status === "ACTIVE") {
            docrequest.status = "DEACTIVATED"
        } else if (docrequest.status === "DEACTIVATED") {
            docrequest.status = "ACTIVE"
        }
        docrequest.save()
        Logger.info('Docrequest Activation', docrequest)
        return docrequest;
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ comment Box -------------------

exports.addBoxComment = async (box_id, data) => {
    if (box_id && data) {
        let box = await Box.findById(box_id)
        if (box) {
            let commentary = await box.addComment(data)
            utils.trackActivity(globals.ACTION_CREATE_COMMENT, { box: box.id })
            notificationService.sendNotification({ action: "comment-box", box: box._id, box_name: box.name })

            return commentary
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    }
    else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ update comment -------------------
exports.updateBoxComment = async (comment_id, data) => {
    if (comment_id && data) {
        let box = await Box.findOne({ 'comments._id': comment_id })
        if (box) {
            let commentary = await box.updateComment(comment_id, data)
            Logger.info('update comment', commentary)

            utils.trackActivity(globals.ACTION_EDIT_COMMENT, { box: box.id })
            return commentary
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//------------------------ delete comment -------------------

exports.deleteBoxComment = async (comment_id) => {
    if (comment_id) {
        let box = await Box.findOne({ 'comments._id': comment_id })
        if (box) {
            let commentary = await box.deleteComment(comment_id)
            utils.trackActivity(globals.ACTION_DELETE_COMMENT, { box })
            Logger.info('delete comment')

            return commentary
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//----folder soft delete

exports.folderSoftDelete = async (id, type) => {
    if (id) {
        let user_id = getUserId()
        let user = await User.findById(user_id)
        let trash = user.trash
        let folder = await Folder.findById(id)
        if (folder.parent_folder !== trash) {
            if (user && trash) {
                folder.deleted_at = Date.now()
                folder.status = 'DELETED'
                await folder.save()
                return await this.moveFolder(id, trash, type)

            }
            else {
                throw new Errors.InvalidDataError('Undefined argument')
            }
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }

}

//----folder soft delete


//  ----------------- get all parents recursively --------
exports.isActive = async (id) => {
    if (id) {

        if (id.toString() == getUserRootFolder() || id.toString() == getUserInboxFolder()) {
            return true
        }
        let folder = await Folder.findById(id)
        let trash_id = getUserTrashFolder()
        let is_active = true;
        if (folder) {
            let parent_folder = folder.parent_folder
            let parent_box = folder.parent_box
            if (parent_folder) {
                if (parent_folder != trash_id) {
                    is_active = await this.isActive(parent_folder, trash_id)
                    return is_active
                }
                else {
                    return false;
                }

            }
            if (parent_box) {
                is_active = await this.isActive(parent_box, trash_id)
                return is_active
            }

        }
        let access = await Access.findOne({ box: id })
        if (access) {
            let parent_folder = access.parent_folder
            if (parent_folder != trash_id) {
                is_active = await this.isActive(parent_folder, trash_id)
                return is_active
            }
        }
        return false
    }

}


exports.restoreContent = async (id, type) => {
    if (id) {
        let is_active = false
        if (type === 'folder') {
            let folder = await Folder.findById(id)
            let parent_folder = folder.old_parent_folder
            let parent_box = folder.old_parent_box
            if (parent_folder || parent_box) {
                is_active = await this.isActive(parent_box || parent_folder)
                if (is_active) {
                    //move
                    folder.deleted_at = undefined
                    folder.status = 'ACTIVE'
                    await folder.save()
                    await this.moveFolder(id, parent_box || parent_folder, parent_box != null ? 'box' : 'folder')
                    return true
                }
            }
        }
        if (type === 'box') {
            let access = await Access.findById(id)
            let parent_folder = access.old_parent_folder
            if (parent_folder) {
                is_active = await this.isActive(parent_folder)
                if (is_active) {
                    //move
                    access.deleted_at = undefined
                    access.status = 'ACTIVE'
                    await access.save()
                    await this.moveBox(id, parent_folder)
                    return true
                }
            }
        }
        if (type === 'docrequest') {
            let docrequest = await DocRequest.findById(id)
            let parent_folder = docrequest.old_parent_folder
            if (parent_folder) {
                is_active = await this.isActive(parent_folder)
                if (is_active) {
                    //move
                    await this.moveDocrequest(id, parent_folder)
                    return true
                }
            }
        }
        if (type === 'document') {
            let document = await Document.findById(id)
            let parent_folder = document.old_parent_folder
            let parent_box = document.old_parent_box
            if (parent_folder || parent_box) {
                is_active = await this.isActive(parent_folder || parent_box)
                if (is_active) {
                    //move
                    document.deleted_at = undefined
                    document.status = 'ACTIVE'
                    await document.save()
                    await this.moveDocument(id, parent_box || parent_folder, parent_box != null ? 'box' : 'folder')
                    return true
                }
            }
        }
        return false
    }
}


//----box soft delete

// ------ moves access to trash

exports.boxSoftDelete = async (id) => {
    if (id) {
        let user_id = getUserId()
        let user = await User.findById(user_id)
        let trash = user.trash
        let access = await Access.findById(id)
        if (user && trash && access) {
            access.deleted_at = Date.now()
            access.status = 'DELETED'
            await access.save()
            return await this.moveBox(id, trash)

        }
        else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}


//----document soft delete

exports.documentSoftDelete = async (id, type) => {
    if (id) {
        let user_id = getUserId()
        let user = await User.findById(user_id)
        let trash = user.trash
        let document = await Document.findById(id)
        if (user && trash && document) {
            document.deleted_at = Date.now()
            document.status = 'DELETED'
            await document.save()
            return await this.moveDocument(id, trash, type)

        }
        else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }

}


//----docreq soft delete

exports.docrequestSoftDelete = async (id) => {
    if (id) {
        let user_id = getUserId()
        let user = await User.findById(user_id)
        let trash = user.trash
        if (user && trash) {
            return await this.moveDocrequest(id, trash)

        }
        else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }

}

/// filter array: remove duplicat
uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))


// ---------------------- add to favorite -------------------

exports.starContent = async (folders, boxes, action = "star") => {
    let user_id = getUserId()
    let user = await User.findById(user_id)
    let starFolder = user.starred
    let starred = await Folder.findById(starFolder)
    if (starred) {
        if (action === "unstar") {
            if (folders && folders.length > 0) {
                starred.folders = await starred.folders.filter(folder => !folders.includes(folder.toString()))
                for (let i = 0; i < folders.length; i++) {
                    await Folder.findByIdAndUpdate(folders[i], { starred: false });
                }
            }
            if (boxes && boxes.length > 0) {
                for (let i = 0; i < boxes.length; i++)
                    await Access.findByIdAndUpdate(boxes[i], { starred: false });
                starred.boxes = await starred.boxes.filter(box => !boxes.includes(box.toString()))

            }

        } else {
            if (folders && folders.length > 0) {
                for (let i = 0; i < folders.length; i++)
                    await Folder.findByIdAndUpdate(folders[i], { starred: true });
                starred.folders = starred.folders.push(...folders)
                starred.folders = uniqueArray(starred.folders)
            }
            if (boxes && boxes.length > 0) {
                for (let i = 0; i < boxes.length; i++)
                    await Access.findByIdAndUpdate(boxes[i], { starred: true });
                starred.boxes.push(...boxes)
                starred.boxes = uniqueArray(starred.boxes);
            }
        }
        await starred.save()
        return starred
    }
    else {
        throw new Errors.NotFoundError('Starred not found')
    }
}
//============parse attachment

exports.parseAttachment = async () => {
    let attachments = await Attachment.updateMany({}, {
        "$set": {
            "size": parseInt(0)
        }
    })
    if (attachments)
        return true
    return false
}

exports.parseDocument = async () => {
    let documents = await Document.updateMany({}, {
        "$set": {
            "size": parseInt(0)
        }
    })
    if (documents)
        return true
    return false
}

exports.duplicateAccess = async (id, destination) => {
    if (id && destination) {
        let access = await Access.findById(id)
        let folder_dest = await Folder.findById(destination)
        let clone = new Access({
            box: access.box,
            user: access.user,
            key: access.key,
            owner: access.owner,
            giver: access.giver,
            expires_at: access.expires_at,
            parent_folder: folder_dest._id,
            source: id
        })
        await clone.save()
        access.clones.push(clone)
        await access.save()
        return clone
    }
    throw new Errors.NotFoundError('Access not found')
}

// hard delete files from trash after 30 days
exports.emptyTrash = async () => {
    try {
        let currentDate = new Date()
        const period = 30
        let old_date = new Date(currentDate.setDate(currentDate.getDate() - period))
        await Folder.deleteMany({ status: 'DELETED', deleted_at: { $lt: old_date } })

        await Document.deleteMany({ status: 'DELETED', deleted_at: { $lt: old_date } })

        await Access.deleteMany({ status: 'DELETED', deleted_at: { $lt: old_date } })

    } catch (error) {
        throw error
    }
}

exports.expireDocrequest = async () => {
    try {
        await DocRequest.updateMany({ expires_at: { $gt: Date.now() } },
            {
                status: "EXPIRED"
            })
    }
    catch (error) {
        throw error
    }
}