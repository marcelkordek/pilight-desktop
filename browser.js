'use strict';
const electron = require('electron');

const ipc = electron.ipcRenderer;
const configStore = electron.remote.require('./config');

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark-mode', configStore.get('darkMode'));
  document.querySelector('body').classList.remove('bg-light');
}

ipc.on('toggleDarkMode', toggleDarkMode);

document.addEventListener('DOMContentLoaded', () => {
  toggleDarkMode();
});

