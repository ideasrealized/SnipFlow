/**
 * SnipFlow Performance Engine
 * Implements sub-50ms activation, 60+ FPS animations, and GPU optimization
 */

import { app, BrowserWindow } from 'electron';
import * as path from 'path';

export interface PerformanceConfig {
  targetFPS: number;
  maxMemoryMB: number;
  gpuAcceleration: 'force-high' | 'integrated' | 'auto';
  animationBudgetMs: number;
}

export class PerformanceEngine {
  private config: PerformanceConfig;
  private frameMetrics: FrameMetrics;
  private animationScheduler: AnimationScheduler;
  private memoryMonitor: MemoryMonitor;
  
  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      targetFPS: 60,
      maxMemoryMB: 150,
      gpuAcceleration: 'force-high',
      animationBudgetMs: 16.67, // 60fps
      ...config
    };
    
    this.frameMetrics = new FrameMetrics();
    this.animationScheduler = new AnimationScheduler(this.config.animationBudgetMs);
    this.memoryMonitor = new MemoryMonitor(this.config.maxMemoryMB);
    
    this.initializeGPUOptimization();
  }
  
  /**
   * Initialize GPU acceleration for maximum performance
   */
  private initializeGPUOptimization(): void {
    // Windows-specific GPU optimizations
    if (process.platform === 'win32') {
      app.commandLine.appendSwitch('enable-gpu-rasterization');
      app.commandLine.appendSwitch('enable-zero-copy');
      app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
      app.commandLine.appendSwitch('enable-accelerated-video-decode');
    }
    
    // Force high-performance GPU on systems with multiple GPUs
    if (this.config.gpuAcceleration === 'force-high') {
      app.commandLine.appendSwitch('force_high_performance_gpu');
    }
    
    // Disable frame rate limiting for high-refresh displays
    app.commandLine.appendSwitch('disable-frame-rate-limit');
    
    // Enable hardware acceleration features
    app.commandLine.appendSwitch('enable-features=VaapiVideoDecoder,CanvasOopRasterization');
    
    // Disable features that might impact performance
    app.commandLine.appendSwitch('disable-features=UseChromeOSDirectVideoDecoder');
  }
  
  /**
   * Create optimized overlay window
   */
  createOptimizedOverlay(): BrowserWindow {
    const overlay = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      hasShadow: false, // Better performance on Windows
      roundedCorners: false, // Avoid compositor overhead
      thickFrame: false, // Windows: disable resize borders
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        backgroundThrottling: false, // Keep animations smooth
        offscreen: false, // Need real-time rendering
        webgl: true,
        experimentalFeatures: true,
        v8CacheOptions: 'code', // Cache compiled JS
        disableBlinkFeatures: 'AutomationControlled',
        preload: path.join(__dirname, 'preload.js')
      }
    });
    
    // Critical performance settings
    overlay.setBackgroundColor('#00000000'); // Fully transparent
    
    // Windows-specific optimizations
    if (process.platform === 'win32') {
      overlay.setIgnoreMouseEvents(false, { forward: true });
      overlay.hookWindowMessage(0x0084, () => { // WM_NCHITTEST
        overlay.setIgnoreMouseEvents(false, { forward: false });
        return 0;
      });
    }
    
    // Optimize content loading
    overlay.webContents.on('did-finish-load', () => {
      // Enable GPU acceleration for canvas and WebGL
      overlay.webContents.executeJavaScript(`
        document.documentElement.style.willChange = 'transform, opacity';
        document.body.style.contain = 'layout style paint';
        
        // Force GPU layers for animated elements
        document.querySelectorAll('[data-animated]').forEach(el => {
          el.style.transform = 'translateZ(0)';
          el.style.backfaceVisibility = 'hidden';
          el.style.perspective = '1000px';
        });
      `);
    });
    
    // Monitor performance
    this.attachPerformanceMonitoring(overlay);
    
    return overlay;
  }
  
  /**
   * Attach performance monitoring to window
   */
  private attachPerformanceMonitoring(window: BrowserWindow): void {
    // Monitor frame timing
    window.webContents.on('paint', (event, dirty, image) => {
      this.frameMetrics.recordFrame();
    });
    
    // Monitor memory usage
    setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryMonitor.record(usage);
      
      // Trigger GC if needed
      if (usage.heapUsed > this.config.maxMemoryMB * 1024 * 1024) {
        if (global.gc) {
          global.gc();
        }
      }
    }, 5000);
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      fps: this.frameMetrics.getCurrentFPS(),
      frameTimes: this.frameMetrics.getFrameTimes(),
      memory: this.memoryMonitor.getCurrentUsage(),
      animationLoad: this.animationScheduler.getCurrentLoad()
    };
  }
}

/**
 * Frame timing metrics
 */
class FrameMetrics {
  private frameTimes: number[] = [];
  private lastFrameTime: number = performance.now();
  private readonly maxSamples = 60;
  
  recordFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }
  
  getCurrentFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return Math.round(1000 / avgFrameTime);
  }
  
  getFrameTimes(): number[] {
    return [...this.frameTimes];
  }
  
  getPercentile(p: number): number {
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * p / 100);
    return sorted[index] || 0;
  }
}

/**
 * Animation scheduler with frame budgeting
 */
class AnimationScheduler {
  private animationQueue: ScheduledAnimation[] = [];
  private currentFrame: number = 0;
  private frameBudgetMs: number;
  private isRunning: boolean = false;
  
  constructor(frameBudgetMs: number) {
    this.frameBudgetMs = frameBudgetMs;
  }
  
  schedule(animation: Animation, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    const scheduled: ScheduledAnimation = {
      animation,
      priority: this.getPriorityValue(priority),
      addedFrame: this.currentFrame
    };
    
    this.animationQueue.push(scheduled);
    this.animationQueue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isRunning) {
      this.startScheduler();
    }
  }
  
  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }
  
  private startScheduler(): void {
    this.isRunning = true;
    
    const runFrame = () => {
      const frameStart = performance.now();
      let frameTime = 0;
      
      // Process animations within budget
      while (this.animationQueue.length > 0 && frameTime < this.frameBudgetMs) {
        const scheduled = this.animationQueue.shift()!;
        
        try {
          scheduled.animation.tick(this.currentFrame);
          
          if (scheduled.animation.isComplete()) {
            scheduled.animation.cleanup();
          } else {
            // Re-queue if not complete
            this.animationQueue.push(scheduled);
          }
        } catch (error) {
          console.error('Animation error:', error);
        }
        
        frameTime = performance.now() - frameStart;
      }
      
      this.currentFrame++;
      
      if (this.animationQueue.length > 0) {
        requestAnimationFrame(runFrame);
      } else {
        this.isRunning = false;
      }
    };
    
    requestAnimationFrame(runFrame);
  }
  
  getCurrentLoad(): number {
    return this.animationQueue.length;
  }
}

/**
 * Memory usage monitor
 */
class MemoryMonitor {
  private samples: MemorySample[] = [];
  private maxMemoryMB: number;
  private readonly maxSamples = 60;
  
  constructor(maxMemoryMB: number) {
    this.maxMemoryMB = maxMemoryMB;
  }
  
  record(usage: NodeJS.MemoryUsage): void {
    const sample: MemorySample = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers
    };
    
    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }
  
  getCurrentUsage(): MemoryMetrics {
    const latest = this.samples[this.samples.length - 1];
    if (!latest) {
      return {
        heapUsedMB: 0,
        heapTotalMB: 0,
        percentUsed: 0,
        trend: 'stable'
      };
    }
    
    const heapUsedMB = latest.heapUsed / 1024 / 1024;
    const heapTotalMB = latest.heapTotal / 1024 / 1024;
    
    return {
      heapUsedMB,
      heapTotalMB,
      percentUsed: (heapUsedMB / this.maxMemoryMB) * 100,
      trend: this.calculateTrend()
    };
  }
  
  private calculateTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.samples.length < 10) return 'stable';
    
    const recent = this.samples.slice(-10);
    const older = this.samples.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }
}

// Type definitions
interface ScheduledAnimation {
  animation: Animation;
  priority: number;
  addedFrame: number;
}

interface Animation {
  tick(frame: number): void;
  isComplete(): boolean;
  cleanup(): void;
}

interface MemorySample {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

interface MemoryMetrics {
  heapUsedMB: number;
  heapTotalMB: number;
  percentUsed: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PerformanceMetrics {
  fps: number;
  frameTimes: number[];
  memory: MemoryMetrics;
  animationLoad: number;
}

// Export singleton instance
export const performanceEngine = new PerformanceEngine();
