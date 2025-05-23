import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import { join } from 'path';
import * as db from './db';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

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
  const { width } = screen.getPrimaryDisplay().workAreaSize;
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
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  overlayWindow.loadFile(join(__dirname, 'overlay.html'));
  overlayWindow.hide();
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

  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (overlayWindow) {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.showInactive();
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
