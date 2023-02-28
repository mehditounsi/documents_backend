const nodeCron = require('node-cron');
const Logger = require("winston");
const ContentService = require("../services/content");

/*
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *
*/
 
// Empty trash every hour
nodeCron.schedule("10 * * * *", async () => { 
    try {
        Logger.info("Empty trash job started");
        ContentService.emptyTrash()
    } catch (error) {
        Logger.error("Error " + error);
    }
});

// deactivate expired docrequest
nodeCron.schedule("20 * * * *", async () => { 
    try {
        Logger.info("Deactivate expired docrequest job started");
        ContentService.expireDocrequest()
        Logger.info("Deactivate expired docrequest job finished");
    } catch (error) {
        Logger.error("Error " + error);
    }
});

// deactivate expired share
nodeCron.schedule("30 * * * *", async () => { 
    try {
        Logger.info("Deactivate expired share started");

        Logger.info("Deactivate expired share finished");
    } catch (error) {
        Logger.error("Error " + error);
    }
});