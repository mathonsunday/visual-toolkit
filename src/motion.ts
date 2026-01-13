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
  /** Unique ID for consistent waviness patterns */
  id: number;
}

// Counter for unique tendril IDs
let tendrilIdCounter = 0;

/**
 * Create a tendril that reaches from an edge toward a target
 */
export function createTendril(
  startX: number,
  startY: number,
  segmentCount = 12,
  thickness?: number
): Tendril {
  return {
    startX,
    startY,
    segments: Array.from({ length: segmentCount }, () => ({ x: startX, y: startY })),
    targetX: startX,
    targetY: startY,
    speed: 0.02 + Math.random() * 0.03,
    thickness: thickness ?? (3 + Math.random() * 5),
    id: tendrilIdCounter++,
  };
}

export interface TendrilUpdateOptions {
  /** Maximum reach as ratio of distance to target (default: 0.5) 
   *  CRITICAL: Keep this at 0.5 or below to prevent disembodied look */
  maxReachRatio?: number;
  
  /** Absolute maximum reach in pixels (default: 250) */
  maxReachPixels?: number;
  
  /** Reduce reach when light moves fast (default: 1) */
  recoilFactor?: number;
}

/**
 * Update tendril segments - follow-the-leader with organic waviness
 * 
 * IMPORTANT: maxReachRatio is capped to prevent "disembodied arm" look.
 * Tendrils must stay visually connected to their origin mass.
 */
export function updateTendril(
  tendril: Tendril,
  targetX: number,
  targetY: number,
  time: number,
  optionsOrRecoil: TendrilUpdateOptions | number = {}
): void {
  // Handle legacy signature (recoilFactor as number)
  const options: TendrilUpdateOptions = typeof optionsOrRecoil === 'number' 
    ? { recoilFactor: optionsOrRecoil }
    : optionsOrRecoil;
  
  const {
    maxReachRatio = 0.5,  // NEVER more than 50% toward target by default
    maxReachPixels = 250,
    recoilFactor = 1,
  } = options;

  const dx = targetX - tendril.startX;
  const dy = targetY - tendril.startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist === 0) return;
  
  // CRITICAL: Double-cap the reach to prevent disembodied look
  // 1. Never more than maxReachRatio of the distance
  // 2. Never more than maxReachPixels absolute
  const ratioReach = dist * Math.min(maxReachRatio, 0.6); // Hard cap at 60%
  const maxReach = Math.min(ratioReach, maxReachPixels) * recoilFactor;
  
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
// TENDRIL DRAWING (organic rendering)
// ============================================

export interface TendrilPalette {
  shadow: { r: number; g: number; b: number };
  base: { r: number; g: number; b: number };
  mid: { r: number; g: number; b: number };
  highlight: { r: number; g: number; b: number };
}

export const tendrilPalettes: Record<string, TendrilPalette> = {
  /** Default flesh - dark with reddish undertones */
  flesh: {
    shadow: { r: 15, g: 8, b: 12 },
    base: { r: 35, g: 20, b: 28 },
    mid: { r: 55, g: 35, b: 42 },
    highlight: { r: 85, g: 55, b: 60 },
  },
  
  /** Abyssal - blue-gray deep-sea creature */
  abyssal: {
    shadow: { r: 10, g: 15, b: 22 },
    base: { r: 25, g: 35, b: 48 },
    mid: { r: 40, g: 55, b: 70 },
    highlight: { r: 60, g: 80, b: 100 },
  },
  
  /** Bioluminescent - subtle cyan glow */
  biolum: {
    shadow: { r: 12, g: 18, b: 22 },
    base: { r: 20, g: 40, b: 45 },
    mid: { r: 35, g: 65, b: 70 },
    highlight: { r: 60, g: 120, b: 130 },
  },
  
  /** Dark - barely visible, for background tendrils */
  dark: {
    shadow: { r: 8, g: 6, b: 10 },
    base: { r: 18, g: 14, b: 20 },
    mid: { r: 28, g: 22, b: 30 },
    highlight: { r: 40, g: 32, b: 42 },
  },
};

export type TendrilPaletteType = keyof typeof tendrilPalettes;

export interface TendrilDrawOptions {
  /** Color palette (default: 'flesh') */
  palette?: TendrilPaletteType | TendrilPalette;
  
  /** Taper ratio - how thin the tip is vs base (default: 0.15) */
  taperRatio?: number;
  
  /** Additional waviness amplitude (default: 0) */
  waviness?: number;
  
  /** Current time for organic variation (optional) */
  time?: number;
  
  /** Whether to draw in "lit" mode - brighter when light is nearby */
  illumination?: number;
  
  // === BASE MASS OPTIONS (prevents disembodied look) ===
  
  /** Draw a dark mass blob at the origin to show what the tendril is attached to (default: false) */
  drawBaseMass?: boolean;
  
  /** Radius of the base mass blob (default: tendril.thickness * 8) */
  baseMassRadius?: number;
  
  /** How much of the base mass is visible (0 = off-screen, 1 = fully visible) 
   *  Affects how prominent the mass rendering is */
  baseMassVisibility?: number;
}

/**
 * Draw a tendril with ORGANIC rendering:
 * - Bezier curves between segments (smooth flow)
 * - Tapering from base to tip
 * - Multi-layer rendering (shadow → body → highlight)
 * - Flesh-like gradient coloring
 * - Optional base mass to prevent "disembodied arm" look
 * 
 * @example
 * // Update physics (note maxReachRatio to keep attached)
 * updateTendril(tendril, mouseX, mouseY, frameCount, { maxReachRatio: 0.5 });
 * 
 * // Draw with organic rendering + base mass
 * drawTendril(ctx, tendril, {
 *   palette: 'flesh',
 *   drawBaseMass: true,      // Shows what it's attached to
 *   baseMassRadius: 80,
 *   illumination: 0.5,
 *   time: frameCount,
 * });
 */
export function drawTendril(
  ctx: CanvasRenderingContext2D,
  tendril: Tendril,
  options: TendrilDrawOptions = {}
): void {
  const {
    palette = 'flesh',
    taperRatio = 0.15,
    waviness = 0,
    time = 0,
    illumination = 0,
    drawBaseMass = false,
    baseMassRadius,
    baseMassVisibility = 0.5,
  } = options;

  const colors = typeof palette === 'string' ? tendrilPalettes[palette] : palette;
  if (!colors) return;

  const segments = tendril.segments;
  if (segments.length < 2) return;

  // Draw base mass FIRST (behind tendril)
  if (drawBaseMass) {
    const massRadius = baseMassRadius ?? tendril.thickness * 8;
    drawTendrilBaseMass(ctx, tendril.startX, tendril.startY, massRadius, colors, illumination, baseMassVisibility);
  }

  // Build the path with bezier curves
  const points = buildTendrilPath(tendril, time, waviness);
  if (points.length < 2) return;

  // Calculate thickness at each point (tapering)
  const baseThickness = tendril.thickness;
  const thicknesses = points.map((_, i) => {
    const t = i / (points.length - 1);
    // Smooth taper using ease-in curve
    const taper = 1 - Math.pow(t, 0.7) * (1 - taperRatio);
    // Add slight bulge in middle for organic feel
    const bulge = Math.sin(t * Math.PI) * 0.15;
    return baseThickness * taper * (1 + bulge);
  });

  // Illumination boost
  const litBoost = illumination * 0.4;

  // LAYER 1: Shadow (offset down-right)
  drawTendrilLayer(ctx, points, thicknesses, colors.shadow, 2, 1.3, 0.5);

  // LAYER 2: Base body
  drawTendrilLayer(ctx, points, thicknesses, colors.base, 0, 1, 0.9 + litBoost * 0.1);

  // LAYER 3: Mid tone (gradient across width effect via offset)
  drawTendrilLayer(ctx, points, thicknesses, colors.mid, -0.5, 0.7, 0.5 + litBoost * 0.2);

  // LAYER 4: Highlight edge (top-left)
  drawTendrilLayer(ctx, points, thicknesses, colors.highlight, -1, 0.35, 0.3 + litBoost * 0.3);

  // LAYER 5: Specular highlight when illuminated
  if (illumination > 0.3) {
    const specular = { r: colors.highlight.r + 40, g: colors.highlight.g + 35, b: colors.highlight.b + 30 };
    drawTendrilLayer(ctx, points, thicknesses, specular, -1.5, 0.15, (illumination - 0.3) * 0.6);
  }
}

/**
 * Draw the dark mass blob at the tendril's origin point.
 * This shows what the tendril is attached to, preventing the "floating arm" look.
 */
function drawTendrilBaseMass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colors: TendrilPalette,
  illumination: number,
  visibility: number
): void {
  // Multiple overlapping gradients for organic mass appearance
  // The mass should look like it continues beyond the edge
  
  const layers = [
    { radiusScale: 1.5, alpha: 0.3 * visibility },   // Outer soft fade
    { radiusScale: 1.0, alpha: 0.6 * visibility },   // Main mass
    { radiusScale: 0.6, alpha: 0.8 * visibility },   // Dense core
  ];
  
  for (const layer of layers) {
    const r = radius * layer.radiusScale;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    
    // Base to shadow gradient
    const baseColor = `rgba(${colors.shadow.r}, ${colors.shadow.g}, ${colors.shadow.b}, ${layer.alpha})`;
    const edgeColor = `rgba(${colors.shadow.r}, ${colors.shadow.g}, ${colors.shadow.b}, 0)`;
    
    grad.addColorStop(0, baseColor);
    grad.addColorStop(0.6, baseColor);
    grad.addColorStop(1, edgeColor);
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add subtle vein-like details radiating from center
  if (visibility > 0.3) {
    const veinCount = 5;
    for (let i = 0; i < veinCount; i++) {
      const angle = (i / veinCount) * Math.PI * 2 + Math.sin(x * 0.01 + i) * 0.3;
      const length = radius * (0.6 + Math.sin(y * 0.01 + i * 2) * 0.2);
      
      ctx.strokeStyle = `rgba(${colors.base.r + 10}, ${colors.base.g}, ${colors.base.b}, ${0.15 * visibility})`;
      ctx.lineWidth = 2 + Math.sin(i) * 1;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // Slight curve
      const midX = x + Math.cos(angle) * length * 0.5 + Math.sin(angle + i) * 5;
      const midY = y + Math.sin(angle) * length * 0.5 + Math.cos(angle + i) * 5;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }
  }
  
  // Light response - subtle glow when illuminated
  if (illumination > 0.2) {
    const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.8);
    glowGrad.addColorStop(0, `rgba(${colors.mid.r + 20}, ${colors.mid.g + 15}, ${colors.mid.b + 10}, ${illumination * 0.15 * visibility})`);
    glowGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Build smooth bezier path through tendril segments
 */
function buildTendrilPath(
  tendril: Tendril,
  time: number,
  extraWaviness: number
): Array<{ x: number; y: number }> {
  const segments = tendril.segments;
  const points: Array<{ x: number; y: number }> = [];
  
  // Start at anchor point
  points.push({ x: tendril.startX, y: tendril.startY });
  
  // Subdivide bezier curves for smooth path
  for (let i = 0; i < segments.length; i++) {
    const p0 = i === 0 ? { x: tendril.startX, y: tendril.startY } : segments[i - 1];
    const p1 = segments[i];
    const p2 = segments[Math.min(i + 1, segments.length - 1)];
    const p3 = segments[Math.min(i + 2, segments.length - 1)];
    
    // Add extra organic waviness perpendicular to direction
    let waveX = 0, waveY = 0;
    if (extraWaviness > 0) {
      const dx = p2.x - p0.x;
      const dy = p2.y - p0.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const perpX = -dy / len;
      const perpY = dx / len;
      const wave = Math.sin(time * timing.slow + i * 0.8 + tendril.id * 0.5) * extraWaviness;
      waveX = perpX * wave;
      waveY = perpY * wave;
    }
    
    // Catmull-Rom interpolation for smooth curve
    for (let t = 0; t <= 1; t += 0.25) {
      const tt = t * t;
      const ttt = tt * t;
      
      const q0 = -ttt + 2 * tt - t;
      const q1 = 3 * ttt - 5 * tt + 2;
      const q2 = -3 * ttt + 4 * tt + t;
      const q3 = ttt - tt;
      
      const x = 0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3) + waveX * (1 - t);
      const y = 0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3) + waveY * (1 - t);
      
      // Avoid duplicates
      const last = points[points.length - 1];
      if (Math.abs(x - last.x) > 0.5 || Math.abs(y - last.y) > 0.5) {
        points.push({ x, y });
      }
    }
  }
  
  return points;
}

/**
 * Draw a single layer of the tendril
 */
function drawTendrilLayer(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  thicknesses: number[],
  color: { r: number; g: number; b: number },
  offset: number,
  thicknessScale: number,
  alpha: number
): void {
  if (points.length < 2 || alpha <= 0) return;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

  // Draw segments with varying thickness
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    // Calculate perpendicular for offset
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = (-dy / len) * offset;
    const perpY = (dx / len) * offset;
    
    // Interpolated thickness
    const t1 = thicknesses[Math.min(i, thicknesses.length - 1)] * thicknessScale;
    const t2 = thicknesses[Math.min(i + 1, thicknesses.length - 1)] * thicknessScale;
    const avgThickness = (t1 + t2) / 2;
    
    ctx.lineWidth = avgThickness;
    ctx.beginPath();
    ctx.moveTo(p1.x + perpX, p1.y + perpY);
    ctx.lineTo(p2.x + perpX, p2.y + perpY);
    ctx.stroke();
  }
}

/**
 * Draw multiple tendrils with proper layering (far ones first)
 * 
 * @example
 * drawTendrils(ctx, tendrilArray, {
 *   palette: 'flesh',
 *   drawBaseMass: true,     // Show what they're attached to
 *   baseMassRadius: 80,
 *   lightX: mouseX,
 *   lightY: mouseY,
 *   lightRadius: 200,
 *   time: frameCount,
 * });
 */
export function drawTendrils(
  ctx: CanvasRenderingContext2D,
  tendrils: Tendril[],
  options: TendrilDrawOptions & {
    lightX?: number;
    lightY?: number;
    lightRadius?: number;
  } = {}
): void {
  const { lightX, lightY, lightRadius = 200, ...drawOptions } = options;
  
  // Sort by distance from light (furthest first for proper layering)
  const sorted = [...tendrils].sort((a, b) => {
    if (lightX === undefined || lightY === undefined) return 0;
    const distA = Math.sqrt((a.startX - lightX) ** 2 + (a.startY - lightY) ** 2);
    const distB = Math.sqrt((b.startX - lightX) ** 2 + (b.startY - lightY) ** 2);
    return distB - distA;
  });
  
  for (const tendril of sorted) {
    // Calculate illumination if light position provided
    let illumination = drawOptions.illumination ?? 0;
    if (lightX !== undefined && lightY !== undefined) {
      // Use the tip of the tendril for illumination calculation
      const tipX = tendril.segments[0]?.x ?? tendril.startX;
      const tipY = tendril.segments[0]?.y ?? tendril.startY;
      const dist = Math.sqrt((tipX - lightX) ** 2 + (tipY - lightY) ** 2);
      illumination = dist < lightRadius ? Math.pow(1 - dist / lightRadius, 2) : 0;
    }
    
    drawTendril(ctx, tendril, { ...drawOptions, illumination });
  }
}

/**
 * Create tendrils spawned from edges of the canvas.
 * Origins are placed AT or BEYOND the edge to prevent disembodied look.
 * 
 * @example
 * const tendrils = createEdgeTendrils(12, canvas.width, canvas.height, {
 *   edges: ['left', 'right', 'bottom'],  // Which edges to spawn from
 *   thickness: [4, 8],                    // Random thickness range
 *   segments: 12,
 * });
 */
export function createEdgeTendrils(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  options: {
    edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
    thickness?: [number, number];
    segments?: number;
    /** How far beyond the edge to place origins (default: 30) */
    edgeOffset?: number;
  } = {}
): Tendril[] {
  const {
    edges = ['left', 'right', 'bottom'],
    thickness = [4, 8],
    segments = 12,
    edgeOffset = 30,
  } = options;

  const tendrils: Tendril[] = [];
  
  for (let i = 0; i < count; i++) {
    const edge = edges[i % edges.length];
    let startX: number, startY: number;
    
    switch (edge) {
      case 'top':
        startX = Math.random() * canvasWidth;
        startY = -edgeOffset - Math.random() * 20;
        break;
      case 'bottom':
        startX = Math.random() * canvasWidth;
        startY = canvasHeight + edgeOffset + Math.random() * 20;
        break;
      case 'left':
        startX = -edgeOffset - Math.random() * 20;
        startY = Math.random() * canvasHeight;
        break;
      case 'right':
        startX = canvasWidth + edgeOffset + Math.random() * 20;
        startY = Math.random() * canvasHeight;
        break;
    }
    
    const t = thickness[0] + Math.random() * (thickness[1] - thickness[0]);
    tendrils.push(createTendril(startX, startY, segments, t));
  }
  
  return tendrils;
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
