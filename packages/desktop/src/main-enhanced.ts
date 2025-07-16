/**
 * SnipFlow Enhanced Main Process
 * Integrates all revolutionary features and optimizations
 */

import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';
import { logger } from './logger';
import { initProductionDb, closeDb } from './db';
import { enhancedOverlay } from './integration/overlay-integration';
import { aiService } from './services/ai-service';
import { edgeDetection } from './services/edge-detection-service';
import { performanceEngine } from './core/performance-engine';
import { createDatabaseOptimizer } from './services/db-optimization';

// Global references
let mainWindow: BrowserWindow | null = null;
let dbOptimizer: any = null;

/**
 * Initialize enhanced application
 */
async function initializeEnhancedApp(): Promise<void> {
  logger.info('[Enhanced Main] Initializing SnipFlow with revolutionary features...');
  
  try {
    // 1. Initialize performance engine first
    logger.info('[Enhanced Main] Initializing performance engine...');
    // Performance engine auto-initializes GPU settings
    
    // 2. Initialize database with optimizations
    logger.info('[Enhanced Main] Initializing optimized database...');
    initProductionDb();
    
    // Get database instance and create optimizer
    const db = (global as any).db; // Access the db instance from db.ts
    if (db) {
      dbOptimizer = createDatabaseOptimizer(db);
      logger.info('[Enhanced Main] Database optimizer created');
    }
    
    // 3. Initialize AI service
    logger.info('[Enhanced Main] Initializing AI service...');
    // AI service auto-initializes on import
    
    // 4. Initialize edge detection
    logger.info('[Enhanced Main] Initializing edge detection service...');
    // Edge detection auto-initializes on import
    
    // 5. Create main window
    logger.info('[Enhanced Main] Creating main window...');
    await createMainWindow();
    
    // 6. Initialize enhanced overlay
    logger.info('[Enhanced Main] Initializing enhanced overlay...');
    await enhancedOverlay.initializeEnhancedOverlay();
    
    // 7. Setup IPC handlers
    setupEnhancedIpcHandlers();
    
    // 8. Register global shortcuts
    registerEnhancedShortcuts();
    
    logger.info('[Enhanced Main] SnipFlow revolutionary features initialized successfully!');
    
  } catch (error) {
    logger.error('[Enhanced Main] Initialization failed:', error);
    throw error;
  }
}

/**
 * Create main window with optimizations
 */
async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webgl: true,
      backgroundThrottling: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    backgroundColor: '#1a1a1a',
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin'
  });
  
  // Load main application
  await mainWindow.loadFile('dist/index.html');
  
  // Optimize window display
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Apply performance optimizations
    mainWindow?.webContents.executeJavaScript(`
      // Enable will-change for animations
      document.documentElement.style.willChange = 'transform';
      
      // Set up performance observer
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              console.warn('Slow operation detected:', entry.name, entry.duration);
            }
          }
        });
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      }
    `);
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Setup enhanced IPC handlers
 */
function setupEnhancedIpcHandlers(): void {
  // AI suggestions
  ipcMain.handle('ai:get-suggestions', async (_, context) => {
    return aiService.getSuggestions(context);
  });
  
  ipcMain.handle('ai:record-activity', async (_, activity) => {
    aiService.recordActivity(activity);
    return { success: true };
  });
  
  // Performance metrics
  ipcMain.handle('performance:get-metrics', async () => {
    return performanceEngine.getMetrics();
  });
  
  // Database optimization
  ipcMain.handle('db:search-fulltext', async (_, table, query, options) => {
    return dbOptimizer?.searchFullText(table, query, options) || [];
  });
  
  ipcMain.handle('db:get-cache-stats', async () => {
    return dbOptimizer?.getCacheStats() || {};
  });
  
  ipcMain.handle('db:vacuum', async () => {
    await dbOptimizer?.vacuum();
    return { success: true };
  });
  
  // Edge detection configuration
  ipcMain.handle('edge:update-config', async (_, config) => {
    edgeDetection.updateConfig(config);
    return { success: true };
  });
  
  // Enhanced overlay controls
  ipcMain.handle('overlay:show-enhanced', async (_, position) => {
    await enhancedOverlay.showOverlay(position);
    return { success: true };
  });
}

/**
 * Register enhanced keyboard shortcuts
 */
function registerEnhancedShortcuts(): void {
  // Main overlay shortcut
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    enhancedOverlay.showOverlay();
  });
  
  // AI suggestion shortcut
  globalShortcut.register('CommandOrControl+Shift+A', async () => {
    const context = await getCurrentContext();
    const suggestions = await aiService.getSuggestions(context);
    
    // Send to overlay
    if (mainWindow) {
      mainWindow.webContents.send('ai-suggestions', suggestions);
    }
  });
  
  // Quick template shortcut
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) {
      mainWindow.webContents.send('quick-template');
    }
  });
  
  // Performance stats shortcut (dev mode)
  if (process.env.NODE_ENV === 'development') {
    globalShortcut.register('CommandOrControl+Shift+P', () => {
      const metrics = performanceEngine.getMetrics();
      logger.info('[Performance]', metrics);
    });
  }
}

/**
 * Get current context for AI
 */
async function getCurrentContext(): Promise<any> {
  const now = new Date();
  
  return {
    applicationName: app.getName(),
    windowTitle: mainWindow?.getTitle() || '',
    timeOfDay: now.toLocaleTimeString(),
    dayOfWeek: now.toLocaleDateString('en', { weekday: 'long' }),
    userActivity: [] // Would be populated from activity tracking
  };
}

/**
 * Application event handlers
 */
app.whenReady().then(async () => {
  await initializeEnhancedApp();
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
  logger.info('[Enhanced Main] Shutting down SnipFlow...');
  
  // Cleanup
  globalShortcut.unregisterAll();
  edgeDetection.destroy();
  closeDb();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('[Enhanced Main] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error('[Enhanced Main] Unhandled rejection:', reason);
});

export {};
