const { app, BrowserWindow } = require('electron');
const path = require('path');

function createTestWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'packages/desktop/dist/overlay.html'));
  win.webContents.openDevTools();
  
  return win;
}

app.whenReady().then(() => {
  createTestWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createTestWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
