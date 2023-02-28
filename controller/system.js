const SystemService = require("../services/system")


    
exports.logError = async (req = null, res = null, next = null) => {
    try {
        let data = await SystemService.logError(req.body)
        res.status(200).json(data);
    } catch (err) {
        res.status(405).send({ error: err.message, code: err.code });
    }
}

exports.getSystemHealth = async (req = null, res = null, next = null) => {
  try {
    let healthcheck = {
      uptime: process.uptime(),
      responsetime: process.hrtime(),
      message: 'OK',
      timestamp: Date.now()
    };
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
}