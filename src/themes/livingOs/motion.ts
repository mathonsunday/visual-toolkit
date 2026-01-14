/**
 * LIVING OS THEME - Motion Effects v2
 *
 * Subtle, organic motion effects: swaying, drifting, and growth animations.
 * Enhanced with non-linear timing, pulsing, and glacial speeds.
 * Inspired by Deep Sea theme's organic timing.
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
 * Options for non-linear growth animation
 */
export interface GrowthAnimationOptions {
  baseGrowth: number; // 0-1, the target growth level
  time: number; // Current animation time
  seed?: number; // For variation between elements
  style?: 'linear' | 'pulse' | 'surge' | 'glacial';
}

/**
 * Options for breathing/pulsing animation on mature elements
 */
export interface PulseOptions {
  time: number;
  intensity?: number; // 0-1 (default: 0.15)
  speed?: number; // Multiplier (default: 1)
  minOpacity?: number; // Minimum opacity (default: 0.8)
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

// ============================================
// NON-LINEAR GROWTH ANIMATION
// ============================================

/**
 * Calculate growth progress with non-linear timing
 *
 * Implements organic growth patterns:
 * - 'linear': Simple linear growth (default)
 * - 'pulse': Growth with rhythmic slow→fast→slow pulsing
 * - 'surge': Accelerating growth curve (slow start, fast finish)
 * - 'glacial': Very slow, barely perceptible growth with subtle variation
 */
export function calculateGrowthProgress(options: GrowthAnimationOptions): number {
  const {
    baseGrowth,
    time,
    seed = 0,
    style = 'linear',
  } = options;

  // Clamp base growth to 0-1
  const clampedGrowth = Math.max(0, Math.min(1, baseGrowth));

  switch (style) {
    case 'linear':
      return clampedGrowth;

    case 'pulse': {
      // Rhythmic pulsing: slow → fast → slow
      // Creates organic feeling of "breathing" growth
      const pulsePhase = Math.sin(time * 0.0015 + seed) * 0.5 + 0.5;
      const pulseMultiplier = 1 + pulsePhase * 0.3; // 1.0 to 1.3
      return Math.min(1, clampedGrowth * pulseMultiplier);
    }

    case 'surge': {
      // Accelerating curve: slow start, fast finish
      // g(t) = t^2 (quadratic ease-in)
      const surgeGrowth = clampedGrowth * clampedGrowth;

      // Add subtle time-based variation
      const variation = Math.sin(time * 0.001 + seed * 0.1) * 0.05;
      return Math.max(0, Math.min(1, surgeGrowth + variation));
    }

    case 'glacial': {
      // Very slow, almost imperceptible growth
      // Uses extremely slow oscillation
      const glacialSpeed = 0.0002;
      const glacialPhase = Math.sin(time * glacialSpeed + seed) * 0.5 + 0.5;

      // Barely perceptible variation (±2%)
      const glacialVariation = (glacialPhase - 0.5) * 0.04;

      return Math.max(0, Math.min(1, clampedGrowth + glacialVariation));
    }

    default:
      return clampedGrowth;
  }
}

/**
 * Calculate tip growth multiplier
 *
 * Tips of vines/roots grow faster than established sections.
 * Returns a multiplier (1.0 for base, up to 1.5 for tips).
 *
 * @param distanceFromBase - 0-1, how far along the vine/root (0 = base, 1 = tip)
 * @param time - Animation time
 * @param seed - For variation
 */
export function calculateTipGrowthMultiplier(
  distanceFromBase: number,
  time: number,
  seed: number = 0
): number {
  // Tips grow 20-50% faster
  const tipBoost = distanceFromBase * 0.3;

  // Add pulsing variation at tips
  const pulse = Math.sin(time * 0.002 + seed + distanceFromBase * 10) * 0.1;

  return 1 + tipBoost + pulse * distanceFromBase;
}

/**
 * Calculate breathing/pulsing opacity for mature elements
 *
 * Provides subtle "alive" feeling for fully grown elements.
 * Only applies when growth > 0.5.
 */
export function calculatePulse(options: PulseOptions): number {
  const {
    time,
    intensity = 0.15,
    speed = 1,
    minOpacity = 0.8,
  } = options;

  // Very slow pulse (glacial timing)
  const pulseValue = Math.sin(time * 0.002 * speed) * 0.5 + 0.5;

  // Map to opacity range
  const opacityRange = 1 - minOpacity;
  return minOpacity + pulseRange(pulseValue, opacityRange, intensity);
}

/**
 * Helper: Apply intensity to pulse range
 */
function pulseRange(value: number, range: number, intensity: number): number {
  return value * range * intensity + range * (1 - intensity);
}

/**
 * Calculate scale pulse for subtle "breathing" effect
 *
 * Returns a scale multiplier (typically 0.98 to 1.02)
 */
export function calculateScalePulse(
  time: number,
  intensity: number = 0.02,
  speed: number = 1
): number {
  const pulse = Math.sin(time * 0.001 * speed);
  return 1 + pulse * intensity;
}

// ============================================
// GROWTH TIMING PRESETS
// ============================================

/**
 * Timing presets for different growth scenarios
 */
export const GROWTH_TIMING = {
  /** Barely perceptible growth (glacial speed) */
  glacial: {
    baseSpeed: 0.0002,
    pulseSpeed: 0.001,
    tipMultiplier: 1.2,
  },

  /** Slow, organic growth */
  slow: {
    baseSpeed: 0.0005,
    pulseSpeed: 0.0015,
    tipMultiplier: 1.3,
  },

  /** Normal growth speed */
  normal: {
    baseSpeed: 0.001,
    pulseSpeed: 0.002,
    tipMultiplier: 1.4,
  },

  /** Fast growth (for time-lapse effects) */
  fast: {
    baseSpeed: 0.003,
    pulseSpeed: 0.004,
    tipMultiplier: 1.5,
  },
} as const;

export type GrowthTimingPreset = keyof typeof GROWTH_TIMING;

/**
 * Apply growth timing preset
 *
 * Returns modified growth value based on timing preset
 */
export function applyGrowthTiming(
  baseGrowth: number,
  time: number,
  preset: GrowthTimingPreset = 'slow',
  seed: number = 0
): number {
  const timing = GROWTH_TIMING[preset];

  // Calculate base growth with timing
  const timeProgress = time * timing.baseSpeed;
  const pulseOffset = Math.sin(time * timing.pulseSpeed + seed) * 0.1;

  // Combine with base growth (growth is still the primary driver)
  const modifiedGrowth = baseGrowth + pulseOffset * baseGrowth;

  return Math.max(0, Math.min(1, modifiedGrowth));
}
