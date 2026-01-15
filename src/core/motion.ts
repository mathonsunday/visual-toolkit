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
 *
 * @deprecated Use SeekersScene instead. Pattern A helpers are being phased out in v3.0.
 * See: docs/SCENE_FIRST_ARCHITECTURE.md
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
// SEEKER SWARM HELPERS
// ============================================

export interface SwarmOptions {
  /** Spawn bias: 'uniform' | 'center' | 'edges' (default: 'uniform') */
  spawnBias?: 'uniform' | 'center' | 'edges';
  
  /** Size range [min, max] (default: [2, 8]) */
  sizeRange?: [number, number];
  
  /** Speed range [min, max] (default: [1, 4]) */
  speedRange?: [number, number];
  
  /** Hue range [min, max] (default: [180, 220]) */
  hueRange?: [number, number];
  
  /** Center drift strength - pulls wandering seekers toward center (default: 0) */
  centerDrift?: number;
}

/**
 * Create a swarm of seekers with configurable spawn distribution.
 *
 * @deprecated Use SeekersScene instead. Pattern A helpers are being phased out in v3.0.
 * See: docs/SCENE_FIRST_ARCHITECTURE.md
 *
 * @example
 * // Center-biased swarm that won't cluster at edges
 * const seekers = createSeekerSwarm(40, canvas.width, canvas.height, {
 *   spawnBias: 'center',
 *   centerDrift: 0.02,
 * });
 */
export function createSeekerSwarm(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  options: SwarmOptions = {}
): Seeker[] {
  const {
    spawnBias = 'uniform',
    sizeRange = [2, 8],
    speedRange = [1, 4],
    hueRange = [180, 220],
  } = options;

  const seekers: Seeker[] = [];
  
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    
    switch (spawnBias) {
      case 'center': {
        // Gaussian-like distribution centered on canvas
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.random() * Math.min(canvasWidth, canvasHeight) * 0.4;
        x = canvasWidth / 2 + Math.cos(angle) * dist;
        y = canvasHeight / 2 + Math.sin(angle) * dist;
        break;
      }
      case 'edges': {
        // Spawn near edges
        const edge = Math.floor(Math.random() * 4);
        const pos = Math.random();
        switch (edge) {
          case 0: x = pos * canvasWidth; y = Math.random() * 50; break;
          case 1: x = canvasWidth - Math.random() * 50; y = pos * canvasHeight; break;
          case 2: x = pos * canvasWidth; y = canvasHeight - Math.random() * 50; break;
          default: x = Math.random() * 50; y = pos * canvasHeight;
        }
        break;
      }
      default: // uniform
        x = Math.random() * canvasWidth;
        y = Math.random() * canvasHeight;
    }
    
    seekers.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
      maxSpeed: speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]),
      awareness: 150 + Math.random() * 250,
      timidity: 0.3 + Math.random() * 0.7,
      glow: 0,
      hue: hueRange[0] + Math.random() * (hueRange[1] - hueRange[0]),
    });
  }
  
  return seekers;
}

/**
 * Update seeker with optional center drift to prevent edge clustering
 */
export function updateSeekerWithDrift(
  seeker: Seeker,
  lightX: number,
  lightY: number,
  lightSpeed: number,
  canvasWidth: number,
  canvasHeight: number,
  centerDrift: number = 0
): void {
  // Standard seeker update
  updateSeeker(seeker, lightX, lightY, lightSpeed, canvasWidth, canvasHeight);
  
  // Apply center drift when wandering (not near light)
  if (centerDrift > 0) {
    const dx = lightX - seeker.x;
    const dy = lightY - seeker.y;
    const distToLight = Math.sqrt(dx * dx + dy * dy);
    
    if (distToLight > seeker.awareness) {
      // Pull toward center when in "wander" mode
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const toCenterX = centerX - seeker.x;
      const toCenterY = centerY - seeker.y;
      const distToCenter = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
      
      if (distToCenter > 0) {
        seeker.vx += (toCenterX / distToCenter) * centerDrift;
        seeker.vy += (toCenterY / distToCenter) * centerDrift;
      }
    }
  }
}

/**
 * Update all seekers in a swarm
 *
 * @deprecated Use SeekersScene instead. Pattern A helpers are being phased out in v3.0.
 * See: docs/SCENE_FIRST_ARCHITECTURE.md
 */
export function updateSeekerSwarm(
  seekers: Seeker[],
  lightX: number,
  lightY: number,
  lightSpeed: number,
  canvasWidth: number,
  canvasHeight: number,
  centerDrift: number = 0
): void {
  for (const seeker of seekers) {
    if (centerDrift > 0) {
      updateSeekerWithDrift(seeker, lightX, lightY, lightSpeed, canvasWidth, canvasHeight, centerDrift);
    } else {
      updateSeeker(seeker, lightX, lightY, lightSpeed, canvasWidth, canvasHeight);
    }
  }
}

/**
 * Draw a bioluminescent glow - reusable for any glowing creature/point
 * 
 * @example
 * drawBiolumGlow(ctx, creature.x, creature.y, 20, 200, 0.8);
 */
export function drawBiolumGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  hue: number,
  intensity: number,
  time?: number
): void {
  // Optional pulse
  const pulse = time !== undefined ? (Math.sin(time * 0.003) + 1) / 2 : 1;
  const currentIntensity = intensity * (0.7 + pulse * 0.3);
  const currentSize = size * (0.9 + pulse * 0.2);
  
  // Outer glow
  const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, currentSize * 3);
  outerGrad.addColorStop(0, `hsla(${hue}, 70%, 60%, ${currentIntensity * 0.6})`);
  outerGrad.addColorStop(0.5, `hsla(${hue}, 60%, 40%, ${currentIntensity * 0.2})`);
  outerGrad.addColorStop(1, 'transparent');
  
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(x, y, currentSize * 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Core
  ctx.fillStyle = `hsla(${hue}, 50%, 70%, ${currentIntensity * 0.8})`;
  ctx.beginPath();
  ctx.arc(x, y, currentSize * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Bright center
  ctx.fillStyle = `hsla(${hue}, 30%, 90%, ${currentIntensity * 0.9})`;
  ctx.beginPath();
  ctx.arc(x, y, currentSize * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a single seeker with bioluminescent glow
 */
export function drawSeeker(
  ctx: CanvasRenderingContext2D,
  seeker: Seeker,
  lightRadius: number = 150,
  lightX?: number,
  lightY?: number,
  time?: number
): void {
  // Calculate visibility based on glow and proximity to light
  let visibility = seeker.glow;
  
  if (lightX !== undefined && lightY !== undefined) {
    const dist = Math.sqrt((seeker.x - lightX) ** 2 + (seeker.y - lightY) ** 2);
    if (dist < lightRadius) {
      visibility = Math.max(visibility, (1 - dist / lightRadius) * 0.8);
    }
  }
  
  if (visibility < 0.05) return;
  
  drawBiolumGlow(ctx, seeker.x, seeker.y, seeker.size, seeker.hue, visibility, time);
}

/**
 * Draw a swarm of seekers with proper layering (dim behind, bright front)
 *
 * @deprecated Use SeekersScene instead. Pattern A helpers are being phased out in v3.0.
 * See: docs/SCENE_FIRST_ARCHITECTURE.md
 *
 * @example
 * drawSeekerSwarm(ctx, seekers, {
 *   lightX: mouseX,
 *   lightY: mouseY,
 *   lightRadius: 200,
 *   time: frameCount,
 * });
 */
export function drawSeekerSwarm(
  ctx: CanvasRenderingContext2D,
  seekers: Seeker[],
  options: {
    lightX?: number;
    lightY?: number;
    lightRadius?: number;
    time?: number;
  } = {}
): void {
  const { lightX, lightY, lightRadius = 150, time } = options;
  
  // Sort by glow (dim first, so bright ones render on top)
  const sorted = [...seekers].sort((a, b) => {
    // Calculate effective visibility for sorting
    let visA = a.glow;
    let visB = b.glow;
    
    if (lightX !== undefined && lightY !== undefined) {
      const distA = Math.sqrt((a.x - lightX) ** 2 + (a.y - lightY) ** 2);
      const distB = Math.sqrt((b.x - lightX) ** 2 + (b.y - lightY) ** 2);
      if (distA < lightRadius) visA = Math.max(visA, (1 - distA / lightRadius) * 0.8);
      if (distB < lightRadius) visB = Math.max(visB, (1 - distB / lightRadius) * 0.8);
    }
    
    return visA - visB;
  });
  
  for (const seeker of sorted) {
    drawSeeker(ctx, seeker, lightRadius, lightX, lightY, time);
  }
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
