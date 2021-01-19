const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const jwtDecode = require('jwt-decode');
const url = require("url");
const path = require("path");


// add back-end dependencies for rebuild to electron ABI
const appServer = require("./back-end/index");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const robot = require('robotjs');
const Jimp = require('jimp');
const { Storage } = require('@google-cloud/storage');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');


let win;
let screenshotDialog;

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {

  // window config

  win = new BrowserWindow({
    width: 1000, // 350,
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

  // start back-end server
  appServer.listen(3000, () => {
    console.log("server has been started");
  })


  // get front-end from dist folder for prod

  // win.loadURL(url.format({
  //     pathname: path.join(__dirname, `dist/index.html`),
  //     protocol: "file",
  //     slashes: true
  //   })
  // );


  // get front-end from "ng serve"  for development

  win.loadURL("http://localhost:4200");


  ipcMain.on('mouse-event-channel', (event, message) => {
    let mousePos = screen.getCursorScreenPoint();
    event.sender.send('mouse-event-channel', mousePos);
  });

  // TODO screenshot dialog window
  ipcMain.on('screenshot-channel', (event, message) => {
    const screenWidth = robot.getScreenSize().width;

    screenshotDialog = new BrowserWindow({
      width: 250,
      height: 180,
      x: screenWidth - 250,
      y: 0,
      show: false,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
      },
      frame: false,
      autoHideMenuBar: true,
      resizable: false
    })

    screenshotDialog.loadURL(url.format({
      pathname: path.join(__dirname, `electron/screenshot.html`),
      protocol: "file",
      slashes: true
    }))

    setTimeout(() => {
      screenshotDialog.webContents.send('screenshot-dialog-channel', message);
      setTimeout(() => {
        screenshotDialog.show();
      }, 200);
    }, 100);

    ipcMain.once('screenshot-dialog-channel', (sDEvent, sDMessage) => {
      sDMessage ? event.sender.send('screenshot-channel', message) : event.sender.send('screenshot-channel', false);
      screenshotDialog.close();
    });


    screenshotDialog.on('closed', () => {
      screenshotDialog = null;
    });
  });

  win.on('close', (e) => {

    // open dialog window

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
      let ses = win.webContents.session;
      ses.clearStorageData().then(() => console.log('localStorage clean'));
    }
  });

  win.on('closed', () => {
    win = null;
  });
}


// get users token and update ActiveProject workTime

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

  return { token, projectId, workTime };
}
