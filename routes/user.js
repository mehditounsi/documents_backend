const configuration = require('../config/config')
const tmp_path = configuration.storage.tmp_path
const user_controller = require('../controller/user');
const system_controller = require('../controller/system');
const jwt = require('../helpers/jwt');
const limiter = require('../helpers/limiter')
const multer  = require('multer')
const upload = multer({ dest: tmp_path})
const {canView} = require('../helpers/access');
const { Resources } = require("../helpers/globals")



module.exports = (router) => {
  router.post('/register', /*limiter.rateLimiter(6,5,4,8),*/ user_controller.register);
  router.post('/login', /*limiter.rateLimiter(6,5,4,8),*/ user_controller.login);
  router.get('/profile', jwt.isAuthorized,  user_controller.profile);
  router.get('/users', jwt.isAuthorized, user_controller.getUserList);
  router.put('/logout', jwt.isAuthorized,  user_controller.logout);
  router.put('/profile',  upload.single('file'),jwt.isAuthorized, user_controller.update);
  router.put('/changepassword', jwt.isAuthorized,  user_controller.changePassword);
  //router.put('/delete', jwt.isAdmin, user_controller.delete);
  router.get('/user/friends', jwt.isAuthorized,  user_controller.getFriends);
  router.get('/user/search', jwt.isAuthorized,  user_controller.searchUser);
  router.get('/user/storage', jwt.isAuthorized,  user_controller.getUserStorage);
  router.get('/user/usedstorage',jwt.isAuthorized, user_controller.usedStorage)
  router.put('/user/deactivate',jwt.isAuthorized, user_controller.deactivateUser)
  router.post('/user/reactivate/:id', user_controller.reactivateUser)
  router.delete('/user/delete',jwt.isAuthorized,user_controller.deleteUser)
  router.get('/user/confirm' , user_controller.confirmUser)
  router.get('/verifylogin',user_controller.verifyLogin)

  
  router.post('/group/create',jwt.isAuthorized, user_controller.createGroup)
  router.get('/group',jwt.isAuthorized, user_controller.getGroup)
  router.put('/group/:id',jwt.isAuthorized, canView(Resources.Group), user_controller.updateGroup)
  router.delete('/group/:id',jwt.isAuthorized, canView(Resources.Group), user_controller.deleteGroup)


  router.get('/code/send', /*limiter.rateLimiter(6,5,4,8),*/ user_controller.sendCode);
  router.get('/code/verify', /*limiter.rateLimiter(6,5,4,8),*/ user_controller.verifyCode);

  router.post('/system/logerror', system_controller.logError)
  router.get('/system/health' , system_controller.getSystemHealth) //to complete

}
  