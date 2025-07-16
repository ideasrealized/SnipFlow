/**
 * SnipFlow Edge Detection Service
 * Advanced edge monitoring with gesture recognition and smart triggers
 */

import { screen, clipboard, BrowserWindow } from 'electron';
import { logger } from '../logger';
import { aiService, AIContext } from './ai-service';

export interface EdgeZone {
  edge: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x: number;
  y: number;
  width: number;
  height: number;
  screen: number;
}

export interface EdgeConfig {
  enabled: boolean;
  sensitivity: number; // 1-10
  activationDelay: number; // ms
  zones: EdgeZone[];
  smartTriggers: boolean;
  gestureSupport: boolean;
}

export interface SmartTrigger {
  type: 'clipboard' | 'typing' | 'selection' | 'pattern';
  condition: string;
  action: string;
  confidence: number;
}

export class EdgeDetectionService {
  private config: EdgeConfig;
  private activeZone: EdgeZone | null = null;
  private hoverTimer: NodeJS.Timeout | null = null;
  private lastClipboard: string = '';
  private clipboardMonitorInterval: NodeJS.Timeout | null = null;
  private gestureBuffer: Array<{ x: number; y: number; time: number }> = [];
  private readonly GESTURE_BUFFER_SIZE = 10;
  private readonly CLIPBOARD_CHECK_INTERVAL = 500;
  
  constructor() {
    this.config = {
      enabled: true,
      sensitivity: 5,
      activationDelay: 200,
      zones: this.initializeZones(),
      smartTriggers: true,
      gestureSupport: true
    };
    
    this.startMonitoring();
  }
  
  /**
   * Initialize edge zones for all displays
   */
  private initializeZones(): EdgeZone[] {
    const zones: EdgeZone[] = [];
    const displays = screen.getAllDisplays();
    
    displays.forEach((display, index) => {
      const { x, y, width, height } = display.workArea;
      const edgeSize = 5; // pixels
      const cornerSize = 100; // pixels
      
      // Corners (higher priority)
      zones.push(
        {
          edge: 'top-left',
          x,
          y,
          width: cornerSize,
          height: cornerSize,
          screen: index
        },
        {
          edge: 'top-right',
          x: x + width - cornerSize,
          y,
          width: cornerSize,
          height: cornerSize,
          screen: index
        },
        {
          edge: 'bottom-left',
          x,
          y: y + height - cornerSize,
          width: cornerSize,
          height: cornerSize,
          screen: index
        },
        {
          edge: 'bottom-right',
          x: x + width - cornerSize,
          y: y + height - cornerSize,
          width: cornerSize,
          height: cornerSize,
          screen: index
        }
      );
      
      // Edges
      zones.push(
        {
          edge: 'top',
          x: x + cornerSize,
          y,
          width: width - (cornerSize * 2),
          height: edgeSize,
          screen: index
        },
        {
          edge: 'bottom',
          x: x + cornerSize,
          y: y + height - edgeSize,
          width: width - (cornerSize * 2),
          height: edgeSize,
          screen: index
        },
        {
          edge: 'left',
          x,
          y: y + cornerSize,
          width: edgeSize,
          height: height - (cornerSize * 2),
          screen: index
        },
        {
          edge: 'right',
          x: x + width - edgeSize,
          y: y + cornerSize,
          width: edgeSize,
          height: height - (cornerSize * 2),
          screen: index
        }
      );
    });
    
    return zones;
  }
  
  /**
   * Start monitoring for edge activation
   */
  private startMonitoring(): void {
    if (!this.config.enabled) return;
    
    // Monitor mouse position
    setInterval(() => {
      const point = screen.getCursorScreenPoint();
      this.checkEdgeActivation(point);
      
      if (this.config.gestureSupport) {
        this.recordGesturePoint(point);
      }
    }, 50); // 20fps monitoring
    
    // Start clipboard monitoring
    if (this.config.smartTriggers) {
      this.startClipboardMonitoring();
    }
  }
  
  /**
   * Check if cursor is in activation zone
   */
  private checkEdgeActivation(point: Electron.Point): void {
    const currentZone = this.getZoneAtPoint(point);
    
    if (currentZone && !this.activeZone) {
      // Entered edge zone
      this.activeZone = currentZone;
      this.startActivationTimer();
    } else if (!currentZone && this.activeZone) {
      // Left edge zone
      this.cancelActivation();
    }
  }
  
  /**
   * Get zone at cursor position
   */
  private getZoneAtPoint(point: Electron.Point): EdgeZone | null {
    // Check corners first (higher priority)
    for (const zone of this.config.zones) {
      if (zone.edge.includes('-') && this.isPointInZone(point, zone)) {
        return zone;
      }
    }
    
    // Then check edges
    for (const zone of this.config.zones) {
      if (!zone.edge.includes('-') && this.isPointInZone(point, zone)) {
        return zone;
      }
    }
    
    return null;
  }
  
  /**
   * Check if point is within zone
   */
  private isPointInZone(point: Electron.Point, zone: EdgeZone): boolean {
    return point.x >= zone.x && 
           point.x <= zone.x + zone.width &&
           point.y >= zone.y && 
           point.y <= zone.y + zone.height;
  }
  
  /**
   * Start activation timer
   */
  private startActivationTimer(): void {
    if (this.hoverTimer) return;
    
    const delay = this.config.activationDelay * (11 - this.config.sensitivity) / 10;
    
    this.hoverTimer = setTimeout(() => {
      if (this.activeZone) {
        this.triggerOverlay(this.activeZone);
      }
    }, delay);
  }
  
  /**
   * Cancel activation
   */
  private cancelActivation(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    this.activeZone = null;
  }
  
  /**
   * Trigger overlay display
   */
  private async triggerOverlay(zone: EdgeZone): Promise<void> {
    logger.info(`[Edge Detection] Triggering overlay at ${zone.edge}`);
    
    // Get AI context for smart suggestions
    const context = await this.getAIContext();
    
    // Check for smart triggers
    if (this.config.smartTriggers) {
      const trigger = await this.checkSmartTriggers(context);
      if (trigger) {
        logger.info(`[Edge Detection] Smart trigger activated: ${trigger.type}`);
      }
    }
    
    // Send activation event with context
    const event = {
      zone: zone.edge,
      screen: zone.screen,
      context,
      gesture: this.detectGesture()
    };
    
    // Trigger overlay through IPC
    this.sendActivationEvent(event);
  }
  
  /**
   * Start clipboard monitoring
   */
  private startClipboardMonitoring(): void {
    this.clipboardMonitorInterval = setInterval(() => {
      const current = clipboard.readText();
      
      if (current && current !== this.lastClipboard) {
        this.lastClipboard = current;
        this.onClipboardChange(current);
      }
    }, this.CLIPBOARD_CHECK_INTERVAL);
  }
  
  /**
   * Handle clipboard changes
   */
  private async onClipboardChange(content: string): Promise<void> {
    logger.info('[Edge Detection] Clipboard changed');
    
    // Analyze clipboard content
    const analysis = await this.analyzeClipboardContent(content);
    
    if (analysis.shouldTrigger) {
      logger.info(`[Edge Detection] Auto-triggering overlay for: ${analysis.type}`);
      
      // Auto-show overlay with relevant suggestions
      this.sendSmartActivationEvent({
        trigger: 'clipboard',
        content,
        analysis
      });
    }
  }
  
  /**
   * Analyze clipboard content for smart triggers
   */
  private async analyzeClipboardContent(content: string): Promise<any> {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\//,
      code: /^(function|class|const|let|var|import|export|def|public|private)/,
      json: /^[{\[]/,
      phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(content.trim())) {
        return {
          shouldTrigger: true,
          type,
          confidence: 0.9
        };
      }
    }
    
    // Check length for potential templates
    if (content.length > 100) {
      return {
        shouldTrigger: true,
        type: 'template',
        confidence: 0.7
      };
    }
    
    return { shouldTrigger: false };
  }
  
  /**
   * Record gesture points
   */
  private recordGesturePoint(point: Electron.Point): void {
    this.gestureBuffer.push({
      x: point.x,
      y: point.y,
      time: Date.now()
    });
    
    if (this.gestureBuffer.length > this.GESTURE_BUFFER_SIZE) {
      this.gestureBuffer.shift();
    }
  }
  
  /**
   * Detect gesture patterns
   */
  private detectGesture(): string | null {
    if (this.gestureBuffer.length < 5) return null;
    
    const recent = this.gestureBuffer.slice(-5);
    if (recent.length < 2) return null;
    
    const lastPoint = recent[recent.length - 1];
    const firstPoint = recent[0];
    
    if (!lastPoint || !firstPoint) return null;
    
    const timeDiff = lastPoint.time - firstPoint.time;
    
    if (timeDiff > 500) return null; // Too slow
    
    // Calculate movement vectors
    const dx = lastPoint.x - firstPoint.x;
    const dy = lastPoint.y - firstPoint.y;
    
    // Detect gesture type
    if (Math.abs(dx) > 50 && Math.abs(dy) < 20) {
      return dx > 0 ? 'swipe-right' : 'swipe-left';
    } else if (Math.abs(dy) > 50 && Math.abs(dx) < 20) {
      return dy > 0 ? 'swipe-down' : 'swipe-up';
    } else if (Math.abs(dx) > 30 && Math.abs(dy) > 30) {
      return 'diagonal';
    }
    
    return null;
  }
  
  /**
   * Check smart triggers
   */
  private async checkSmartTriggers(context: AIContext): Promise<SmartTrigger | null> {
    const triggers: SmartTrigger[] = [
      {
        type: 'typing',
        condition: 'repeated_typing',
        action: 'show_templates',
        confidence: 0.8
      },
      {
        type: 'selection',
        condition: 'text_selected',
        action: 'show_formatting',
        confidence: 0.85
      }
    ];
    
    // Check each trigger condition
    for (const trigger of triggers) {
      if (await this.evaluateTrigger(trigger, context)) {
        return trigger;
      }
    }
    
    return null;
  }
  
  /**
   * Evaluate trigger condition
   */
  private async evaluateTrigger(trigger: SmartTrigger, context: AIContext): Promise<boolean> {
    // Placeholder for trigger evaluation logic
    return false;
  }
  
  /**
   * Get AI context
   */
  private async getAIContext(): Promise<AIContext> {
    // Get active window info
    const activeWindow = BrowserWindow.getFocusedWindow();
    
    return {
      applicationName: 'Unknown', // Would need native module for this
      windowTitle: activeWindow?.getTitle() || '',
      timeOfDay: new Date().toLocaleTimeString(),
      dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }),
      userActivity: []
    };
  }
  
  /**
   * Send activation event
   */
  private sendActivationEvent(event: any): void {
    // Send to overlay window via IPC
    const overlayWindow = BrowserWindow.getAllWindows().find(w => 
      w.getTitle() === 'SnipFlow Overlay'
    );
    
    if (overlayWindow) {
      overlayWindow.webContents.send('edge-activated', event);
    }
  }
  
  /**
   * Send smart activation event
   */
  private sendSmartActivationEvent(event: any): void {
    const overlayWindow = BrowserWindow.getAllWindows().find(w => 
      w.getTitle() === 'SnipFlow Overlay'
    );
    
    if (overlayWindow) {
      overlayWindow.webContents.send('smart-trigger', event);
    }
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<EdgeConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.zones || config.enabled !== undefined) {
      // Reinitialize if zones or enabled state changed
      this.config.zones = this.initializeZones();
    }
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }
    
    if (this.clipboardMonitorInterval) {
      clearInterval(this.clipboardMonitorInterval);
    }
  }
}

// Export singleton instance
export const edgeDetection = new EdgeDetectionService();
