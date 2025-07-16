/**
 * SnipFlow Animation Engine
 * Implements fluid, spring-based animations with liquid effects
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  velocity?: number;
  precision?: number;
}

export interface AnimationOptions {
  duration?: number;
  easing?: string | EasingFunction;
  delay?: number;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}

export type EasingFunction = (t: number) => number;

/**
 * Main animation engine for fluid interactions
 */
export class FluidAnimationEngine {
  private readonly FRAME_BUDGET_MS = 16.67; // 60fps target
  private animations: Map<string, AnimationController> = new Map();
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  
  /**
   * Animate element with spring physics
   */
  spring(
    element: HTMLElement,
    properties: Record<string, number>,
    config: Partial<SpringConfig> = {}
  ): SpringAnimation {
    const springConfig: SpringConfig = {
      stiffness: 180,
      damping: 12,
      mass: 1,
      velocity: 0,
      precision: 0.01,
      ...config
    };
    
    const animation = new SpringAnimation(element, properties, springConfig);
    this.registerAnimation(animation);
    return animation;
  }
  
  /**
   * Liquid morph text animation
   */
  async morphText(
    element: HTMLElement,
    from: string,
    to: string,
    options: MorphOptions = {}
  ): Promise<void> {
    const morpher = new TextMorpher(element, from, to, options);
    await morpher.morph();
  }
  
  /**
   * Particle burst effect
   */
  particles(
    origin: DOMRect,
    options: ParticleOptions = {}
  ): ParticleSystem {
    const system = new ParticleSystem(origin, options);
    system.emit();
    return system;
  }
  
  /**
   * Liquid transition between elements
   */
  async liquidTransition(
    from: HTMLElement,
    to: HTMLElement,
    options: LiquidOptions = {}
  ): Promise<void> {
    const liquid = new LiquidTransition(from, to, options);
    await liquid.animate();
  }
  
  /**
   * Register animation for frame scheduling
   */
  private registerAnimation(animation: AnimationController): void {
    const id = Math.random().toString(36).substr(2, 9);
    this.animations.set(id, animation);
    
    animation.onComplete(() => {
      this.animations.delete(id);
    });
    
    if (!this.rafId) {
      this.startAnimationLoop();
    }
  }
  
  /**
   * Main animation loop
   */
  private startAnimationLoop(): void {
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      
      // Update all active animations
      for (const [id, animation] of this.animations) {
        animation.update(deltaTime);
        
        if (animation.isComplete()) {
          this.animations.delete(id);
        }
      }
      
      // Continue loop if animations remain
      if (this.animations.size > 0) {
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.rafId = null;
      }
    };
    
    this.rafId = requestAnimationFrame(animate);
  }
}

/**
 * Spring physics animation
 */
class SpringAnimation implements AnimationController {
  private element: HTMLElement;
  private properties: Record<string, SpringValue>;
  private config: SpringConfig;
  private onCompleteCallback?: () => void;
  private isRunning: boolean = true;
  
  constructor(
    element: HTMLElement,
    targetProperties: Record<string, number>,
    config: SpringConfig
  ) {
    this.element = element;
    this.config = config;
    this.properties = {};
    
    // Initialize spring values
    const computedStyle = getComputedStyle(element);
    
    for (const [prop, target] of Object.entries(targetProperties)) {
      const current = this.getCurrentValue(prop, computedStyle);
      this.properties[prop] = {
        current,
        target,
        velocity: config.velocity || 0
      };
    }
  }
  
  update(deltaTime: number): void {
    if (!this.isRunning) return;
    
    const dt = Math.min(deltaTime / 1000, 0.1); // Cap at 100ms
    let allSettled = true;
    
    for (const [prop, spring] of Object.entries(this.properties)) {
      // Spring physics calculation
      const distance = spring.target - spring.current;
      const springForce = distance * this.config.stiffness;
      const dampingForce = -spring.velocity * this.config.damping;
      const acceleration = (springForce + dampingForce) / this.config.mass;
      
      // Update velocity and position
      spring.velocity += acceleration * dt;
      spring.current += spring.velocity * dt;
      
      // Check if settled
      if (
        Math.abs(spring.velocity) > this.config.precision! ||
        Math.abs(distance) > this.config.precision!
      ) {
        allSettled = false;
      }
      
      // Apply to element
      this.applyProperty(prop, spring.current);
    }
    
    if (allSettled) {
      this.complete();
    }
  }
  
  private getCurrentValue(prop: string, computedStyle: CSSStyleDeclaration): number {
    switch (prop) {
      case 'x':
      case 'translateX':
        return this.parseTransform(computedStyle.transform, 'translateX');
      case 'y':
      case 'translateY':
        return this.parseTransform(computedStyle.transform, 'translateY');
      case 'scale':
        return this.parseTransform(computedStyle.transform, 'scale');
      case 'opacity':
        return parseFloat(computedStyle.opacity);
      default:
        return parseFloat(computedStyle.getPropertyValue(prop)) || 0;
    }
  }
  
  private parseTransform(transform: string, type: string): number {
    if (transform === 'none') return type === 'scale' ? 1 : 0;
    
    const match = transform.match(new RegExp(`${type}\\(([^)]+)\\)`));
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    
    return type === 'scale' ? 1 : 0;
  }
  
  private applyProperty(prop: string, value: number): void {
    switch (prop) {
      case 'x':
      case 'translateX':
        this.element.style.transform = `translateX(${value}px)`;
        break;
      case 'y':
      case 'translateY':
        this.element.style.transform = `translateY(${value}px)`;
        break;
      case 'scale':
        this.element.style.transform = `scale(${value})`;
        break;
      case 'opacity':
        this.element.style.opacity = value.toString();
        break;
      default:
        this.element.style.setProperty(prop, `${value}px`);
    }
  }
  
  isComplete(): boolean {
    return !this.isRunning;
  }
  
  complete(): void {
    this.isRunning = false;
    
    // Snap to final values
    for (const [prop, spring] of Object.entries(this.properties)) {
      this.applyProperty(prop, spring.target);
    }
    
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }
  
  onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }
}

/**
 * Text morphing animation
 */
class TextMorpher {
  private element: HTMLElement;
  private from: string;
  private to: string;
  private options: MorphOptions;
  
  constructor(
    element: HTMLElement,
    from: string,
    to: string,
    options: MorphOptions = {}
  ) {
    this.element = element;
    this.from = from;
    this.to = to;
    this.options = {
      duration: 600,
      stagger: 20,
      particleEffect: true,
      ...options
    };
  }
  
  async morph(): Promise<void> {
    const fromChars = this.from.split('');
    const toChars = this.to.split('');
    const maxLength = Math.max(fromChars.length, toChars.length);
    
    // Create character spans
    const spans: HTMLSpanElement[] = [];
    this.element.innerHTML = '';
    
    for (let i = 0; i < maxLength; i++) {
      const span = document.createElement('span');
      span.textContent = fromChars[i] || '';
      span.style.display = 'inline-block';
      span.style.transition = `all ${this.options.duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      this.element.appendChild(span);
      spans.push(span);
    }
    
    // Trigger reflow
    void this.element.offsetHeight;
    
    // Animate each character
    const animations = spans.map((span, index) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          const newChar = toChars[index] || '';
          
          if (span.textContent !== newChar) {
            // Add rotation and scale for changing characters
            span.style.transform = 'rotateY(180deg) scale(0.8)';
            span.style.opacity = '0';
            
            setTimeout(() => {
              span.textContent = newChar;
              span.style.transform = 'rotateY(0deg) scale(1)';
              span.style.opacity = '1';
              
              // Particle effect for new characters
              if (this.options.particleEffect && newChar && !fromChars[index]) {
                this.createCharacterParticle(span);
              }
              
              resolve();
            }, this.options.duration! / 2);
          } else {
            resolve();
          }
        }, index * this.options.stagger!);
      });
    });
    
    await Promise.all(animations);
    
    // Clean up - replace spans with text
    setTimeout(() => {
      this.element.textContent = this.to;
    }, 100);
  }
  
  private createCharacterParticle(span: HTMLSpanElement): void {
    const rect = span.getBoundingClientRect();
    const particle = document.createElement('div');
    
    particle.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      width: 4px;
      height: 4px;
      background: #4a90e2;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
    `;
    
    document.body.appendChild(particle);
    
    // Animate particle
    particle.animate([
      {
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
      },
      {
        transform: `translate(-50%, -50%) translateY(-30px) scale(0)`,
        opacity: 0
      }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }).onfinish = () => particle.remove();
  }
}

/**
 * Particle system for celebrations
 */
class ParticleSystem {
  private origin: DOMRect;
  private options: ParticleOptions;
  private particles: HTMLElement[] = [];
  
  constructor(origin: DOMRect, options: ParticleOptions = {}) {
    this.origin = origin;
    this.options = {
      count: 30,
      spread: 90,
      startVelocity: 45,
      shapes: ['circle', 'square'],
      colors: ['#4a90e2', '#27ae60', '#f39c12', '#e74c3c'],
      gravity: 0.3,
      duration: 3000,
      ...options
    };
  }
  
  emit(): void {
    for (let i = 0; i < this.options.count!; i++) {
      this.createParticle(i);
    }
  }
  
  private createParticle(index: number): void {
    const particle = document.createElement('div');
    const shape = this.options.shapes![index % this.options.shapes!.length];
    const color = this.options.colors![index % this.options.colors!.length];
    
    // Random angle within spread
    const angle = (Math.random() - 0.5) * this.options.spread! * (Math.PI / 180);
    const velocity = this.options.startVelocity! * (0.5 + Math.random() * 0.5);
    
    particle.style.cssText = `
      position: fixed;
      left: ${this.origin.left + this.origin.width / 2}px;
      top: ${this.origin.top + this.origin.height / 2}px;
      width: ${shape === 'circle' ? '8px' : '6px'};
      height: ${shape === 'circle' ? '8px' : '6px'};
      background: ${color};
      border-radius: ${shape === 'circle' ? '50%' : '0'};
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(particle);
    this.particles.push(particle);
    
    // Animate particle
    this.animateParticle(particle, angle, velocity);
  }
  
  private animateParticle(particle: HTMLElement, angle: number, velocity: number): void {
    let x = 0;
    let y = 0;
    let vx = Math.sin(angle) * velocity;
    let vy = -Math.cos(angle) * velocity;
    let opacity = 1;
    
    const animate = () => {
      // Apply physics
      vy += this.options.gravity!;
      x += vx * 0.016; // 60fps
      y += vy * 0.016;
      opacity -= 0.016 / (this.options.duration! / 1000);
      
      // Update particle
      particle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      particle.style.opacity = opacity.toString();
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  clear(): void {
    this.particles.forEach(p => p.remove());
    this.particles = [];
  }
}

/**
 * Liquid transition effect
 */
class LiquidTransition {
  private from: HTMLElement;
  private to: HTMLElement;
  private options: LiquidOptions;
  
  constructor(from: HTMLElement, to: HTMLElement, options: LiquidOptions = {}) {
    this.from = from;
    this.to = to;
    this.options = {
      duration: 800,
      viscosity: 0.3,
      tension: 0.4,
      resolution: 32,
      ...options
    };
  }
  
  async animate(): Promise<void> {
    // Create liquid mesh overlay
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const fromRect = this.from.getBoundingClientRect();
    const toRect = this.to.getBoundingClientRect();
    
    canvas.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 10000;
    `;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    document.body.appendChild(canvas);
    
    // Animate liquid flow
    await this.animateLiquidFlow(ctx, fromRect, toRect);
    
    canvas.remove();
  }
  
  private async animateLiquidFlow(
    ctx: CanvasRenderingContext2D,
    from: DOMRect,
    to: DOMRect
  ): Promise<void> {
    const steps = 60; // 60fps for 1 second
    const viscosity = this.options.viscosity!;
    const tension = this.options.tension!;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const eased = this.easeInOutCubic(progress);
      
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Create liquid path
      ctx.beginPath();
      
      // Start from source
      const sx = from.left + from.width / 2;
      const sy = from.top + from.height / 2;
      const tx = to.left + to.width / 2;
      const ty = to.top + to.height / 2;
      
      // Current position
      const cx = sx + (tx - sx) * eased;
      const cy = sy + (ty - sy) * eased;
      
      // Draw liquid blob with bezier curves
      const radius = (1 - eased) * (from.width / 2) + eased * (to.width / 2);
      const wobble = Math.sin(progress * Math.PI * 4) * 10 * (1 - progress);
      
      ctx.moveTo(cx + radius + wobble, cy);
      
      for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 8) {
        const x = cx + Math.cos(angle) * (radius + wobble * Math.sin(angle * 3));
        const y = cy + Math.sin(angle) * (radius + wobble * Math.cos(angle * 3));
        ctx.lineTo(x, y);
      }
      
      ctx.closePath();
      
      // Apply liquid style
      ctx.fillStyle = `rgba(74, 144, 226, ${0.8 * (1 - progress)})`;
      ctx.fill();
      
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 + 4 * (t - 1) * (t - 1) * (t - 1);
  }
}

// Type definitions
interface AnimationController {
  update(deltaTime: number): void;
  isComplete(): boolean;
  onComplete(callback: () => void): void;
}

interface SpringValue {
  current: number;
  target: number;
  velocity: number;
}

interface MorphOptions {
  duration?: number;
  stagger?: number;
  particleEffect?: boolean;
}

interface ParticleOptions {
  count?: number;
  spread?: number;
  startVelocity?: number;
  shapes?: ('circle' | 'square' | 'star')[];
  colors?: string[];
  gravity?: number;
  duration?: number;
}

interface LiquidOptions {
  duration?: number;
  viscosity?: number;
  tension?: number;
  resolution?: number;
}

// Export singleton instance
export const animationEngine = new FluidAnimationEngine();
