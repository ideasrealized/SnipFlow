import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  clipboard,
} from 'electron';
import { join } from 'path';
import * as db from './db';
import { logger } from './logger';
import { initErrorTracking, withRetry } from './error-tracker';
import { exportDiagnostics } from './diagnostics';
import {
  startClipboardMonitor,
  stopClipboardMonitor,
} from './services/clipboard';
import { loadSettings, saveSettings, getSettings, Settings } from './settings';
import { pasteClipboard } from './autopaste';
import { createTray } from './tray';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let mouseCheckInterval: NodeJS.Timeout | null = null;

function handle(channel: string, fn: (...args: any[]) => any) {
  ipcMain.handle(channel, async (_e, ...args) => {
    const start = Date.now();
    try {
      return await withRetry(() => Promise.resolve(fn(...args)), {
        retries: 3,
      });
    } finally {
      logger.perf(`ipc.${channel}: ${Date.now() - start}ms`);
    }
  });
}

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
  const s = getSettings();
  const x = s.overlaySide === 'left' ? 0 : width - 320;
  const y = s.overlayY ?? 0;
  overlayWindow = new BrowserWindow({
    width: 320,
    height: 250,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
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
      overlayWindow.webContents.send('overlay:show');
    } else if (!isInTriggerZone && overlayWindow.isVisible()) {
      // Add small delay to prevent flicker
      setTimeout(() => {
        if (overlayWindow && !isMouseOverOverlay()) {
          overlayWindow.webContents.send('overlay:hide');
          ipcMain.once('overlay:hidden', () => overlayWindow?.hide());
          setTimeout(() => overlayWindow?.hide(), 350);
        }
      }, 200);
    }
  }, 100);
}

function isMouseOverOverlay(): boolean {
  if (!overlayWindow) return false;

  const { x, y } = screen.getCursorScreenPoint();
  const bounds = overlayWindow.getBounds();

  return (
    x >= bounds.x &&
    x <= bounds.x + bounds.width &&
    y >= bounds.y &&
    y <= bounds.y + bounds.height
  );
}

app.whenReady().then(() => {
  loadSettings();
  initErrorTracking();
  logger.info('Application starting');
  createWindow();
  createOverlayWindow();
  if (mainWindow && overlayWindow) {
    createTray({ main: mainWindow, overlay: overlayWindow });
  }
  startClipboardMonitor();

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
      overlayWindow.show();
      overlayWindow.focus();
      overlayWindow.webContents.send('overlay:show');
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
  stopClipboardMonitor();
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

handle('list-snippets', () => db.getSnippets());
handle('create-snippet', (content: string) => {
  db.createSnippet(content);
  return db.getSnippets();
});
handle('update-snippet', (id: number, content: string) => {
  db.updateSnippet(id, content);
  return db.getSnippets();
});
handle('delete-snippet', (id: number) => {
  db.deleteSnippet(id);
  return db.getSnippets();
});

handle('list-chains', () => db.getChains());
handle('create-chain', (name: string, nodes: db.ChainNode[]) => {
  db.createChain(name, nodes);
  return db.getChains();
});
handle('update-chain', (id: number, name: string, nodes: db.ChainNode[]) => {
  db.updateChain(id, name, nodes);
  return db.getChains();
});
handle('delete-chain', (id: number) => {
  db.deleteChain(id);
  return db.getChains();
});
handle('get-chain-by-name', (name: string) => db.getChainByName(name));

handle('get-clipboard-history', () => db.getClipboardHistory());
handle('pin-clipboard-item', (id: string, pinned: boolean) => {
  db.pinClipboardItem(id, pinned);
  return db.getClipboardHistory();
});

handle('get-settings', () => getSettings());
handle('save-settings', (s: Partial<Settings>) => {
  const updated = saveSettings(s);
  overlayWindow?.webContents.send('theme:changed', updated.theme);
  return updated;
});

handle('insert-snippet', (text: string) => {
  clipboard.writeText(text);
  pasteClipboard();
});

handle('get-error-log', () => logger.getErrorLog());
handle('export-diagnostics', () => exportDiagnostics());

ipcMain.on('hide-overlay', () => {
  if (overlayWindow) {
    const bounds = overlayWindow.getBounds();
    const display = screen.getPrimaryDisplay().workAreaSize;
    const side = bounds.x < display.width / 2 ? 'left' : 'right';
    saveSettings({ overlayY: bounds.y, overlaySide: side });
    overlayWindow.webContents.send('overlay:hide');
    ipcMain.once('overlay:hidden', () => overlayWindow?.hide());
    setTimeout(() => overlayWindow?.hide(), 350);
  }
});
