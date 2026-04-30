const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const vm = require('./vm');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900, height: 600,
    title: 'InstantVM',
    backgroundColor: '#060810',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { vm.kill(); app.quit(); });

ipcMain.handle('vm-list', () => vm.list());
ipcMain.handle('vm-status', () => vm.status());
ipcMain.handle('vm-launch', (_, name) => vm.launchTemplate(name));
ipcMain.handle('vm-kill', () => ({ ok: vm.kill() }));
