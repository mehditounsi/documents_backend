const mongoose = require('mongoose');
const globals = require('../helpers/globals');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Document = require('../model/document');

const folder = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String
    },
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    starred: {
        type: Boolean,
        default: false
    },
    folders: [{
        type: ObjectId,
        ref: 'Folder'
    }],
    boxes: [{
        type: ObjectId,
        ref: 'Access'
    }],
    documents: [{
        type: ObjectId,
        ref: 'Document'
    }],
    parent_folder: {
        type: ObjectId,
        ref: 'Folder'
    },
    old_parent_folder :{
        type : ObjectId,
        ref : 'Folder'
    },
    parent_box: {
        type: ObjectId,
        ref: 'Box'
    },
    old_parent_box: {
        type: ObjectId,
        ref: 'Box'
    },
    inbox: Boolean,  //true if dolder is in a box
    docrequests: [{
        type: ObjectId,
        ref: 'Docrequest'
    }],
    activities: [{
        type: ObjectId,
        ref: 'Activity'
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    last_modified: {
        modified_at: {
            type: Date,
            default: Date.now
        },
        modifier: {
            type: ObjectId,
            ref: 'User'
        }
    },
    deleted_at: { 
        type: Date
     },
     status: {
        type: String,
        required: true,
        enum: ['ACTIVE','DESACTIVATED','DELETED'],
        default: 'ACTIVE'
    }
});


folder.methods.addFolder = async function (folder_id) {

    if (folder_id) {
        this.folders.push(folder_id)
        await this.save()
        return this.folders
    }

}

folder.methods.deleteFolder = async function (folder_id) {
    if (folder_id) {
        for (var i = 0; this.folders && i < this.folders.length; i++) {
            if (this.folders[i]._id.toString() == folder_id) {
                this.folders.splice(i, 1)
                await this.save()

                return this.folders
            }

        }
    }
}


folder.methods.addBox = async function (box_id) {

    if (box_id) {
        this.boxes.push(box_id)
        await this.save()
        return this.boxes
    }

}

folder.methods.deleteBox = async function (box_id) {
    if (box_id) {
        for (var i = 0; this.boxes && i < this.boxes.length; i++) {
            if (this.boxes[i]._id.toString() === box_id) {
                await this.boxes.splice(i, 1)
                await this.save()
                return this.boxes
            }
        }
    }
}


folder.methods.addDocrequest = async function (docreq_id) {

    if (docreq_id) {
        this.docrequests.push(docreq_id)
        await this.save()
        return this.docrequests
    }

}

folder.methods.deleteDocrequest = async function (docreq_id) {
    if (docreq_id) {
        for (var i = 0; this.docrequests && i < this.docrequests.length; i++) {
            if (this.docrequests[i]._id.toString() === docreq_id) {
                await this.docrequests.splice(i, 1)
                await this.save()
                return this.docrequests
            }
        }
    }
}



folder.methods.addDocument = async function (document_id) {
    if (document_id) {
        this.documents.push(document_id)
        await this.save()
        return this.documents
    }
}

folder.methods.deleteDocument = async function (document_id) {
    if (document_id) {
        for (var i = 0; this.documents && i < this.documents.length; i++) {
            if (this.documents[i]._id.toString() === document_id) {

                this.documents.splice(i, 1)
                await this.save()

                return this.documents
            }

        }
    }
}

folder.methods.deleteDocs = async function () {
    for (var i = 0; i < this.documents.length; i++) {
        await Document.findByIdAndDelete( this.documents[i])
    }
}

folder.methods.deleteFolderCascade = async function () {
    this.deleteFolderChildren()
    this.deleteDocs()

    await Folder.findByIdAndRemove(this._id)
}

folder.methods.deleteFolderChildren = async function () {
    for (var i = 0; i < this.folders.length; i++) {
        let folder = await Folder.findById(this.folders[i])
        if (folder) {
            await folder.deleteFolderCascade()
        }
    }

    await this.save()
    return this
} 




const Folder = mongoose.model('Folder', folder);

module.exports = Folder;