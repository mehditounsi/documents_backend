const { getUserId } = require('../helpers/context')
const { Resources } = require("../helpers/globals")
const Folder = require("../model/folder")
const Access = require("../model/access")
const Box = require("../model/box")
const User = require("../model/user")
const Docrequest = require("../model/docrequest")
const Document = require("../model/document")
const Storage = require("../model/storage")
exports.canView = (resource) => {
    return async function (req, res, next) {
        let current_id = undefined
        let current_user = getUserId()
        let ok = false
        if (req.params.id) { //search in params
            current_id = req.params.id
        } else if (req.query.id) {//serach in query
            current_id = req.query.id
        } else if (req.body.id) {//search in body
            current_id = req.body.id
        }
        if (current_id) {
            // Folder 
            if (resource == Resources.Folder) {
                let folder = await Folder.findById(current_id)
                if (folder.parent_box) { //inbox folder
                    let access = await Access.find({ user: current_user, box: folder.parent_box })
                    if (access) {
                        ok = true
                    }
                } else { //folder
                    if (folder && folder.owner == current_user) {
                        ok = true
                    }
                }
            }
            //Box
             if (resource == Resources.Box) {
                let access = await Access.findOne({box : current_id, user : current_user })
                if (access) {
                    ok = true
                }
            }
             //Access
             if (resource == Resources.Access) {
                let access = await Access.findById(current_id)
                if (access && access.owner == current_user) {
                    ok = true
                }
            }
            //Document
            if (resource == Resources.Document) {
                let document = await Document.findById(current_id)
                if (document.root_box) {
                    let access = await Access.findOne({ user: current_user, box: document.root_box })
                    if (access) {
                        ok = true
                    }
                }
            }

            // Docrequest 
            if (resource == Resources.Docrequest) {
                let docrequest = await Docrequest.findById(current_id)
                if (docrequest && docrequest.owner == current_user) {
                    ok = true
                }
            }

            // Storage 
            if (resource == Resources.Storage) {
                let storage = await Storage.findById(current_id)
                if (storage && storage.owner == current_user) {
                    ok = true
                }
            }

            // Group : we serch in groups._id
            if (resource == Resources.Group) {
                let user = await User.findOne({ 'groups._id': current_id })
                if (user && user.id == current_user) {
                    ok = true
                }
            }

              // Comment
              if (resource == Resources.Comment) {
                let box = await Box.findOne({ 'comments._id': current_id })
                for (let i = 0;box && box.comments && i < box.comments.length; i++) {
                    if (box.comments[i].id == current_id && box.comments[i].owner == current_user) {
                        ok = true
                    }
                }
                let document = await Document.findOne({ 'comments._id': current_id })
                for (let i = 0;document && document.comments && i < document.comments.length; i++){
                    if (document.comments[i].id == current_id && document.comments[i].owner == current_user) {
                        ok = true
                    }
                }
            }

            if (ok) {
                next()
                return
            }
        }
        res.status(401).send({ error: "Unauthorized action" })
    }
}