const { Storage } = require('@google-cloud/storage');
const config = require('../../config.json');
const path = require('path');

module.exports = {
  uploadFile,
  deleteFile
}

const storage = new Storage({ keyFilename: path.join(__dirname, `../../${config.storageConfigFile}`) });
const bucketName = config.storageBucketName;


/**
 *
 * @param key - path in storage
 * @param file - path in app
 * @returns {Promise<*>}
 */
async function uploadFile(key, file) {
  const res = await storage.bucket(bucketName).upload(file, {
    destination: key,
  });
  const url = res[0].metadata.mediaLink;

  // make image public
  await storage.bucket(bucketName).file(key).makePublic();

  return url;
}


async function deleteFile(screenshotLink) {
  let link = screenshotLink.split('/');
  link = link[link.length - 1].split('%2F');

  const employer = link[0];
  const project = link[1].split('%20').join(' ');
  const worker = link[2];
  const fileName = link[link.length - 1].split('?')[0];

  const prefix = [employer, project, worker, fileName].join('/');

  storage.bucket(bucketName).deleteFiles( { prefix }, (error) => console.log(error));
}
