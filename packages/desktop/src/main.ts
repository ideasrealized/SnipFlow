import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import { join } from 'path';
import { homedir } from 'os';
import * as db from './db';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let mouseCheckInterval: NodeJS.Timeout | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(join(__dirname, 'index.html'));
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  overlayWindow = new BrowserWindow({
    width: 320,
    height: 250,
    x: width - 320,
    y: 0,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  overlayWindow.loadFile(join(__dirname, 'overlay.html'));
  overlayWindow.hide();
  
  // Start mouse position monitoring
  startMouseMonitoring();
}

function startMouseMonitoring() {
  mouseCheckInterval = setInterval(() => {
    if (!overlayWindow) return;
    
    const { x, y } = screen.getCursorScreenPoint();
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    // Trigger overlay when mouse is in top-right corner (within 50px from edges)
    const isInTriggerZone = x > width - 50 && y < 50;
    
    if (isInTriggerZone && !overlayWindow.isVisible()) {
      overlayWindow.showInactive();
    } else if (!isInTriggerZone && overlayWindow.isVisible()) {
      // Add small delay to prevent flicker
      setTimeout(() => {
        if (overlayWindow && !isMouseOverOverlay()) {
          overlayWindow.hide();
        }
      }, 200);
    }
  }, 100);
}

function isMouseOverOverlay(): boolean {
  if (!overlayWindow) return false;
  
  const { x, y } = screen.getCursorScreenPoint();
  const bounds = overlayWindow.getBounds();
  
  return x >= bounds.x && x <= bounds.x + bounds.width &&
         y >= bounds.y && y <= bounds.y + bounds.height;
}

app.whenReady().then(() => {
  createWindow();
  createOverlayWindow();

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createOverlayWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (mouseCheckInterval) {
    clearInterval(mouseCheckInterval);
  }
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('list-snippets', () => db.getSnippets());
ipcMain.handle('create-snippet', (_e: any, content: string) => {
  db.createSnippet(content);
  return db.getSnippets();
});
ipcMain.handle('update-snippet', (_e: any, id: number, content: string) => {
  db.updateSnippet(id, content);
  return db.getSnippets();
});
ipcMain.handle('delete-snippet', (_e: any, id: number) => {
  db.deleteSnippet(id);
  return db.getSnippets();
});

ipcMain.on('hide-overlay', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});
