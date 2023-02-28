const winston = require('winston');
const Sentry = require('winston-transport-sentry-node').default;
require('express-async-errors');
let configuration = require('../config/config')
require('winston-mongodb').MongoDB;



module.exports = function () {

  const options = {
    sentry: {
      dsn: configuration.logs.sentry_dns,
    },
    level: configuration.logs.sentry_level
  };

  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true, }),
    new winston.transports.File({ filename: './logs/uncaughtExceptions.log' })
  );

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });


  if (configuration.logs.file == 'y') {
    winston.add(
      new winston.transports.File({
        level: configuration.logs.file_level,
        filename: configuration.logs.file_path,
        format: winston.format.combine(winston.format.json(), winston.format.timestamp()),
      })
    );
  }

  if (configuration.logs.mongo === "y") {
    winston.add(
      new winston.transports.MongoDB({
        level: configuration.logs.mongo_level,
        db: configuration.logs.mongo_url,
        useUnifiedTopology: true,
        format: winston.format.combine(winston.format.json(), winston.format.timestamp())
      }))
  }

  if (configuration.logs.console === "y") {
    winston.add(
      new winston.transports.Console({
        level: configuration.logs.console_level,
        colorize: true,
        prettyPrint: true,
      })
    )
  }

  if (configuration.logs.sentry === "y") {
    winston.add(new Sentry(options))
    
  }

}