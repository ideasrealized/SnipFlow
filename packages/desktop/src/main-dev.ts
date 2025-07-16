import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  clipboard,
  Menu,
  IpcMainEvent,
  Tray,
  nativeImage,
} from 'electron';
import path from 'path';
import { logger } from './logger';

// Mock database functions for development
const mockDb = {
  getSettings: () => ({
    edgeHover: {
      enabled: true,
      position: 'top-right',
      delay: 200,
      triggerSize: 50
    },
    overlay: {
      theme: 'dark',
      opacity: 0.95,
      width: 400,
      height: 300
    },
    general: {
      startOnBoot: false,
      minimizeToTray: true
    }
  }),
  updateSettings: (settings: any) => Promise.resolve(),
  getChains: () => [],
  getSnippets: () => [],
  getClipboardHistory: () => [],
  getPinnedItems: () => [],
  getStarterChains: () => []
};

let overlayState: 'hidden' | 'showing' | 'visible' | 'hiding' = 'hidden';
let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let chainManagerWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Basic window creation functions
function createMainWindow(): void {
  logger.info('Creating main window...');
  logger.info('__dirname:', __dirname);
  
  const htmlPath = path.join(__dirname, 'index.html');
  logger.info('Loading HTML from:', htmlPath);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
  });

  mainWindow.loadFile(htmlPath).catch((error) => {
    logger.error('Failed to load main window HTML:', error);
    logger.info('Trying to create a fallback HTML...');
    
    // Create a simple HTML string to load instead
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <title>SnipFlow - Dev Mode</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: #fff; }
        h1 { color: #4CAF50; }
      </style>
    </head>
    <body>
      <h1>SnipFlow Development Mode</h1>
      <p>Application is running in development mode.</p>
      <p>Database functionality is mocked.</p>
      <button onclick="window.close()">Close</button>
    </body>
    </html>`;
    
    mainWindow?.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  });
  
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    logger.info('Main window shown');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logger.error('Main window failed to load:', errorCode, errorDescription);
  });
}

function createOverlayWindow(): void {
  logger.info('Creating overlay window...');
  
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  const overlayPath = path.join(__dirname, 'overlay.html');
  logger.info('Loading overlay HTML from:', overlayPath);
  
  overlayWindow.loadFile(overlayPath).catch((error) => {
    logger.error('Failed to load overlay HTML:', error);
    
    // Create a simple overlay HTML
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <title>SnipFlow - Overlay</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 10px; background: rgba(0,0,0,0.8); color: #fff; border-radius: 8px; }
        h2 { color: #4CAF50; margin: 0 0 10px 0; }
      </style>
    </head>
    <body>
      <h2>SnipFlow Overlay</h2>
      <p>Development mode - overlay active</p>
    </body>
    </html>`;
    
    overlayWindow?.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  });
  
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logger.error('Overlay window failed to load:', errorCode, errorDescription);
  });
}

function createChainManagerWindow(): void {
  chainManagerWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
  });

  chainManagerWindow.loadFile(path.join(__dirname, 'chainManager.html'));
  chainManagerWindow.on('closed', () => {
    chainManagerWindow = null;
  });
}

// App event handlers
app.whenReady().then(() => {
  logger.info('SnipFlow starting in development mode...');
  
  // Create windows
  createMainWindow();
  createOverlayWindow();
  createChainManagerWindow();

  // Set up basic IPC handlers
  ipcMain.handle('db:getSettings', () => mockDb.getSettings());
  ipcMain.handle('db:updateSettings', (event, settings) => mockDb.updateSettings(settings));
  ipcMain.handle('db:getChains', () => mockDb.getChains());
  ipcMain.handle('db:getSnippets', () => mockDb.getSnippets());
  ipcMain.handle('db:getClipboardHistory', () => mockDb.getClipboardHistory());
  ipcMain.handle('db:getPinnedItems', () => mockDb.getPinnedItems());
  ipcMain.handle('db:getStarterChains', () => mockDb.getStarterChains());

  // Basic window management
  ipcMain.handle('window:show-main', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.handle('window:show-chain-manager', () => {
    if (chainManagerWindow) {
      chainManagerWindow.show();
      chainManagerWindow.focus();
    }
  });

  // Register global shortcuts for testing
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    logger.info('Overlay shortcut triggered');
    if (overlayWindow) {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
        logger.info('Overlay hidden');
      } else {
        overlayWindow.show();
        logger.info('Overlay shown');
      }
    }
  });

  globalShortcut.register('CommandOrControl+Shift+C', () => {
    logger.info('Chain manager shortcut triggered');
    if (chainManagerWindow) {
      if (chainManagerWindow.isVisible()) {
        chainManagerWindow.hide();
        logger.info('Chain manager hidden');
      } else {
        chainManagerWindow.show();
        chainManagerWindow.focus();
        logger.info('Chain manager shown');
      }
    }
  });

  logger.info('SnipFlow development mode ready');
  logger.info('Keyboard shortcuts:');
  logger.info('  Ctrl+Shift+O: Toggle overlay');
  logger.info('  Ctrl+Shift+C: Toggle chain manager');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  logger.info('SnipFlow shutting down...');
});

// Handle app termination
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  app.quit();
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  app.quit();
});

export {};
