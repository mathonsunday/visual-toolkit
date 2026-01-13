/**
 * LIVING OS THEME - Plant Elements
 * 
 * Leaf shapes and plant elements with organic forms.
 */

export interface LeafOptions {
  x: number;
  y: number;
  size?: number;
  rotation?: number;
  type?: 'simple' | 'veined' | 'organic';
  color?: string;
  opacity?: number;
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
