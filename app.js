const { app, BrowserWindow, ipcMain, screen } = require('electron');
const jwtDecode = require('jwt-decode');
const { interval } = require('rxjs');
const url = require("url");
const path = require("path");

const middlewares = require("./middlewares/accounts/accounts.controller");


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

  win.loadURL(url.format({
      pathname: path.join(__dirname, `dist/index.html`),
      protocol: "file",
      slashes: true
    })
  );

  // win.loadURL("http://localhost:4200");

  let ses = win.webContents.session;

  middlewares.authenticate();
  middlewares.updateWorkTime();
  middlewares.screenshot();
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
    updateWorkTimeData().then(data => {
      middlewares.updateWorkTime(data).then( () => console.log('workTime updated'));
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

  const user = jwtDecode(localStorageData.token);

  const projectId = Number(localStorageData.activeProject);
  const workTime = user.activeProjects[projectId].workTime;
  const token = localStorageData.token;

  return {token, projectId, workTime};
}


