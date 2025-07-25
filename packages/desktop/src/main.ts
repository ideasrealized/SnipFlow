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
import {
  initProductionDb,
  getSettings as dbGetSettings,
  updateSettings as dbUpdateSettings,
  resetEdgeHoverSettings as dbResetEdgeHoverSettings,
  closeDb,
  getChainById as dbGetChainById,
  getChainByName as dbGetChainByName,
  createChain as dbCreateChain,
  updateChain as dbUpdateChain,
  deleteChain as dbDeleteChain,
  getChains as dbGetChains,
  getClipboardHistory as dbGetClipboardHistory,
  pinClipboardItem as dbPinClipboardItem,
  clearClipboardHistory as dbClearClipboardHistory,
  getSnippets as dbGetSnippets,
  createSnippet as dbCreateSnippet,
  updateSnippet as dbUpdateSnippet,
  deleteSnippet as dbDeleteSnippet,
  getSnippetById as dbGetSnippetById,
  getPinnedItems as dbGetPinnedItems,
  getStarterChains as dbGetStarterChains,
} from './db';
import { logger } from './logger';
import { processTextWithChain } from './services/chainService';
import { exportDiagnostics } from './diagnostics';
import { setupTestStarterChains } from './test-data-setup';
import { startClipboardMonitor, stopClipboardMonitor } from './services/clipboard';
import {
  type Settings, 
  type OverlaySettings, 
  type ChoiceProvider as MainChoiceProvider,
  type InputProvider as MainInputProvider,
  type Choice, 
  type Chain, 
  type ChainOption, 
  type ClipboardEntry, 
  type Snippet
} from './types';

let overlayState: 'hidden' | 'showing' | 'visible' | 'hiding' = 'hidden';
let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let mouseMoveInterval: NodeJS.Timeout | null = null;
let hoverTimeout: NodeJS.Timeout | null = null;
let isHovering = false;
let chainManagerWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const EDGE_HOVER_POLL_INTERVAL = 50; // ms
const DEFAULT_EDGE_HOVER_ACTIVATION_DELAY = 200; // Default if not in settings
const EDGE_HOVER_HIDE_DELAY = 800; // ms for hide initiation - increased for better UX
const OVERLAY_CONFIRM_HIDE_TIMEOUT = 750; // ms for failsafe hide

let lastUsedEdgeHoverPosition: string | null = null;

// Store the previously focused window for cursor position restoration
let previouslyFocusedWindow: BrowserWindow | null = null;

// Track if we've already scheduled a hide attempt to prevent spam
let hideAttemptScheduled: boolean = false;

// Track last input pending check to avoid excessive JavaScript execution
let lastInputPendingCheck: number = 0;
const INPUT_PENDING_CHECK_THROTTLE = 100; // ms

// Consolidated helper: Checks if cursor is within a specific trigger zone
function isCursorInTriggerZone(cursorPos: Electron.Point, position: string, triggerSize: number, workArea: Electron.Rectangle): boolean {
  const { x: cursorScreenX, y: cursorScreenY } = cursorPos;
  const { x: areaX, y: areaY, width: areaWidth, height: areaHeight } = workArea;
  switch (position) {
    case 'top-left': 
      return cursorScreenX >= areaX && cursorScreenX < areaX + triggerSize && 
             cursorScreenY >= areaY && cursorScreenY < areaY + triggerSize;
    case 'top-right': 
      return cursorScreenX > areaX + areaWidth - triggerSize && cursorScreenX <= areaX + areaWidth &&
             cursorScreenY >= areaY && cursorScreenY < areaY + triggerSize;
    case 'bottom-left': 
      return cursorScreenX >= areaX && cursorScreenX < areaX + triggerSize &&
             cursorScreenY > areaY + areaHeight - triggerSize && cursorScreenY <= areaY + areaHeight;
    case 'bottom-right': 
      return cursorScreenX > areaX + areaWidth - triggerSize && cursorScreenX <= areaX + areaWidth &&
             cursorScreenY > areaY + areaHeight - triggerSize && cursorScreenY <= areaY + areaHeight;
    case 'left-center': 
      return cursorScreenX >= areaX && cursorScreenX < areaX + triggerSize &&
             cursorScreenY > areaY + areaHeight * 0.3 && cursorScreenY < areaY + areaHeight * 0.7;
    case 'right-center': 
      return cursorScreenX > areaX + areaWidth - triggerSize && cursorScreenX <= areaX + areaWidth &&
             cursorScreenY > areaY + areaHeight * 0.3 && cursorScreenY < areaY + areaHeight * 0.7;
    default: return false;
  }
}

// Consolidated helper: Checks if mouse is over the overlay window
function isMouseOverOverlayWindow(cursorPos: Electron.Point, overlayBounds: Electron.Rectangle | null): boolean {
  if (!overlayWindow || !overlayWindow.isVisible() || !overlayBounds) return false;
  return cursorPos.x >= overlayBounds.x && cursorPos.x <= overlayBounds.x + overlayBounds.width &&
         cursorPos.y >= overlayBounds.y && cursorPos.y <= overlayBounds.y + overlayBounds.height;
}

// Consolidated and primary mouse tracking function
function startMouseTracking(currentSettings: Settings) {
  if (mouseMoveInterval) {
    clearInterval(mouseMoveInterval);
    mouseMoveInterval = null;
  }

  if (!currentSettings.edgeHover.enabled) {
    logger.info('[main.ts] Edge hover is disabled. Mouse tracking stopped.');
    return;
  }

  const activationDelay = currentSettings.edgeHover.delay || DEFAULT_EDGE_HOVER_ACTIVATION_DELAY;
  logger.info(`[main.ts] Starting mouse tracking. Position: ${currentSettings.edgeHover.position}, Delay: ${activationDelay}ms, Size: ${currentSettings.edgeHover.triggerSize}px`);

  mouseMoveInterval = setInterval(() => {
    if (!overlayWindow) return;

    const cursorPos = screen.getCursorScreenPoint();
    const workArea = screen.getPrimaryDisplay().workArea;
    const { position, triggerSize } = currentSettings.edgeHover;
    
    const overlayIsVisible = overlayWindow.isVisible();
    const overlayBounds = overlayIsVisible ? overlayWindow.getBounds() : null;
    const mouseOverOverlay = isMouseOverOverlayWindow(cursorPos, overlayBounds);
    const isInCurrentActivationZone = isCursorInTriggerZone(cursorPos, position, triggerSize, workArea);
    
    // Reset hide attempt flag if mouse returns to overlay or trigger zone
    if ((mouseOverOverlay || isInCurrentActivationZone) && hideAttemptScheduled) {
      hideAttemptScheduled = false;
      logger.info('[main.ts] Mouse returned to overlay/trigger zone - resetting hide attempt flag');
    }

        // SHOW LOGIC
    if (isInCurrentActivationZone && !isHovering && !mouseOverOverlay) {
      if (overlayState === 'hidden' || overlayState === 'hiding') { 
        logger.info('[main.ts] startMouseTracking: Initiating show sequence. Setting overlayState to showing.');
        overlayState = 'showing';
        hideAttemptScheduled = false; // Reset flag when showing
        
      isHovering = true;
        lastUsedEdgeHoverPosition = position; 
        logger.info(`[main.ts] Mouse entered ${position} zone. Setting hoverTimeout for ${activationDelay}ms. state: ${overlayState}`);
        if (hoverTimeout) clearTimeout(hoverTimeout);
        
      hoverTimeout = setTimeout(() => {
          const latestCursorPos = screen.getCursorScreenPoint();
          const stillInZone = isCursorInTriggerZone(latestCursorPos, position, triggerSize, workArea);
          const latestOverlayBounds = overlayWindow && overlayWindow.isVisible() ? overlayWindow.getBounds() : null;
          const stillNotOverOverlay = !isMouseOverOverlayWindow(latestCursorPos, latestOverlayBounds);

          if (isHovering && overlayWindow && stillInZone && stillNotOverOverlay && overlayState === 'showing') {
            logger.info('[main.ts] hoverTimeout: Conditions met. Positioning and showing overlay.');
            
            // Store the currently focused window before showing overlay
            previouslyFocusedWindow = BrowserWindow.getFocusedWindow();
            if (previouslyFocusedWindow && previouslyFocusedWindow !== overlayWindow) {
              logger.info('[main.ts] Stored previously focused window for cursor restoration');
            }
            
            if (lastUsedEdgeHoverPosition) { 
               positionOverlayAtPosition(lastUsedEdgeHoverPosition); 
            }
            if (overlayWindow) overlayWindow.showInactive();
            overlayWindow?.webContents.send('overlay:show', { position: lastUsedEdgeHoverPosition, screen: screen.getDisplayMatching(latestOverlayBounds || workArea) });

            logger.info('[main.ts] hoverTimeout: Overlay shown. Setting overlayState to visible.');
            overlayState = 'visible';
          } else {
            logger.info(`[main.ts] hoverTimeout: Show conditions NOT met (isHovering: ${isHovering}, stillInZone: ${stillInZone}, stillNotOverOverlay: ${stillNotOverOverlay}, overlayState: ${overlayState}).`);
            if (overlayState === 'showing') { 
              logger.info('[main.ts] hoverTimeout: Resetting overlayState to hidden because show attempt failed.');
              overlayState = 'hidden';
            }
            isHovering = false; 
          }
        }, activationDelay);
      } else {
        // If not hidden or hiding, means it's showing or visible, so don't re-trigger.
        // logger.info(`[main.ts] Show trigger in zone, but overlayState is '${overlayState}'. Ignoring new show.`);
      }
    } 
    // HIDE INITIATION LOGIC
    else if (
      (isHovering && !isInCurrentActivationZone && !mouseOverOverlay) || 
      (overlayIsVisible && !mouseOverOverlay && lastUsedEdgeHoverPosition && !isCursorInTriggerZone(cursorPos, lastUsedEdgeHoverPosition, triggerSize, workArea))
    ) {
      if (isHovering) {
        logger.info(`[main.ts] Mouse left ${lastUsedEdgeHoverPosition || 'an active'} zone or conditions changed. Clearing hoverTimeout, resetting isHovering.`);
        isHovering = false;
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        if (overlayState === 'showing') {
          logger.info('[main.ts] Mouse left zone while trying to show (state was \'showing\'). Resetting overlayState to hidden.');
          overlayState = 'hidden';
        }
      }

      if (overlayIsVisible && !mouseOverOverlay ) {
        const relevantZoneToCheck = lastUsedEdgeHoverPosition || position;
        if (!isCursorInTriggerZone(cursorPos, relevantZoneToCheck, triggerSize, workArea)) {
          // Only proceed if no hide attempt is already scheduled (prevents all spam)
          if (!hideAttemptScheduled) {
            hideAttemptScheduled = true;
            logger.info(`[main.ts] Conditions met to initiate overlay hide (mouse left ${relevantZoneToCheck}). Scheduling hide with delay.`);
            
        setTimeout(() => {
              const latestCursorPosAfterHideDelay = screen.getCursorScreenPoint();
              const workAreaAfterHideDelay = screen.getPrimaryDisplay().workArea;
              const stillNotInRelevantZone = !isCursorInTriggerZone(latestCursorPosAfterHideDelay, relevantZoneToCheck, triggerSize, workAreaAfterHideDelay);
              const latestOverlayIsVisibleAfterDelay = overlayWindow && overlayWindow.isVisible();
              const latestOverlayBoundsAfterDelay = latestOverlayIsVisibleAfterDelay ? overlayWindow && overlayWindow.getBounds() : null;
              const stillNotOverOverlayAfterHideDelay = !isMouseOverOverlayWindow(latestCursorPosAfterHideDelay, latestOverlayBoundsAfterDelay);

              // Reset the flag since this timeout has executed
              hideAttemptScheduled = false;

              if (overlayWindow && latestOverlayIsVisibleAfterDelay && stillNotOverOverlayAfterHideDelay && stillNotInRelevantZone) {
                // Throttle input pending checks to avoid excessive JavaScript execution
                const now = Date.now();
                if (now - lastInputPendingCheck > INPUT_PENDING_CHECK_THROTTLE) {
                  lastInputPendingCheck = now;
                  
                  // Check if input is pending or user is in interactive mode before hiding
                  overlayWindow.webContents.executeJavaScript('window.isInputPending || window.isInQuickEdit || window.isInContextMenu || false')
                    .then((isInteractive: boolean) => {
                      if (isInteractive) {
                        logger.info('[main.ts] Mouse leave: Interactive mode active (input/quick edit/context menu), keeping overlay open');
                        // Don't schedule another hide attempt immediately - let the next mouse poll cycle handle it
                      } else {
                        logger.info('[main.ts] Mouse confirmed away after hide-delay. Calling hideOverlay("mouse_leave").');
                        hideOverlay("mouse_leave");
                      }
                    })
                    .catch(() => {
                      // Fallback: if we can't check input state, hide overlay as before
                      logger.info('[main.ts] Mouse leave: Could not check input state, hiding overlay.');
                      hideOverlay("mouse_leave");
                    });
                } else {
                  logger.info('[main.ts] Mouse leave: Input pending check throttled, skipping');
                }
              } else {
                logger.info('[main.ts] Hide conditions no longer met after mouse-leave delay. Aborting hide request.');
              }
            }, EDGE_HOVER_HIDE_DELAY);
          }
          // If hideAttemptScheduled is true, we silently skip ALL processing to avoid spam
        }
      }
    }
  }, EDGE_HOVER_POLL_INTERVAL);
}

// Function to calculate overlay window size based on current settings and actual node count
function calculateOverlaySize(): { width: number; height: number } {
  const settings = dbGetSettings();
  const gridCols = settings.overlay.gridCols || 2;
  const gridRows = settings.overlay.gridRows || 3;
  const nodeWidth = settings.overlay.nodeWidth || 180;
  const nodeHeight = settings.overlay.nodeHeight || 90;
  const nodeGap = settings.overlay.nodeGap || 8; // Use settings nodeGap with fallback
  
  // Get actual node counts for better sizing
  const pinnedItems = dbGetPinnedItems();
  const starterChains = dbGetStarterChains();
  const clipboardHistory = dbGetClipboardHistory();
  
  // Calculate sections that will be shown
  const sections = [];
  if (pinnedItems.length > 0) sections.push({ name: 'Pinned', count: pinnedItems.length });
  if (starterChains.length > 0) sections.push({ name: 'Starters', count: starterChains.length });
  if (clipboardHistory.length > 0) sections.push({ name: 'History', count: Math.min(clipboardHistory.length, 8) }); // Limit history display
  
  // Calculate total nodes needed
  const totalNodes = sections.reduce((sum, section) => sum + section.count, 0);
  
  // Calculate optimal grid dimensions based on actual content
  let optimalCols = gridCols;
  let optimalRows = gridRows;
  
  if (totalNodes > 0) {
    // Adjust grid to fit actual content better
    optimalCols = Math.min(gridCols, Math.ceil(Math.sqrt(totalNodes)));
    optimalRows = Math.ceil(totalNodes / optimalCols);
    
    // Ensure minimum dimensions
    optimalCols = Math.max(1, optimalCols);
    optimalRows = Math.max(1, optimalRows);
    
    // Respect maximum dimensions from settings
    optimalCols = Math.min(optimalCols, gridCols);
    optimalRows = Math.min(optimalRows, gridRows);
  }
  
  // Calculate window size based on optimized grid
  const containerPadding = 40; // 20px each side
  const sectionHeaderHeight = sections.length > 1 ? 40 : 20; // Header space per section
  const width = (nodeWidth * optimalCols) + (nodeGap * (optimalCols - 1)) + containerPadding;
  const height = (nodeHeight * optimalRows) + (nodeGap * (optimalRows - 1)) + containerPadding + sectionHeaderHeight;
  
  logger.info(`[main.ts] Calculated overlay size: ${width}x${height} for ${totalNodes} nodes in ${optimalCols}x${optimalRows} grid`);
  
  return { width, height };
}

// Function to resize overlay window based on current settings
function resizeOverlayWindow() {
  if (!overlayWindow) {
    logger.warn('[main.ts] resizeOverlayWindow called but overlayWindow is null.');
    return;
  }

  const { width, height } = calculateOverlaySize();
  const workArea = screen.getPrimaryDisplay().workArea;
  
  // Ensure the overlay doesn't exceed screen boundaries with dynamic padding
  const minPadding = 30; // Minimum padding from screen edges
  const maxWidth = workArea.width - (minPadding * 2);
  const maxHeight = workArea.height - (minPadding * 2);
  
  const finalWidth = Math.min(width, maxWidth);
  const finalHeight = Math.min(height, maxHeight);
  
  // Log sizing information for debugging
  logger.info(`[main.ts] Overlay sizing: calculated=${width}x${height}, max=${maxWidth}x${maxHeight}, final=${finalWidth}x${finalHeight}`);
  
  // Get current position to maintain it during resize
  const currentBounds = overlayWindow.getBounds();
  
  // Resize the window
  overlayWindow.setSize(finalWidth, finalHeight);
  
  // Reposition if the window would go off-screen after resize
  const newX = Math.max(workArea.x, Math.min(currentBounds.x, workArea.x + workArea.width - finalWidth));
  const newY = Math.max(workArea.y, Math.min(currentBounds.y, workArea.y + workArea.height - finalHeight));
  
  if (newX !== currentBounds.x || newY !== currentBounds.y) {
    overlayWindow.setPosition(newX, newY);
  }
  
  logger.info(`[main.ts] Overlay window resized to ${finalWidth}x${finalHeight} at position (${newX}, ${newY})`);
}

// Consolidated and robust version for positioning
function positionOverlayAtPosition(activatedPosition: string) {
  if (!overlayWindow) {
    logger.warn('[main.ts] positionOverlayAtPosition called but overlayWindow is null.');
    return;
  }

  // First, resize the overlay to current settings
  resizeOverlayWindow();
  
  const display = screen.getPrimaryDisplay();
  const workArea = display.workArea; 
  const overlaySizeArray = overlayWindow.getSize(); // Returns [width, height]

  // Ensure overlaySizeArray has valid numbers, default if not
  const overlayWidth = (Array.isArray(overlaySizeArray) && typeof overlaySizeArray[0] === 'number') ? overlaySizeArray[0] : 400; // Default width
  const overlayHeight = (Array.isArray(overlaySizeArray) && typeof overlaySizeArray[1] === 'number') ? overlaySizeArray[1] : 500; // Default height

  const currentSettings = dbGetSettings(); 
  // Use y/side from settings.overlay, with defaults if not present
  const preferredY = currentSettings.overlay.y !== undefined ? currentSettings.overlay.y : workArea.y + workArea.height * 0.1; 
  const preferredSide = currentSettings.overlay.side || 'right'; 

  let x: number;
  let y: number = preferredY;
  y = Math.max(workArea.y, Math.min(y, workArea.y + workArea.height - overlayHeight));

  // Dynamic edge padding based on window size to prevent cutoff
  const edgePadding = Math.max(15, Math.min(30, overlayWidth * 0.02)); // 2% of width, min 15px, max 30px
  
  switch (activatedPosition) {
    case 'top-left': 
      x = workArea.x + edgePadding; 
      y = workArea.y + edgePadding; 
      break;
    case 'top-right': 
      x = workArea.x + workArea.width - overlayWidth - edgePadding; 
      y = workArea.y + edgePadding; 
      break;
    case 'bottom-left': 
      x = workArea.x + edgePadding; 
      y = workArea.y + workArea.height - overlayHeight - edgePadding; 
      break;
    case 'bottom-right': 
      x = workArea.x + workArea.width - overlayWidth - edgePadding; 
      y = workArea.y + workArea.height - overlayHeight - edgePadding; 
      break;
    case 'left-center': 
      x = workArea.x + edgePadding; 
      // Ensure the overlay doesn't go off-screen vertically
      y = Math.max(workArea.y + edgePadding, Math.min(y, workArea.y + workArea.height - overlayHeight - edgePadding));
      break;
    case 'right-center': 
      x = workArea.x + workArea.width - overlayWidth - edgePadding; 
      // Ensure the overlay doesn't go off-screen vertically
      y = Math.max(workArea.y + edgePadding, Math.min(y, workArea.y + workArea.height - overlayHeight - edgePadding));
      break;
    default: 
      logger.warn(`[main.ts] Unknown position '${activatedPosition}'. Defaulting to preferred side: ${preferredSide}.`);
      x = (preferredSide === 'left') ? workArea.x + edgePadding : workArea.x + workArea.width - overlayWidth - edgePadding;
      y = Math.max(workArea.y + edgePadding, Math.min(y, workArea.y + workArea.height - overlayHeight - edgePadding));
      break;
  }
  
  // Final boundary check to ensure overlay stays within screen bounds
  x = Math.max(workArea.x + edgePadding, Math.min(x, workArea.x + workArea.width - overlayWidth - edgePadding));
  y = Math.max(workArea.y + edgePadding, Math.min(y, workArea.y + workArea.height - overlayHeight - edgePadding));
  logger.info(`[main.ts] Positioning overlay at x: ${Math.round(x)}, y: ${Math.round(y)} for position: ${activatedPosition}`);
  overlayWindow.setBounds({ x: Math.round(x), y: Math.round(y), width: overlayWidth, height: overlayHeight });
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024, height: 768, show: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), nodeIntegration: false, contextIsolation: true },
  });
  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
  mainWindow.loadFile(path.join(__dirname, 'index-react.html'));
  mainWindow.webContents.on('did-finish-load', () => logger.info('Main window loaded.'));
  mainWindow.webContents.on('render-process-gone', (e,d) => logger.error('Main render gone:',d));
  mainWindow.on('focus', () => logger.info('Main window focus.'));
  mainWindow.on('blur', () => logger.info('Main window blur.'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createOverlayWindow() {
  const workArea = screen.getPrimaryDisplay().workArea;
  
  // Get current settings to calculate window size
  const settings = dbGetSettings();
  const gridCols = settings.overlay.gridCols || 2;
  const gridRows = settings.overlay.gridRows || 3;
  const nodeWidth = settings.overlay.nodeWidth || 180;
  const nodeHeight = settings.overlay.nodeHeight || 90;
  
  // Calculate window size based on grid settings
  // Add padding for container margins and gaps between nodes
  const containerPadding = 40; // 20px each side
  const nodeGap = 15; // gap between nodes
  const width = (nodeWidth * gridCols) + (nodeGap * (gridCols - 1)) + containerPadding;
  const height = (nodeHeight * gridRows) + (nodeGap * (gridRows - 1)) + containerPadding + 60; // extra for section headers
  
  // Create base options
  const baseOptions = {
    width, height, 
    x: workArea.x + workArea.width, y: workArea.y + 100, // Off-screen initially
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    show: false, // Initially hidden
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      nodeIntegration: false, 
      contextIsolation: true 
    },
  };
  
  // Add macOS-specific options if on macOS
  const overlayOptions = process.platform === 'darwin' 
    ? { ...baseOptions, type: 'panel' as const }
    : baseOptions;
  
  overlayWindow = new BrowserWindow(overlayOptions);
  
  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
  
  // Enhanced z-index management for input dialogs
  overlayWindow.on('show', () => {
    // Ensure overlay stays on top when shown
    overlayWindow?.setAlwaysOnTop(true, 'screen-saver');
    if (process.platform === 'win32') {
      // On Windows, use additional methods to ensure top-most behavior
      overlayWindow?.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }
  });
  
  // Handle focus events to maintain z-index during input
  overlayWindow.on('focus', () => {
    // When overlay gains focus (like during input), ensure it stays on top
    overlayWindow?.setAlwaysOnTop(true, 'screen-saver');
  });
  
  // Monitor for input pending state and adjust z-index accordingly
  const checkInputState = () => {
    if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible()) {
      overlayWindow.webContents.executeJavaScript('window.isInputPending || window.isInQuickEdit || window.isInContextMenu || false')
        .then((isInteractive: boolean) => {
          if (isInteractive) {
            // During interactive mode, use highest z-index level
            overlayWindow?.setAlwaysOnTop(true, 'screen-saver');
            if (process.platform === 'win32') {
              overlayWindow?.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
            }
          }
        })
        .catch(() => {
          // Ignore errors during state checking
        });
    }
  };
  
  // Check input state periodically when overlay is visible
  setInterval(checkInputState, 1000);
  
  if (overlayWindow) overlayWindow.webContents.openDevTools({ mode: 'detach' });
  overlayWindow.on('blur', () => {
    logger.info(`[main.ts] Overlay window blurred. Current state: ${overlayState}`);
    if (overlayState === 'visible' && overlayWindow && !overlayWindow.isDestroyed()) {
      // Check if we're in interactive mode before hiding on blur
      overlayWindow.webContents.executeJavaScript('window.isInputPending || window.isInQuickEdit || window.isInContextMenu || false')
        .then((isInteractive: boolean) => {
          if (!isInteractive) {
            logger.info('[main.ts] Blur event: No interactive mode, calling hideOverlay("blur_event").');
            hideOverlay("blur_event");
          } else {
            logger.info('[main.ts] Blur event: Interactive mode active, keeping overlay open');
            // Ensure overlay stays on top even when blurred during interactive mode
            overlayWindow?.setAlwaysOnTop(true, 'screen-saver');
          }
        })
        .catch(() => {
          // Fallback: hide on blur if we can't check state
          logger.info('[main.ts] Blur event: Could not check interactive state, hiding overlay');
          hideOverlay("blur_event");
        });
    }
  });
  
  // Handle overlay acknowledgment for proper hide sequence
  ipcMain.on('overlay:hidden-ack', () => {
    logger.info(`[main.ts] ✅ RECEIVED overlay:hidden-ack. Current state: ${overlayState}`);
    if (overlayState === 'hiding') {
      logger.info('[main.ts] hidden-ack: Hiding overlay window.');
      if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible()) {
  overlayWindow.hide();
      }
      logger.info('[main.ts] hidden-ack: Setting overlayState to hidden.');
      overlayState = 'hidden';
      isHovering = false;
      lastUsedEdgeHoverPosition = null;
    } else {
      logger.warn(`[main.ts] hidden-ack: Received but state is not 'hiding'. Current state: ${overlayState}`);
    }
  });
  
  logger.info('[main.ts] Overlay window created.');
}

function createSystemTray() {
  logger.info('[main.ts] Creating system tray');
  
  // Create tray icon
  const iconPath = process.platform === 'win32' 
    ? path.join(__dirname, '../assets/tray/iconWin.png')
    : process.platform === 'darwin'
    ? path.join(__dirname, '../assets/tray/iconTemplate.png')
    : path.join(__dirname, '../assets/tray/icon.png');
  
  try {
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    tray.setToolTip('SnipFlow - Text Productivity Tool');
    
    // Create context menu
    const createTrayMenu = () => {
      const template = [
        {
          label: 'SnipFlow',
          type: 'normal' as const,
          enabled: false
        },
        { type: 'separator' as const },
        {
          label: 'Show Main Window',
          click: () => {
            logger.info('[main.ts] Tray: Show Main Window clicked');
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.show();
              mainWindow.focus();
              logger.info('[main.ts] Tray: Main window shown and focused');
            } else {
              logger.info('[main.ts] Tray: Main window not available, creating new one');
              createWindow();
              if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
              }
            }
          }
        },
        {
          label: overlayWindow?.isVisible() ? 'Hide Overlay' : 'Show Overlay',
          click: () => {
            logger.info('[main.ts] Tray: Toggle overlay clicked');
            if (!overlayWindow || overlayWindow.isDestroyed()) {
              logger.info('[main.ts] Tray: Overlay window not available, creating new one');
              createOverlayWindow();
            }
            
            if (overlayWindow?.isVisible()) {
              logger.info('[main.ts] Tray: Hiding overlay');
              hideOverlay('tray-toggle');
            } else {
              logger.info('[main.ts] Tray: Showing overlay at left-center');
              // Show overlay at default position
              positionOverlayAtPosition('left-center');
              if (overlayWindow) {
                overlayWindow.show();
                overlayWindow.webContents.send('overlay:show', { position: 'left-center' });
                overlayState = 'visible';
              }
            }
          }
        },
        { type: 'separator' as const },
        {
          label: 'Developer Tools',
          submenu: [
            {
              label: 'Main Window DevTools',
              click: () => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                  if (mainWindow.webContents.isDevToolsOpened()) {
                    mainWindow.webContents.closeDevTools();
                  } else {
                    mainWindow.webContents.openDevTools({ mode: 'detach' });
                  }
                }
              }
            },
            {
              label: 'Overlay DevTools',
              click: () => {
                if (overlayWindow && !overlayWindow.isDestroyed()) {
                  if (overlayWindow.webContents.isDevToolsOpened()) {
                    overlayWindow.webContents.closeDevTools();
                  } else {
                    overlayWindow.webContents.openDevTools({ mode: 'detach' });
                  }
                }
              }
            },
            {
              label: 'Chain Manager DevTools',
              click: () => {
                if (chainManagerWindow && !chainManagerWindow.isDestroyed()) {
                  if (chainManagerWindow.webContents.isDevToolsOpened()) {
                    chainManagerWindow.webContents.closeDevTools();
                  } else {
                    chainManagerWindow.webContents.openDevTools({ mode: 'detach' });
                  }
                } else {
                  // Open chain manager first, then dev tools
                  ipcMain.emit('open-chain-manager');
                  setTimeout(() => {
                    if (chainManagerWindow && !chainManagerWindow.isDestroyed()) {
                      chainManagerWindow.webContents.openDevTools({ mode: 'detach' });
                    }
                  }, 1000);
                }
              }
            }
          ]
        },
        { type: 'separator' as const },
        {
          label: 'Settings',
          click: () => {
            logger.info('[main.ts] Tray: Settings clicked');
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.show();
              mainWindow.focus();
              // Send navigation event to main window
              mainWindow.webContents.send('navigate-to-settings');
              logger.info('[main.ts] Tray: Main window shown, sending navigate-to-settings');
            } else {
              logger.info('[main.ts] Tray: Main window not available, creating new one');
              createWindow();
              // Wait for window to be ready before sending navigation event
              if (mainWindow) {
                mainWindow.once('ready-to-show', () => {
                  mainWindow?.show();
                  mainWindow?.focus();
                  setTimeout(() => {
                    mainWindow?.webContents.send('navigate-to-settings');
                    logger.info('[main.ts] Tray: Sent navigate-to-settings after window ready');
                  }, 100);
                });
              }
            }
          }
        },
        {
          label: 'Export Diagnostics',
          click: async () => {
            try {
              const diagnostics = await exportDiagnostics();
              logger.info('[main.ts] Diagnostics exported via tray');
            } catch (error) {
              logger.error('[main.ts] Error exporting diagnostics via tray:', error);
            }
          }
        },
        { type: 'separator' as const },
        {
          label: 'Quit SnipFlow',
          click: () => {
            app.quit();
          }
        }
      ];
      
      return Menu.buildFromTemplate(template);
    };
    
    // Set up tray interactions
    tray.on('click', () => {
      // On Windows/Linux, single click toggles overlay
      if (process.platform !== 'darwin') {
        if (overlayWindow?.isVisible()) {
          hideOverlay('tray-click');
        } else {
          positionOverlayAtPosition('left-center');
          if (overlayWindow) {
            overlayWindow.show();
            overlayWindow.webContents.send('overlay:show', { position: 'left-center' });
            overlayState = 'visible';
          }
        }
      }
    });
    
    tray.on('right-click', () => {
      tray?.popUpContextMenu(createTrayMenu());
    });
    
    // On macOS, always show menu on click
    if (process.platform === 'darwin') {
      tray.on('click', () => {
        tray?.popUpContextMenu(createTrayMenu());
      });
    }
    
    logger.info('[main.ts] System tray created successfully');
    
  } catch (error) {
    logger.error('[main.ts] Error creating system tray:', error);
    logger.warn('[main.ts] Continuing without system tray');
  }
}

function setupIpcHandlers() {
  logger.info('[main.ts] Setting up IPC handlers');

  // Settings
  ipcMain.handle('get-settings', async () => {
    try {
      logger.info('[main.ts] IPC: get-settings received');
      const settings = await dbGetSettings();
      logger.info(`[main.ts] IPC: get-settings returning: ${JSON.stringify(settings).substring(0, 100)}...`);
      return settings;
    } catch (error) {
      logger.error('[main.ts] IPC: Error in get-settings:', error);
      throw error; // Re-throw to be caught by invoke
    }
  });

  ipcMain.handle('save-settings', async (event, newSettings: Partial<Settings>) => {
    try {
      logger.info(`[main.ts] IPC: save-settings received with ${JSON.stringify(newSettings).substring(0,100)}...`);
      await dbUpdateSettings(newSettings);
      logger.info('[main.ts] IPC: save-settings completed successfully.');
      
      // Restart mouse tracking with new settings if edge hover settings changed
      const currentSettings = await dbGetSettings(); // Get the fully updated settings
      if (newSettings.edgeHover) {
        startMouseTracking(currentSettings);
      }
      
      // Resize overlay window if overlay settings changed
      if (newSettings.overlay && overlayWindow) {
        resizeOverlayWindow();
        logger.info('[main.ts] Overlay window resized due to settings change');
      }
      
       // Send settings:changed to renderers
      if (mainWindow) mainWindow.webContents.send('settings:changed', currentSettings);
      if (overlayWindow) overlayWindow.webContents.send('settings:changed', currentSettings);

      return { success: true };
    } catch (error) {
      logger.error('[main.ts] IPC: Error in save-settings:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Snippets
  ipcMain.handle('list-snippets', async () => dbGetSnippets());

  // Chains
  ipcMain.handle('list-chains', async () => dbGetChains());
  ipcMain.handle('get-chain-by-id', async (event, id: number) => {
    logger.info(`[main.ts] IPC: get-chain-by-id received for ID: ${id}`);
    try {
      const chain = await dbGetChainById(id);
      if (chain) {
        logger.info(`[main.ts] IPC: get-chain-by-id found chain: ${chain.name}`);
        return chain;
      } else {
        logger.warn(`[main.ts] IPC: get-chain-by-id chain not found for ID: ${id}`);
        return null;
      }
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in get-chain-by-id for ID ${id}:`, error);
      return null;
    }
  });

  ipcMain.handle('get-chain-by-name', async (event, name: string) => {
    logger.info(`[main.ts] IPC: get-chain-by-name received for name: ${name}`);
    try {
      const chain = await dbGetChainByName(name);
      if (chain) {
        logger.info(`[main.ts] IPC: get-chain-by-name found chain: ${chain.name}`);
        return chain;
      } else {
        logger.warn(`[main.ts] IPC: get-chain-by-name chain not found for name: ${name}`);
        return null;
      }
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in get-chain-by-name for name ${name}:`, error);
      return null;
    }
  });

  ipcMain.handle('create-chain', async (event, name: string, options: ChainOption[], description?: string | null, tags?: string[] | undefined, layoutData?: string | null, isPinned?: boolean) => {
    logger.info(`[IPC] Received create-chain. Name: ${name}, Options Count: ${options?.length}`);
    try {
      const chainData: Partial<Chain> = {
        name,
        options,
        isPinned: isPinned || false, // Ensure boolean
      };
      if (description !== undefined && description !== null) chainData.description = description;
      if (tags !== undefined) chainData.tags = tags;
      if (layoutData !== undefined && layoutData !== null) chainData.layoutData = layoutData;
      
      const newChain = dbCreateChain(chainData);
      if (newChain) {
        logger.info(`[IPC] Chain created successfully: ${newChain.id} - ${newChain.name}`);
        return newChain;
      } else {
        logger.error('[main.ts] IPC: Error in create-chain: Chain not created');
        throw new Error('Failed to create chain or receive new chain ID.');
      }
    } catch (error) {
      logger.error('[main.ts] IPC: Error in create-chain:', error);
      throw error; // Re-throw the error so React component can catch it
    }
  });

  ipcMain.handle('update-chain', async (_,id:number, data:Partial<Omit<Chain,'id'>>) => {
    try {
      dbUpdateChain(id, data);
      
      // Notify overlay of chain updates for real-time refresh
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('chains:updated');
        logger.info(`[main.ts] Sent chains:updated to overlay after updating chain ${id}`);
      }
      
      return { success: true };
    } catch (e: any) {
      logger.error(`IPC update-chain failed for ID ${id}:`, e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('delete-chain', async (event, id: number) => {
    logger.info(`[main.ts] IPC: delete-chain received for ID: ${id}`);
    try {
      await dbDeleteChain(id);
      logger.info(`[main.ts] IPC: delete-chain successful for ID: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in delete-chain for ID ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Clipboard History
  ipcMain.handle('get-clipboard-history', async () => {
    logger.info('[main.ts] IPC: get-clipboard-history received');
    try {
      const history = await dbGetClipboardHistory();
      logger.info(`[main.ts] IPC: get-clipboard-history returning ${history.length} items.`);
      return history;
    } catch (error) {
      logger.error('[main.ts] IPC: Error in get-clipboard-history:', error);
      return [];
    }
  });

  ipcMain.handle('pin-clipboard-item', async (event, id: string, pinned: boolean) => {
    logger.info(`[main.ts] IPC: pin-clipboard-item received for ID: ${id}, Pinned: ${pinned}`);
    try {
      const result = await dbPinClipboardItem(id, pinned);
      logger.info(`[main.ts] IPC: pin-clipboard-item successful for ID: ${id}`);
      return result;
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in pin-clipboard-item for ID ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('clear-clipboard-history', async () => {
    logger.info('[main.ts] IPC: clear-clipboard-history received');
    try {
      await dbClearClipboardHistory();
      logger.info('[main.ts] IPC: clear-clipboard-history successful.');
      return { success: true };
    } catch (error) {
      logger.error('[main.ts] IPC: Error in clear-clipboard-history:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Text Processing
  ipcMain.handle('process-text-with-chain', async (event, text: string) => {
    try {
      logger.info(`[main.ts] IPC: process-text-with-chain received with text length: ${text.length}`);
      const result = await processTextWithChain(
        text,
        async (name: string) => dbGetChainByName(name),
        async (question: string, options: { label: string; text: string }[]) => {
          const mainChoices: Choice[] = options.map(opt => ({ id: opt.label, title: opt.label, body: opt.text }));
          const chosenId = await mainChoiceProvider.presentChoice(mainChoices);
          return options.find(opt => opt.label === chosenId)?.text || '';
        },
        async (promptText: string) => {
          const result = await mainInputProvider.presentInput(promptText);
          return result || '';
        }
      );
      logger.info(`[main.ts] IPC: process-text-with-chain returning result length: ${result.length}`);
      return result;
    } catch (error) {
      logger.error('[main.ts] IPC: Error in process-text-with-chain:', error);
      return `Error processing text: ${(error as Error).message}`;
    }
  });

  // Logging from renderer
  ipcMain.on('log:error', (event, ...args) => {
    logger.error('[Renderer]', ...args);
  });

  ipcMain.on('log:info', (event, ...args) => {
    logger.info('[Renderer]', ...args);
  });
  
  ipcMain.on('log:warn', (event, ...args) => {
    logger.warn('[Renderer]', ...args);
  });

  // Overlay events
  ipcMain.on('overlay:ready', () => {
    logger.info('[main.ts] Received overlay:ready.');
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      // Example: Potentially send initial data or confirm ready state
      // overlayWindow.webContents.send('initial-data', { someData: 'hello from main' });
    }
    if (overlayState === 'showing') {
      logger.info('[main.ts] overlay:ready: Overlay was showing, ensuring state is visible.');
      overlayState = 'visible';
    }
  });

  ipcMain.on('request-main-window-focus', () => {
    logger.info('[main.ts] IPC: request-main-window-focus received from renderer.');
    // This is an explicit signal from the renderer to request focus on the main window.
    // No direct action needed here beyond logging.
  });

  ipcMain.on('hide-overlay', () => {
    logger.info(`[main.ts] IPC hide-overlay received. Current state: ${overlayState}`);
    hideOverlay("ipc_hide_overlay"); // Call the unified function
    // REMOVE all other existing logic from this handler
  });

  ipcMain.on('overlay:hidden-ack', () => {
    logger.info(`[main.ts] ✅ RECEIVED overlay:hidden-ack. Current state: ${overlayState}`);
    if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible()) {
      logger.info('[main.ts] hidden-ack: Hiding overlay window.');
      overlayWindow.hide();
    } else if (overlayWindow && !overlayWindow.isDestroyed() && !overlayWindow.isVisible()) {
      logger.info('[main.ts] hidden-ack: Overlay window already hidden.');
    }
    logger.info('[main.ts] hidden-ack: Setting overlayState to hidden.');
    overlayState = 'hidden';
    isHovering = false; 
    lastUsedEdgeHoverPosition = null;
  });

  const mainChoiceProvider: MainChoiceProvider = {
    presentChoice: async (choices: Choice[]) => {
      return new Promise((resolve) => {
        const target = overlayWindow?.isVisible() ? overlayWindow : mainWindow;
        if (!target) { logger.error("No window for choice"); resolve(null); return; }
        target.webContents.send('present-choice', choices);
        ipcMain.once('choice-response', (_, choiceId: string|null) => resolve(choiceId));
      });
    },
  };

  const mainInputProvider: MainInputProvider = {
    presentInput: async (promptText: string, initialValue?: string) => {
      return new Promise((resolve) => {
        const target = overlayWindow?.isVisible() ? overlayWindow : mainWindow;
        if (!target) { logger.error("No window for input"); resolve(null); return; }
        target.webContents.send('present-input', { prompt: promptText, initialValue });
        ipcMain.once('input-response', (_, value: string|null) => resolve(value));
      });
    },
  };

  ipcMain.handle('execute-chain', async (_, chainId: number, dynamicInput?: string) => {
    try {
      const chain = await dbGetChainById(chainId);
      if (!chain) {
        logger.error(`Execute Chain: Chain with ID ${chainId} not found.`);
        return `Error: Chain with ID ${chainId} not found.`;
      }
      logger.info(`[main.ts] Executing chain '${chain.name}' (ID: ${chainId}). Options count: ${chain.options.length}`);

      let contentToProcess = '';

      if (chain.options.length === 0) {
        logger.warn(`Chain "${chain.name}" has no options. Nothing to execute.`);
        return `Chain "${chain.name}" has no options.`; // Or handle as empty/success
      } else if (chain.options.length === 1) {
        contentToProcess = chain.options[0]?.body || '';
        logger.info(`Chain "${chain.name}" has 1 option. Using its body.`);
      } else {
        // Multiple options: present choice to user
        const choicesForMainProvider: Choice[] = chain.options.map(opt => ({
          id: opt.id, // Use option ID as choice ID
          title: opt.title,
          body: opt.body // Pass full body for display in choice UI if needed
        }));
        
        logger.info(`Chain "${chain.name}" has multiple options. Presenting choices.`);
        const chosenOptionId = await mainChoiceProvider.presentChoice(choicesForMainProvider);

        if (chosenOptionId) {
          const selectedOption = chain.options.find(opt => opt.id === chosenOptionId);
          contentToProcess = selectedOption?.body || '';
          logger.info(`User selected option ID: ${chosenOptionId}. Using its body.`);
        } else {
          logger.info(`User cancelled choice for chain "${chain.name}". Execution halted.`);
          return 'Chain execution cancelled by user.'; // Or handle as empty/success
        }
      }

      if (dynamicInput && contentToProcess.includes('[?]')) {
          contentToProcess = contentToProcess.replace('[?]', dynamicInput);
          logger.info(`Replaced [?] with dynamic input. New content (first 100): ${contentToProcess.substring(0,100)}`);
      } else if (dynamicInput) {
          logger.info(`Dynamic input provided but no [?] placeholder found in content for chain ${chain.name}.`);
      }

      // Adapter for processTextWithChain's choiceProvider
      const adaptedChoiceProviderForTextProcessing = async (question: string, options: { label: string; text: string }[]) => {
        // Map to the structure mainChoiceProvider expects
        const mainChoices: Choice[] = options.map(opt => ({ id: opt.label, title: opt.label, body: opt.text }));
        const chosenId = await mainChoiceProvider.presentChoice(mainChoices);
        // Find the original text associated with the chosenId (label)
        return options.find(opt => opt.label === chosenId)?.text || ''; // Fallback to empty string
      };

      // Adapter for processTextWithChain's inputProvider
      const adaptedInputProviderForTextProcessing = async (promptText: string) => {
        const result = await mainInputProvider.presentInput(promptText);
        return result || ''; // processTextWithChain expects string, not string | null
      };

      logger.info(`Processing content for chain "${chain.name}" with processTextWithChain. Content (first 100): ${contentToProcess.substring(0,100)}`);
      const finalOutput = await processTextWithChain(
        contentToProcess,
        async (name: string) => dbGetChainByName(name),
        adaptedChoiceProviderForTextProcessing,
        adaptedInputProviderForTextProcessing
      );

      logger.info(`Chain "${chain.name}" final output (first 100): ${finalOutput.substring(0,100)}`);
      // Perform the direct output action (e.g., copy to clipboard)
      clipboard.writeText(finalOutput);
      // Potentially send to main window or trigger other actions
      // mainWindow?.webContents.send('chain-executed-output', finalOutput);
      return finalOutput; // Return the final processed string

    } catch (error) {
      logger.error(`[main.ts] Error executing chain ID ${chainId}:`, error);
      return `Error executing chain: ${(error as Error).message}`;
    }
  });
  
  ipcMain.handle('create-snippet', async (_, content: string) => dbCreateSnippet({ content }));
  ipcMain.handle('update-snippet', async (_, id: number, data: { content?: string, isPinned?: boolean }) => dbUpdateSnippet(id, data));
  ipcMain.handle('delete-snippet', async (_, id: number) => dbDeleteSnippet(id));

  // IPC handlers for pinning snippets
  ipcMain.handle('toggle-snippet-pin', async (event, id: number, isPinned: boolean) => {
    logger.info(`[main.ts] IPC: toggle-snippet-pin received for ID: ${id}, Pinned: ${isPinned}`);
    try {
      // dbUpdateSnippet now accepts an object with isPinned
      const success = await dbUpdateSnippet(id, { isPinned }); 
      if (success) {
        logger.info(`[main.ts] IPC: toggle-snippet-pin successful for ID: ${id}`);
        if (mainWindow) mainWindow.webContents.send('snippets-updated');
        if (overlayWindow) overlayWindow.webContents.send('pinned-items-updated');
        return { success: true };
      } else {
        logger.warn(`[main.ts] IPC: toggle-snippet-pin failed for ID: ${id}. Update returned false.`);
        return { success: false, error: 'Snippet update failed or snippet not found' };
      }
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in toggle-snippet-pin for ID ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });

  // IPC handlers for pinning chains
  ipcMain.handle('toggle-chain-pin', async (event, id: number, isPinned: boolean) => {
    logger.info(`[main.ts] IPC: toggle-chain-pin received for ID: ${id}, Pinned: ${isPinned}`);
    try {
      // Assuming dbUpdateChain is modified to accept isPinned in its data object
      await dbUpdateChain(id, { isPinned }); 
      logger.info(`[main.ts] IPC: toggle-chain-pin successful for ID: ${id}`);
      if (mainWindow) mainWindow.webContents.send('chains-updated');
      if (overlayWindow) overlayWindow.webContents.send('pinned-items-updated');
      // Also notify React Chain Manager if it's open
      if (chainManagerWindow && !chainManagerWindow.isDestroyed()) {
        chainManagerWindow.webContents.send('chains-updated');
      }
      return { success: true };
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in toggle-chain-pin for ID ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });

  // IPC handler to get all pinned items
  ipcMain.handle('get-pinned-items', async () => {
    logger.info('[main.ts] IPC: get-pinned-items received');
    try {
      const items = await dbGetPinnedItems();
      logger.info(`[main.ts] IPC: get-pinned-items returning ${items.length} items.`);
      return items;
    } catch (error) {
      logger.error('[main.ts] IPC: Error in get-pinned-items:', error);
      return []; // Return empty array on error
    }
  });

  // IPC handler to get starter chains
  ipcMain.handle('get-starter-chains', async () => {
    logger.info('[main.ts] IPC: get-starter-chains received');
    try {
      const chains = await dbGetStarterChains();
      logger.info(`[main.ts] IPC: get-starter-chains returning ${chains.length} chains.`);
      return chains;
    } catch (error) {
      logger.error('[main.ts] IPC: Error in get-starter-chains:', error);
      return []; // Return empty array on error
    }
  });

  // IPC handler to open the Chain Manager window
  ipcMain.handle('open-chain-manager', () => {
    if (chainManagerWindow) {
      chainManagerWindow.focus();
      return;
    }

    chainManagerWindow = new BrowserWindow({
      width: 1100, // Adjusted size
      height: 750,
      show: false, // Don't show until ready
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // UNCOMMENTED and corrected to use main preload
        contextIsolation: true,
        nodeIntegration: false,
        spellcheck: false,
        // Potentially add sandbox: true if the content is simple enough and doesn't need node access
      },
      title: 'SnipFlow - Chain Manager',
      // icon: path.join(__dirname, 'assets/icons/icon.png'), // Optional: if you have an icon
    });

    chainManagerWindow.loadFile(path.join(__dirname, 'chainManager.html'));

    chainManagerWindow.once('ready-to-show', () => {
      chainManagerWindow!.show();
    });

    // Open DevTools for the new window - useful for development
    // chainManagerWindow.webContents.openDevTools(); 

    chainManagerWindow.on('closed', () => {
      chainManagerWindow = null;
    });
  });

  // Test overlay visibility handler
  ipcMain.on('test-show-overlay', () => {
    logger.info('[main.ts] IPC: test-show-overlay received');
    if (overlayWindow) {
      positionOverlayAtPosition('left-center');
      overlayWindow.show();
      overlayWindow.webContents.send('overlay:show', { position: 'left-center' });
      overlayState = 'visible';
      logger.info('[main.ts] Test overlay shown successfully');
    } else {
      logger.error('[main.ts] No overlay window available for test');
    }
  });

  // Insert snippet handler - for overlay text insertion
  ipcMain.on('insert-snippet', (event, content: string) => {
    logger.info(`[main.ts] IPC: insert-snippet received with content length: ${content.length}`);
    try {
      // Copy to clipboard for immediate paste
      clipboard.writeText(content);
      logger.info('[main.ts] IPC: insert-snippet - Content copied to clipboard successfully');
      
      // Hide overlay first to return focus to original window
      hideOverlay('insert-snippet-completion');
      
      // Brief delay to ensure overlay is hidden and focus returns to original window
      setTimeout(() => {
        logger.info('[main.ts] IPC: insert-snippet - Content ready for seamless pasting');
        
        // Restore focus to the previously focused window for cursor position preservation
        if (previouslyFocusedWindow && !previouslyFocusedWindow.isDestroyed()) {
          try {
            previouslyFocusedWindow.focus();
            logger.info('[main.ts] IPC: insert-snippet - Focus restored to original window');
          } catch (error) {
            logger.warn('[main.ts] IPC: insert-snippet - Could not restore focus:', error);
          }
        } else {
          logger.info('[main.ts] IPC: insert-snippet - No previous window to restore focus to');
        }
        
        // Send success notification back to overlay (if still exists)
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.webContents.send('snippet-inserted', { success: true });
        }
      }, 150);
      
    } catch (error) {
      logger.error('[main.ts] IPC: Error in insert-snippet:', error);
      // Send error notification back to overlay
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('snippet-inserted', { success: false, error: (error as Error).message });
      }
    }
  });

  // Error Log handler
  ipcMain.handle('get-error-log', async () => {
    try {
      return logger.getErrorLog();
    } catch (error) {
      logger.error('[main.ts] IPC: Error in get-error-log:', error);
      return ['Error fetching logs from main process.'];
    }
  });

  // Diagnostics handler
  ipcMain.handle('export-diagnostics', async () => {
    try {
      return exportDiagnostics();
    } catch (error) {
      logger.error('[main.ts] IPC: Error in export-diagnostics:', error);
      throw error;
    }
  });

  // NEW: Export/Import handlers
  ipcMain.handle('export-chain', async (event, chainId: number, options?: any) => {
    logger.info(`[main.ts] IPC: export-chain received for ID: ${chainId}`);
    try {
      const chain = await dbGetChainById(chainId);
      if (!chain) {
        throw new Error(`Chain with ID ${chainId} not found`);
      }

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        chains: [{
          name: chain.name,
          description: chain.description,
          options: chain.options,
          tags: chain.tags,
          isStarterChain: chain.isStarterChain,
          metadata: {
            originalId: chain.id,
            createdAt: chain.createdAt,
            updatedAt: chain.updatedAt,
          }
        }],
        metadata: {
          totalChains: 1,
          categories: [],
          tags: chain.tags || [],
        }
      };

      // Show save dialog
      const { dialog } = require('electron');
      const result = await dialog.showSaveDialog(mainWindow || chainManagerWindow, {
        title: 'Export Chain',
        defaultPath: `${chain.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.snip`,
        filters: [
          { name: 'SnipFlow Chain Files', extensions: ['snip'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        const fs = require('fs');
        await fs.promises.writeFile(result.filePath, JSON.stringify(exportData, null, 2));
        logger.info(`[main.ts] Chain exported successfully to: ${result.filePath}`);
        return result.filePath;
      }

      return null;
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in export-chain for ID ${chainId}:`, error);
      throw error;
    }
  });

  ipcMain.handle('export-chains', async (event, chainIds: number[], options?: any) => {
    logger.info(`[main.ts] IPC: export-chains received for ${chainIds.length} chains`);
    try {
      const chains = [];
      const allTags = new Set<string>();

      for (const chainId of chainIds) {
        const chain = await dbGetChainById(chainId);
        if (chain) {
          chains.push({
            name: chain.name,
            description: chain.description,
            options: chain.options,
            tags: chain.tags,
            isStarterChain: chain.isStarterChain,
            metadata: {
              originalId: chain.id,
              createdAt: chain.createdAt,
              updatedAt: chain.updatedAt,
            }
          });
          
          if (chain.tags) {
            chain.tags.forEach(tag => allTags.add(tag));
          }
        }
      }

      if (chains.length === 0) {
        throw new Error('No valid chains found to export');
      }

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        chains,
        metadata: {
          totalChains: chains.length,
          categories: [],
          tags: Array.from(allTags),
        }
      };

      // Show save dialog
      const { dialog } = require('electron');
      const defaultName = chains.length === 1 && chains[0]
        ? `${chains[0].name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.snip`
        : `snipflow_chains_${chains.length}_${new Date().toISOString().split('T')[0]}.snip`;

      const result = await dialog.showSaveDialog(mainWindow || chainManagerWindow, {
        title: `Export ${chains.length} Chain${chains.length > 1 ? 's' : ''}`,
        defaultPath: defaultName,
        filters: [
          { name: 'SnipFlow Chain Files', extensions: ['snip'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        const fs = require('fs');
        await fs.promises.writeFile(result.filePath, JSON.stringify(exportData, null, 2));
        logger.info(`[main.ts] ${chains.length} chains exported successfully to: ${result.filePath}`);
        return result.filePath;
      }

      return null;
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in export-chains:`, error);
      throw error;
    }
  });

  ipcMain.handle('import-chains-with-dialog', async (event) => {
    logger.info(`[main.ts] IPC: import-chains-with-dialog received`);
    try {
      // Show open dialog
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog(mainWindow || chainManagerWindow, {
        title: 'Import Chains from .snip file',
        filters: [
          { name: 'SnipFlow Chain Files', extensions: ['snip'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      const filePath = result.filePaths[0];
      
      // Use the existing import logic
      const fs = require('fs');
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const importData = JSON.parse(fileContent);

      if (!importData.chains || !Array.isArray(importData.chains)) {
        throw new Error('Invalid .snip file format: missing chains array');
      }

      const imported = [];
      const skipped = [];
      const errors = [];

      for (const chainData of importData.chains) {
        try {
          // Check if chain already exists
          const existing = await dbGetChainByName(chainData.name);
          
          if (existing) {
            // Simple rename strategy for now
            let newName = chainData.name;
            let counter = 1;
            while (await dbGetChainByName(newName)) {
              newName = `${chainData.name} (${counter})`;
              counter++;
            }
            chainData.name = newName;
          }

          // Create the new chain
          const newChain = dbCreateChain({
            name: chainData.name,
            description: chainData.description,
            options: chainData.options,
            tags: chainData.tags,
            isStarterChain: chainData.isStarterChain || false,
          });

          if (newChain) {
            imported.push(newChain);
            logger.info(`[main.ts] Imported chain: ${chainData.name}`);
          }
        } catch (error) {
          logger.error(`[main.ts] Error importing chain ${chainData.name}:`, error);
          errors.push(`${chainData.name}: ${(error as Error).message}`);
        }
      }

      // Notify windows of chain updates
      if (mainWindow) mainWindow.webContents.send('chains-updated');
      if (overlayWindow) overlayWindow.webContents.send('chains-updated');
      if (chainManagerWindow && !chainManagerWindow.isDestroyed()) {
        chainManagerWindow.webContents.send('chains-updated');
      }

      logger.info(`[main.ts] Import completed: ${imported.length} imported, ${skipped.length} skipped, ${errors.length} errors`);

      return {
        success: true,
        imported: imported.length,
        skipped: skipped.length,
        errors,
        chains: imported
      };
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in import-chains-with-dialog:`, error);
      throw error;
    }
  });

  ipcMain.handle('preview-import', async (event, filePath: string) => {
    logger.info(`[main.ts] IPC: preview-import received for file: ${filePath}`);
    try {
      const fs = require('fs');
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const importData = JSON.parse(fileContent);

      // Validate basic structure
      if (!importData.chains || !Array.isArray(importData.chains)) {
        throw new Error('Invalid .snip file format: missing chains array');
      }

      // Check for conflicts with existing chains
      const conflicts = [];
      for (const chain of importData.chains) {
        const existing = await dbGetChainByName(chain.name);
        if (existing) {
          conflicts.push(chain.name);
        }
      }

      return {
        chains: importData.chains,
        totalChains: importData.chains.length,
        conflicts,
        fileSize: Buffer.byteLength(fileContent, 'utf8')
      };
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in preview-import:`, error);
      throw error;
    }
  });

  ipcMain.handle('import-chains-from-file', async (event, filePath: string, options?: any) => {
    logger.info(`[main.ts] IPC: import-chains-from-file received for file: ${filePath}`);
    try {
      const fs = require('fs');
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const importData = JSON.parse(fileContent);

      if (!importData.chains || !Array.isArray(importData.chains)) {
        throw new Error('Invalid .snip file format: missing chains array');
      }

      const imported = [];
      const skipped = [];
      const errors = [];

      for (const chainData of importData.chains) {
        try {
          // Check if chain already exists
          const existing = await dbGetChainByName(chainData.name);
          
          if (existing) {
            const conflictResolution = options?.conflictResolution || 'skip';
            
            if (conflictResolution === 'skip') {
              skipped.push(chainData.name);
              continue;
            } else if (conflictResolution === 'rename') {
              // Find a unique name
              let newName = chainData.name;
              let counter = 1;
              while (await dbGetChainByName(newName)) {
                newName = `${chainData.name} (${counter})`;
                counter++;
              }
              chainData.name = newName;
            } else if (conflictResolution === 'replace') {
              // Delete existing chain first
              await dbDeleteChain(existing.id);
            }
          }

          // Create the new chain
          const newChain = dbCreateChain({
            name: chainData.name,
            description: chainData.description,
            options: chainData.options,
            tags: chainData.tags,
            isStarterChain: chainData.isStarterChain || false,
          });

          if (newChain) {
            imported.push(newChain);
            logger.info(`[main.ts] Imported chain: ${chainData.name}`);
          }
        } catch (error) {
          logger.error(`[main.ts] Error importing chain ${chainData.name}:`, error);
          errors.push(`${chainData.name}: ${(error as Error).message}`);
        }
      }

      // Notify windows of chain updates
      if (mainWindow) mainWindow.webContents.send('chains-updated');
      if (overlayWindow) overlayWindow.webContents.send('chains-updated');
      if (chainManagerWindow && !chainManagerWindow.isDestroyed()) {
        chainManagerWindow.webContents.send('chains-updated');
      }

      logger.info(`[main.ts] Import completed: ${imported.length} imported, ${skipped.length} skipped, ${errors.length} errors`);

      return {
        success: true,
        imported: imported.length,
        skipped: skipped.length,
        errors,
        chains: imported
      };
    } catch (error) {
      logger.error(`[main.ts] IPC: Error in import-chains-from-file:`, error);
      throw error;
    }
  });
}

app.on('ready', async () => {
  await initProductionDb();
  logger.info('[main.ts] DB initialized.');
  
  // Setup test data for development
  if (process.env.NODE_ENV === 'development') {
    await setupTestStarterChains();
  }
  
  // Reset edge hover settings to defaults for testing
  // Remove this line after testing is complete
  dbResetEdgeHoverSettings();
  
  createWindow();
  createOverlayWindow(); 
  createSystemTray();
  setupIpcHandlers();
  
  // Start clipboard monitoring
  startClipboardMonitor();
  logger.info('[main.ts] Clipboard monitoring started.');
  
  logger.info('[main.ts] App ready, IPCs registered.');
  const s = dbGetSettings();
  if (s.edgeHover.enabled) startMouseTracking(s); 
  else logger.info('[main.ts] Edge hover initially disabled.');
});

app.on('window-all-closed', () => { if (process.platform !=='darwin') app.quit(); });
app.on('will-quit', () => { 
  globalShortcut.unregisterAll(); 
  if (mouseMoveInterval) clearInterval(mouseMoveInterval); 
  if (hoverTimeout) clearTimeout(hoverTimeout); 
  if (tray) {
    tray.destroy();
    tray = null;
  }
  stopClipboardMonitor();
  logger.info('[main.ts] Clipboard monitoring stopped.');
  closeDb(); 
});
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

export function getMainWindow(): BrowserWindow|null { return mainWindow; }
export function getOverlayWindow(): BrowserWindow|null { return overlayWindow; }

function hideOverlay(source: string) {
  if (overlayState === 'visible' || overlayState === 'showing') {
    logger.info(`[main.ts] hideOverlay (source: ${source}): Requesting hide. Current state: ${overlayState}. Setting to hiding.`);
    overlayState = 'hiding';
    isHovering = false; 
    hideAttemptScheduled = false; // Reset flag when hiding
    if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
    
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('overlay:hide');
      
      setTimeout(() => {
        if (overlayState === 'hiding') {
          logger.warn(`[main.ts] Fallback Safety: No overlay:hidden-ack received within 2000ms for source '${source}'. Force hiding.`);
          if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible()) {
            overlayWindow.hide();
          }
          overlayState = 'hidden';
          isHovering = false;
          lastUsedEdgeHoverPosition = null;
          logger.info('[main.ts] Fallback Safety: Overlay state forced to hidden.');
        }
      }, 2000);

    } else {
      logger.warn(`[main.ts] hideOverlay (source: ${source}): overlayWindow not available to send "overlay:hide"`);
      if (overlayState === 'hiding') {
         logger.warn(`[main.ts] hideOverlay (source: ${source}): OverlayWindow gone, forcing state to hidden.`);
         overlayState = 'hidden';
         isHovering = false;
         lastUsedEdgeHoverPosition = null;
      }
    }
  } else {
    logger.info(`[main.ts] hideOverlay (source: ${source}): Called but overlay not visible or showing. State: ${overlayState}. No action.`);
  }
}
