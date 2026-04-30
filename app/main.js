const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const vm = require('./vm');
const api = require('./api');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900, height: 600,
    title: 'InstantVM',
    backgroundColor: '#060810',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  mainWindow.loadURL('https://teslasolar.github.io/instantvm/pages/');
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  api.start();
  createWindow();
});
app.on('window-all-closed', () => { vm.kill(); api.stop(); app.quit(); });

ipcMain.handle('vm-list', () => vm.list());
ipcMain.handle('vm-status', () => vm.status());
ipcMain.handle('vm-launch', (_, name) => vm.launchTemplate(name));
ipcMain.handle('vm-kill', () => ({ ok: vm.kill() }));
