import { app, BrowserWindow } from 'electron';
import jwtDecode from 'jwt-decode';
import fetch from 'electron-fetch';
import FormData =  require('form-data');


let win: BrowserWindow;

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  win = new BrowserWindow({
    width: 2000,
    height: 600,
    // resizable: false,
    useContentSize: true,
    // autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

  win.loadURL('http://localhost:4200');

  win.webContents.openDevTools();
  let ses = win.webContents.session;

  win.on('close', (e) => {
    updateWorkTimeData()
      .then(data => {
        const form = new FormData();
        const body: any = {projectId: data.projectId, workTime: data.workTime, interval: data.interval};
        const sendData =

        fetch('http://localhost:3000/users/update', {
          method: 'POST',
          body: body,
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        })
      });


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

  const user: any = jwtDecode(localStorageData.token);

  const projectId = Number(localStorageData.activeProject);
  const project = user.projects[projectId];
  const workTime = new Date(Date.now()).getTime() - new Date(project.dateUpdated).getTime();
  const interval = Math.floor(project.interval - (workTime / 1000));
  const token = localStorageData.token;

  return {projectId, workTime, interval, token};
}


