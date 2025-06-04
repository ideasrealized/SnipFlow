const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let overlayWindow;

function createTestOverlay() {
  const workArea = screen.getPrimaryDisplay().workArea;
  
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 500,
    x: workArea.x + workArea.width - 400,
    y: workArea.y + 100,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'dist/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  overlayWindow.loadFile(path.join(__dirname, 'dist/overlay.html'));
  overlayWindow.webContents.openDevTools({ mode: 'detach' });

  // Show overlay after 2 seconds
  setTimeout(() => {
    console.log('Showing test overlay...');
    overlayWindow.show();
    overlayWindow.webContents.send('overlay:show', { position: 'right-center' });
  }, 2000);

  // Hide overlay after 10 seconds
  setTimeout(() => {
    console.log('Hiding test overlay...');
    overlayWindow.webContents.send('overlay:hide');
  }, 10000);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    app.quit();
  });
}

app.whenReady().then(() => {
  createTestOverlay();
});

app.on('window-all-closed', () => {
  app.quit();
}); 