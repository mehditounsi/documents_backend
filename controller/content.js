const Logger = require("winston");
const ContentService = require("../services/content");
const StorageService = require("../services/storage");
const formidable = require("formidable");
var mime = require("mime");
const notificationService = require("../helpers/notification");

//---------------- Création InBox Folder ----------------------------------
exports.createInboxFolder = async (req, res, next) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let folder = await ContentService.createFolder(req.body, true);
    res.status(200).send(folder);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- Création de Folder ----------------------------------
exports.createFolder = async (req, res, next) => {
  try {
    Logger.debug(req.body);
    let folder = await ContentService.createFolder(req.body);
    res.status(200).send(folder);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- Création de Folder Root -----------------------------
exports.initRoot = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body);
    let folder = await ContentService.createRootFolder(req.body);
    res.status(200).send(folder);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
exports.getFolderActivity = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let activity = await ContentService.getFolderActivity(req.params.id);
    res.status(200).send(activity);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- Affichage des Sous-repertoire et Box d'un Folder -------------------
exports.getFolderContent = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let folders = await ContentService.getFolderContent(req.body);
    res.status(200).send(folders);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//--------------- Edit Folder --------------------------
exports.editFolder = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let folder = await ContentService.editFolder(req.body);
    res.status(200).send(folder);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//------------------ Delete Folder ------------------------
exports.deleteFolder = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let folder = await ContentService.deleteFolder(req.body);
    res.status(200).send(folder);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
///---------------- Search inside Folder ----------------------------------
exports.searchInsideFolder = async (req = null, res = null) => {
  try {
    Logger.debug(req.query.search, req.query.type, req.params.id);
    let folder_id = req.params.id;
    let search = req.query.search;
    let type = req.query.type;

    let result = await ContentService.searchInsideFolder(
      folder_id,
      search,
      type
    );

    res.status(200).send(result);
  } catch (err) {
    res.status(420).send({ error: err.message, code: err.code });
  }
};
///---------------- Move Folder ----------------------------------

exports.moveFolder = async (req = null, res = null) => {
  try {
    Logger.debug(req.params.id, req.params.destination);
    let id = req.params.id;
    let destination = req.params.destination;
    // destination type
    let type = req.query.type;
    let folder = await ContentService.moveFolder(id, destination, type);
    res.status(200).send(folder);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

///---------------- Création de Box ----------------------------------
exports.createBox = async (req, res, next) => {
  try {
    Logger.debug(req.body);
    let box = await ContentService.createBox(req.body);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- Affichage des Sous-repertoire et Documents d'un Box -------------------
exports.getBoxContent = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let box = await ContentService.getBoxContent(req.body);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- Affichage des Sous-repertoire et Documents d'un Box -------------------
exports.getBoxAccesses = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let box = await ContentService.getBoxAccesses(req.params.id);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

exports.getBoxAccess = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let box = await ContentService.getBoxAccess(req.params.id);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};


exports.getBoxActivity = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let activity = await ContentService.getBoxActivity(req.params.id);
    res.status(200).send(activity);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//---------------------- get access----------------
exports.getAccess = async (req, res) => {
  try {
    Logger.debug(req.params.id);
    let access = await ContentService.getAccess(req.params.id);
    res.status(200).send(access);
  }
  catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
}
//--------------- Edit Box --------------------------
exports.editBox = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let box = await ContentService.editBox(req.body);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//------------------ Delete Box ------------------------
exports.deleteBox = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let box = await ContentService.deleteBox(req.body);
    res.status(200).send({ message: "Box deleted with success" });
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//------------------ Move Box ------------------------

exports.moveBox = async (req = null, res = null) => {
  try {
    Logger.debug(req.params.id, req.params.destination);
    //access id
    let id = req.params.id;
    let destination = req.params.destination;
    let box = await ContentService.moveBox(id, destination);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + message.err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//------------------ Delete Access ------------------------
exports.deleteAccess = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let box = await ContentService.deleteAccess(req.body.id);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//------------------ Delete Access ------------------------
exports.editAccess = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    let id = req.params.id;
    let box = await ContentService.editAccess(id, req.body);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//==============================================================
//----------------- DOCUMENTS ----------------------------------

//------------------ upload document in Box ------------------------
exports.uploadInBox = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let form = new formidable.IncomingForm();
    let datafile = "";
    let box_id = req.params.id;
    let dataform = {};
    form
      .parse(req)
      .on("field", function (name, field) {
        dataform[name] = field;
      })
      .on("file", function (name, files) {
        datafile = {
          name: files.name,
          path: files.path,
          size: files.size,
          type: files.type,
        };
      })
      .on("error", function (err) {
        Logger.error("Error " + err);
        res.status(420).send({ error: err.message, code: err.code });
      })
      .on("end", function () {
        if (
          datafile &&
          datafile.path &&
          datafile.name &&
          box_id &&
          dataform &&
          dataform.key &&
          dataform.iv
        ) {
          ContentService.uploadDocument(datafile, box_id, dataform, true).then(
            function (result) {
              res.status(200).send(result);
            }
          );
        } else {
          res.status(200).send({ error: "missing arguments" });
        }
      });
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- createDocument -------------------
exports.createDocument = async (req = null, res = null, next = null) => {
     try {
    Logger.debug(
      req.body.filename,
      req.body.size,
      req.body.content_type,
      req.body.mac,
      req.body.nonce,
      req.body.parent_folder,
      req.body.parent_box
    );

    let data = {};
    data.filename = req.body.filename;
    data.size = req.body.size;
    data.content_type = req.body.content_type;
    data.mac = req.body.mac;
    data.nonce = req.body.nonce;
    data.root_box = req.body.root_box;
    let parent_folder = req.body.parent_folder;
    let parent_box = req.body.parent_box;
    let document = await ContentService.createDocument(
      data,
      parent_box,
      parent_folder
    );
         res.status(200).send(document);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

exports.getDocumentActivity = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let activity = await ContentService.getDocumentActivity(req.params.id);
    res.status(200).send(activity);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- getDocument -------------------
exports.getDocument = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let document_id = req.params.id;
    let document = await ContentService.getDocument(document_id);
    res.status(200).send(document);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- getDocument -------------------
exports.editDocument = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let document_id = req.params.id;
    let document = await ContentService.editDocument(document_id, req.body);
    res.status(200).send(document);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- downloadAttachment -------------------
exports.downloadAttachment = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let attachment_id = req.params.id;
    let presignedUrl = await ContentService.downloadAttachment(attachment_id);
    res.status(200).send(presignedUrl);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
exports.deleteDocument = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);

    req.body.id = req.params.id;
    let document = await ContentService.deleteDocument(req.body);
    res.status(200).send(document);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//------------------ comment document ------------------------

exports.addComment = async (req, res) => {
  try {
    Logger.debug(req.body.comment, req.params.id);
    let id = req.params.id;
    let data = req.body;
    if (id && data) {
      let content = await ContentService.addComment(id, data);
      res.status(200).send(content);
    } else {
      Logger.error("Error " + err);
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//------------------ update comment ------------------------

exports.updateComment = async (req, res) => {
  try {
    Logger.debug(req.body.comment, req.params.comment_id);
    let comment_id = req.params.id;
    let data = req.body;
    if (comment_id && data) {
      let content = await ContentService.updateComment(comment_id, data);
      res.status(200).send(content);
    } else {
      Logger.error("Error " + err);
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//------------------ delete comment ------------------------

exports.deleteComment = async (req, res) => {
  try {
    Logger.debug(req.params.comment_id);
    let comment_id = req.params.id;
    if (comment_id) {
      let content = await ContentService.deleteComment(comment_id);
      res.status(200).send(content);
    } else {
      Logger.error("Error " + err);
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//------------------ move document ------------------------

exports.moveDocument = async (req = null, res = null) => {
  try {
    Logger.debug(req.params.id, req.params.destination);
    let id = req.params.id;
    let destination = req.params.destination;
    // destination type
    let type = req.query.type;
    let document = await ContentService.moveDocument(id, destination, type);
    res.status(200).send(document);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//------------------ share document ------------------------
exports.shareBox = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id, req.body.users);
    let box_id = req.params.id;
    let users = req.body.users;
    let shares = await ContentService.shareBox(box_id, users);
    res.status(200).send(shares);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(406).send({ error: err.message, code: err.code });
  }
};

///---------------- Création de Doc Request ----------------------------------
exports.createDocrequest = async (req, res, next) => {
  try {
    Logger.debug(req.body);
    let box = await ContentService.createDocrequest(req.body);
    res.status(200).send(box);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//---------------docrequest track activity----------------

exports.getDocrequestActivity = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let activity = await ContentService.getDocrequestActivity(req.params.id);
    res.status(200).send(activity);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//---------------- getDocrequest -------------------
exports.getDocrequest = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let docRequest = await ContentService.getDocrequest(req.body);
    res.status(200).send(docRequest);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- getDocrequest -------------------
exports.editDocrequest = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let docRequest = await ContentService.editDocrequest(req.body);
    res.status(200).send(docRequest);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//---------------- Doc request activation -------------------
exports.docrequestActivation = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.id);
    let id = req.params.id;
    let docRequest = await ContentService.docrequestActivation(id);
    res.status(200).send(docRequest);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//-----------move docrequest -------------------

exports.moveDocrequest = async (req = null, res = null) => {
  try {
    Logger.debug(req.params.id, req.params.destination);
    let id = req.params.id;
    let destination = req.params.destination;
    let Docrequest = await ContentService.moveDocrequest(id, destination);
    res.status(200).send(Docrequest);
  } catch (err) {
    Logger.error("Error " + message.err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//---------------- deleteDocrequest -------------------
exports.deleteDocrequest = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.params.id);
    req.body.id = req.params.id;
    let docRequest = await ContentService.deleteDocrequest(req.body);
    res.status(200).send({ message: "docRequest deleted" });
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};
//---------------- getDocrequest -------------------
exports.getDocrequestData = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.body, req.query.link);
    let link = req.query.link;
    let user = await ContentService.getDocrequestData(link);
    res.status(200).send(user);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//************************ upload docreq ******************//

exports.docRequestUpload = async (req, res) => {
  try {
    Logger.debug(req.query.link);
    let data = {};
    let link = req.query.link;
    data.files = req.body.files;
    data.key = req.body.key;
    data.comment = req.body.comment;
    data.sender = req.body.sender;
    let upload = await ContentService.docRequestUpload(link, data);
    res.status(200).send(upload);
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

exports.anonymousUpload = async (req = null, res = null, next = null) => {
  try {
    Logger.debug(req.params.link);
    let form = new formidable.IncomingForm();
    let datafile = "";
    let link = req.params.link;
    form
      .parse(req)
      .on("field", function (name, field) { })
      .on("file", function (name, files) {
        datafile = {
          name: files.name,
          path: files.path,
          size: files.size,
          type: files.type,
        };
        Logger.info("Data Form : ", datafile);
      })
      .on("error", function (err) {
        Logger.error("Error " + err);
        res.status(420).send({ error: err.message, code: err.code });
      })
      .on("end", function () {
        Logger.info("On End : ", datafile, link);

        if (datafile && datafile.path && datafile.name && link) {
          ContentService.uploadAnonymousDocument(datafile, link, true).then(
            function (result) {
              res.status(200).send(result);
            }
          );
        } else {
          res.status(200).send({ error: "missing arguments" });
        }
      });
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//---------------- create storage -------------------

exports.createStorage = async (req, res) => {
  try {
    Logger.debug(req.body);
    let storage = await StorageService.createStorage(req.body);
    res.status(200).send(storage);
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//---------------- get storage  -------------------

exports.getStorage = async (req, res) => {
  try {
    Logger.debug(req.params.id);
    let id = req.params.id;
    if (id) {
      let storage = await StorageService.getStorage(id);
      res.status(200).send(storage);
    }
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(470).json({ error: err.message, code: err.code });
  }
};

//----------------- edit storage ----------------------

module.exports.editStorage = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.body);
    let id = req.params.id;
    if (!id) {
      Logger.error("Error " + err.message);
      res.status(470).send({ error: err.message, code: err.code });
    } else {
      let storage = await StorageService.editStorage(id, req.body);
      res.status(200).send(storage);
    }
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(470).json({ error: err.message, code: err.code });
  }
};

//----------------- activate storage ----------------------

module.exports.activateStorage = async (req, res) => {
  try {
    Logger.debug(req.params.id);
    let id = req.params.id;
    if (!id) {
      Logger.error("Error " + err.message);
      res.status(470).send({ error: err.message, code: err.code });
    } else {
      let storage = await StorageService.activateStorage(id);
      res.status(200).send(storage);
    }
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(470).json({ error: err.message, code: err.code });
  }
};

//------------------ deactivate storage -----------------

module.exports.deactivateStorage = async (req, res) => {
  try {
    Logger.debug(req.params.id);
    let id = req.params.id;
    if (!id) {
      Logger.error("Error " + err.message);
      res.status(470).send({ error: err.message, code: err.code });
    } else {
      let storage = await StorageService.deactivateStorage(id);
      res.status(200).send(storage);
    }
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(470).json({ error: err.message, code: err.code });
  }
};

//------------------ edit notification ----------------
  
module.exports.editNotification = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.body);
    let id = req.params.id;
    if (!id) {
      Logger.error("Error " + err.message);
    } else {
      let preferences = await notificationService.editNotification(
        id,
        req.body
      );
      res.status(200).send(preferences);
    }
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(470).json({ error: err.message, code: err.code });
  }
};

module.exports.preferencesNotification = async (req, res) => {
  try {
    let preferences = await notificationService.preferencesNotification();
    res.status(200).send(preferences);
  } catch (err) {
    Logger.error("Error " + err.message);
    res.status(470).json({ error: err.message, code: err.code });
  }
};

//------------------ add box comment

exports.addBoxComment = async (req, res) => {
  try {
    Logger.debug(req.body.comment, req.params.id);
    let id = req.params.id;
    let data = req.body;
    if (id && data) {
      let content = await ContentService.addBoxComment(id, data);
      res.status(200).send(content);
    } else {
      Logger.error("Error " + err);
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//------------------ update comment ------------------------

exports.updateBoxComment = async (req, res) => {
  try {
    Logger.debug(req.body.comment, req.params.comment_id);
    let comment_id = req.params.id;
    let data = req.body;
    if (comment_id && data) {
      let content = await ContentService.updateBoxComment(comment_id, data);
      res.status(200).send(content);
    } else {
      Logger.error("Error " + err);
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

//------------------ delete comment ------------------------

exports.deleteBoxComment = async (req, res) => {
  try {
    Logger.debug(req.params.comment_id);
    let comment_id = req.params.id;
    if (comment_id) {
      let content = await ContentService.deleteBoxComment(comment_id);
      res.status(200).send(content);
    } else {
      Logger.error("Error " + err);
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

// ------------------folder soft delete---------------------

exports.folderSoftDelete = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    let type = "folder"
    if (id) {
      let trash = await ContentService.folderSoftDelete(id, type);
      res.status(200).send(trash);
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

// ------------------folder restore---------------------

exports.restoreFolder = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    let type = "folder"
    if (id) {
      let restore = await ContentService.restoreContent(id, type);
      res.status(200).send({result:restore});
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};


// ------------------box soft delete---------------------

exports.boxSoftDelete = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    if (id) {
      let trash = await ContentService.boxSoftDelete(id);
      res.status(200).send(trash);
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};



// ------------------document soft delete---------------------

exports.documentSoftDelete = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    let type = "folder"
    if (id) {
      let trash = await ContentService.documentSoftDelete(id, type);
      res.status(200).send(trash);
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

// ------------------docrequest soft delete---------------------

exports.docrequestSoftDelete = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    if (id) {
      let trash = await ContentService.docrequestSoftDelete(id);
      res.status(200).send(trash);
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

// ------------------box restore---------------------

exports.restoreBox = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    let type = "box"
    if (id) {
      let restore = await ContentService.restoreContent(id, type);
      res.status(200).send({result:restore});
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};


// ------------------docrequest restore---------------------

exports.restoreDocrequest = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    let type = "docrequest"
    if (id) {
      let restore = await ContentService.restoreContent(id, type);
      res.status(200).send({result:restore});
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};


// ------------------document restore---------------------

exports.restoreDocument = async (req, res) => {
  try {
    Logger.debug(req.params.id, req.query);
    let id = req.params.id;
    let type = "document"
    if (id) {
      let restore = await ContentService.restoreContent(id, type);
      res.status(200).send({result:restore});
    } else {
      res.status(420).send("Missing arguments");
    }
  } catch (err) {
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
};

// ------------------starred ----------------------

exports.starContent = async (req,res)=>{
try{
  Logger.debug(req.body);
  let folders = req.body.folders
  let boxes = req.body.boxes
  let action = req.body.action
  if (folders || boxes){
    let favorite = await ContentService.starContent(folders,boxes,action);
    res.status(200).send(favorite);
  } else {
    res.status(420).send("Missing arguments");
  }
}
catch (err) {
  Logger.error("Error " + err);
  res.status(420).send({ error: err.message, code: err.code });
}

}

//------------------parse Int----------------------------------------------------------------

exports.parseAttachment = async (req,res)=>{
  try {
    let parseSize = await ContentService.parseAttachment();
    res.status(200).send(parseSize);
  }
  catch(err){
    Logger.error("Error " + err);
  res.status(420).send({ error: err.message, code: err.code });
  }
}

exports.parseDocument = async (req,res)=>{
  try {
    let parseSize = await ContentService.parseDocument();
    res.status(200).send(parseSize);
  }
  catch(err){
    Logger.error("Error " + err);
  res.status(420).send({ error: err.message, code: err.code });
  }
}

//-----------------------duplicate access------------------------

exports.duplicateAccess = async (req,res) =>{
  try{
    let id = req.params.id
    let destination = req.params.destination
    let duplication = await ContentService.duplicateAccess(id,destination)
    res.status(200).send(duplication);
  }
  catch(err){
    Logger.error("Error " + err);
    res.status(420).send({ error: err.message, code: err.code });
  }
}