require('dotenv').config()
//const client = require('../config/redis')
const rateLimit = require('express-rate-limit')
const RedisStore = require("rate-limit-redis");
const redis = require('redis')
const configuration = require('../config/config')

const redis_home = configuration.redis.server
const redis_port = configuration.redis.port
const url = `redis://${redis_home}:${redis_port}`



// limiting number of requests

  module.exports.rateLimiter = (max_request = 50, window = 1 , delayAfter = 40 , delay = 8) => {
    return rateLimit({
    windowMs: window * 60 * 1000,
    delayAfter : delayAfter,
    delayMs: delay * 1000,
    max: max_request,
    message:`you have exceeded the limit of requests, try again in  ${window} minutes`,
    standardHeaders: true,
    legacyHeaders: false,
  })
}


module.exports.limiter = (max_request = 500, window = 5 , delayAfter = 450 , delay = 8) => { 
  return rateLimit({
    windowMs: window * 60 * 1000,
    delayAfter: delayAfter,
    delayMs: delay * 1000 ,
    max: max_request,
    message: `you have exceeded the limit of requests, try again in  ${window} minutes`,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
    store: new RedisStore({
      redisURL:url,
      sendCommand: async (...args) => client.sendCommand(args),
    })
  })
}
  




