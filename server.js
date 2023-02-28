/*
 *   Copyright (c) 2021 B.P.S.
 *   All rights reserved.
 *    *   Unauthorized copying of this file, via any medium is strictly prohibited\n *   Proprietary and confidential
 */

require('dotenv').config();
var httpContext = require('express-http-context');
const express = require('express');
const winston = require('winston');

var morgan = require('morgan')
const responseTime = require('response-time')
let Ratelimiter = require("./helpers/limiter")
const swaggerUi = require('swagger-ui-express');







console.log(process.env)
const app = express();
const http = require('http');
const https = require('https');
const fs = require('fs');
const configuration = require('./config/config')
const helmet = require("helmet");
const requestIp = require('request-ip');







const httpPort = configuration.port.http || 3001;
const httpsPort = configuration.port.https || 3002;

const crtPath = configuration.port.cert_path || '/ssl';

var key = ""//fs.readFileSync(__dirname + crtPath + 'selfsigned.key');
var cert = ""//fs.readFileSync(__dirname  + crtPath + 'selfsigned.crt');
var credentials = {
  key: key,
  cert: cert
};



// const userRouter = require('./routes/user');
// const contentRouter = require('./routes/content');


const cors = require('cors');
const bodyParser = require('body-parser');

// retrieve a request's IP address
app.use(requestIp.mw())

app.use(responseTime())
app.use(Ratelimiter.limiter());
app.use(morgan('dev'))



//middleware
app.use(helmet());
app.use(cors());

// temporarly accept all : froont and back in different subdomain
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.disable('x-powered-by')
app.use(bodyParser.json());
app.use(httpContext.middleware);


require('./helpers/logging')();
require('./config/db')();

require('./routes/user')(app);
require('./routes/content')(app);
require('./routes/swagger')(app)
require('./helpers/jobs');



var httpServer = http.createServer(app)

httpServer.listen(httpPort,() => {
  console.log("Http server listing on port : " + httpPort)
});


// Gracefull shutdown
process.on('SIGTERM', gracefullShutDown);
process.on('SIGINT', gracefullShutDown);

function gracefullShutDown() {
  // todo: close mongo connection
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

}