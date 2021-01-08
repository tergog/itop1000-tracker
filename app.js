const { app, BrowserWindow, ipcMain, screen } = require('electron');
const jwtDecode = require('jwt-decode');
const { interval } = require('rxjs');
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

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {

  // window config

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


  // start back-end server

  appServer.listen(3000, () => {
    console.log("server has been started");
  })


  // get front-end from dist folder for prod

  win.loadURL(url.format({
      pathname: path.join(__dirname, `dist/index.html`),
      protocol: "file",
      slashes: true
    })
  );


  // get front-end from "ng serve"  for development

  // win.loadURL("http://localhost:4200");


  // TODO mouse action detect
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

  return {token, projectId, workTime};
}
