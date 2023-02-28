/*
 *   Copyright (c) 2021 B.P.S.
 *   All rights reserved.
 *   Unauthorized copying of this file, via any medium is strictly prohibited
 *   Proprietary and confidential
 *   @Written by Amine BEN DHIAB <amine@bps-tunisie.com>
 */
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const log = new mongoose.Schema({
    user : {
        type : ObjectId,
        ref : 'User'
    },
    applicationParameters: Object,
    customParameters: Object,
    deviceParameters: Object,
    error: String,
    platformType:String,
    stackTrace: String,
    date: { type: Date, default: Date.now }
});


const Log = mongoose.model('Log', log);

module.exports = Log;