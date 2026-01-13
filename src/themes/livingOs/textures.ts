/**
 * LIVING OS THEME - Organic Textures
 * 
 * Bark, wood, and organic surface textures using noise patterns.
 */

// Reuse simplex noise from deepSea surfaces (simplified version)
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const grad3 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

function createPermutation(seed: number): number[] {
  const perm = Array.from({ length: 256 }, (_, i) => i);
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return [...perm, ...perm];
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
  
  return 70 * (n0 + n1 + n2);
}

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

export interface BarkTextureOptions {
  width: number;
  height: number;
  grainDirection?: 'vertical' | 'horizontal';
  roughness?: number; // 0-1
  color?: string;
  seed?: number;
}

/**
 * Draw bark/wood texture
 * 
 * PERFORMANCE NOTE: Large textures (e.g., full-screen on 4K displays) can exceed
 * browser memory limits. This function automatically caps dimensions to prevent
 * allocation failures. For very large surfaces, consider tiled rendering.
 */
export function drawBarkTexture(
  ctx: CanvasRenderingContext2D,
  options: BarkTextureOptions
): void {
  const {
    width,
    height,
    grainDirection = 'vertical',
    roughness = 0.5,
    color = '#3d2817',
    seed = 0,
  } = options;
  
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
      `drawBarkTexture: Dimensions ${width}x${height} exceed safe limit (${MAX_WIDTH}x${MAX_HEIGHT}). ` +
      `Using reduced size ${actualWidth}x${actualHeight} to prevent memory allocation failure.`
    );
  }
  
  // Additional safety check: ensure we don't exceed reasonable pixel count
  if (actualPixels > MAX_PIXELS) {
    const scale = Math.sqrt(MAX_PIXELS / actualPixels);
    const scaledWidth = Math.floor(actualWidth * scale);
    const scaledHeight = Math.floor(actualHeight * scale);
    console.warn(
      `drawBarkTexture: Pixel count ${actualPixels} exceeds limit ${MAX_PIXELS}. ` +
      `Scaling to ${scaledWidth}x${scaledHeight}.`
    );
    // Recursively call with safe dimensions
    return drawBarkTexture(ctx, {
      ...options,
      width: scaledWidth,
      height: scaledHeight,
    });
  }
  
  const perm = createPermutation(seed);
  const scale = 0.02; // Texture scale
  const roughnessScale = roughness * 0.1;
  
  // Create image data for pixel manipulation with error handling
  let imageData: ImageData;
  try {
    imageData = ctx.createImageData(actualWidth, actualHeight);
  } catch (error) {
    if (error instanceof RangeError || error instanceof DOMException) {
      // Fallback: try smaller size
      const fallbackWidth = Math.floor(actualWidth * 0.5);
      const fallbackHeight = Math.floor(actualHeight * 0.5);
      console.error(
        `drawBarkTexture: Failed to allocate ${actualWidth}x${actualHeight} buffer. ` +
        `Falling back to ${fallbackWidth}x${fallbackHeight}.`,
        error
      );
      return drawBarkTexture(ctx, {
        ...options,
        width: fallbackWidth,
        height: fallbackHeight,
      });
    }
    throw error; // Re-throw if it's not a memory error
  }
  
  const data = imageData.data;
  
  const baseColor = hexToRgb(color);
  
  for (let y = 0; y < actualHeight; y++) {
    for (let x = 0; x < actualWidth; x++) {
      const idx = (y * actualWidth + x) * 4;
      
      // Grain pattern (stronger in grain direction)
      let grain = 0;
      if (grainDirection === 'vertical') {
        grain = fbm(x * scale, y * scale * 0.1, perm, 3);
      } else {
        grain = fbm(x * scale * 0.1, y * scale, perm, 3);
      }
      
      // Roughness variation
      const rough = fbm(x * scale * 2, y * scale * 2, perm, 2) * roughnessScale;
      
      // Combine patterns
      const variation = grain + rough;
      
      // Apply to color
      const r = Math.max(0, Math.min(255, baseColor.r + variation * 20));
      const g = Math.max(0, Math.min(255, baseColor.g + variation * 15));
      const b = Math.max(0, Math.min(255, baseColor.b + variation * 10));
      
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
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

/**
 * Draw organic surface texture (enhanced for plant textures)
 */
export function drawOrganicSurface(
  ctx: CanvasRenderingContext2D,
  options: BarkTextureOptions & { type?: 'bark' | 'wood' | 'organic' }
): void {
  const { type = 'organic', ...barkOptions } = options;
  
  if (type === 'bark' || type === 'wood') {
    drawBarkTexture(ctx, barkOptions);
  } else {
    // Organic surface (similar to deepSea but with plant colors)
    drawBarkTexture(ctx, {
      ...barkOptions,
      roughness: (barkOptions.roughness || 0.5) * 0.7, // Softer for organic
    });
  }
}

/**
 * Helper: Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 61, g: 40, b: 23 }; // Default bark color
}
