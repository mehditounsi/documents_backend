const dotenv = require('dotenv');

dotenv.config();



const env = {
    jwt_secret: process.env.JWT_SIGN_SECRET,
    token_expiration : process.env.TOKEN_EXPIRATION || 12,
    base_url :process.env.BASE_URL,
    port: {
        http: process.env.PORT_HTTP,
        https: process.env.PORT_HTTPS,
        cert_path: process.env.CERT_PATH
    },
    database: {
        port: process.env.DB_PORT,
        server: process.env.DB_SERVER,
        name: process.env.DB_NAME
    },
    logs: {
        console: process.env.LOG_CONSOLE,
        console_level: process.env.LOG_CONSOLE_LEVEL,
        file: process.env.LOG_FILE,
        file_level: process.env.LOG_FILE_LEVEL,
        file_path: process.env.LOG_FILE_PATH,
        mongo: process.env.LOG_MONGO,
        mongo_level: process.env.LOG_MONGO_LEVEL,
        mongo_url: process.env.LOG_MONGO_URL,
        sentry: process.env.LOG_SENTRY,
        sentry_level: process.env.LOG_SENTRY_LEVEL,
        sentry_dns: process.env.SENTRY_DNS,
    },
    redis: {
        server: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
    },
    storage: {
        path: process.env.STORAGE_PATH,
        tmp: process.env.STORAGE_TMP,
        tmp_path: process.env.STORAGE_TMPPATH
    },
    minio: {
        server: process.env.MINIO_SERVER,
        port: process.env.MINIO_PORT,
        ssl: process.env.MINIO_SSL,
        access: process.env.MINIO_ACCESS,
        secret: process.env.MINIO_SECRET,
        version: process.env.MINIO_VERSION,
        bucket: process.env.MINIO_BUCKET
    },
    sms: {
        token: process.env.SMS_TOKEN,
        appName: process.env.SMS_APPNAME,
        host: process.env.SMS_HOST,
        validity : process.env.VERIFICATION_CODE_VALIDITY || 10
    },
    mailing: {
        host: process.env.MAILING_HOST,
        port: process.env.MAILING_PORT,
        from: process.env.MAILING_FROM,
        user: process.env.MAILING_USER,
        password: process.env.MAILING_PASSWORD,
        sender: process.env.MAILER_SENDER
    }
}


module.exports = env;