var jwt = require('jsonwebtoken');
// var globals = require('../helpers/globals');
const User = require('../model/user')
var httpContext = require('express-http-context');
const configuration = require('../config/config')

const JWT_SIGN_SECRET = "" + configuration.jwt_secret;

// Exported functions
module.exports = {
  generateTokenForUser: function (_user) {
    return jwt.sign({
      userId: _user.id,
      isAdmin: _user.is_Admin
    },

      JWT_SIGN_SECRET,
      {
        expiresIn: '1200h'
      })
  },
  parseAuthorization: function (authorization) {
    //httpContext.get('gUserID') = _user.id
    return (authorization != null) ? authorization.replace('Bearer ', '') : null;
  },
  // --------------- Get User ID from Token -------------
  getUserId: function (authorization) {
    var user_id = -1;
    var token = module.exports.parseAuthorization(authorization);
    if (token != null) {
      try {
        var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
        if (jwtToken != null)
          user_id = jwtToken.userId;
      } catch (err) { }
    }
    httpContext.get('gUserID', jwtToken.userId) = user_id
    return user_id;
  },
  // ------------ Verifiy Authentication -------------
  isAuthorized: async function (req, res, next) {
    var auth = req.headers['authorization'];
    var token = module.exports.parseAuthorization(auth);
    if (!token) return res.status(402).send("Access denied. No token provided.");
    try {
      const jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
      req.user = {
        id: jwtToken.userId
      }

      if (jwtToken.userId) {
        let user = await User.findById(jwtToken.userId)

      //httpContext.set('gUserIP', req.connection.remoteaddress)
      httpContext.set('gUserIP', req.clientIp)
      httpContext.set('gUserID', jwtToken.userId)
      httpContext.set('root', user.root_folder)
      httpContext.set('inbox', user.inbox_folder)
      httpContext.set('trash', user.trash)
      httpContext.set('starred', user.starred)
      httpContext.set('gUser', user)
      httpContext.set('UserLogin', user.login)

      let context = {
      //gUserIP :req.connection.remoteaddress,
      gUserIP : req.clientIp,
      gUserID : jwtToken.userId,
      root : user.root_folder,
      inbox: user.inbox_folder,
      trash: user.trash,
      starred : user.starred,
      gUser : user,
      UserLogin : user.login
      }
      req.body.context = context

      }


      next();
    } catch (ex) {
      res.status(402).send("Invalid token.");
    }
  },
  // ------------ Verifiy Authentication -------------
  isAdmin: function (req, res, next) {
    var auth = req.headers['authorization'];
    var token = module.exports.parseAuthorization(auth);
    if (!token) return res.status(402).send("Access denied. No token provided.");
    try {
      const jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
      if (jwtToken != null)
        if (!jwtToken.isAdmin) {
          res.status(402).send("Access denied. need more rights.")
        };
      next();
    } catch (ex) {
      //if invalid token
      res.status(402).send("Invalid token.");
    }
  }
}



