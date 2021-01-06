const { Storage } = require('@google-cloud/storage');
const config = require('../../config.json');
const path = require("path");

async function uploadFile(key, file) {

    const storage = new Storage({keyFilename: path.join(__dirname, `../../${config.storageConfigFile}`)});

    const bucketName = config.storageBucketName;

    const res = await storage.bucket(bucketName).upload(file, {
        destination: key,
    });
    const url = res[0].metadata.mediaLink;

    await storage.bucket(bucketName).file(key).makePublic();

    return url;
}

module.exports = {
    uploadFile
}
