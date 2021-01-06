const config = require('../../config.json');
const db = require('../_helpers/db');
const Account = db.Account;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const screenshotService = require('../_middleware/screenshots.service');
const storageService = require('../_middleware/storage.service');
const fs = require('fs');

module.exports = {
  authenticate,
  updateWorkTime,
  takeScreenshot,
}

async function authenticate({ email, password }) {
  const account = await Account.findOne({ email, isVerified: true });
  if (account && bcrypt.compareSync(password, account.passwordHash)) {
    // return basic details and auth token
    const token = jwt.sign({ ...basicDetails(account) }, config.secret);
    return { token };
  }
}

async function updateWorkTime(token, { projectId, workTime }) {
  const account = await getAccount(token).then(u => u);

  await defaultProjectUpdating(account, projectId, workTime);

  const response = jwt.sign({ ...basicDetails(account) }, config.secret);

  return { response }
}

async function takeScreenshot(token, { projectId, workTime }) {
  const account = await getAccount(token).then(u => u);
  const project = account.activeProjects[projectId];

  const link = await screenshotService.takeScreenshots();

  console.log(link);

  const screenshotLink = [project.employerId, project.title, account._id, link].join('/');
  const storageImageLink = await storageService.uploadFile(screenshotLink, `./public/screenshots/${link}`)

  console.log(storageImageLink);

  // await fs.unlinkSync(`./public/screenshots/${link}`)

  account.activeProjects[projectId].screenshots.push({ link: storageImageLink, dateCreated: Date.now() });

  await defaultProjectUpdating(account, projectId, workTime);

  const response = jwt.sign({ ...basicDetails(account) }, config.secret);
  return { response }
}

async function getAccount(token) {
  const userId = jwt.verify(token, config.secret).id;
  return Account.findOne({ "_id": userId });
}

async function defaultProjectUpdating(account, projectId, workTime) {
  account.activeProjects[projectId].workTime = workTime;
  account.activeProjects[projectId].dateUpdated = Date.now();

  await account.save();
}

function basicDetails(user) {
  const { id, activeProjects } = user;
  return { id, activeProjects };
}

