/*
 *   Copyright (c) 2022 B.P.S.
 *   All rights reserved.
 *    *   Unauthorized copying of this file, via any medium is strictly prohibited\n *   Proprietary and confidential
 */
const globals = require('../helpers/globals');
const Logger = require('winston');
const { getUserId } = require('../helpers/context')
const Attachment = require('../model/attachment');
const Storage = require('../model/storage');
const User = require('../model/user');

const Minio = require('minio')
const fetch = require('node-fetch');
const Errors = require('../helpers/errors');
const configuration = require('../config/config');

const minio_destination = {
    type: globals.MIO,
    endPoint: configuration.minio.server,
    port: parseInt(configuration.minio.port),
    useSSL: true,
    accessKey: configuration.minio.access,
    secretKey: configuration.minio.secret,
    signatureVersion: configuration.minio.version,
    bucket: configuration.minio.bucket
}
const f3s_destinaion= {}

//------------------------ getDocument -------------------
exports.getPreparedDownloadURL = async (attachment_id) => {
    let attachment = await Attachment.findById(attachment_id).populate('document')
    if (attachment) {
        let storage_destination = minio_destination
        if (attachment.storage) {
            storage_destination = attachment.storage
        }
        if (storage_destination.type === globals.MIO) {
            var minioClient = new Minio.Client({
                endPoint: storage_destination.endPoint,
                port: storage_destination.port,
                useSSL: storage_destination.useSSL,
                accessKey: storage_destination.accessKey,
                secretKey: storage_destination.secretKey,
                signatureVersion: storage_destination.signatureVersion
            })
            if (minioClient) {
                return await minioClient.presignedGetObject(storage_destination.bucket, attachment_id)
            } else {
                // todo : inform user
            }
        }

        if (storage_destination.type === globals.F3S) {
            let url = f3s_destinaion.server + ":" + f3s_destinaion.port + "/downloadurl/" + f3s_destinaion.bucket + "/" + attachment_id
            const presigned = await fetch(url);
            response = await presigned.json()

            return response
        }
    }
}
//------------------------ upload Document -------------------
exports.getPreparedUploadURL = async (attachment_id) => {
         let attachment = await Attachment.findById(attachment_id).populate('document')
    if (attachment) {
        let storage_destination = minio_destination

        if (attachment.storage) {
            storage_destination = attachment.storage
        }

        if (storage_destination.type === globals.MIO) {
            var minioClient = new Minio.Client({
                endPoint: storage_destination.endPoint,
                port: storage_destination.port,
                useSSL: storage_destination.useSSL,
                accessKey: storage_destination.accessKey,
                secretKey: storage_destination.secretKey,
                signatureVersion: storage_destination.signatureVersion
            })
            if (minioClient) {
                let url = await minioClient.presignedPutObject(storage_destination.bucket, attachment_id)
                return url
            } else {
                // todo : inform user 
            }
        }

        if (storage_destination.type = globals.F3S) {
            //todo fetch f3s url to get presignedUrl
            let url = f3s_destinaion.server + ":" + f3s_destinaion.port + "/uploadurl/" + f3s_destinaion.bucket + "/" + attachment_id
            const presigned = await fetch(url);
            response = await presigned.json()

            return response
        }
    }
}
//------------- User Storage -------------------
exports.getUserStorage = async (user_id) => {
    try {
        if (user_id) {
            let user = await User.findById(user_id)
            if (user) {
                let storage = await Storage.findById(user.storage)
                return storage
            } else {
                return getDefaultStorage()
            }
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } catch (err) {
        Logger.error(err.message)
    }
}

//-------------- Default Storage : for new users ------------
exports.getDefaultStorage = async () => {
    try {
        let default_storage = await Storage.findOne({ default_storage: true })
        if (default_storage) {
            return default_storage
        }
        throw new Errors.InvalidDataError('default storage not found')
    } catch (err) {
        Logger.error(err.message)
    }
}

//----------------- add storage ----------------

exports.createStorage = async (_storage) => {
    try {
        let currentStorage = new Storage({
            storage: _storage.storage,
            type: _storage.type,
            params: _storage.params,
            default_storage: _storage.default_storage,
            owner: getUserId()
        })
        await currentStorage.save()
        Logger.info('create Storage',currentStorage)
        return currentStorage
    }
    catch (err) {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//----------------- get storage ----------------

exports.getStorage = async (storage_id) => {
    if (storage_id) {
        let storage = await Storage.findById(storage_id)
        Logger.info('get storage', storage)
        return storage
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//-----------------edit storage--------------

exports.editStorage = async (storage_id, update) => {
    if (storage_id && update) {
        let currentStorage = await Storage.findByIdAndUpdate(storage_id, update, { new: true });
        if (currentStorage) {
            Logger.info('edit storage', currentStorage)
            return currentStorage
        } else {
            throw new Errors.InvalidDataError('Undefined argument')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}

//----------------- activate storage ----------------

exports.activateStorage = async (storage_id) => {
    if (storage_id) {
        let storage = await Storage.findById(storage_id)
        if (storage.status !== 'ACTIVE') {
            storage.status = 'ACTIVE'
            await storage.save();
            Logger.info('activate storage', storage)
            return storage
        } else {
            throw new Errors.InvalidDataError('Already Active')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}


//-----------------deactivate storage--------------

exports.deactivateStorage = async (storage_id) => {
    if (storage_id) {
        let storage = await Storage.findById(storage_id)
        if (storage.status !== 'DESACTIVATED') {
            storage.status = "DESACTIVATED"
            await storage.save();
            Logger.info('deactivate storage', storage)
            return storage
        } else {
            throw new Errors.InvalidDataError('Already Desactivated')
        }
    } else {
        throw new Errors.InvalidDataError('Undefined argument')
    }
}
