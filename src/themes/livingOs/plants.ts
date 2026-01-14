/**
 * LIVING OS THEME - Plant Elements v2
 *
 * Leaf shapes, flowers, and plant elements with organic forms.
 * Enhanced with recursive veins, color mottling, and premium detail.
 * Inspired by Deep Sea theme quality standards.
 */

import { simplex2D, fbm, getOrCreatePermutation } from './textures.js';

export interface LeafOptions {
  x: number;
  y: number;
  size?: number;
  rotation?: number;
  type?: 'simple' | 'veined' | 'organic' | 'detailed';
  color?: string;
  opacity?: number;
  growthLevel?: number; // 0-1, affects detail level
  seed?: number; // For deterministic variation
}

/**
 * Enhanced flower rendering options
 */
export interface FlowerOptions {
  x: number;
  y: number;
  petalCount?: number; // 4-8 (default: 5)
  petalLength?: number; // Length of petals (default: 15)
  color?: string; // Petal color
  centerColor?: string; // Center disk color
  growthStage?: number; // 0-1 (0 = bud, 1 = fully open)
  rotation?: number;
  seed?: number;
}

/**
 * Draw a single leaf
 */
export function drawLeaf(ctx: CanvasRenderingContext2D, options: LeafOptions): void {
  const {
    x,
    y,
    size = 20,
    rotation = 0,
    type = 'simple',
    color = '#3d6a4d',
    opacity = 1,
    growthLevel = 1,
    seed = 0,
  } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;

  switch (type) {
    case 'simple':
      drawSimpleLeaf(ctx, size, color);
      break;
    case 'veined':
      drawVeinedLeaf(ctx, size, color);
      break;
    case 'organic':
      drawOrganicLeaf(ctx, size, color);
      break;
    case 'detailed':
      drawDetailedLeaf(ctx, size, color, growthLevel, seed);
      break;
  }

  ctx.restore();
}

/**
 * Draw multiple leaves with drift/movement
 */
export function drawLeaves(
  ctx: CanvasRenderingContext2D,
  leaves: Array<LeafOptions & { driftX?: number; driftY?: number }>
): void {
  leaves.forEach((leaf) => {
    const x = leaf.x + (leaf.driftX || 0);
    const y = leaf.y + (leaf.driftY || 0);
    drawLeaf(ctx, { ...leaf, x, y });
  });
}

/**
 * Simple leaf shape (basic teardrop)
 */
function drawSimpleLeaf(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  
  // Teardrop shape using Bezier curve
  ctx.moveTo(0, -size * 0.5); // Top point
  ctx.bezierCurveTo(
    size * 0.3, -size * 0.2, // Control point 1
    size * 0.4, size * 0.3,  // Control point 2
    0, size * 0.5             // Bottom point
  );
  ctx.bezierCurveTo(
    -size * 0.4, size * 0.3,  // Control point 1
    -size * 0.3, -size * 0.2, // Control point 2
    0, -size * 0.5            // Back to top
  );
  
  ctx.closePath();
  ctx.fill();
}

/**
 * Veined leaf (with visible veins)
 */
function drawVeinedLeaf(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string
): void {
  // Draw leaf base
  drawSimpleLeaf(ctx, size, color);
  
  // Draw veins
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  
  // Main vein (center)
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(0, size * 0.5);
  ctx.stroke();
  
  // Side veins (3-4 on each side)
  const veinCount = 3;
  for (let i = 0; i < veinCount; i++) {
    const t = (i + 1) / (veinCount + 1);
    const y = -size * 0.5 + size * t;
    
    // Left vein
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(-size * 0.3, y + size * 0.1);
    ctx.stroke();
    
    // Right vein
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size * 0.3, y + size * 0.1);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

/**
 * Organic leaf (irregular, natural shape)
 */
function drawOrganicLeaf(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();

  // More irregular shape using multiple Bezier curves
  const points = 8;
  const baseAngle = (Math.PI * 2) / points;

  ctx.moveTo(0, -size * 0.5);

  for (let i = 0; i <= points; i++) {
    const angle = baseAngle * i - Math.PI / 2;
    const radius = size * 0.5 * (1 + Math.sin(i * 0.7) * 0.2); // Irregular radius
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      // Use quadratic curves for smoother organic feel
      const prevAngle = baseAngle * (i - 1) - Math.PI / 2;
      const prevRadius = size * 0.5 * (1 + Math.sin((i - 1) * 0.7) * 0.2);
      const prevX = Math.cos(prevAngle) * prevRadius;
      const prevY = Math.sin(prevAngle) * prevRadius;

      const cpX = (prevX + px) / 2 + Math.sin(i) * size * 0.1;
      const cpY = (prevY + py) / 2 + Math.cos(i) * size * 0.1;

      ctx.quadraticCurveTo(cpX, cpY, px, py);
    }
  }

  ctx.closePath();
  ctx.fill();

  // Add subtle veins
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;

  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(0, size * 0.5);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

// ============================================
// DETAILED LEAF WITH RECURSIVE VEINS
// ============================================

/**
 * Draw a detailed leaf with recursive veins and color mottling
 */
function drawDetailedLeaf(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  growthLevel: number,
  seed: number
): void {
  const perm = getOrCreatePermutation(seed);
  const rgb = hexToRgb(color);

  // Draw leaf base with per-vertex noise for organic edge
  ctx.beginPath();

  const segments = 24;
  const halfSegments = segments / 2;

  // Generate points for left and right sides of leaf
  const leftPoints: Array<{ x: number; y: number }> = [];
  const rightPoints: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= halfSegments; i++) {
    const t = i / halfSegments;
    // Base leaf shape (wider in middle, tapered at ends)
    const widthFactor = Math.sin(t * Math.PI) * 0.4;
    const baseX = widthFactor * size;
    const baseY = -size * 0.5 + t * size;

    // Add organic variation using noise
    const noiseX = simplex2D(seed + i * 10, 0, perm) * size * 0.08;
    const noiseY = simplex2D(seed + i * 10, 100, perm) * size * 0.03;

    leftPoints.push({ x: -baseX + noiseX, y: baseY + noiseY });
    rightPoints.push({ x: baseX - noiseX, y: baseY + noiseY });
  }

  // Draw the leaf outline
  ctx.moveTo(0, -size * 0.5);

  // Right side (top to bottom)
  for (let i = 0; i < rightPoints.length - 1; i++) {
    const p1 = rightPoints[i];
    const p2 = rightPoints[i + 1];
    const cpx = (p1.x + p2.x) / 2 + simplex2D(seed + i * 20, 200, perm) * size * 0.05;
    const cpy = (p1.y + p2.y) / 2;
    ctx.quadraticCurveTo(p1.x, p1.y, cpx, cpy);
  }
  ctx.lineTo(0, size * 0.5); // Bottom tip

  // Left side (bottom to top)
  for (let i = leftPoints.length - 1; i > 0; i--) {
    const p1 = leftPoints[i];
    const p2 = leftPoints[i - 1];
    const cpx = (p1.x + p2.x) / 2 - simplex2D(seed + i * 20, 300, perm) * size * 0.05;
    const cpy = (p1.y + p2.y) / 2;
    ctx.quadraticCurveTo(p1.x, p1.y, cpx, cpy);
  }

  ctx.closePath();

  // Apply mottled color fill using gradient or solid base
  // For performance, we use a base color with subtle mottling
  ctx.fillStyle = color;
  ctx.fill();

  // Draw mottling overlay if growth level allows
  if (growthLevel > 0.3) {
    drawLeafMottling(ctx, size, rgb, perm, seed, growthLevel);
  }

  // Draw recursive veins if growth level allows
  if (growthLevel > 0.2) {
    drawRecursiveVeins(ctx, size, color, perm, seed, growthLevel);
  }
}

/**
 * Draw color mottling on leaf surface
 */
function drawLeafMottling(
  ctx: CanvasRenderingContext2D,
  size: number,
  baseRgb: { r: number; g: number; b: number },
  perm: number[],
  seed: number,
  growthLevel: number
): void {
  const mottleIntensity = (growthLevel - 0.3) * 1.4;
  const spotCount = Math.floor(mottleIntensity * 8);

  ctx.save();

  for (let i = 0; i < spotCount; i++) {
    const spotX = simplex2D(seed + i * 50, 0, perm) * size * 0.35;
    const spotY = simplex2D(seed + i * 50, 50, perm) * size * 0.4;
    const spotSize = 3 + simplex2D(seed + i * 50, 100, perm) * 4;

    // Vary color slightly (darker or lighter)
    const colorShift = simplex2D(seed + i * 50, 150, perm) * 20;
    const spotColor = `rgba(${Math.max(0, baseRgb.r + colorShift)}, ${Math.max(0, baseRgb.g + colorShift)}, ${Math.max(0, baseRgb.b + colorShift)}, 0.3)`;

    ctx.fillStyle = spotColor;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, spotSize, spotSize * 0.7, simplex2D(seed + i, 0, perm), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw recursive veins with branching
 */
function drawRecursiveVeins(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  perm: number[],
  seed: number,
  growthLevel: number
): void {
  const veinColor = darkenColor(color, 0.7);
  const veinIntensity = Math.min(1, growthLevel * 1.2);

  ctx.save();
  ctx.strokeStyle = veinColor;
  ctx.lineCap = 'round';

  // Main vein (center spine)
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5 * veinIntensity;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.45);
  ctx.bezierCurveTo(
    simplex2D(seed, 0, perm) * 2, 0,
    simplex2D(seed + 100, 0, perm) * 2, size * 0.3,
    0, size * 0.45
  );
  ctx.stroke();

  // Secondary veins (4-6 per side) with sub-veins
  const secondaryCount = Math.floor(4 + veinIntensity * 2);

  for (let i = 0; i < secondaryCount; i++) {
    const t = (i + 1) / (secondaryCount + 1);
    const y = -size * 0.45 + t * size * 0.9;

    // Calculate leaf width at this y position
    const widthAtY = Math.sin(t * Math.PI) * size * 0.35;

    // Draw left and right secondary veins
    for (const side of [-1, 1]) {
      const endX = side * widthAtY * 0.85;
      const endY = y + size * 0.05;

      // Secondary vein
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4 * veinIntensity;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(
        side * widthAtY * 0.3 + simplex2D(seed + i * 20, side * 100, perm) * 3,
        y + size * 0.02,
        endX,
        endY
      );
      ctx.stroke();

      // Tertiary veins (sub-veins) if growth level high enough
      if (growthLevel > 0.5) {
        const tertiaryCount = 2 + Math.floor((growthLevel - 0.5) * 4);
        for (let j = 0; j < tertiaryCount; j++) {
          const tt = (j + 1) / (tertiaryCount + 1);
          const subStartX = side * widthAtY * 0.3 * tt;
          const subStartY = y + size * 0.02 * tt;
          const subEndX = subStartX + side * widthAtY * 0.2;
          const subEndY = subStartY + size * 0.03;

          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 0.3 * veinIntensity;
          ctx.beginPath();
          ctx.moveTo(subStartX, subStartY);
          ctx.lineTo(subEndX, subEndY);
          ctx.stroke();
        }
      }
    }
  }

  ctx.restore();
}

// ============================================
// FLOWER RENDERING
// ============================================

/**
 * Draw a flower with organic petals
 */
export function drawFlower(
  ctx: CanvasRenderingContext2D,
  options: FlowerOptions
): void {
  const {
    x,
    y,
    petalCount = 5,
    petalLength = 15,
    color = '#e8a0b0',
    centerColor = '#f5d76e',
    growthStage = 1,
    rotation = 0,
    seed = 0,
  } = options;

  const perm = getOrCreatePermutation(seed);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Calculate petal opening based on growth stage
  // 0 = bud (petals closed), 1 = fully open
  const openAngle = growthStage * Math.PI * 0.4; // Max 72 degrees from center

  // Draw petals
  const actualPetalCount = Math.max(4, Math.min(8, petalCount));
  const angleStep = (Math.PI * 2) / actualPetalCount;

  for (let i = 0; i < actualPetalCount; i++) {
    const petalAngle = angleStep * i - Math.PI / 2; // Start from top
    const petalSeed = seed + i * 100;

    // Slight variation per petal
    const lengthVar = 1 + simplex2D(petalSeed, 0, perm) * 0.15;
    const widthVar = 1 + simplex2D(petalSeed, 50, perm) * 0.1;
    const colorVar = simplex2D(petalSeed, 100, perm) * 15;

    // Calculate petal base position (moves outward as flower opens)
    const baseOffset = (1 - growthStage) * petalLength * 0.3;

    ctx.save();
    ctx.rotate(petalAngle);

    // Petal color with variation
    const rgb = hexToRgb(color);
    const petalColor = rgbToHex(
      Math.min(255, Math.max(0, rgb.r + colorVar)),
      Math.min(255, Math.max(0, rgb.g + colorVar)),
      Math.min(255, Math.max(0, rgb.b + colorVar))
    );

    drawSinglePetal(
      ctx,
      baseOffset,
      petalLength * lengthVar * growthStage,
      petalLength * 0.35 * widthVar,
      openAngle,
      petalColor,
      perm,
      petalSeed
    );

    ctx.restore();
  }

  // Draw center disk
  if (growthStage > 0.3) {
    const centerSize = petalLength * 0.25 * Math.min(1, (growthStage - 0.3) * 1.5);
    drawFlowerCenter(ctx, centerSize, centerColor, perm, seed);
  }

  ctx.restore();
}

/**
 * Draw a single organic petal
 */
function drawSinglePetal(
  ctx: CanvasRenderingContext2D,
  baseOffset: number,
  length: number,
  width: number,
  openAngle: number,
  color: string,
  perm: number[],
  seed: number
): void {
  ctx.save();
  ctx.translate(0, -baseOffset);
  ctx.rotate(-openAngle * 0.3); // Tilt petal outward as it opens

  ctx.fillStyle = color;
  ctx.beginPath();

  // Petal shape using Bezier curves (organic, not perfect ellipse)
  ctx.moveTo(0, 0);

  // Right side
  ctx.bezierCurveTo(
    width * 0.8 + simplex2D(seed, 0, perm) * width * 0.2,
    -length * 0.3,
    width * 0.6 + simplex2D(seed, 50, perm) * width * 0.2,
    -length * 0.7,
    simplex2D(seed, 100, perm) * width * 0.1,
    -length
  );

  // Left side (back to base)
  ctx.bezierCurveTo(
    -width * 0.6 - simplex2D(seed, 150, perm) * width * 0.2,
    -length * 0.7,
    -width * 0.8 - simplex2D(seed, 200, perm) * width * 0.2,
    -length * 0.3,
    0,
    0
  );

  ctx.closePath();
  ctx.fill();

  // Subtle vein on petal
  ctx.strokeStyle = darkenColor(color, 0.85);
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    simplex2D(seed + 300, 0, perm) * width * 0.2,
    -length * 0.5,
    0,
    -length * 0.85
  );
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw flower center disk with FBM texture
 */
function drawFlowerCenter(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  perm: number[],
  seed: number
): void {
  const rgb = hexToRgb(color);

  // Base circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  // Add textured dots (stamens/pistils)
  const dotCount = Math.floor(size * 2);
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const radiusNoise = simplex2D(seed + i * 10, 0, perm);
    const radius = size * (0.3 + radiusNoise * 0.5);
    const dotX = Math.cos(angle) * radius;
    const dotY = Math.sin(angle) * radius;
    const dotSize = 1 + simplex2D(seed + i * 10, 100, perm) * 1;

    // Vary color
    const colorShift = simplex2D(seed + i * 10, 200, perm) * 30;
    ctx.fillStyle = rgbToHex(
      Math.max(0, Math.min(255, rgb.r - colorShift)),
      Math.max(0, Math.min(255, rgb.g - colorShift)),
      Math.max(0, Math.min(255, rgb.b - colorShift))
    );

    ctx.beginPath();
    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================
// COLOR UTILITIES
// ============================================

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 61, g: 106, b: 77 }; // Default green
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Darken a hex color by a factor (0-1)
 */
function darkenColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  );
}
