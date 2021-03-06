"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var jwt_decode_1 = require("jwt-decode");
var rxjs_1 = require("rxjs");
var win;
electron_1.app.on('ready', createWindow);
electron_1.app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
function createWindow() {
    win = new electron_1.BrowserWindow({
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
    var ses = win.webContents.session;
    var mouseInterval;
    electron_1.ipcMain.on('mouse-event-channel', function (event, message) {
        var lastMousePos = { x: 0, y: 0 };
        console.log(message);
        if (message === 'off') {
            mouseInterval.unsubscribe();
            return;
        }
        if (message === 'on') {
            mouseInterval = rxjs_1.interval(1000 * 10).subscribe(function () {
                var mousePos = electron_1.screen.getCursorScreenPoint();
                event.sender.send('mouse-event-channel', lastMousePos.x !== mousePos.x || lastMousePos.y !== mousePos.y);
                lastMousePos = mousePos;
            });
        }
    });
    win.on('close', function (e) {
        updateWorkTimeData()
            .then(function (data) {
            var postData = JSON.stringify({ projectId: data.projectId, workTime: data.workTime });
            var net = require('electron').net;
            var request = net.request({
                method: 'POST',
                url: 'http://localhost:3000/users/update',
            });
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('authorization', "Bearer " + data.token);
            request.on('response', function (response) {
                response.on('data', function (chunk) {
                    console.log("BODY: " + chunk);
                });
                response.on('end', function () {
                });
            });
            request.write(postData);
            request.end();
        });
        var choice = require('electron').dialog.showMessageBoxSync(win, {
            'type': 'question',
            'buttons': ['Yes', 'No'],
            'title': 'Confirm',
            'message': 'Are you sure you want to quit?'
        });
        if (choice === 1) {
            e.preventDefault();
        }
        else {
            ses.clearStorageData().then(function () { return console.log('localStorage clean'); });
        }
    });
    win.on('closed', function () {
        win = null;
    });
}
function updateWorkTimeData() {
    return __awaiter(this, void 0, void 0, function () {
        var localStorageData, user, projectId, workTime, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, win.webContents.executeJavaScript('({...localStorage});')
                        .then(function (result) {
                        localStorageData = result;
                    })];
                case 1:
                    _a.sent();
                    if (!localStorageData.activeProject) {
                        return [2 /*return*/];
                    }
                    user = jwt_decode_1.default(localStorageData.token);
                    projectId = Number(localStorageData.activeProject);
                    workTime = user.projects[projectId].workTime;
                    token = localStorageData.token;
                    return [2 /*return*/, { projectId: projectId, workTime: workTime, token: token }];
            }
        });
    });
}
//# sourceMappingURL=main.js.map