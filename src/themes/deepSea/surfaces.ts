/**
 * ORGANIC SURFACES v2
 * 
 * Draw surfaces that look like LIVING TISSUE - whale skin, squid mantle,
 * deep-sea creature flesh. Not 90s vector graphics.
 * 
 * Key techniques:
 * - Simplex noise for organic variation
 * - Bezier curves for veins (not straight lines)
 * - Varied thickness with tapering
 * - Color mottling, not uniform fills
 */

// ============================================
// SIMPLEX NOISE (for organic variation)
// ============================================

// Simplified 2D simplex noise implementation
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const grad3 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

function createPermutation(seed: number): number[] {
  const perm = Array.from({ length: 256 }, (_, i) => i);
  // Fisher-Yates shuffle with seed
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return [...perm, ...perm]; // Double it for overflow
}

function simplex2D(x: number, y: number, perm: number[]): number {
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;
  
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;
  
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;
  
  const ii = i & 255;
  const jj = j & 255;
  
  const gi0 = perm[ii + perm[jj]] % 8;
  const gi1 = perm[ii + i1 + perm[jj + j1]] % 8;
  const gi2 = perm[ii + 1 + perm[jj + 1]] % 8;
  
  let n0 = 0, n1 = 0, n2 = 0;
  
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
  }
  
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
  }
  
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
  }
  
  return 70 * (n0 + n1 + n2); // Returns -1 to 1
}

/** Fractal Brownian Motion - layered noise for more organic patterns */
function fbm(x: number, y: number, perm: number[], octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * simplex2D(x * frequency, y * frequency, perm);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value / maxValue;
}

// ============================================
// SURFACE COLOR PALETTES
// ============================================

export interface SurfacePalette {
  base: { r: number; g: number; b: number };
  mid: { r: number; g: number; b: number };
  highlight: { r: number; g: number; b: number };
  shadow: { r: number; g: number; b: number };
  vein: { r: number; g: number; b: number };
  veinHighlight: { r: number; g: number; b: number };
}

export const surfacePalettes: Record<string, SurfacePalette> = {
  /** Whale/squid flesh - dark with subtle blue undertones */
  fleshy: {
    base: { r: 28, g: 22, b: 26 },
    mid: { r: 38, g: 30, b: 35 },
    highlight: { r: 58, g: 48, b: 52 },
    shadow: { r: 18, g: 14, b: 18 },
    vein: { r: 50, g: 28, b: 35 },
    veinHighlight: { r: 85, g: 50, b: 55 },
  },
  
  /** Deep-sea creature - blue-gray with bioluminescent hints */
  abyssal: {
    base: { r: 20, g: 25, b: 32 },
    mid: { r: 30, g: 38, b: 48 },
    highlight: { r: 50, g: 62, b: 75 },
    shadow: { r: 12, g: 15, b: 22 },
    vein: { r: 35, g: 45, b: 60 },
    veinHighlight: { r: 60, g: 80, b: 100 },
  },
  
  /** Rocky/barnacled - crusty organic growth */
  rocky: {
    base: { r: 25, g: 28, b: 25 },
    mid: { r: 38, g: 42, b: 38 },
    highlight: { r: 55, g: 62, b: 55 },
    shadow: { r: 15, g: 18, b: 16 },
    vein: { r: 35, g: 32, b: 30 },
    veinHighlight: { r: 55, g: 50, b: 45 },
  },
  
  /** Membranous - thin translucent tissue */
  membranous: {
    base: { r: 25, g: 20, b: 30 },
    mid: { r: 38, g: 30, b: 45 },
    highlight: { r: 60, g: 48, b: 68 },
    shadow: { r: 15, g: 12, b: 20 },
    vein: { r: 70, g: 40, b: 55 },
    veinHighlight: { r: 100, g: 60, b: 75 },
  },
};

export type SurfaceType = keyof typeof surfacePalettes;

// ============================================
// MAIN SURFACE DRAWING
// ============================================

/** 
 * Visibility presets - shortcuts for common use cases.
 * 
 * - 'visible': Clear, high-contrast surface (for main features like The Wall)
 * - 'subtle': Muted background texture (for ambient depth)
 * - 'dramatic': High vein density, strong light response (for horror scenes)
 */
export type SurfacePreset = 'visible' | 'subtle' | 'dramatic';

const surfacePresets: Record<SurfacePreset, Partial<OrganicSurfaceOptions>> = {
  visible: {
    noiseScale: 0.003,
    showVeins: true,
    veinCount: 6,
  },
  subtle: {
    noiseScale: 0.005,
    showVeins: true,
    veinCount: 3,
  },
  dramatic: {
    noiseScale: 0.002,
    showVeins: true,
    veinCount: 10,
  },
};

export interface OrganicSurfaceOptions {
  /** Use a preset configuration (overridable by other options) */
  preset?: SurfacePreset;
  
  /** Surface type (default: 'fleshy') */
  type?: SurfaceType;
  
  /** Noise scale - larger = bigger features (default: 0.003) */
  noiseScale?: number;
  
  /** Show organic veins (default: true) */
  showVeins?: boolean;
  
  /** Number of major veins (default: 6) */
  veinCount?: number;
  
  /** Random seed for consistent patterns (default: 42) */
  seed?: number;
  
  /** Animation time for subtle pulsing (optional) */
  time?: number;
  
  /** Light position for surface response (optional) */
  lightX?: number;
  lightY?: number;
  lightRadius?: number;
}

/**
 * Draw an organic surface that looks like LIVING TISSUE.
 * Uses noise for mottling, bezier curves for veins, proper depth cues.
 * 
 * PERFORMANCE NOTE: The per-pixel noise (mottled base) is expensive.
 * For animated scenes, render the base layer to an offscreen canvas once,
 * then composite it each frame:
 * 
 * @example
 * // Cache the base layer
 * const offscreen = document.createElement('canvas');
 * offscreen.width = width; offscreen.height = height;
 * drawOrganicSurface(offscreen.getContext('2d'), width, height, { 
 *   type: 'fleshy', time: 0 // static base
 * });
 * 
 * // In render loop
 * ctx.drawImage(offscreen, 0, 0);
 * // Then draw dynamic elements (light response, eyes, etc.)
 * 
 * @example
 * // Simple usage with preset
 * drawOrganicSurface(ctx, canvas.width, canvas.height, {
 *   preset: 'visible',
 *   type: 'fleshy',
 *   lightX: mouseX,
 *   lightY: mouseY,
 * });
 */
export function drawOrganicSurface(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: OrganicSurfaceOptions = {}
): void {
  // Apply preset first, then override with explicit options
  const presetConfig = options.preset ? surfacePresets[options.preset] : {};
  
  const {
    type = 'fleshy',
    noiseScale = presetConfig.noiseScale ?? 0.003,
    showVeins = presetConfig.showVeins ?? true,
    veinCount = presetConfig.veinCount ?? 6,
    seed = 42,
    time = 0,
    lightX,
    lightY,
    lightRadius = 250,
  } = { ...presetConfig, ...options };

  const palette = surfacePalettes[type] || surfacePalettes.fleshy;
  const perm = createPermutation(seed);

  // 1. BASE MOTTLED LAYER - noise-based color variation
  drawMottledBase(ctx, width, height, palette, perm, noiseScale, time);

  // 2. DEPTH LAYER - raised and recessed areas (NOT holes)
  drawDepthLayer(ctx, width, height, palette, perm, noiseScale);

  // 3. ORGANIC VEINS - bezier curves with varied thickness
  if (showVeins) {
    drawOrganicVeins(ctx, width, height, palette, perm, veinCount, time);
  }

  // 4. SUBSURFACE DETAIL - pores, texture at larger scale
  drawSubsurfaceDetail(ctx, width, height, palette, perm, noiseScale * 3);

  // 5. LIGHT RESPONSE
  if (lightX !== undefined && lightY !== undefined) {
    drawFleshLightResponse(ctx, width, height, lightX, lightY, lightRadius, palette, perm);
  }
}

// ============================================
// MOTTLED BASE (noise-based color variation)
// ============================================

function drawMottledBase(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SurfacePalette,
  perm: number[],
  noiseScale: number,
  time: number
): void {
  // Safety limit: prevent memory allocation failures
  // Max 1920x1080 = ~8MB buffer (safe for most browsers)
  const MAX_WIDTH = 1920;
  const MAX_HEIGHT = 1080;
  const MAX_PIXELS = MAX_WIDTH * MAX_HEIGHT;
  
  const actualWidth = Math.min(width, MAX_WIDTH);
  const actualHeight = Math.min(height, MAX_HEIGHT);
  const actualPixels = actualWidth * actualHeight;
  
  // If dimensions exceed limits, warn and use reduced size
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    console.warn(
      `drawOrganicSurface: Dimensions ${width}x${height} exceed safe limit (${MAX_WIDTH}x${MAX_HEIGHT}). ` +
      `Using reduced size ${actualWidth}x${actualHeight} to prevent memory allocation failure.`
    );
  }
  
  // Additional safety check: ensure we don't exceed reasonable pixel count
  if (actualPixels > MAX_PIXELS) {
    const scale = Math.sqrt(MAX_PIXELS / actualPixels);
    const scaledWidth = Math.floor(actualWidth * scale);
    const scaledHeight = Math.floor(actualHeight * scale);
    console.warn(
      `drawOrganicSurface: Pixel count ${actualPixels} exceeds limit ${MAX_PIXELS}. ` +
      `Scaling to ${scaledWidth}x${scaledHeight}.`
    );
    // Recursively call with safe dimensions
    return drawMottledBase(ctx, scaledWidth, scaledHeight, palette, perm, noiseScale, time);
  }
  
  // Use imageData for per-pixel noise (much more organic than gradients)
  let imageData: ImageData;
  try {
    imageData = ctx.createImageData(actualWidth, actualHeight);
  } catch (error) {
    if (error instanceof RangeError || error instanceof DOMException) {
      // Fallback: try smaller size
      const fallbackWidth = Math.floor(actualWidth * 0.5);
      const fallbackHeight = Math.floor(actualHeight * 0.5);
      console.error(
        `drawOrganicSurface: Failed to allocate ${actualWidth}x${actualHeight} buffer. ` +
        `Falling back to ${fallbackWidth}x${fallbackHeight}.`,
        error
      );
      return drawMottledBase(ctx, fallbackWidth, fallbackHeight, palette, perm, noiseScale, time);
    }
    throw error; // Re-throw if it's not a memory error
  }
  
  const data = imageData.data;
  
  // Time-based subtle shift
  const timeOffset = time * 0.00005;
  
  for (let y = 0; y < actualHeight; y++) {
    for (let x = 0; x < actualWidth; x++) {
      // Multi-octave noise for organic variation
      const n1 = fbm(x * noiseScale + timeOffset, y * noiseScale, perm, 4);
      const n2 = fbm(x * noiseScale * 2 + 100, y * noiseScale * 2 + 100, perm, 3);
      
      // Combine noises for color blending
      const blend = (n1 + 1) / 2; // 0-1
      const detail = (n2 + 1) / 2;
      
      // Interpolate between base, mid, and shadow based on noise
      let r, g, b;
      if (blend < 0.4) {
        const t = blend / 0.4;
        r = palette.shadow.r + (palette.base.r - palette.shadow.r) * t;
        g = palette.shadow.g + (palette.base.g - palette.shadow.g) * t;
        b = palette.shadow.b + (palette.base.b - palette.shadow.b) * t;
      } else if (blend < 0.7) {
        const t = (blend - 0.4) / 0.3;
        r = palette.base.r + (palette.mid.r - palette.base.r) * t;
        g = palette.base.g + (palette.mid.g - palette.base.g) * t;
        b = palette.base.b + (palette.mid.b - palette.base.b) * t;
      } else {
        const t = (blend - 0.7) / 0.3;
        r = palette.mid.r + (palette.highlight.r - palette.mid.r) * t * 0.3;
        g = palette.mid.g + (palette.highlight.g - palette.mid.g) * t * 0.3;
        b = palette.mid.b + (palette.highlight.b - palette.mid.b) * t * 0.3;
      }
      
      // Add detail variation
      r += (detail - 0.5) * 8;
      g += (detail - 0.5) * 6;
      b += (detail - 0.5) * 8;
      
      const idx = (y * width + x) * 4;
      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = 255;
    }
  }
  
  // Only put imageData if dimensions match (otherwise it was scaled down)
  if (actualWidth === width && actualHeight === height) {
    ctx.putImageData(imageData, 0, 0);
  } else {
    // If scaled down, draw to a temporary canvas and scale it up
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = actualWidth;
    tempCanvas.height = actualHeight;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  }
}

// ============================================
// DEPTH LAYER (raised/recessed without holes)
// ============================================

function drawDepthLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SurfacePalette,
  perm: number[],
  noiseScale: number
): void {
  // Large-scale depth variation - like muscles under skin
  const depthScale = noiseScale * 0.5;
  
  ctx.globalCompositeOperation = 'overlay';
  
  // Draw several large depth regions
  for (let i = 0; i < 8; i++) {
    const cx = simplex2D(i * 50, 0, perm) * 0.5 + 0.5;
    const cy = simplex2D(0, i * 50, perm) * 0.5 + 0.5;
    const x = cx * width;
    const y = cy * height;
    const size = 100 + Math.abs(simplex2D(i * 30, i * 30, perm)) * 200;
    
    // Raised area - highlight on top edge, shadow on bottom
    const isRaised = simplex2D(i * 20, i * 20 + 500, perm) > 0;
    
    if (isRaised) {
      // Subtle highlight gradient (NOT circular - use ellipse)
      const angle = simplex2D(i * 10, 0, perm) * Math.PI;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      const grad = ctx.createLinearGradient(0, -size * 0.3, 0, size * 0.3);
      grad.addColorStop(0, `rgba(${palette.highlight.r}, ${palette.highlight.g}, ${palette.highlight.b}, 0.15)`);
      grad.addColorStop(0.5, 'rgba(128, 128, 128, 0)');
      grad.addColorStop(1, `rgba(${palette.shadow.r}, ${palette.shadow.g}, ${palette.shadow.b}, 0.1)`);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  ctx.globalCompositeOperation = 'source-over';
}

// ============================================
// ORGANIC VEINS (bezier curves, varied thickness)
// ============================================

interface VeinPoint {
  x: number;
  y: number;
  thickness: number;
}

function drawOrganicVeins(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SurfacePalette,
  perm: number[],
  count: number,
  time: number
): void {
  for (let v = 0; v < count; v++) {
    // Start from edges with some randomness
    const edge = Math.floor((simplex2D(v * 100, 0, perm) + 1) * 2) % 4;
    let startX: number, startY: number, startAngle: number;
    
    const edgePos = (simplex2D(v * 50, v * 50, perm) + 1) / 2;
    
    switch (edge) {
      case 0: // top
        startX = edgePos * width;
        startY = -20;
        startAngle = Math.PI / 2 + (simplex2D(v * 30, 0, perm)) * 0.4;
        break;
      case 1: // right
        startX = width + 20;
        startY = edgePos * height;
        startAngle = Math.PI + (simplex2D(v * 30, 100, perm)) * 0.4;
        break;
      case 2: // bottom
        startX = edgePos * width;
        startY = height + 20;
        startAngle = -Math.PI / 2 + (simplex2D(v * 30, 200, perm)) * 0.4;
        break;
      default: // left
        startX = -20;
        startY = edgePos * height;
        startAngle = (simplex2D(v * 30, 300, perm)) * 0.4;
    }
    
    drawOrganicVeinBranch(
      ctx, startX, startY, startAngle,
      5 + Math.abs(simplex2D(v * 20, v * 20, perm)) * 4, // thickness 5-9
      0, perm, palette, time, width, height, v * 1000
    );
  }
}

function drawOrganicVeinBranch(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  angle: number,
  thickness: number,
  depth: number,
  perm: number[],
  palette: SurfacePalette,
  time: number,
  width: number,
  height: number,
  seedOffset: number
): void {
  if (thickness < 1 || depth > 4) return;
  
  // Generate organic path using bezier curves
  const points: VeinPoint[] = [{ x: startX, y: startY, thickness }];
  
  let currentX = startX;
  let currentY = startY;
  let currentAngle = angle;
  let currentThickness = thickness;
  
  const segmentCount = 8 + Math.floor(Math.abs(simplex2D(seedOffset, 0, perm)) * 6);
  
  for (let i = 0; i < segmentCount; i++) {
    // Organic angle variation using noise
    const angleNoise = simplex2D(seedOffset + i * 10, depth * 100, perm) * 0.6;
    currentAngle += angleNoise;
    
    // Segment length varies
    const segLength = 30 + simplex2D(seedOffset + i * 20, 0, perm) * 20;
    
    // Time-based subtle pulse
    const pulse = time > 0 ? Math.sin(time * 0.002 + i * 0.5 + seedOffset * 0.01) * 2 : 0;
    
    currentX += Math.cos(currentAngle) * segLength;
    currentY += Math.sin(currentAngle) * segLength + pulse;
    
    // Thickness varies organically - bulges and tapers
    const thicknessNoise = simplex2D(seedOffset + i * 15, depth * 50 + 500, perm);
    currentThickness *= 0.92 + thicknessNoise * 0.1; // Taper with variation
    
    // Occasional bulge
    if (thicknessNoise > 0.6) {
      currentThickness *= 1.15;
    }
    
    points.push({ x: currentX, y: currentY, thickness: Math.max(0.5, currentThickness) });
    
    // Stop if out of bounds
    if (currentX < -50 || currentX > width + 50 || currentY < -50 || currentY > height + 50) {
      break;
    }
    
    // Branch chance
    if (i > 2 && simplex2D(seedOffset + i * 25, depth * 200, perm) > 0.7 && depth < 3) {
      const branchAngle = currentAngle + (simplex2D(seedOffset + i * 30, 0, perm) > 0 ? 1 : -1) * (0.5 + Math.abs(simplex2D(seedOffset + i * 35, 0, perm)) * 0.5);
      drawOrganicVeinBranch(
        ctx, currentX, currentY, branchAngle,
        currentThickness * 0.6, depth + 1,
        perm, palette, time, width, height,
        seedOffset + i * 1000 + depth * 10000
      );
    }
  }
  
  // Draw the vein using bezier curves between points
  if (points.length < 2) return;
  
  // Main vein body
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    // Catmull-Rom to Bezier control points for smooth curves
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    
    // Draw segment with thickness gradient
    const avgThickness = (p1.thickness + p2.thickness) / 2;
    
    // Shadow/depth underneath
    ctx.strokeStyle = `rgba(${palette.shadow.r}, ${palette.shadow.g}, ${palette.shadow.b}, 0.4)`;
    ctx.lineWidth = avgThickness + 2;
    ctx.beginPath();
    ctx.moveTo(p1.x + 1, p1.y + 1);
    ctx.bezierCurveTo(cp1x + 1, cp1y + 1, cp2x + 1, cp2y + 1, p2.x + 1, p2.y + 1);
    ctx.stroke();
    
    // Main vein
    ctx.strokeStyle = `rgba(${palette.vein.r}, ${palette.vein.g}, ${palette.vein.b}, 0.7)`;
    ctx.lineWidth = avgThickness;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    ctx.stroke();
    
    // Highlight on top edge
    ctx.strokeStyle = `rgba(${palette.veinHighlight.r}, ${palette.veinHighlight.g}, ${palette.veinHighlight.b}, 0.25)`;
    ctx.lineWidth = avgThickness * 0.4;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y - avgThickness * 0.25);
    ctx.bezierCurveTo(cp1x, cp1y - avgThickness * 0.25, cp2x, cp2y - avgThickness * 0.25, p2.x, p2.y - avgThickness * 0.25);
    ctx.stroke();
  }
}

// ============================================
// SUBSURFACE DETAIL (pores, large-scale texture)
// ============================================

function drawSubsurfaceDetail(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: SurfacePalette,
  perm: number[],
  scale: number
): void {
  ctx.globalCompositeOperation = 'soft-light';
  
  // Large organic shapes that suggest structure beneath
  for (let i = 0; i < 15; i++) {
    const x = (simplex2D(i * 70, 0, perm) + 1) / 2 * width;
    const y = (simplex2D(0, i * 70, perm) + 1) / 2 * height;
    const size = 40 + Math.abs(simplex2D(i * 40, i * 40, perm)) * 100;
    const angle = simplex2D(i * 25, 500, perm) * Math.PI;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Elongated organic shape
    const aspectRatio = 0.3 + Math.abs(simplex2D(i * 35, 0, perm)) * 0.4;
    
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    const brightness = simplex2D(i * 45, 250, perm) > 0 ? 1.2 : 0.8;
    grad.addColorStop(0, `rgba(${palette.mid.r * brightness}, ${palette.mid.g * brightness}, ${palette.mid.b * brightness}, 0.15)`);
    grad.addColorStop(0.7, `rgba(${palette.base.r}, ${palette.base.g}, ${palette.base.b}, 0.05)`);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * aspectRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  ctx.globalCompositeOperation = 'source-over';
}

// ============================================
// LIGHT RESPONSE (subsurface scattering)
// ============================================

function drawFleshLightResponse(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lightX: number,
  lightY: number,
  lightRadius: number,
  palette: SurfacePalette,
  perm: number[]
): void {
  // Subsurface scattering - light penetrates flesh, creates warm glow
  
  // Inner warm glow (light penetrating tissue)
  const scatterGrad = ctx.createRadialGradient(
    lightX, lightY, 0,
    lightX, lightY, lightRadius * 1.5
  );
  scatterGrad.addColorStop(0, `rgba(${palette.veinHighlight.r + 20}, ${palette.veinHighlight.g}, ${palette.veinHighlight.b - 10}, 0.12)`);
  scatterGrad.addColorStop(0.3, `rgba(${palette.vein.r + 15}, ${palette.vein.g}, ${palette.vein.b}, 0.08)`);
  scatterGrad.addColorStop(0.6, `rgba(${palette.mid.r + 10}, ${palette.mid.g + 5}, ${palette.mid.b + 5}, 0.04)`);
  scatterGrad.addColorStop(1, 'transparent');
  
  ctx.fillStyle = scatterGrad;
  ctx.fillRect(0, 0, width, height);
  
  // Surface highlight (specular)
  const highlightGrad = ctx.createRadialGradient(
    lightX, lightY, 0,
    lightX, lightY, lightRadius * 0.5
  );
  highlightGrad.addColorStop(0, `rgba(${palette.highlight.r + 40}, ${palette.highlight.g + 35}, ${palette.highlight.b + 30}, 0.2)`);
  highlightGrad.addColorStop(0.5, `rgba(${palette.highlight.r + 20}, ${palette.highlight.g + 15}, ${palette.highlight.b + 10}, 0.08)`);
  highlightGrad.addColorStop(1, 'transparent');
  
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(0, 0, width, height);
  
  // Reveal more vein detail near light
  // Draw subtle additional veins that only appear in light
  ctx.globalCompositeOperation = 'overlay';
  
  const revealRadius = lightRadius * 1.2;
  for (let i = 0; i < 5; i++) {
    const angle = (simplex2D(lightX * 0.01 + i * 20, lightY * 0.01, perm) + 1) * Math.PI;
    const dist = 20 + Math.abs(simplex2D(i * 30, 0, perm)) * 60;
    const vx = lightX + Math.cos(angle) * dist;
    const vy = lightY + Math.sin(angle) * dist;
    
    const veinAlpha = Math.max(0, 1 - Math.sqrt((vx - lightX) ** 2 + (vy - lightY) ** 2) / revealRadius) * 0.3;
    
    if (veinAlpha > 0.05) {
      ctx.strokeStyle = `rgba(${palette.vein.r + 20}, ${palette.vein.g}, ${palette.vein.b}, ${veinAlpha})`;
      ctx.lineWidth = 1 + Math.abs(simplex2D(i * 25, 0, perm)) * 2;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      
      // Short curving vein segment
      const endAngle = angle + (simplex2D(i * 15, 500, perm)) * 0.8;
      const length = 20 + Math.abs(simplex2D(i * 35, 0, perm)) * 40;
      const cpDist = length * 0.5;
      const cpAngle = angle + (simplex2D(i * 20, 250, perm)) * 0.5;
      
      ctx.quadraticCurveTo(
        vx + Math.cos(cpAngle) * cpDist,
        vy + Math.sin(cpAngle) * cpDist,
        vx + Math.cos(endAngle) * length,
        vy + Math.sin(endAngle) * length
      );
      ctx.stroke();
    }
  }
  
  ctx.globalCompositeOperation = 'source-over';
}

// ============================================
// ADDITIONAL SURFACE ELEMENTS
// ============================================

/**
 * Draw barnacle/growth clusters on a surface
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
    palette = surfacePalettes.rocky,
  } = options;

  const perm = createPermutation(seed);
  
  for (let i = 0; i < count; i++) {
    const angle = (simplex2D(i * 50, 0, perm) + 1) * Math.PI;
    const dist = Math.abs(simplex2D(i * 30, i * 30, perm)) * clusterRadius;
    const bx = x + Math.cos(angle) * dist;
    const by = y + Math.sin(angle) * dist;
    const size = 3 + Math.abs(simplex2D(i * 40, 0, perm)) * 8;
    
    // Raised bump with highlight/shadow
    ctx.strokeStyle = `rgba(${palette.highlight.r}, ${palette.highlight.g}, ${palette.highlight.b}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, size, Math.PI * 0.7, Math.PI * 1.9);
    ctx.stroke();
    
    ctx.strokeStyle = `rgba(${palette.shadow.r}, ${palette.shadow.g}, ${palette.shadow.b}, 0.6)`;
    ctx.beginPath();
    ctx.arc(bx, by, size, Math.PI * 1.9, Math.PI * 0.7);
    ctx.stroke();
    
    ctx.fillStyle = `rgba(${palette.mid.r}, ${palette.mid.g}, ${palette.mid.b}, 0.7)`;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw organic scarring
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
    palette = surfacePalettes.fleshy,
  } = options;

  // Organic scar with slight curve
  const midX = x + Math.cos(angle) * length * 0.5;
  const midY = y + Math.sin(angle) * length * 0.5;
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  
  // Offset for curve
  const curveOffset = (Math.random() - 0.5) * 15;
  const cpX = midX + Math.cos(angle + Math.PI / 2) * curveOffset;
  const cpY = midY + Math.sin(angle + Math.PI / 2) * curveOffset;
  
  // Dark center
  ctx.strokeStyle = `rgba(${palette.shadow.r}, ${palette.shadow.g}, ${palette.shadow.b}, 0.7)`;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(cpX, cpY, endX, endY);
  ctx.stroke();
  
  // Raised edge
  ctx.strokeStyle = `rgba(${palette.veinHighlight.r}, ${palette.veinHighlight.g}, ${palette.veinHighlight.b}, 0.35)`;
  ctx.lineWidth = width * 0.4;
  ctx.beginPath();
  ctx.moveTo(x, y - width * 0.4);
  ctx.quadraticCurveTo(cpX, cpY - width * 0.4, endX, endY - width * 0.4);
  ctx.stroke();
}
