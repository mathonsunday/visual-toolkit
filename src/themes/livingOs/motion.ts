/**
 * LIVING OS THEME - Motion Effects
 * 
 * Subtle, organic motion effects like swaying, drifting.
 */

export interface SwayOptions {
  intensity?: number; // 0-1
  speed?: number;
  time: number;
  baseRotation?: number; // Base rotation in radians
}

export interface DriftOptions {
  intensity?: number; // 0-1
  speed?: number;
  time: number;
  baseX?: number;
  baseY?: number;
}

/**
 * Calculate sway rotation (for trees, leaves, etc.)
 */
export function calculateSway(options: SwayOptions): number {
  const {
    intensity = 0.5,
    speed = 1.0,
    time,
    baseRotation = 0,
  } = options;
  
  // Subtle sine wave for organic swaying
  const sway = Math.sin(time * speed * 0.5) * intensity * 0.05; // Max 5 degrees
  
  return baseRotation + sway;
}

/**
 * Calculate drift position (for floating leaves, etc.)
 */
export function calculateDrift(options: DriftOptions): { x: number; y: number } {
  const {
    intensity = 0.5,
    speed = 1.0,
    time,
    baseX = 0,
    baseY = 0,
  } = options;
  
  // Slow, organic drift using sine waves
  const driftX = Math.sin(time * speed * 0.3) * intensity * 5;
  const driftY = Math.cos(time * speed * 0.2) * intensity * 3;
  
  return {
    x: baseX + driftX,
    y: baseY + driftY,
  };
}

/**
 * Apply sway transform to canvas context
 */
export function applySway(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  options: SwayOptions
): void {
  const rotation = calculateSway(options);
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.translate(-x, -y);
}

/**
 * Apply drift transform to canvas context
 */
export function applyDrift(
  ctx: CanvasRenderingContext2D,
  options: DriftOptions
): void {
  const { x, y } = calculateDrift(options);
  
  ctx.translate(x, y);
}
