const { app, BrowserWindow, ipcMain, screen, Tray } = require('electron');
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
    width: 350, // 1000,
    height: 600,
    // resizable: false,
    useContentSize: true,
    icon: __dirname + '/assets/icons/64x64.png',
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


  ipcMain.on('mouse-event-channel', (event) => {
    let mousePos = screen.getCursorScreenPoint();
    event.sender.send('mouse-event-channel', mousePos);
  });

  ipcMain.on('screenshot-channel', (event, message) => {
    const screenWidth = robot.getScreenSize().width;

    screenshotDialog = new BrowserWindow({
      width: 250,
      height: 175,
      x: screenWidth - 250,
      y: 0,
      show: false,
      focusable: false,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
      },
      frame: false,
      autoHideMenuBar: true,
      resizable: false
    })

    screenshotDialog.loadURL(url.format({
      pathname: path.join(__dirname, `electron/screenshot-dialog/screenshot-dialog.html`),
      protocol: "file",
      slashes: true
    }))

    setTimeout(() => {
      screenshotDialog.webContents.send('screenshot-dialog-channel', message);
      setTimeout(() => {
        screenshotDialog.show();
      }, 200);
    }, 200);

    ipcMain.once('screenshot-dialog-channel', (sDEvent, sDMessage) => {
      sDMessage ? event.sender.send('screenshot-channel', {status: true, screenshot: message}) :
        event.sender.send('screenshot-channel', {status: false, screenshot: message});
      screenshotDialog.close();
    });

    ipcMain.on('screenshot-dialog-resize-channel', (sDREvent, sDRMessage) => {
      screenshotDialog.setSize(1500, 900);
      screenshotDialog.center();
    });


    screenshotDialog.on('closed', () => {
      ipcMain.removeAllListeners('screenshot-dialog-resize-channel');
      screenshotDialog = null;
    });
  });

  win.on('close', (e) => {
    // updating back-end if closing from TimeTrackerComponent
    win.webContents.send('closing-channel');

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
    ipcMain.removeAllListeners('screenshot-channel');
    ipcMain.removeAllListeners('screenshot-dialog-channel');
    ipcMain.removeAllListeners('mouse-event-channel');
    win = null;
  });
}
