/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates` callback from `updater` for the click property of `Check Updates...` MenuItem.
 */
const { app, dialog, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')

let updater;
autoUpdater.autoDownload = false

autoUpdater.on('error', (error) => {
  //dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

autoUpdater.on('update-available', (info) => {
  var dock = app.dock
  dock.setBadge('' + 1)

  dialog.showMessageBox({
    type: 'info',
    title: 'Update verfügbar',
    message: 'Version '+info.version+' ist verfügbar, jetzt herunter laden?',
    buttons: ['Ja', 'Später']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate()
    }
    else {
      if (!updater == null) {
        updater.enabled = true
        updater = null
      }
    }
  })
})

autoUpdater.on('update-not-available', (info) => {
  var dock = app.dock
  if (!updater == null) {
    dock.setBadge('')

    dialog.showMessageBox({
      title: 'Kein Update verfügbar',
      message: app.getName() + ' Version: '+info.version+' ist die aktuellste Version!'
    })

    updater.enabled = true
    updater = null
  }
})

autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    title: 'Update ist bereit zum installieren',
    message: app.getName() + ' Version: '+info.version+' wurde herunter geladen und wird jetzt automatisch installiert.'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
    app.quit();
  })
})

autoUpdater.on('download-progress', (progressObj) => {
  var win = BrowserWindow.getAllWindows()[0];
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  // Use values 0 to 1, or -1 to hide the progress bar
  win.setProgressBar(progressObj.percent || -1) // Progress bar works on all platforms
})

// export this to MenuItem click callback
function checkForUpdates(menuItem, focusedWindow, event) {
  updater = menuItem;
  updater.enabled = false;
  autoUpdater.checkForUpdatesAndNotify();
  //autoUpdater.checkForUpdates()
}
module.exports.checkForUpdates = checkForUpdates