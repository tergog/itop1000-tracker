const { app, BrowserWindow, ipcMain, screen } = require('electron');
const jwtDecode = require('jwt-decode');
const { interval } = require('rxjs');
const url = require("url");
const path = require("path");


const robot = require('robotjs');
const Jimp = require('jimp');
const { Storage } = require('@google-cloud/storage');
const config = require('./middlewares/config.json');
const db = require('./middlewares/_helpers/db');
const Account = db.Account;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const fs = require('fs');


let win;

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  win = new BrowserWindow({
    width: 350,
    height: 600,
    // resizable: false,
    useContentSize: true,
    // autoHideMenuBar: true,
    webPreferences: {
      // devTools: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  // win.loadURL(url.format({
  //     pathname: path.join(__dirname, `dist/index.html`),
  //     protocol: "file",
  //     slashes: true
  //   })
  // );

  win.loadURL("http://localhost:4200");

  let ses = win.webContents.session;

  authenticate();
  updateWorkTime();
  screenshot();

  //
  // let mouseInterval;
  // ipcMain.on('mouse-event-channel', (event, message) => {
  //   let lastMousePos = {x: 0, y: 0};
  //
  //   if (message === 'off') {
  //     mouseInterval && mouseInterval.unsubscribe();
  //     return;
  //   }
  //
  //   if (message === 'on') {
  //     mouseInterval = interval(1000 * 10).subscribe(() => {
  //       let mousePos = screen.getCursorScreenPoint();
  //       event.sender.send('mouse-event-channel', lastMousePos.x !== mousePos.x || lastMousePos.y !== mousePos.y);
  //       lastMousePos = mousePos;
  //     });
  //   }
  // });

  win.on('close', (e) => {
    const choice = require('electron').dialog.showMessageBoxSync(win,
      {
        'type': 'question',
        'buttons': ['Yes', 'No'],
        'title': 'Confirm',
        'message': 'Are you sure you want to quit?'
      });
    if (choice === 1) {
      e.preventDefault();
    } else {
      ses.clearStorageData().then(() => console.log('localStorage clean'));
    }
  });

  win.on('closed', () => {
    win = null;
  });

}

async function updateWorkTimeData() {
  let localStorageData;

  await win.webContents.executeJavaScript('({...localStorage});')
    .then(result => {
      localStorageData = result;
    });

  if (!localStorageData.activeProject) {
    return;
  }

  const user = jwtDecode(localStorageData.token);

  const projectId = Number(localStorageData.activeProject);
  const workTime = user.activeProjects[projectId].workTime;
  const token = localStorageData.token;

  return {token, projectId, workTime};
}

function authenticate() {
  ipcMain.on('authenticate', async (event, message) => {
    const account = await Account.findOne({ email: message.email, isVerified: true });
    if (account && bcrypt.compareSync(message.password, account.passwordHash)) {
      // return basic details and auth token
      const token = jwt.sign({ ...basicDetails(account) }, config.secret);
      event.sender.send('authenticate', { token });
    }
  });
}

function updateWorkTime() {
  ipcMain.on('updateWorkTime', async (event, message) => {
    const account = await getAccount(message.token).then(u => u);

    await defaultProjectUpdating(account, message.projectId, message.workTime);

    const response = jwt.sign({ ...basicDetails(account) }, config.secret);

    event.sender.send('updateWorkTime', { response });
  });
}

function screenshot() {
  ipcMain.on('takeScreenshot', async (event, message) => {
    const account = await getAccount(message.token).then(u => u);
    const project = account.activeProjects[message.projectId];

    try {
      const link = await takeScreenshots();
      const screenshotLink = [project.employerId, project.title, account._id, link].join('/');
      const storageImageLink = await uploadFile(screenshotLink, `./public/screenshots/${link}`);
      await fs.unlinkSync(`./public/screenshots/${link}`);
      account.activeProjects[message.projectId].screenshots.push({ link: storageImageLink, dateCreated: Date.now() });
    } catch(e) {
      console.log(e, 'Screenshot saving have been crushed');
    }

    await defaultProjectUpdating(account, message.projectId, message.workTime);

    const response = jwt.sign({ ...basicDetails(account) }, config.secret);
    event.sender.send('takeScreenshot', { response });
  });
}



async function takeScreenshots() {

  const screenWidth = robot.getScreenSize().width;
  const screenHeight = robot.getScreenSize().height;

  const img = robot.screen.capture(0, 0, screenWidth, screenHeight);
  const path = './public/screenshots/' + String(Date.now()) + '.png';

  // Create a new blank image, same size as Robotjs' one
  let jimp = new Jimp(screenWidth, screenHeight);

  for (let x=0; x < screenWidth; x++) {
    for (let y=0; y < screenHeight; y++) {
      let index = (y * img.byteWidth) + (x * img.bytesPerPixel);
      let r = img.image[index];
      let g = img.image[index+1];
      let b = img.image[index+2];
      let num = (r*256) + (g*256*256) + (b*256*256*256) + 255;
      jimp.setPixelColor(num, x, y);
    }
  }

  await jimp.write(path);

  const pathArr = path.split('/');
  return pathArr[pathArr.length - 1];
}

async function uploadFile(key, file) {

  const storage = new Storage({keyFilename: config.storageConfigFile});

  const bucketName = config.storageBucketName;

  const res = await storage.bucket(bucketName).upload(file, {
    destination: key,
  });
  const url = res[0].metadata.mediaLink;

  await storage.bucket(bucketName).file(key).makePublic();

  return url;
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
