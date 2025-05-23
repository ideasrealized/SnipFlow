import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join } from 'path';
import * as db from './db';

let mainWindow: any = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

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
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
