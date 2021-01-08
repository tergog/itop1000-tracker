const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const screenshotService = require('../_middleware/screenshots.service');
const storageService = require('../_middleware/storage.service');
const config = require('../../config.json');
const db = require('../_helpers/db');
const Account = db.Account;

module.exports = {
  authenticate,
  getUserProjects,
  updateWorkTime,
  takeScreenshot,
}

async function authenticate({ email, password }) {
  const account = await Account.findOne({ email, isVerified: true });
  if (account && bcrypt.compareSync(password, account.passwordHash)) {
    // return basic details and auth token
    const token = jwt.sign(account.passwordHash, config.secret);
    return { token };
  }
}

async function getUserProjects(token) {
  const account = await getAccount(token);
  return basicDetails(account);
}

async function updateWorkTime(token, { projectId, workTime }) {
  const account = await getAccount(token);
  await defaultProjectUpdating(account, projectId, workTime);
  return basicDetails(account)
}

async function takeScreenshot(token, { projectId, workTime }) {
  const account = await getAccount(token);
  const project = account.activeProjects[projectId];

  // create screenshot and get name
  const link = await screenshotService.takeScreenshots();

  // create screenshot path for storage and upload screenshot
  const screenshotLink = [project.employerId, project.title, account._id, link].join('/');
  const storageImageLink = await storageService.uploadFile(screenshotLink,`./public/screenshots/${link}`)

  // delete image from app
  await fs.unlinkSync(`./public/screenshots/${link}`);

  // return updated account with screenshot link
  account.activeProjects[projectId].screenshots.push({ link: storageImageLink, dateCreated: Date.now() });
  await defaultProjectUpdating(account, projectId, workTime);
  return basicDetails(account);
}

async function getAccount(token) {
  const userPasswordHash = jwt.verify(token, config.secret);
  return Account.findOne({ "passwordHash": userPasswordHash });
}

async function defaultProjectUpdating(account, projectId, workTime) {
  account.activeProjects[projectId].workTime = workTime;
  account.activeProjects[projectId].dateUpdated = Date.now();
  await account.save();
}

function basicDetails(account) {
  const { id, activeProjects } = account;
  return { id, activeProjects };
}

