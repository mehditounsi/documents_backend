const crypto = require('crypto');

// --------------- Return Salt --------------
exports.getRandaomSalt = async () => {
    const salt = crypto.randomBytes(16).toString("hex");
    return salt
}

exports.getHashedPassword = async (password, salt ) =>{
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'))
        });
    })

}