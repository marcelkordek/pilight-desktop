'use strict';
const {app, BrowserWindow, Menu, shell} = require('electron');
const os = require('os');
const configStore = require('./config');
const isDev = require('electron-is-dev');

//const appName = app.getName();
const appName = app.getName();

function restoreWindow() {
  const win = BrowserWindow.getAllWindows()[0];
  win.show();
  return win;
}

function sendAction(action) {
  const win = BrowserWindow.getAllWindows()[0];
  win.webContents.send(action);
}

const trayTpl = [
  {
    label: 'Show',
    click() {
      restoreWindow();
    }
  },

  {
    type: 'separator'
  },
  {
    label: `Quit ${appName}`,
    click() {
      app.exit(0);
    }
  }
];

const darwinTpl = [
  {
    label: appName,
    submenu: [
      {
        label: `Über ${appName}`,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: `${appName} ausblenden`,
        accelerator: 'Cmd+H',
        role: 'hide'
      },
      {
        label: 'Andere ausblenden',
        accelerator: 'Cmd+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Alle einblenden',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: `${appName} beenden`,
        accelerator: 'Cmd+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
 {
    label: 'Einstellungen',
    submenu: [
      {
        label: 'Neuladen',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Developer-Tools einblenden',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        },
        visible: isDev
      }
    ]
  },
  {
    label: 'Fenster',
    role: 'window',
    submenu: [
      {
        label: 'Minimieren',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Schließen',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        type: 'separator'
      },
      {
        label: 'Alle nach vorne bringen',
        role: 'front'
      },
      {
        label: 'Vollbild',
        accelerator: 'Ctrl+Cmd+F',
        click() {
          const win = BrowserWindow.getAllWindows()[0];
          win.setFullScreen(!win.isFullScreen());
        }
      }
    ]
  },
  {
    label: 'Hilfe',
    role: 'help'
  }
];

const linuxTpl = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Enable dark mode',
        type: 'checkbox',
        checked: configStore.get('darkMode'),
        click(item) {
          configStore.set('darkMode', item.checked);
          sendAction('toggleDarkMode');
        }
      }
    ]
  },

  {
    label: 'Help',
    role: 'help'
  }
];

const winTpl = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Minimize to tray',
        type: 'checkbox',
        checked: configStore.get('minimizeToTray'),
        click(item) {
          configStore.set('minimizeToTray', item.checked);
        }
      },
      {
        label: 'Close to tray',
        type: 'checkbox',
        checked: configStore.get('closeToTray'),
        click(item) {
          configStore.set('closeToTray', item.checked);
        }
      },
      {
        label: 'Enable dark mode',
        type: 'checkbox',
        checked: configStore.get('darkMode'),
        click(item) {
          configStore.set('darkMode', item.checked);
          sendAction('toggleDarkMode');
        }
      }
    ]
  },
  {
    label: 'Help',
    role: 'help'
  }
];

const helpSubmenu = [
  {
    label: `${appName} Website...`,
    click() {
      shell.openExternal('https://github.com/mawie81/whatsdesktop');
    }
  },
  {
    label: 'Report an Issue...',
    click() {
      const body = `
**Please succinctly describe your issue and steps to reproduce it.**

-

${app.getName()} ${app.getVersion()}
${process.platform} ${process.arch} ${os.release()}`;

      shell.openExternal(`https://github.com/mawie81/whatsdesktop/issues/new?body=${encodeURIComponent(body)}`);
    }
  }
];

let tpl;
if (process.platform === 'darwin') {
  tpl = darwinTpl;
} else if (process.platform === 'win32') {
  tpl = winTpl;
} else {
  tpl = linuxTpl;
}

tpl[tpl.length - 1].submenu = helpSubmenu;

module.exports = {
  mainMenu: Menu.buildFromTemplate(tpl),
  trayMenu: Menu.buildFromTemplate(trayTpl)
};
