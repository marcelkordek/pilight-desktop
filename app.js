'use strict';
const path = require('path');
const fs = require('fs');
const {app, BrowserWindow, shell, Tray, Menu} = require('electron');
const appMenu = require('./menu');

let mainWindow;
let appIcon;

function createMainWindow() {
  const windowStateKeeper = require('electron-window-state');

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 720
  });

  const win = new BrowserWindow({
    title: app.getName(),
    show: false,
    icon: process.platform === 'linux' && path.join(__dirname, 'media', 'logo.png'),
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 400,
    minHeight: 200,
    webPreferences: {
      preload: path.join(__dirname, 'browser.js'),
      nodeIntegration: false,
      webSecurity: true,
      plugins: true
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff'
    });

  mainWindowState.manage(win);

  win.loadURL('http://rpiremote.local:5001/bootstrap/index.html', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
  });
  //win.toggleDevTools();
  win.on('closed', () => app.quit);
  //win.on('page-title-updated', (e, title) => updateBadge(title));
  win.on('close', e => {
    if (process.platform === 'darwin' && !win.forceClose) {
      e.preventDefault();
      win.hide();
    } else if (process.platform === 'win32' && configStore.get('closeToTray')) {
      win.hide();
      e.preventDefault();
    }
  });
  win.on('minimize', () => {
    if (process.platform === 'win32' && configStore.get('minimizeToTray')) {
      win.hide();
    }
  });
  return win;
}

function createTray() {
  appIcon = new Tray(path.join(__dirname, 'media', 'logo-tray.png'));
  appIcon.setPressedImage(path.join(__dirname, 'media', 'logo-tray-white.png'));
  appIcon.setContextMenu(appMenu.trayMenu);

  appIcon.on('double-click', () => {
    mainWindow.show();
  });
}

app.on('ready', () => {
  Menu.setApplicationMenu(appMenu.mainMenu);

  mainWindow = createMainWindow();
  //createTray();

  const page = mainWindow.webContents;

  page.on('dom-ready', () => {
    page.insertCSS(fs.readFileSync(path.join(__dirname, 'custom.css'), 'utf8'));
    mainWindow.show();
  });

  page.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  page.on('did-finish-load', () => {
    mainWindow.setTitle(app.getName());
  });
});

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
  app.quit();
});

app.on('before-quit', () => {
  mainWindow.forceClose = true;
});

app.on('activate', () => {
  mainWindow.show();
});
