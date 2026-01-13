/**
 * LIGHTING HELPERS
 * 
 * Functions for calculating and drawing light interactions.
 * The key insight: illumination falloff should be non-linear (squared)
 * for a more natural look.
 */

// ============================================
// ILLUMINATION CALCULATION
// ============================================

/**
 * Calculate how illuminated a point is by a light source.
 * Uses squared falloff for natural-looking light decay.
 * 
 * @param lightX - Light source X position
 * @param lightY - Light source Y position
 * @param targetX - Target point X position
 * @param targetY - Target point Y position
 * @param awarenessRadius - How far the light reaches (default: 200)
 * @returns 0-1 illumination value (1 = fully lit, 0 = darkness)
 * 
 * @example
 * const illumination = calculateIllumination(mouseX, mouseY, creatureX, creatureY, 250);
 * if (illumination > 0.4) {
 *   // Reveal hidden details
 * }
 */
export function calculateIllumination(
  lightX: number,
  lightY: number,
  targetX: number,
  targetY: number,
  awarenessRadius: number = 200
): number {
  const dx = lightX - targetX;
  const dy = lightY - targetY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist >= awarenessRadius) return 0;
  
  // Squared falloff feels more natural than linear
  const normalized = 1 - dist / awarenessRadius;
  return normalized * normalized;
}

/**
 * Calculate illumination with direction awareness.
 * Objects facing the light are more illuminated.
 * 
 * @param lightX - Light source X
 * @param lightY - Light source Y
 * @param targetX - Target X
 * @param targetY - Target Y
 * @param facingAngle - Direction the target is facing (radians)
 * @param awarenessRadius - Light reach
 * @returns 0-1 illumination, reduced if facing away
 */
export function calculateDirectionalIllumination(
  lightX: number,
  lightY: number,
  targetX: number,
  targetY: number,
  facingAngle: number,
  awarenessRadius: number = 200
): number {
  const baseIllumination = calculateIllumination(lightX, lightY, targetX, targetY, awarenessRadius);
  if (baseIllumination === 0) return 0;
  
  // Calculate angle to light
  const dx = lightX - targetX;
  const dy = lightY - targetY;
  const angleToLight = Math.atan2(dy, dx);
  
  // How much are we facing the light? (1 = directly facing, 0 = facing away)
  const angleDiff = Math.abs(angleToLight - facingAngle);
  const normalizedAngle = Math.min(angleDiff, Math.PI * 2 - angleDiff);
  const facingFactor = 1 - normalizedAngle / Math.PI;
  
  return baseIllumination * (0.3 + facingFactor * 0.7); // Always some ambient
}

// ============================================
// DRAW PLAYER LIGHT
// ============================================

/**
 * Draw the complete player light effect (cursor/flashlight).
 * Multiple concentric layers for realistic soft falloff.
 * 
 * @example
 * // In your render loop:
 * drawPlayerLight(ctx, mouseX, mouseY, 120, {
 *   intensity: 1,
 *   pulseTime: frameCount,
 * });
 */
export function drawPlayerLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 120,
  options: {
    /** Overall brightness 0-1 (default: 1) */
    intensity?: number;
    /** Frame counter for subtle pulse (optional) */
    pulseTime?: number;
    /** Core color RGB (default: white) */
    coreColor?: { r: number; g: number; b: number };
    /** Ambient color RGB (default: cool blue-white) */
    ambientColor?: { r: number; g: number; b: number };
  } = {}
): void {
  const {
    intensity = 1,
    pulseTime,
    coreColor = { r: 255, g: 255, b: 255 },
    ambientColor = { r: 180, g: 220, b: 255 },
  } = options;

  // Optional subtle pulse
  const pulseOffset = pulseTime !== undefined 
    ? Math.sin(pulseTime * 0.003) * 20 
    : 0;
  const currentRadius = radius + pulseOffset;

  // Multiple concentric glow layers (5 -> 1, outer to inner)
  for (let i = 5; i >= 1; i--) {
    const layerRadius = currentRadius * (i / 2);
    const alpha = (0.15 / i) * intensity;
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
    grad.addColorStop(0, `rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, ${alpha})`);
    grad.addColorStop(0.5, `rgba(${Math.round(ambientColor.r * 0.55)}, ${ambientColor.g}, ${Math.round(ambientColor.b * 0.85)}, ${alpha * 0.5})`);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright core
  const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, 15);
  coreGrad.addColorStop(0, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, ${0.9 * intensity})`);
  coreGrad.addColorStop(0.5, `rgba(${Math.round(coreColor.r * 0.8)}, ${Math.round(coreColor.g * 0.94)}, ${coreColor.b}, ${0.5 * intensity})`);
  coreGrad.addColorStop(1, 'transparent');
  
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================
// ORGANIC TEXTURE
// ============================================

/**
 * Draw organic surface texture (for walls, creature skin, etc.)
 * Uses overlapping radial gradients for a non-uniform, living look.
 * 
 * @example
 * // Draw textured wall background
 * ctx.fillStyle = '#0a0a12';
 * ctx.fillRect(0, 0, width, height);
 * drawOrganicTexture(ctx, width, height, {
 *   density: 25,
 *   color: { r: 20, g: 30, b: 40 },
 *   intensity: 0.15,
 * });
 */
export function drawOrganicTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    /** Number of texture spots (default: 20) */
    density?: number;
    /** Base color RGB (default: dark blue-gray) */
    color?: { r: number; g: number; b: number };
    /** Max opacity of spots (default: 0.15) */
    intensity?: number;
    /** Animation time for slow movement (optional) */
    time?: number;
    /** Random seed for consistent patterns (optional) */
    seed?: number;
  } = {}
): void {
  const {
    density = 20,
    color = { r: 20, g: 30, b: 40 },
    intensity = 0.15,
    time = 0,
    seed = 12345,
  } = options;

  // Simple seeded random for consistent patterns
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let i = 0; i < density; i++) {
    // Position with optional subtle movement
    const baseX = seededRandom(i) * width;
    const baseY = seededRandom(i + 1000) * height;
    const moveX = time > 0 ? Math.sin(time * 0.0008 + i * 0.5) * 3 : 0;
    const moveY = time > 0 ? Math.cos(time * 0.0006 + i * 0.3) * 2 : 0;
    
    const x = baseX + moveX;
    const y = baseY + moveY;
    
    // Varied sizes
    const size = 30 + seededRandom(i + 2000) * 80;
    const alpha = intensity * (0.5 + seededRandom(i + 3000) * 0.5);
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
    grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    grad.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw caustic-like light patterns (light filtering through water)
 * Good for top of underwater scenes.
 */
export function drawCaustics(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  options: {
    /** Number of caustic spots (default: 5) */
    count?: number;
    /** Max height of caustic area (default: 0.4) */
    heightRatio?: number;
    /** Opacity (default: 0.03) */
    intensity?: number;
  } = {}
): void {
  const {
    count = 5,
    heightRatio = 0.4,
    intensity = 0.03,
  } = options;

  for (let i = 0; i < count; i++) {
    const cx = (Math.sin(time * 0.001 + i) * 0.3 + 0.5) * width;
    const cy = height * 0.1;
    
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
    grad.addColorStop(0, `rgba(100, 150, 200, ${intensity})`);
    grad.addColorStop(1, 'rgba(100, 150, 200, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height * heightRatio);
  }
}
