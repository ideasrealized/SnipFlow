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
let hoverTimeout: NodeJS.Timeout | null = null;
let isHovering = false;

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
    show: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(join(__dirname, 'index.html'));
  
  // Force open DevTools for debugging
  mainWindow.webContents.openDevTools();
  
  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('Main window loaded successfully');
  });
  
  mainWindow.webContents.on('render-process-gone', () => {
    logger.error('Main window render process gone');
  });
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const s = getSettings();
  
  // Start with default position, will be repositioned on hover
  overlayWindow = new BrowserWindow({
    width: 420,
    height: 520,
    x: width - 430, // Start off-screen right
    y: 10,
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
  
  logger.info(`Edge hover activation: ${s.edgeHover.enabled ? s.edgeHover.position : 'disabled'}`);
}

function startMouseMonitoring() {
  if (mouseCheckInterval) {
    clearInterval(mouseCheckInterval);
  }

  mouseCheckInterval = setInterval(() => {
    if (!overlayWindow) return;

    const settings = getSettings();
    if (!settings.edgeHover.enabled) return;

    const { x, y } = screen.getCursorScreenPoint();
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const { position, triggerSize } = settings.edgeHover;

    // Calculate trigger zone based on selected position
    let isInTriggerZone = false;
    switch (position) {
      case 'top-left':
        isInTriggerZone = x < triggerSize && y < triggerSize;
        break;
      case 'top-right':
        isInTriggerZone = x > width - triggerSize && y < triggerSize;
        break;
      case 'bottom-left':
        isInTriggerZone = x < triggerSize && y > height - triggerSize;
        break;
      case 'bottom-right':
        isInTriggerZone = x > width - triggerSize && y > height - triggerSize;
        break;
      case 'left-center':
        isInTriggerZone = x < triggerSize && y > height * 0.3 && y < height * 0.7;
        break;
      case 'right-center':
        isInTriggerZone = x > width - triggerSize && y > height * 0.3 && y < height * 0.7;
        break;
    }

    if (isInTriggerZone && !isHovering && !overlayWindow.isVisible()) {
      isHovering = true;
      hoverTimeout = setTimeout(() => {
        if (isHovering && overlayWindow && !overlayWindow.isVisible()) {
          logger.info(`Showing overlay via ${position} edge hover`);
          positionOverlayAtPosition(position);
          overlayWindow.showInactive();
          overlayWindow.webContents.send('overlay:show');
        }
      }, settings.edgeHover.delay);
    } else if (!isInTriggerZone || isMouseOverOverlay()) {
      if (isHovering) {
        isHovering = false;
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
      }

      // Hide overlay if mouse moved away and not over overlay
      if (overlayWindow.isVisible() && !isInTriggerZone && !isMouseOverOverlay()) {
        setTimeout(() => {
          if (overlayWindow && overlayWindow.isVisible() && !isMouseOverOverlay()) {
            logger.info('Hiding overlay - mouse moved away');
            overlayWindow.webContents.send('overlay:hide');
            ipcMain.once('overlay:hidden', () => overlayWindow?.hide());
            setTimeout(() => overlayWindow?.hide(), 350);
          }
        }, 300);
      }
    }
  }, 50); // More responsive polling
}

function positionOverlayAtPosition(position: string) {
  if (!overlayWindow) return;

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const overlayWidth = 380;
  const overlayHeight = 480;
  const margin = 10;
  const slideDistance = 20; // How far from edge to appear

  let x = 0, y = 0;
  switch (position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'top-right':
      x = width - overlayWidth - margin;
      y = margin;
      break;
    case 'bottom-left':
      x = margin;
      y = height - overlayHeight - margin;
      break;
    case 'bottom-right':
      x = width - overlayWidth - margin;
      y = height - overlayHeight - margin;
      break;
    case 'left-center':
      x = slideDistance;
      y = (height - overlayHeight) / 2;
      break;
    case 'right-center':
      x = width - overlayWidth - slideDistance;
      y = (height - overlayHeight) / 2;
      break;
  }

  overlayWindow.setBounds({ x, y, width: overlayWidth, height: overlayHeight });
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
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
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
  
  // Restart mouse monitoring if edge hover settings changed
  if (s.edgeHover) {
    startMouseMonitoring();
    logger.info(`Edge hover updated: ${updated.edgeHover.enabled ? updated.edgeHover.position : 'disabled'}`);
  }
  
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

// Handle settings navigation from tray
ipcMain.on('nav:openSettings', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('navigate-to-settings');
  }
});
