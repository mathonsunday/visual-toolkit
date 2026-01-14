/**
 * LIVING OS THEME - Growth Patterns v2
 *
 * Organic growth patterns: roots, vines, and growth indicators.
 * Uses recursive Bezier curves with natural branching for premium organic feel.
 * Inspired by Deep Sea theme quality standards.
 */

import { addAlphaToColor } from './colors.js';
import { simplex2D, fbm, getOrCreatePermutation } from './textures.js';

export interface GrowthOptions {
  origin: { x: number; y: number };
  direction?: 'down' | 'left' | 'right' | 'up';
  length: number; // 0-1, current growth progress
  branches?: number; // Number of branch points
  thickness?: number; // Base thickness
  color?: string; // Stroke color
  time?: number; // Animation time
  seed?: number; // Random seed for variation
}

export interface GrowthIndicatorOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  growthLevel: number; // 0-1
  style?: 'vines' | 'roots' | 'leaves' | 'bark';
  color?: string;
}

/**
 * Enhanced vine rendering options for organic, recursive branching
 */
export interface OrganicVineOptions {
  origin: { x: number; y: number };
  target?: { x: number; y: number }; // Optional growth target for "reaching" behavior
  length: number; // Total length in pixels
  branchingDepth?: number; // 0-3, max recursion depth (default: 2)
  organicVariation?: number; // 0-1, how much organic wobble (default: 0.5)
  hasLeaves?: boolean; // Add leaves at intervals
  hasTendrils?: boolean; // Curly tips at branch ends
  growthLevel?: number; // 0-1, affects complexity and detail
  thickness?: number; // Base thickness (default: 4)
  color?: string; // Main vine color
  leafColor?: string; // Leaf color (default: derived from vine color)
  time?: number; // For animation (sway, pulsing)
  seed?: number; // Random seed for deterministic variation
}

/**
 * Draw growing roots that extend from an origin point
 */
export function drawGrowingRoots(
  ctx: CanvasRenderingContext2D,
  options: GrowthOptions
): void {
  const {
    origin,
    direction = 'down',
    length,
    branches = 2,
    thickness = 3,
    color = '#3d2817',
    time = 0,
    seed = 0,
  } = options;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Direction vector
  const dirVec = {
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
  }[direction];
  
  // Main root path using Bezier curve for organic feel
  const mainLength = length * 150; // Max length
  const controlOffset = 30 + (seed % 20); // Organic curve
  
  const endX = origin.x + dirVec.x * mainLength;
  const endY = origin.y + dirVec.y * mainLength;
  
  // Control points for Bezier curve (creates organic curve)
  const cp1x = origin.x + dirVec.x * (mainLength * 0.3) + (seed % 15 - 7);
  const cp1y = origin.y + dirVec.y * (mainLength * 0.3) + (seed % 15 - 7);
  const cp2x = origin.x + dirVec.x * (mainLength * 0.7) + (seed % 10 - 5);
  const cp2y = origin.y + dirVec.y * (mainLength * 0.7) + (seed % 10 - 5);
  
  // Draw main root with tapering
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  
  // Tapering: thicker at base, thinner at tip
  const gradient = ctx.createLinearGradient(origin.x, origin.y, endX, endY);
  gradient.addColorStop(0, color);
  // Use proper rgba format for transparency (works with hex, rgb, rgba)
  const transparentColor = addAlphaToColor(color, 0);
  gradient.addColorStop(1, transparentColor);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = thickness * (1 - length * 0.3); // Taper
  ctx.stroke();
  
  // Draw branches
  for (let i = 0; i < branches; i++) {
    const branchT = (i + 1) / (branches + 1); // Position along root
    const branchX = getBezierPoint(origin.x, cp1x, cp2x, endX, branchT);
    const branchY = getBezierPoint(origin.y, cp1y, cp2y, endY, branchT);
    
    // Branch direction (perpendicular + random)
    const perpX = -dirVec.y;
    const perpY = dirVec.x;
    const branchAngle = (seed + i * 100) % 60 - 30; // -30 to 30 degrees
    const rad = (branchAngle * Math.PI) / 180;
    
    const branchDirX = perpX * Math.cos(rad) - perpY * Math.sin(rad);
    const branchDirY = perpX * Math.sin(rad) + perpY * Math.cos(rad);
    
    const branchLength = length * 40 * (0.5 + (seed % 50) / 100);
    const branchEndX = branchX + branchDirX * branchLength;
    const branchEndY = branchY + branchDirY * branchLength;
    
    ctx.beginPath();
    ctx.moveTo(branchX, branchY);
    ctx.lineTo(branchEndX, branchEndY);
    ctx.lineWidth = thickness * 0.5 * (1 - branchT);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Draw vines that creep across surfaces
 */
export function drawVines(
  ctx: CanvasRenderingContext2D,
  options: GrowthOptions & { path?: { x: number; y: number }[] }
): void {
  const {
    origin,
    length,
    thickness = 2,
    color = '#2d5a3d',
    path,
  } = options;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = thickness;
  
  if (path && path.length > 1) {
    // Validate and filter path: ensure all elements are valid objects with x and y
    const validPath = path.filter(
      (p): p is { x: number; y: number } =>
        p != null &&
        typeof p === 'object' &&
        typeof (p as any).x === 'number' &&
        typeof (p as any).y === 'number' &&
        !isNaN((p as any).x) &&
        !isNaN((p as any).y)
    );
    
    // If we don't have enough valid points, fall back to generated path
    if (validPath.length < 2) {
      console.warn(
        `drawVines: Path array has insufficient valid points (${validPath.length} valid out of ${path.length} total). ` +
        `Falling back to generated path.`
      );
      // Fall through to generated path code below
    } else {
      // Use provided path
      ctx.beginPath();
      ctx.moveTo(validPath[0].x, validPath[0].y);
      
      for (let i = 1; i < validPath.length; i++) {
        const p1 = validPath[i - 1];
        const p2 = validPath[i];
        
        // Use Bezier curves between points for smooth, organic feel
        if (i < validPath.length - 1) {
          const p3 = validPath[i + 1]; // Guaranteed to exist since i < length - 1
          const cp1x = p1.x + (p2.x - p1.x) * 0.5;
          const cp1y = p1.y + (p2.y - p1.y) * 0.5;
          const cp2x = p2.x + (p3.x - p2.x) * 0.3;
          const cp2y = p2.y + (p3.y - p2.y) * 0.3;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        } else {
          ctx.lineTo(p2.x, p2.y);
        }
      }
      
      ctx.stroke();
      ctx.restore();
      return; // Early return after drawing valid path
    }
  }
  
  // Generate simple vine path (fallback or when no path provided)
  {
    // Generate simple vine path
    const segments = Math.floor(length * 20);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    
    let currentX = origin.x;
    let currentY = origin.y;
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const angle = Math.sin(t * Math.PI * 3) * 0.3; // Organic wave
      const dx = Math.cos(angle) * 10;
      const dy = Math.sin(angle) * 10 + 5; // Downward drift
      
      currentX += dx;
      currentY += dy;
      
      ctx.lineTo(currentX, currentY);
    }
    
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Draw growth indicator (visual representation of growth level)
 */
export function drawGrowthIndicator(
  ctx: CanvasRenderingContext2D,
  options: GrowthIndicatorOptions
): void {
  const {
    x,
    y,
    width,
    height,
    growthLevel,
    style = 'vines',
    color = '#5a7a4d',
  } = options;
  
  ctx.save();
  
  const level = Math.max(0, Math.min(1, growthLevel));
  const filledHeight = height * level;
  
  switch (style) {
    case 'vines':
      // Vines growing upward
      const vineCount = Math.floor(width / 15);
      for (let i = 0; i < vineCount; i++) {
        const vineX = x + (i * width) / vineCount + 5;
        drawVines(ctx, {
          origin: { x: vineX, y: y + height },
          length: level,
          thickness: 2,
          color,
          direction: 'up',
        });
      }
      break;
      
    case 'roots':
      // Roots extending downward
      const rootCount = Math.floor(width / 20);
      for (let i = 0; i < rootCount; i++) {
        const rootX = x + (i * width) / rootCount + 10;
        drawGrowingRoots(ctx, {
          origin: { x: rootX, y: y },
          length: level,
          thickness: 2,
          color,
          direction: 'down',
          branches: 1,
          seed: i * 100,
        });
      }
      break;
      
    case 'leaves':
      // Leaves appearing
      const leafCount = Math.floor(level * 10);
      for (let i = 0; i < leafCount; i++) {
        const leafX = x + (Math.random() * width);
        const leafY = y + height - (Math.random() * filledHeight);
        // drawLeaf will be implemented in plants.ts
        // For now, simple circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(leafX, leafY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'bark':
      // Bark texture filling
      ctx.fillStyle = color;
      ctx.fillRect(x, y + height - filledHeight, width, filledHeight);
      // Add bark texture (will use texture function)
      break;
  }
  
  ctx.restore();
}

/**
 * Helper: Get point on Bezier curve at t (0-1)
 */
function getBezierPoint(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

// ============================================
// ORGANIC VINE RENDERING SYSTEM
// ============================================

/**
 * Internal state for tracking branch points during rendering
 */
interface BranchPoint {
  x: number;
  y: number;
  angle: number;
  thickness: number;
  progress: number; // 0-1, position along parent vine
}

/**
 * Draw an organic vine with recursive branching
 *
 * Uses chained Bezier curves with noise-driven control points
 * for natural, non-geometric curves. Supports recursive branching,
 * tendrils at tips, and leaf placement.
 */
export function drawOrganicVine(
  ctx: CanvasRenderingContext2D,
  options: OrganicVineOptions
): void {
  const {
    origin,
    target,
    length,
    branchingDepth = 2,
    organicVariation = 0.5,
    hasLeaves = false,
    hasTendrils = false,
    growthLevel = 1,
    thickness = 4,
    color = '#2d5a3d',
    leafColor,
    time = 0,
    seed = 0,
  } = options;

  // Normalize color early to catch any format issues
  const normalizedColor = normalizeColor(color);

  const perm = getOrCreatePermutation(seed);
  const actualLeafColor = leafColor || lightenColor(normalizedColor, 0.15);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = normalizedColor;  // Set default stroke color (normalized)
  ctx.fillStyle = actualLeafColor;  // Set fill color for leaves

  // Calculate initial angle (toward target if provided, otherwise random)
  let initialAngle: number;
  if (target) {
    initialAngle = Math.atan2(target.y - origin.y, target.x - origin.x);
  } else {
    initialAngle = simplex2D(seed, 0, perm) * Math.PI * 2;
  }

  // Collect branch points for later recursive drawing
  const branchPoints: BranchPoint[] = [];
  const leafPositions: Array<{ x: number; y: number; angle: number; size: number }> = [];

  // Draw main vine stem
  drawVineBranch(
    ctx,
    origin.x,
    origin.y,
    initialAngle,
    thickness,
    length * growthLevel,
    0, // depth 0 = main stem
    branchingDepth,
    organicVariation,
    perm,
    seed,
    time,
    normalizedColor,
    target,
    branchPoints,
    leafPositions,
    hasLeaves,
    hasTendrils
  );

  // Recursively draw collected branch points
  for (const bp of branchPoints) {
    if (bp.thickness >= 1.5) {
      drawVineBranch(
        ctx,
        bp.x,
        bp.y,
        bp.angle,
        bp.thickness,
        length * growthLevel * (1 - bp.progress) * 0.6,
        1, // depth 1 = first-level branch
        branchingDepth,
        organicVariation,
        perm,
        seed + bp.progress * 1000,
        time,
        normalizedColor,
        undefined, // branches don't have targets
        [], // sub-branches collected separately
        leafPositions,
        hasLeaves,
        hasTendrils
      );
    }
  }

  // Draw leaves at collected positions
  if (hasLeaves && leafPositions.length > 0) {
    for (const leaf of leafPositions) {
      drawSimpleLeaf(ctx, leaf.x, leaf.y, leaf.angle, leaf.size, actualLeafColor);
    }
  }

  ctx.restore();
}

/**
 * Internal: Draw a single vine branch with organic Bezier curves
 */
function drawVineBranch(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  startAngle: number,
  startThickness: number,
  totalLength: number,
  currentDepth: number,
  maxDepth: number,
  variation: number,
  perm: number[],
  seed: number,
  time: number,
  color: string,
  target: { x: number; y: number } | undefined,
  branchPoints: BranchPoint[],
  leafPositions: Array<{ x: number; y: number; angle: number; size: number }>,
  hasLeaves: boolean,
  hasTendrils: boolean
): void {
  if (totalLength < 5 || startThickness < 0.5) return;

  const segmentCount = Math.max(4, Math.floor(totalLength / 15));
  const segmentLength = totalLength / segmentCount;

  let currentX = startX;
  let currentY = startY;
  let currentAngle = startAngle;
  let currentThickness = startThickness;

  // Sway animation offset
  const swayOffset = Math.sin(time * 0.0015 + seed) * 0.03 * variation;

  for (let i = 0; i < segmentCount; i++) {
    const progress = i / segmentCount;
    const segmentSeed = seed + i * 100 + currentDepth * 10000;

    // Organic angle variation using noise
    const angleNoise = simplex2D(segmentSeed, currentDepth * 50, perm) * 0.4 * variation;
    const targetInfluence = target
      ? Math.atan2(target.y - currentY, target.x - currentX) * 0.1
      : 0;

    currentAngle += angleNoise + targetInfluence + swayOffset;

    // Thickness tapering with occasional bulges
    const bulgeNoise = simplex2D(segmentSeed + 500, seed, perm);
    const taper = 0.94 + (bulgeNoise > 0.6 ? 0.08 : 0);
    currentThickness *= taper;
    currentThickness = Math.max(0.5, currentThickness);

    // Calculate end point of this segment
    const endX = currentX + Math.cos(currentAngle) * segmentLength;
    const endY = currentY + Math.sin(currentAngle) * segmentLength;

    // Organic control points for Bezier curve
    const cpOffset1 = segmentLength * 0.3 * (1 + simplex2D(segmentSeed + 200, 0, perm) * variation * 0.5);
    const cpOffset2 = segmentLength * 0.3 * (1 + simplex2D(segmentSeed + 300, 0, perm) * variation * 0.5);
    const cpAngle1 = currentAngle + simplex2D(segmentSeed + 400, 0, perm) * 0.2 * variation;
    const cpAngle2 = currentAngle - simplex2D(segmentSeed + 450, 0, perm) * 0.2 * variation;

    const cp1x = currentX + Math.cos(cpAngle1) * cpOffset1;
    const cp1y = currentY + Math.sin(cpAngle1) * cpOffset1;
    const cp2x = endX - Math.cos(cpAngle2) * cpOffset2;
    const cp2y = endY - Math.sin(cpAngle2) * cpOffset2;

    // Draw the segment with gradient for tapering effect
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

    // Color darkening toward tips
    const darkenFactor = 1 - progress * 0.2;
    ctx.strokeStyle = darkenColor(color, darkenFactor);
    ctx.lineWidth = currentThickness;
    ctx.stroke();

    // Determine if we should branch here
    if (
      currentDepth < maxDepth &&
      i > 1 &&
      i < segmentCount - 1 &&
      simplex2D(segmentSeed + 600, currentDepth, perm) > 0.6 - currentDepth * 0.1
    ) {
      // Golden angle offset for natural branching
      const branchSide = simplex2D(segmentSeed + 700, 0, perm) > 0 ? 1 : -1;
      const branchAngle = currentAngle + branchSide * (0.4 + simplex2D(segmentSeed + 800, 0, perm) * 0.4);

      branchPoints.push({
        x: currentX,
        y: currentY,
        angle: branchAngle,
        thickness: currentThickness * 0.55,
        progress,
      });
    }

    // Place leaves periodically
    if (hasLeaves && i > 0 && i % 3 === 0 && currentThickness > 1) {
      const leafSide = simplex2D(segmentSeed + 900, 0, perm) > 0 ? 1 : -1;
      const leafAngle = currentAngle + leafSide * Math.PI * 0.4;
      const leafSize = 6 + simplex2D(segmentSeed + 950, 0, perm) * 4;

      leafPositions.push({
        x: currentX,
        y: currentY,
        angle: leafAngle,
        size: leafSize * (1 - progress * 0.3),
      });
    }

    currentX = endX;
    currentY = endY;
  }

  // Draw tendril at tip if enabled and at sufficient depth
  if (hasTendrils && currentThickness < startThickness * 0.5) {
    drawTendril(ctx, currentX, currentY, currentAngle, currentThickness, perm, seed, color);
  }
}

/**
 * Draw a curly tendril at vine tip
 */
function drawTendril(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  thickness: number,
  perm: number[],
  seed: number,
  color: string
): void {
  const rotations = 2 + simplex2D(seed, 100, perm) * 1.5;
  const totalAngle = rotations * Math.PI * 2;
  const spiralLength = 15 + simplex2D(seed + 200, 0, perm) * 10;
  const direction = simplex2D(seed + 300, 0, perm) > 0 ? 1 : -1;

  ctx.beginPath();
  ctx.moveTo(x, y);

  let currentX = x;
  let currentY = y;
  let currentRadius = spiralLength / (rotations * Math.PI * 2);

  const steps = 30;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const spiralAngle = angle + direction * t * totalAngle;
    const radius = currentRadius * (1 - t * 0.7);

    currentX = x + Math.cos(spiralAngle) * radius * t * spiralLength * 0.5;
    currentY = y + Math.sin(spiralAngle) * radius * t * spiralLength * 0.5;

    ctx.lineTo(currentX, currentY);
  }

  ctx.strokeStyle = darkenColor(color, 0.85);
  ctx.lineWidth = Math.max(0.5, thickness * 0.4);
  ctx.stroke();
}

/**
 * Draw a simple leaf shape
 */
function drawSimpleLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Leaf shape using quadratic curves
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.5, -size * 0.4, size, 0);
  ctx.quadraticCurveTo(size * 0.5, size * 0.4, 0, 0);

  ctx.fillStyle = color;
  ctx.fill();

  // Simple center vein
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.8, 0);
  ctx.strokeStyle = darkenColor(color, 0.7);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

// ============================================
// ENHANCED ROOT SYSTEM
// ============================================

/**
 * Options for enhanced organic root rendering
 */
export interface OrganicRootOptions {
  origin: { x: number; y: number };
  mainRootCount?: number; // 3-5 main roots (default: 4)
  maxDepth?: number; // Recursion depth (default: 3)
  length: number; // Total spread in pixels
  growthLevel?: number; // 0-1, affects complexity
  thickness?: number; // Base thickness
  color?: string;
  surfaceY?: number; // Y coordinate of surface (for breaking through)
  time?: number;
  seed?: number;
}

/**
 * Draw an enhanced root system with multiple main roots and recursive branching
 */
export function drawOrganicRoots(
  ctx: CanvasRenderingContext2D,
  options: OrganicRootOptions
): void {
  const {
    origin,
    mainRootCount = 4,
    maxDepth = 3,
    length,
    growthLevel = 1,
    thickness = 5,
    color = '#3d2817',
    surfaceY,
    time = 0,
    seed = 0,
  } = options;

  const perm = getOrCreatePermutation(seed);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Generate main root directions (radial distribution, biased downward)
  const rootCount = Math.max(2, Math.min(6, mainRootCount));

  for (let r = 0; r < rootCount; r++) {
    const rootSeed = seed + r * 10000;

    // Angle biased downward (between 0.2π and 0.8π, roughly)
    const baseAngle = Math.PI * 0.5; // Down
    const spread = Math.PI * 0.6; // ±0.3π spread
    const angleOffset = (r / (rootCount - 1) - 0.5) * spread;
    const noiseOffset = simplex2D(rootSeed, 0, perm) * 0.2;
    const rootAngle = baseAngle + angleOffset + noiseOffset;

    // Root length varies
    const rootLength = length * (0.7 + simplex2D(rootSeed + 100, 0, perm) * 0.5) * growthLevel;
    const rootThickness = thickness * (0.8 + simplex2D(rootSeed + 200, 0, perm) * 0.4);

    drawRootBranch(
      ctx,
      origin.x,
      origin.y,
      rootAngle,
      rootThickness,
      rootLength,
      0,
      maxDepth,
      perm,
      rootSeed,
      time,
      color,
      surfaceY
    );
  }

  ctx.restore();
}

/**
 * Internal: Draw a single root branch recursively
 */
function drawRootBranch(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  startAngle: number,
  startThickness: number,
  totalLength: number,
  currentDepth: number,
  maxDepth: number,
  perm: number[],
  seed: number,
  time: number,
  color: string,
  surfaceY?: number
): void {
  if (totalLength < 8 || startThickness < 1 || currentDepth > maxDepth) return;

  const segmentCount = Math.max(3, Math.floor(totalLength / 20));
  const segmentLength = totalLength / segmentCount;

  let currentX = startX;
  let currentY = startY;
  let currentAngle = startAngle;
  let currentThickness = startThickness;

  // Roots have more chaotic angle variation than vines
  const variation = 0.6;

  for (let i = 0; i < segmentCount; i++) {
    const progress = i / segmentCount;
    const segmentSeed = seed + i * 100 + currentDepth * 5000;

    // Chaotic angle variation (roots are messier than vines)
    const angleNoise = simplex2D(segmentSeed, currentDepth * 30, perm) * 0.6 * variation;

    // Gravity influence (roots curve downward slightly)
    const gravityPull = (currentDepth === 0 ? 0.02 : 0.01) * (currentAngle < Math.PI ? 1 : -1);

    currentAngle += angleNoise + gravityPull;

    // Thickness tapering (roots are gnarlier)
    const bulge = simplex2D(segmentSeed + 500, seed, perm) > 0.65 ? 1.12 : 0.92;
    currentThickness *= bulge;
    currentThickness = Math.max(1, Math.min(startThickness * 1.2, currentThickness));

    // Calculate end point
    const endX = currentX + Math.cos(currentAngle) * segmentLength;
    const endY = currentY + Math.sin(currentAngle) * segmentLength;

    // Draw with Bezier curves for organic feel
    const cpOffset = segmentLength * 0.35;
    const cp1Angle = currentAngle + simplex2D(segmentSeed + 200, 0, perm) * 0.3;
    const cp2Angle = currentAngle - simplex2D(segmentSeed + 250, 0, perm) * 0.3;

    const cp1x = currentX + Math.cos(cp1Angle) * cpOffset;
    const cp1y = currentY + Math.sin(cp1Angle) * cpOffset;
    const cp2x = endX - Math.cos(cp2Angle) * cpOffset;
    const cp2y = endY - Math.sin(cp2Angle) * cpOffset;

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

    // Darker color for roots
    ctx.strokeStyle = darkenColor(color, 0.85 - currentDepth * 0.05);
    ctx.lineWidth = currentThickness;
    ctx.stroke();

    // Branch points (more frequent than vines)
    if (
      currentDepth < maxDepth &&
      i > 0 &&
      simplex2D(segmentSeed + 600, currentDepth, perm) > 0.5 - currentDepth * 0.1
    ) {
      const branchSide = simplex2D(segmentSeed + 700, 0, perm) > 0 ? 1 : -1;
      const branchAngle = currentAngle + branchSide * (0.5 + simplex2D(segmentSeed + 800, 0, perm) * 0.5);

      drawRootBranch(
        ctx,
        currentX,
        currentY,
        branchAngle,
        currentThickness * 0.5,
        totalLength * (1 - progress) * 0.5,
        currentDepth + 1,
        maxDepth,
        perm,
        segmentSeed + 1000,
        time,
        color,
        surfaceY
      );
    }

    // Surface breaking effect (roots poking through)
    if (surfaceY !== undefined && currentY < surfaceY && startY >= surfaceY) {
      // Draw a small "break through" effect
      ctx.fillStyle = darkenColor(color, 0.6);
      ctx.beginPath();
      ctx.ellipse(currentX, surfaceY, currentThickness * 1.5, currentThickness * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    currentX = endX;
    currentY = endY;
  }
}

// ============================================
// COLOR UTILITIES
// ============================================

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

/**
 * Lighten a hex color by a factor (0-1)
 */
function lightenColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * factor),
    Math.round(rgb.g + (255 - rgb.g) * factor),
    Math.round(rgb.b + (255 - rgb.b) * factor)
  );
}

/**
 * Validate and normalize color string for canvas use
 */
function normalizeColor(color: string): string {
  if (!color) return '#2d5a3d'; // Default fallback

  // Already valid hex format
  if (/^#([a-f\d]{3}){1,2}$/i.test(color)) {
    return color;
  }

  // Invalid format - try to convert if it looks like RGB
  if (color.startsWith('rgb')) {
    return color; // Let canvas handle rgb() format directly
  }

  // Unrecognized format - use default
  console.warn(`Invalid color format: ${color}, using default green`);
  return '#2d5a3d';
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeColor(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 45, g: 90, b: 61 }; // Default green
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
