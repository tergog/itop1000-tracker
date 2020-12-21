import { app, BrowserWindow, ipcMain, screen } from 'electron';
import jwtDecode from 'jwt-decode';
import { interval, Subscription } from 'rxjs';


let win: BrowserWindow;

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
      enableRemoteModule: true
    }
  });

  win.loadURL('http://localhost:4500');

  win.webContents.openDevTools();
  let ses = win.webContents.session;

  let mouseInterval: Subscription;

  ipcMain.on('mouse-event-channel', (event, message) => {
    let lastMousePos = {x: 0, y: 0};

    if (message === 'off') {
      mouseInterval.unsubscribe();
      return;
    }

    if (message === 'on') {
      mouseInterval = interval(1000 * 10).subscribe(() => {
        let mousePos = screen.getCursorScreenPoint();
        event.sender.send('mouse-event-channel', lastMousePos.x !== mousePos.x || lastMousePos.y !== mousePos.y);
        lastMousePos = mousePos;
      });
    }
  });

  win.on('close', (e) => {
    updateWorkTimeData()
      .then(data => {
        const postData: any = JSON.stringify({projectId: data.projectId, workTime: data.workTime});

        const {net} = require('electron');

        const request = net.request({
          method: 'POST',
          url: 'http://localhost:3000/users/update',
        });
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('authorization', `Bearer ${data.token}`);

        request.on('response', (response) => {
          response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
          });
          response.on('end', () => {
          });
        });

        request.write(postData);
        request.end();
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
  const workTime = user.projects[projectId].workTime;
  const token = localStorageData.token;

  return {projectId, workTime, token};
}


