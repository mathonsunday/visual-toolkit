/**
 * EYE SYSTEM
 * 
 * Stateful eye management for scenes with multiple reactive eyes.
 * Eyes track targets, blink, react to light, and dilate/contract.
 */

import { calculateIllumination } from './lighting.js';

// ============================================
// EYE STATE
// ============================================

export interface Eye {
  /** Position */
  x: number;
  y: number;
  
  /** Base size (radius) */
  size: number;
  
  /** Current openness 0-1 (0 = closed, 1 = fully open) */
  openness: number;
  
  /** How far it can see light */
  awarenessRadius: number;
  
  /** Time until next blink consideration */
  blinkTimer: number;
  
  /** Currently in blink animation */
  isBlinking: boolean;
  
  /** Blink progress 0-1 */
  blinkProgress: number;
  
  /** Current pupil dilation 0-1 (0 = slit, 1 = dilated) */
  dilation: number;
  
  /** Hue for eye color (default: 0 = red) */
  hue: number;
  
  /** Current illumination level */
  illumination: number;
  
  /** Pupil offset from center (for tracking) */
  pupilOffset: { x: number; y: number };
}

export interface EyeOptions {
  x: number;
  y: number;
  size?: number;
  awarenessRadius?: number;
  hue?: number;
}

/**
 * Create a new eye with default state
 * 
 * @example
 * const eyes = [
 *   createEye({ x: 100, y: 150, size: 8 }),
 *   createEye({ x: 400, y: 200, size: 6, hue: 30 }),
 * ];
 */
export function createEye(options: EyeOptions): Eye {
  return {
    x: options.x,
    y: options.y,
    size: options.size ?? 8,
    openness: 1,
    awarenessRadius: options.awarenessRadius ?? 200,
    blinkTimer: 2000 + Math.random() * 3000,
    isBlinking: false,
    blinkProgress: 0,
    dilation: 0.5,
    hue: options.hue ?? 0, // 0 = red, 30 = orange, 180 = cyan
    illumination: 0,
    pupilOffset: { x: 0, y: 0 },
  };
}

/**
 * Update eye state based on light position and time
 * 
 * @param eye - Eye to update
 * @param lightX - Light source X
 * @param lightY - Light source Y
 * @param deltaTime - Time since last update (ms, typically 16)
 * 
 * @example
 * function animate() {
 *   for (const eye of eyes) {
 *     updateEye(eye, mouseX, mouseY, 16);
 *   }
 * }
 */
export function updateEye(
  eye: Eye,
  lightX: number,
  lightY: number,
  deltaTime: number = 16
): void {
  // Calculate illumination
  eye.illumination = calculateIllumination(lightX, lightY, eye.x, eye.y, eye.awarenessRadius);
  
  // Pupil tracking - follows the light
  const dx = lightX - eye.x;
  const dy = lightY - eye.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 0) {
    const maxOffset = eye.size * 0.3;
    const targetOffsetX = (dx / dist) * maxOffset;
    const targetOffsetY = (dy / dist) * maxOffset;
    
    // Smooth follow
    eye.pupilOffset.x += (targetOffsetX - eye.pupilOffset.x) * 0.1;
    eye.pupilOffset.y += (targetOffsetY - eye.pupilOffset.y) * 0.1;
  }
  
  // Pupil dilation - contracts (smaller) in light, dilates (larger) in darkness
  const targetDilation = 1 - eye.illumination * 0.8;
  eye.dilation += (targetDilation - eye.dilation) * 0.05;
  
  // Blink logic
  if (eye.isBlinking) {
    eye.blinkProgress += deltaTime / 150; // 150ms blink
    
    if (eye.blinkProgress < 0.5) {
      // Closing
      eye.openness = 1 - eye.blinkProgress * 2;
    } else {
      // Opening
      eye.openness = (eye.blinkProgress - 0.5) * 2;
    }
    
    if (eye.blinkProgress >= 1) {
      eye.isBlinking = false;
      eye.blinkProgress = 0;
      eye.openness = 1;
      eye.blinkTimer = 2000 + Math.random() * 4000;
    }
  } else {
    eye.blinkTimer -= deltaTime;
    
    if (eye.blinkTimer <= 0) {
      eye.isBlinking = true;
      eye.blinkProgress = 0;
    }
  }
}

/**
 * Draw an eye with current state
 * 
 * @example
 * for (const eye of eyes) {
 *   drawEye(ctx, eye);
 * }
 */
export function drawEye(
  ctx: CanvasRenderingContext2D,
  eye: Eye,
  options: {
    /** Show outer glow (default: true) */
    showGlow?: boolean;
    /** Glow size multiplier (default: 2.5) */
    glowSize?: number;
  } = {}
): void {
  const {
    showGlow = true,
    glowSize = 2.5,
  } = options;

  const currentSize = eye.size * eye.openness;
  if (currentSize < 0.5) return; // Don't draw if basically closed
  
  // Calculate colors based on hue and illumination
  const baseR = eye.hue === 0 ? 200 : (eye.hue < 60 ? 200 : 100);
  const baseG = eye.hue > 30 && eye.hue < 90 ? 150 : 50;
  const baseB = eye.hue > 150 ? 200 : 50;
  
  const illumBoost = eye.illumination * 55;
  const r = Math.min(255, baseR + illumBoost);
  const g = Math.min(255, baseG + eye.illumination * 40);
  const b = Math.min(255, baseB + eye.illumination * 20);

  // Outer glow
  if (showGlow) {
    const glowRadius = currentSize * glowSize + eye.illumination * currentSize;
    const glowGrad = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, glowRadius);
    glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.6 + eye.illumination * 0.2})`);
    glowGrad.addColorStop(0.5, `rgba(${r * 0.6}, ${g * 0.6}, ${b * 0.6}, ${0.2 + eye.illumination * 0.2})`);
    glowGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eye core (iris)
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.8 + eye.illumination * 0.2})`;
  ctx.beginPath();
  ctx.arc(eye.x, eye.y, currentSize, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  const pupilX = eye.x + eye.pupilOffset.x;
  const pupilY = eye.y + eye.pupilOffset.y;
  
  ctx.fillStyle = 'rgba(10, 0, 0, 0.9)';
  ctx.beginPath();
  
  if (eye.illumination > 0.4) {
    // Slit pupil when illuminated
    const slitWidth = 2 * eye.dilation;
    const slitHeight = currentSize * 0.7;
    ctx.ellipse(pupilX, pupilY, slitWidth, slitHeight, 0, 0, Math.PI * 2);
  } else {
    // Round pupil in darkness
    const pupilSize = 2 + eye.dilation * 2;
    ctx.arc(pupilX, pupilY, pupilSize, 0, Math.PI * 2);
  }
  ctx.fill();

  // Specular highlight (small glint)
  if (eye.openness > 0.5) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * eye.openness})`;
    ctx.beginPath();
    ctx.arc(eye.x - currentSize * 0.3, eye.y - currentSize * 0.3, currentSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Create multiple eyes at once
 */
export function createEyes(positions: EyeOptions[]): Eye[] {
  return positions.map(createEye);
}

/**
 * Update all eyes in an array
 */
export function updateEyes(
  eyes: Eye[],
  lightX: number,
  lightY: number,
  deltaTime: number = 16
): void {
  for (const eye of eyes) {
    updateEye(eye, lightX, lightY, deltaTime);
  }
}

/**
 * Draw all eyes in an array
 */
export function drawEyes(
  ctx: CanvasRenderingContext2D,
  eyes: Eye[],
  options?: Parameters<typeof drawEye>[2]
): void {
  for (const eye of eyes) {
    drawEye(ctx, eye, options);
  }
}
