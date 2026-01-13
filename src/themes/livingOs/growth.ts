/**
 * LIVING OS THEME - Growth Patterns
 * 
 * Organic growth patterns: roots, vines, and growth indicators.
 * All patterns use Bezier curves and organic branching for natural feel.
 */

import { addAlphaToColor } from './colors.js';

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
