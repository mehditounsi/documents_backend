const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Folder = require("../model/folder");
const Document = require("../model/document");
const {getUserId} = require('../helpers/context')
const Access = require('./access')


const box = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: ObjectId,
    ref: "User",
  },
  sender: {
    type: String,
  },
  folders: [
    {
      type: ObjectId,
      ref: "Folder",
    },
  ],
  documents: [
    {
      type: ObjectId,
      ref: "Document",
    },
  ],
  activities: [
    {
      type: ObjectId,
      ref: "Activity",
    },
  ],
  created_at: { type: Date, default: Date.now },
  last_modified: {
    modified_at: {
      type: Date,
      default: Date.now,
    },
    modifier: {
      type: ObjectId,
      ref: "User",
    },
  },
  comments: [
    {
      comment: {
        type: String,
        default: "",
      },
      owner: {
        type: ObjectId,
        ref: "User",
      },
      sender: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      modified_at: {
        type: Date,
        default: null,
      },
      nonce: String,
      mac: String,
    },
  ],
  access_number: {
    type : Number,
    default : 1
  }
});

box.methods.updateAccessNumber = async function () {
  let access = await Access.find({box : this.id})
  if (access){
    this.access_number = access.length
    this.save()
  }
}

box.methods.addFolder = async function (folder_id) {
  if (folder_id) {
    this.folders.push(folder_id);
    await this.save();
    return this.folders;
  }
};

box.methods.deleteFolder = async function (folder_id) {
  if (folder_id) {
    for (var i = 0; this.folders && i < this.folders.length; i++) {
      if (this.folders[i]._id.toString() === folder_id) {
        this.folders.splice(i, 1);
        await this.save();

        return this.folders;
      }
    }
  }
};

box.methods.addDocument = async function (document_id) {
  if (document_id) {
    this.documents.push(document_id);
    await this.save();
    return this.documents;
  }
};

box.methods.deleteDocument = async function (document_id) {
  if (document_id) {
    for (var i = 0; this.documents && i < this.documents.length; i++) {
      if (this.documents[i]._id.toString() === document_id) {
        this.documents.splice(i, 1);
        await this.save();

        return this.documents;
      }
    }
  }
};

box.methods.deleteDocs = async function () {
  for (var i = 0; i < this.documents.length; i++) {
    await Document.findByIdAndDelete(this.documents[i]._id);
  }
  return this;
};

box.methods.deleteFolderChildren = async function () {
  for (var i = 0; i < this.folders.length; i++) {
    let folder = await Folder.findById(this.folders[i]);
    if (folder) {
      await folder.deleteFolderCascade();
    }
    //folders.splice(i, 1)
  }
  await this.save();
  return this;
};

box.methods.addComment = async function (data) {
  if (data) {
    this.comments.push({
      comment: data.comment,
      mac: data.mac,
      nonce: data.nonce,
      sender: data.sender,
      owner: data.owner,
    });
    await this.save();
    return this.comments[this.comments.length - 1];
  }
};

box.methods.updateComment = async function (comment_id, data) {
  let id = getUserId();
  for (var i = 0; this.comments && i < this.comments.length; i++) {
    if (
      this.comments[i]._id.toString() == comment_id &&
      this.comments[i].owner.toString() == id
    ) {
      this.comments[i].comment = data.comment;
      this.comments[i].nonce = data.nonce;
      this.comments[i].mac = data.mac;
      this.comments[i].modified_at = Date.now();
      await this.save();

      return this.comments[i];
    }
  }
};

box.methods.deleteComment = async function (comment_id) {
  let id = getUserId();
  for (var i = 0; this.comments && i < this.comments.length; i++) {
    if (
      this.comments[i]._id.toString() == comment_id &&
      this.comments[i].owner.toString() == id
    ) {
      this.comments.splice(i, 1);
      await this.save();

      return this.comments;
    }
  }
};

const Box = mongoose.model("Box", box);

module.exports = Box;
