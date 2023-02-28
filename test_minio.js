
const configuration = require('./config/config')

(async () => {
    require('dotenv').config();
    const globals = require('./helpers/globals');

    const Minio = require('minio')
    let minio_destination = {
        type: globals.MIO,
        endPoint: configuration.minio.server,
        port: parseInt(configuration.minio.port),
        useSSL: true,
        accessKey: configuration.minio.access,
        secretKey: configuration.minio.secret,
        signatureVersion: configuration.minio.version,
        bucket: configuration.minio.bucket
    }

    let storage_destination = minio_destination

    var minioClient = new Minio.Client({
        endPoint: storage_destination.endPoint,
        port: storage_destination.port,
        useSSL: storage_destination.useSSL,
        accessKey: storage_destination.accessKey,
        secretKey: storage_destination.secretKey,
        signatureVersion: storage_destination.signatureVersion
    })

    if (minioClient) {
                 let url = await minioClient.presignedPutObject(storage_destination.bucket, "attachment_id")
    }
})()