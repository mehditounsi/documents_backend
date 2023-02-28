const content_controller = require('../controller/content');
const {canView} = require('../helpers/access');
const service = require('../helpers/notification')
const { Resources } = require("../helpers/globals")
const jwt = require('../helpers/jwt');

module.exports = (router) => {
  //=====================Parseint ===============

  //router.put('/attachment/parseint' , content_controller.parseAttachment)
  //router.put('/document/parseint' , content_controller.parseDocument)

  
  //==================Folders===================
  router.post('/folder/init', jwt.isAuthorized, content_controller.initRoot);
  router.post('/folder/create', jwt.isAuthorized, content_controller.createFolder);
  router.get('/folder/:id/activity', jwt.isAuthorized, canView(Resources.Folder), content_controller.getFolderActivity);
  router.get('/folder/:id', jwt.isAuthorized, canView(Resources.Folder),content_controller.getFolderContent);
  router.get('/folder/:id/search', jwt.isAuthorized, canView(Resources.Folder), content_controller.searchInsideFolder)
  router.put('/folder/:id', jwt.isAuthorized, canView(Resources.Folder), content_controller.editFolder);
  router.put('/folder/:id/move/:destination',  jwt.isAuthorized, canView(Resources.Folder), content_controller.moveFolder)
  router.put('/folder/restore/:id', jwt.isAuthorized , canView(Resources.Folder), content_controller.restoreFolder)
  router.delete('/folder/:id', jwt.isAuthorized, canView(Resources.Folder), content_controller.deleteFolder);
  router.delete('/folder/softdelete/:id', jwt.isAuthorized , canView(Resources.Folder), content_controller.folderSoftDelete)



    
  //================Boxes=====================
  router.post('/box/create', jwt.isAuthorized, content_controller.createBox);
  router.post('/box/:id/share', jwt.isAuthorized, canView(Resources.Box), content_controller.shareBox);
  router.post('/box/:id/create', jwt.isAuthorized, canView(Resources.Box), content_controller.createInboxFolder);
  router.get('/box/:id', jwt.isAuthorized, canView(Resources.Box), content_controller.getBoxContent);
  router.get('/box/:id/access', jwt.isAuthorized, canView(Resources.Box), content_controller.getBoxAccesses);
  router.get('/access/box/:id' , jwt.isAuthorized, canView(Resources.Box), content_controller.getBoxAccess)
  router.get('/box/:id/activity', jwt.isAuthorized, canView(Resources.Box), content_controller.getBoxActivity);
  router.put('/box/:id', jwt.isAuthorized, canView(Resources.Box), content_controller.editBox);
  router.put('/box/:id/move/:destination', jwt.isAuthorized, canView(Resources.Access), content_controller.moveBox)
  router.put('/box/restore/:id', jwt.isAuthorized , canView(Resources.Access), content_controller.restoreBox)
  router.delete('/box/:id', jwt.isAuthorized, canView(Resources.Box), content_controller.deleteBox);
  router.delete('/box/softdelete/:id', jwt.isAuthorized , canView(Resources.Access), content_controller.boxSoftDelete)
  
  router.get('/access/:id',jwt.isAuthorized, canView(Resources.Access), content_controller.getAccess);
  router.put('/access/:id',jwt.isAuthorized, canView(Resources.Access), content_controller.editAccess);
  router.put('/access/:id/duplicate/:destination',jwt.isAuthorized, canView(Resources.Access), content_controller.duplicateAccess)
  router.delete('/access/:id', jwt.isAuthorized, canView(Resources.Access), content_controller.deleteAccess);
  
// comments
  router.post('/box/:id/comment', jwt.isAuthorized, canView(Resources.Box),  content_controller.addBoxComment)
  router.put('/box/comment/:id', jwt.isAuthorized, canView(Resources.Comment), content_controller.updateBoxComment)
  router.delete('/box/comment/:id', jwt.isAuthorized, canView(Resources.Comment), content_controller.deleteBoxComment)


  //================Documents=====================
  router.post('/document/create', jwt.isAuthorized, content_controller.createDocument);
  router.post('/document/:id/comment', jwt.isAuthorized, canView(Resources.Document),  content_controller.addComment)
  router.get('/document/:id', jwt.isAuthorized, canView(Resources.Document), content_controller.getDocument);
  router.get('/document/:id/activity', jwt.isAuthorized, canView(Resources.Document), content_controller.getDocumentActivity);
  router.put('/document/:id', jwt.isAuthorized, canView(Resources.Document), content_controller.editDocument);
  router.put('/document/:id/move/:destination', jwt.isAuthorized, canView(Resources.Document), content_controller.moveDocument)
  router.put('/document/comment/:id', jwt.isAuthorized, canView(Resources.Comment), content_controller.updateComment)
  router.put('/document/restore/:id', jwt.isAuthorized  , canView(Resources.Document), content_controller.restoreDocument)
  router.delete('/document/:id', jwt.isAuthorized, canView(Resources.Document), content_controller.deleteDocument);
  router.delete('/document/comment/:id', jwt.isAuthorized, canView(Resources.Comment), content_controller.deleteComment)
  router.delete('/document/softdelete/:id', jwt.isAuthorized , canView(Resources.Document), content_controller.documentSoftDelete)


  router.get('/attachment/:id/download', jwt.isAuthorized,content_controller.downloadAttachment);


  
  router.post('/docrequest/create', jwt.isAuthorized, content_controller.createDocrequest);
  router.post('/docrequest/upload' , content_controller.docRequestUpload);
  router.get('/docrequest/:id', jwt.isAuthorized, canView(Resources.Docrequest), content_controller.getDocrequest);
  router.get('/docrequest/:id/activity', jwt.isAuthorized, canView(Resources.Docrequest), content_controller.getDocrequestActivity);
  router.put('/docrequest/:id', jwt.isAuthorized, canView(Resources.Docrequest), content_controller.editDocrequest);
  router.put('/docrequest/:id/move/:destination', jwt.isAuthorized ,canView(Resources.Docrequest), content_controller.moveDocrequest)
  router.put('/docrequest/restore/:id', jwt.isAuthorized, canView(Resources.Docrequest), content_controller.restoreDocrequest)
  router.put('/docrequest/:id/activation', jwt.isAuthorized, canView(Resources.Docrequest), content_controller.docrequestActivation)
  router.delete('/docrequest/:id', jwt.isAuthorized, canView(Resources.Docrequest), content_controller.deleteDocrequest);
  router.delete('/docrequest/softdelete/:id', jwt.isAuthorized , canView(Resources.Docrequest), content_controller.docrequestSoftDelete)



  router.get('/anonymous', content_controller.getDocrequestData);

  //================Storage=====================

  router.post('/storage/create', jwt.isAuthorized, content_controller.createStorage);
  router.get('/storage/:id', jwt.isAuthorized, canView(Resources.Storage) ,content_controller.getStorage)
  router.put('/storage/:id', jwt.isAuthorized , canView(Resources.Storage), content_controller.editStorage);
  router.put('/storage/:id/activate', jwt.isAuthorized, canView(Resources.Storage), content_controller.activateStorage)
  router.put('/storage/:id/deactivate', jwt.isAuthorized, canView(Resources.Storage), content_controller.deactivateStorage)


  //================notification tester =============================

  router.put('/preferences/:id' , jwt.isAuthorized , content_controller.editNotification)
  router.get('/notification/config' , jwt.isAuthorized , content_controller.preferencesNotification)

  //======================== favorite ================================

  router.put('/starContent' , jwt.isAuthorized , content_controller.starContent)



}