/**
 * MOTION PRESETS
 * 
 * The secret to "premium" motion is SLOWNESS. Generic animations use 1-2 second durations.
 * Deep-sea creatures move glacially. Equipment drifts. Nothing snaps.
 * 
 * These multipliers are applied to a frame counter (typically incrementing by ~16 per frame).
 * Lower = slower. The 0.0008-0.002 range feels organic.
 */

// ============================================
// TIME MULTIPLIERS
// ============================================

export const timing = {
  // For Math.sin(time * X) patterns
  
  /** Glacial - barely perceptible (ROV rotation, leviathan approach) */
  glacial: 0.0008,
  
  /** Very slow - gentle drift (ROV lateral sway, creature bob) */
  verySlow: 0.001,
  
  /** Slow - visible but organic (light pulse, tendril movement) */
  slow: 0.002,
  
  /** Medium - noticeable rhythm (bio-pulse, eye tracking) */
  medium: 0.003,
  
  /** Fast - quick response (flee behavior, startle) */
  fast: 0.005,
  
  /** Rapid - immediate feedback (particle shimmer) */
  rapid: 0.01,
} as const;

// ============================================
// AMPLITUDE PRESETS
// ============================================

export const amplitude = {
  /** Micro - subtle wobble */
  micro: 0.02,
  
  /** Small - gentle sway */
  small: 0.03,
  
  /** Medium - visible drift */
  medium: 0.1,
  
  /** Large - dramatic movement */
  large: 0.3,
} as const;

// ============================================
// DRIFT/BOB FUNCTIONS
// ============================================

/**
 * Organic drift - combines two sine waves for non-mechanical movement
 * Use for: ROV sway, creature floating, camera shake
 */
export function drift(time: number, primary: number = timing.verySlow, secondary: number = timing.slow): {
  x: number;
  y: number;
  rotation: number;
} {
  return {
    x: Math.sin(time * primary) * amplitude.micro + Math.sin(time * secondary) * amplitude.micro * 0.5,
    y: Math.cos(time * primary * 1.1) * amplitude.micro + Math.cos(time * secondary * 0.9) * amplitude.micro * 0.3,
    rotation: Math.sin(time * timing.glacial) * amplitude.small,
  };
}

/**
 * Bob motion - vertical oscillation for floating objects
 * Use for: Jellyfish, floating particles, suspended objects
 */
export function bob(time: number, speed: number = timing.slow, height: number = 0.02): number {
  return Math.sin(time * speed) * height;
}

/**
 * Pulse - rhythmic scaling for glows and organs
 * Use for: Bioluminescent glow, heartbeat, breathing
 */
export function pulse(time: number, speed: number = timing.medium, min: number = 0.8, max: number = 1.2): number {
  const t = (Math.sin(time * speed) + 1) / 2; // normalize to 0-1
  return min + t * (max - min);
}

/**
 * Waver - organic waviness for long shapes
 * Use for: Tentacles, tethers, trailing elements
 */
export function waver(time: number, segmentIndex: number, speed: number = timing.slow): { x: number; y: number } {
  return {
    x: Math.sin(time * speed + segmentIndex * 0.5) * 0.5,
    y: Math.cos(time * speed + segmentIndex * 0.3) * 0.5,
  };
}

// ============================================
// TENDRIL PHYSICS
// ============================================

export interface TendrilSegment {
  x: number;
  y: number;
}

export interface Tendril {
  startX: number;
  startY: number;
  segments: TendrilSegment[];
  targetX: number;
  targetY: number;
  speed: number;
  thickness: number;
}

/**
 * Create a tendril that reaches from an edge toward a target
 */
export function createTendril(
  startX: number,
  startY: number,
  segmentCount = 12
): Tendril {
  return {
    startX,
    startY,
    segments: Array.from({ length: segmentCount }, () => ({ x: startX, y: startY })),
    targetX: startX,
    targetY: startY,
    speed: 0.02 + Math.random() * 0.03,
    thickness: 3 + Math.random() * 5,
  };
}

/**
 * Update tendril segments - follow-the-leader with organic waviness
 * The key insight: each segment follows the previous one with LAG
 */
export function updateTendril(
  tendril: Tendril,
  targetX: number,
  targetY: number,
  time: number,
  recoilFactor = 1 // reduce when light moves fast
): void {
  const dx = targetX - tendril.startX;
  const dy = targetY - tendril.startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist === 0) return;
  
  // Calculate how far to reach (capped, reduced by recoil)
  const maxReach = Math.min(dist * 0.7, 300) * recoilFactor;
  tendril.targetX = tendril.startX + (dx / dist) * maxReach;
  tendril.targetY = tendril.startY + (dy / dist) * maxReach;
  
  // Lead segment follows target
  tendril.segments[0].x += (tendril.targetX - tendril.segments[0].x) * tendril.speed;
  tendril.segments[0].y += (tendril.targetY - tendril.segments[0].y) * tendril.speed;
  
  // Each subsequent segment follows the previous with lag + waviness
  for (let i = 1; i < tendril.segments.length; i++) {
    const prev = tendril.segments[i - 1];
    const curr = tendril.segments[i];
    const segDx = prev.x - curr.x;
    const segDy = prev.y - curr.y;
    
    // Follow with lag
    curr.x += segDx * 0.15;
    curr.y += segDy * 0.15;
    
    // Add organic waviness
    const wave = waver(time, i);
    curr.x += wave.x;
    curr.y += wave.y;
  }
}

// ============================================
// SEEKER BEHAVIOR
// ============================================

export interface Seeker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSpeed: number;
  awareness: number;
  timidity: number;
  glow: number;
  hue: number;
}

/**
 * Create a seeker - a small creature drawn to light
 */
export function createSeeker(canvasWidth: number, canvasHeight: number): Seeker {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: 0,
    vy: 0,
    size: 2 + Math.random() * 6,
    maxSpeed: 1 + Math.random() * 3,
    awareness: 150 + Math.random() * 250,
    timidity: 0.3 + Math.random() * 0.7,
    glow: 0,
    hue: 180 + Math.random() * 40,
  };
}

/**
 * Update seeker behavior - approach light slowly, flee if it moves fast
 */
export function updateSeeker(
  seeker: Seeker,
  lightX: number,
  lightY: number,
  lightSpeed: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  const dx = lightX - seeker.x;
  const dy = lightY - seeker.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < seeker.awareness) {
    if (lightSpeed > 15 * seeker.timidity) {
      // FLEE - light moved too fast
      seeker.vx -= (dx / dist) * 0.5;
      seeker.vy -= (dy / dist) * 0.5;
      seeker.glow = Math.max(0, seeker.glow - 0.1);
    } else if (dist > 40) {
      // APPROACH - drawn to light
      seeker.vx += (dx / dist) * 0.08;
      seeker.vy += (dy / dist) * 0.08;
      seeker.glow = Math.min(1, seeker.glow + 0.02);
    } else {
      // TOO CLOSE - orbit nervously
      seeker.vx += (dy / dist) * 0.1;
      seeker.vy -= (dx / dist) * 0.1;
      seeker.glow = 1;
    }
  } else {
    // Wander in darkness
    seeker.vx += (Math.random() - 0.5) * 0.1;
    seeker.vy += (Math.random() - 0.5) * 0.1;
    seeker.glow = Math.max(0, seeker.glow - 0.01);
  }
  
  // Speed limit
  const speed = Math.sqrt(seeker.vx * seeker.vx + seeker.vy * seeker.vy);
  if (speed > seeker.maxSpeed) {
    seeker.vx = (seeker.vx / speed) * seeker.maxSpeed;
    seeker.vy = (seeker.vy / speed) * seeker.maxSpeed;
  }
  
  // Friction
  seeker.vx *= 0.98;
  seeker.vy *= 0.98;
  
  // Move
  seeker.x += seeker.vx;
  seeker.y += seeker.vy;
  
  // Wrap at edges
  if (seeker.x < -50) seeker.x = canvasWidth + 50;
  if (seeker.x > canvasWidth + 50) seeker.x = -50;
  if (seeker.y < -50) seeker.y = canvasHeight + 50;
  if (seeker.y > canvasHeight + 50) seeker.y = -50;
}

// ============================================
// CSS ANIMATION HELPERS
// ============================================

/**
 * Generate CSS keyframes timing for organic animations
 * Use these as animation-duration values
 */
export const cssTimings = {
  /** 3-5 seconds - pulse, glow */
  pulse: '4s',
  
  /** 5-8 seconds - drift, float */
  drift: '8s',
  
  /** 8-15 seconds - slow movement */
  creature: '12s',
  
  /** 15-25 seconds - very slow drift */
  ambient: '20s',
  
  /** 25+ seconds - barely perceptible */
  glacial: '30s',
} as const;

/**
 * Generate CSS animation delay for staggered groups
 */
export function staggerDelay(index: number, baseDelay = 0.3): string {
  return `${index * baseDelay}s`;
}
