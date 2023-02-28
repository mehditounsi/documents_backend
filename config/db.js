const winston = require('winston');
require('dotenv').config()
const mongoose = require('mongoose');
const config = require('config');
const configuration = require('./config');

module.exports = function () {
  const port = configuration.database.port || "27017"
  const dbname = configuration.database.name || "doculock"
  const dbserver = configuration.database.server || "localhost"

  const dbUrl = `mongodb://${dbserver}:${port}/${dbname}`
  mongoose.connect(dbUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.info(`Connected to ${dbUrl}...`))
    .catch((e) => { console.error('MongoDB Error', e) })
}