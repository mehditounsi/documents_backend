/*
 *   Copyright (c) 2022 B.P.S.
 *   All rights reserved.
 *    *   Unauthorized copying of this file, via any medium is strictly prohibited\n *   Proprietary and confidential
 */

const Log = require('../model/log');

// ------------- get all logs --------------
exports.getLogs = async () => {
    let logs = Log.find()
    return logs
}

// ------------- logError --------------    
exports.logError = async (data) => {
    let log = new Log({
        user: data.user ?? undefined,
        applicationParameters: data.applicationParameters ?? undefined,
        customParameters: data.customParameters ?? undefined,
        deviceParameters: data.deviceParameters ?? undefined,
        error : data.error  ?? undefined,
        platformType: data.platformType ?? undefined,
        stackTrace: data.stackTrace ?? undefined
    })  
    log = await log.save()
    return log
}