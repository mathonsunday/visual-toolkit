/**
 * ORGANIC SURFACES
 * 
 * Draw surfaces that read as SOLID (flesh, rock, membrane) not VOID.
 * Key insight: avoid radial gradients which look like holes/sockets.
 * Use directional patterns, veins, and grain instead.
 */

// ============================================
// SURFACE COLOR PALETTES
// ============================================

export interface SurfacePalette {
  base: { r: number; g: number; b: number };
  mid: { r: number; g: number; b: number };
  highlight: { r: number; g: number; b: number };
  vein: { r: number; g: number; b: number };
  veinHighlight: { r: number; g: number; b: number };
}

export const surfacePalettes: Record<string, SurfacePalette> = {
  /** Dark flesh - like creature skin */
  fleshy: {
    base: { r: 25, g: 18, b: 22 },
    mid: { r: 35, g: 25, b: 30 },
    highlight: { r: 55, g: 40, b: 45 },
    vein: { r: 45, g: 20, b: 25 },
    veinHighlight: { r: 80, g: 35, b: 40 },
  },
  
  /** Dark rock - like cave wall */
  rocky: {
    base: { r: 20, g: 22, b: 25 },
    mid: { r: 30, g: 33, b: 38 },
    highlight: { r: 50, g: 55, b: 60 },
    vein: { r: 25, g: 28, b: 32 },
    veinHighlight: { r: 40, g: 45, b: 50 },
  },
  
  /** Barnacled - crusty organic growth */
  barnacled: {
    base: { r: 22, g: 25, b: 20 },
    mid: { r: 35, g: 40, b: 32 },
    highlight: { r: 55, g: 60, b: 50 },
    vein: { r: 40, g: 35, b: 30 },
    veinHighlight: { r: 60, g: 55, b: 45 },
  },
  
  /** Membranous - thin organic tissue */
  membranous: {
    base: { r: 20, g: 15, b: 25 },
    mid: { r: 30, g: 22, b: 35 },
    highlight: { r: 50, g: 38, b: 55 },
    vein: { r: 60, g: 30, b: 45 },
    veinHighlight: { r: 90, g: 45, b: 65 },
  },
};

export type SurfaceType = keyof typeof surfacePalettes;

// ============================================
// SEEDED RANDOM (for consistent patterns)
// ============================================

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// ============================================
// MAIN SURFACE DRAWING
// ============================================

export interface OrganicSurfaceOptions {
  /** Surface type (default: 'fleshy') */
  type?: SurfaceType;
  
  /** Show veins/capillaries (default: true) */
  showVeins?: boolean;
  
  /** Vein density 0-1 (default: 0.5) */
  veinDensity?: number;
  
  /** Show grain/texture (default: true) */
  showGrain?: boolean;
  
  /** Grain density (default: 0.6) */
  grainDensity?: number;
  
  /** Random seed for consistent patterns (default: 42) */
  seed?: number;
  
  /** Animation time for subtle movement (optional) */
  time?: number;
  
  /** Light position for surface response (optional) */
  lightX?: number;
  lightY?: number;
  lightRadius?: number;
}

/**
 * Draw an organic surface that reads as SOLID, not void.
 * Uses directional patterns (veins, grain) instead of radial gradients.
 * 
 * @example
 * // Draw fleshy wall
 * drawOrganicSurface(ctx, canvas.width, canvas.height, {
 *   type: 'fleshy',
 *   showVeins: true,
 *   veinDensity: 0.6,
 *   lightX: mouseX,
 *   lightY: mouseY,
 * });
 * 
 * // Then draw eyes ON TOP
 * drawEyes(ctx, eyes);
 */
export function drawOrganicSurface(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: OrganicSurfaceOptions = {}
): void {
  const {
    type = 'fleshy',
    showVeins = true,
    veinDensity = 0.5,
    showGrain = true,
    grainDensity = 0.6,
    seed = 42,
    time = 0,
    lightX,
    lightY,
    lightRadius = 200,
  } = options;

  const palette = surfacePalettes[type];
  const random = seededRandom(seed);

  // 1. BASE LAYER - gradient that shows it's a surface, not void
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  baseGrad.addColorStop(0, `rgb(${palette.base.r}, ${palette.base.g}, ${palette.base.b})`);
  baseGrad.addColorStop(0.5, `rgb(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b})`);
  baseGrad.addColorStop(1, `rgb(${palette.base.r + 5}, ${palette.base.g + 3}, ${palette.base.b + 5})`);
  
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. DIRECTIONAL GRAIN - horizontal/diagonal strokes that read as texture
  if (showGrain) {
    drawGrain(ctx, width, height, palette, random, grainDensity, time);
  }

  // 3. VEINS - branching lines that read as organic surface
  if (showVeins) {
    drawVeins(ctx, width, height, palette, random, veinDensity, time);
  }

  // 4. SURFACE IRREGULARITIES - bumps and ridges (NOT circular)
  drawRidges(ctx, width, height, palette, random);

  // 5. LIGHT RESPONSE - if light position provided
  if (lightX !== undefined && lightY !== undefined) {
    drawSurfaceLightResponse(ctx, width, height, lightX, lightY, lightRadius, palette);
  }
}

// ============================================
// GRAIN TEXTURE
// ============================================

function drawGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SurfacePalette,
  random: () => number,
  density: number,
  time: number
): void {
  const lineCount = Math.floor(density * 150);
  
  ctx.lineCap = 'round';
  
  for (let i = 0; i < lineCount; i++) {
    const x = random() * width;
    const y = random() * height;
    
    // Mostly horizontal with slight variation
    const angle = (random() - 0.5) * 0.4 + Math.PI * 0.1;
    const length = 20 + random() * 60;
    
    // Subtle movement over time
    const wobble = time > 0 ? Math.sin(time * 0.0005 + i * 0.1) * 2 : 0;
    
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length + wobble;
    
    // Vary color slightly
    const colorVar = random() * 10 - 5;
    const alpha = 0.1 + random() * 0.15;
    
    ctx.strokeStyle = `rgba(${palette.mid.r + colorVar}, ${palette.mid.g + colorVar}, ${palette.mid.b + colorVar}, ${alpha})`;
    ctx.lineWidth = 1 + random() * 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

// ============================================
// VEINS / CAPILLARIES
// ============================================

interface VeinSegment {
  x: number;
  y: number;
  angle: number;
  thickness: number;
  depth: number;
}

function drawVeins(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SurfacePalette,
  random: () => number,
  density: number,
  time: number
): void {
  const mainVeinCount = Math.floor(density * 8);
  
  for (let v = 0; v < mainVeinCount; v++) {
    // Start from edges
    const side = Math.floor(random() * 4);
    let startX: number, startY: number, startAngle: number;
    
    switch (side) {
      case 0: // top
        startX = random() * width;
        startY = 0;
        startAngle = Math.PI / 2 + (random() - 0.5) * 0.5;
        break;
      case 1: // right
        startX = width;
        startY = random() * height;
        startAngle = Math.PI + (random() - 0.5) * 0.5;
        break;
      case 2: // bottom
        startX = random() * width;
        startY = height;
        startAngle = -Math.PI / 2 + (random() - 0.5) * 0.5;
        break;
      default: // left
        startX = 0;
        startY = random() * height;
        startAngle = (random() - 0.5) * 0.5;
    }
    
    drawVeinBranch(ctx, startX, startY, startAngle, 3 + random() * 2, 0, random, palette, time, width, height);
  }
}

function drawVeinBranch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  thickness: number,
  depth: number,
  random: () => number,
  palette: SurfacePalette,
  time: number,
  width: number,
  height: number
): void {
  if (thickness < 0.5 || depth > 5) return;
  if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;
  
  const segmentLength = 15 + random() * 25;
  const segments: VeinSegment[] = [];
  
  let currentX = x;
  let currentY = y;
  let currentAngle = angle;
  let currentThickness = thickness;
  
  // Draw main vein path
  const pathLength = 5 + Math.floor(random() * 8);
  
  for (let i = 0; i < pathLength; i++) {
    // Wobble angle
    currentAngle += (random() - 0.5) * 0.4;
    
    // Time-based subtle pulse
    const pulse = time > 0 ? Math.sin(time * 0.001 + i * 0.5) * 0.5 : 0;
    
    const nextX = currentX + Math.cos(currentAngle) * segmentLength;
    const nextY = currentY + Math.sin(currentAngle) * segmentLength;
    
    // Draw segment
    const alpha = 0.3 + (thickness / 5) * 0.4;
    ctx.strokeStyle = `rgba(${palette.vein.r}, ${palette.vein.g}, ${palette.vein.b}, ${alpha})`;
    ctx.lineWidth = currentThickness + pulse;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(nextX, nextY);
    ctx.stroke();
    
    // Highlight on top edge of vein
    ctx.strokeStyle = `rgba(${palette.veinHighlight.r}, ${palette.veinHighlight.g}, ${palette.veinHighlight.b}, ${alpha * 0.3})`;
    ctx.lineWidth = currentThickness * 0.3;
    ctx.beginPath();
    ctx.moveTo(currentX, currentY - currentThickness * 0.3);
    ctx.lineTo(nextX, nextY - currentThickness * 0.3);
    ctx.stroke();
    
    segments.push({ x: currentX, y: currentY, angle: currentAngle, thickness: currentThickness, depth });
    
    currentX = nextX;
    currentY = nextY;
    currentThickness *= 0.92; // Taper
    
    // Branch chance
    if (random() < 0.25 && depth < 4) {
      const branchAngle = currentAngle + (random() > 0.5 ? 1 : -1) * (0.4 + random() * 0.4);
      drawVeinBranch(ctx, currentX, currentY, branchAngle, currentThickness * 0.6, depth + 1, random, palette, time, width, height);
    }
  }
}

// ============================================
// RIDGES (directional, not circular)
// ============================================

function drawRidges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SurfacePalette,
  random: () => number
): void {
  const ridgeCount = 15 + Math.floor(random() * 10);
  
  for (let i = 0; i < ridgeCount; i++) {
    const x = random() * width;
    const y = random() * height;
    const ridgeWidth = 40 + random() * 80;
    const ridgeHeight = 8 + random() * 15;
    const angle = random() * Math.PI;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Ridge is an elongated shape (NOT circular)
    const grad = ctx.createLinearGradient(0, -ridgeHeight, 0, ridgeHeight);
    grad.addColorStop(0, `rgba(${palette.highlight.r}, ${palette.highlight.g}, ${palette.highlight.b}, 0.1)`);
    grad.addColorStop(0.3, `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, 0.15)`);
    grad.addColorStop(0.7, `rgba(${palette.base.r}, ${palette.base.g}, ${palette.base.b}, 0.1)`);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, ridgeWidth / 2, ridgeHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

// ============================================
// SURFACE LIGHT RESPONSE
// ============================================

function drawSurfaceLightResponse(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lightX: number,
  lightY: number,
  lightRadius: number,
  palette: SurfacePalette
): void {
  // When light hits the surface, it should reveal texture, not create a hole
  // Use a soft LINEAR gradient from light position, not radial
  
  const angle = Math.atan2(height / 2 - lightY, width / 2 - lightX);
  const gradLength = lightRadius * 1.5;
  
  const endX = lightX + Math.cos(angle) * gradLength;
  const endY = lightY + Math.sin(angle) * gradLength;
  
  // Highlight where light hits (subtle)
  const highlightGrad = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, lightRadius * 0.8);
  highlightGrad.addColorStop(0, `rgba(${palette.highlight.r + 30}, ${palette.highlight.g + 25}, ${palette.highlight.b + 25}, 0.15)`);
  highlightGrad.addColorStop(0.5, `rgba(${palette.mid.r + 15}, ${palette.mid.g + 12}, ${palette.mid.b + 12}, 0.08)`);
  highlightGrad.addColorStop(1, 'transparent');
  
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(0, 0, width, height);
  
  // Subsurface scattering effect for fleshy/membranous surfaces
  // Light penetrates slightly, creating warm glow
  // Check by color - fleshy and membranous have reddish veins
  const hasSubsurfaceScattering = palette.vein.r > palette.vein.g && palette.vein.r > palette.vein.b;
  if (hasSubsurfaceScattering) {
    const scatterGrad = ctx.createRadialGradient(lightX, lightY, lightRadius * 0.3, lightX, lightY, lightRadius * 1.2);
    scatterGrad.addColorStop(0, `rgba(${palette.veinHighlight.r}, ${palette.veinHighlight.g * 0.6}, ${palette.veinHighlight.b * 0.6}, 0.08)`);
    scatterGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = scatterGrad;
    ctx.fillRect(0, 0, width, height);
  }
}

// ============================================
// ADDITIONAL SURFACE ELEMENTS
// ============================================

/**
 * Draw barnacle/growth clusters on a surface
 * These are raised bumps, NOT holes
 */
export function drawBarnacles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  clusterRadius: number,
  options: {
    count?: number;
    seed?: number;
    palette?: SurfacePalette;
  } = {}
): void {
  const {
    count = 8,
    seed = 123,
    palette = surfacePalettes.barnacled as SurfacePalette,
  } = options;

  const random = seededRandom(seed);
  
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const dist = random() * clusterRadius;
    const bx = x + Math.cos(angle) * dist;
    const by = y + Math.sin(angle) * dist;
    const size = 3 + random() * 8;
    
    // Barnacle is a raised ring, not a hole
    // Highlight on top, shadow on bottom
    
    // Outer ring (raised edge)
    ctx.strokeStyle = `rgba(${palette.highlight.r}, ${palette.highlight.g}, ${palette.highlight.b}, 0.4)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, size, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();
    
    // Shadow on bottom
    ctx.strokeStyle = `rgba(${palette.base.r}, ${palette.base.g}, ${palette.base.b}, 0.5)`;
    ctx.beginPath();
    ctx.arc(bx, by, size, Math.PI * 1.8, Math.PI * 0.8);
    ctx.stroke();
    
    // Center (slightly raised)
    ctx.fillStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, 0.6)`;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw scarring/damage on surface
 * Linear marks that read as scratches, not holes
 */
export function drawScarring(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  options: {
    angle?: number;
    width?: number;
    palette?: SurfacePalette;
  } = {}
): void {
  const {
    angle = 0,
    width = 3,
    palette = surfacePalettes.fleshy as SurfacePalette,
  } = options;

  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  
  // Dark center (the scar itself)
  ctx.strokeStyle = `rgba(${palette.base.r - 5}, ${palette.base.g - 5}, ${palette.base.b - 5}, 0.6)`;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  
  // Raised edge (scar tissue)
  ctx.strokeStyle = `rgba(${palette.veinHighlight.r}, ${palette.veinHighlight.g}, ${palette.veinHighlight.b}, 0.3)`;
  ctx.lineWidth = width * 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y - width * 0.5);
  ctx.lineTo(endX, endY - width * 0.5);
  ctx.stroke();
}
