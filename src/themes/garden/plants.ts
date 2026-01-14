/**
 * Garden Theme Plant Elements
 *
 * Reusable leaf, petal, and vine drawing functions
 * Used to compose the layered scenes with organic plant shapes
 */

/**
 * Draw a simple leaf shape using Bezier curves
 * Used for background and layering in scenes
 */
export function drawSimpleLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = color;
  ctx.beginPath();
  // Leaf outline using quadratic Bezier curves
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.6, -size * 0.3, size * 0.5, 0);
  ctx.quadraticCurveTo(size * 0.6, size * 0.3, 0, size);
  ctx.quadraticCurveTo(-size * 0.6, size * 0.3, -size * 0.5, 0);
  ctx.quadraticCurveTo(-size * 0.6, -size * 0.3, 0, -size);
  ctx.closePath();
  ctx.fill();

  // Optional: leaf vein down the center
  ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.1, 0, 0, size);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a pointed/elongated leaf
 * For more dynamic variety in foliage
 */
export function drawPointedLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.2); // pointed tip
  ctx.quadraticCurveTo(size * 0.5, -size * 0.4, size * 0.6, size * 0.3);
  ctx.quadraticCurveTo(size * 0.3, size * 0.8, 0, size);
  ctx.quadraticCurveTo(-size * 0.3, size * 0.8, -size * 0.6, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.5, -size * 0.4, 0, -size * 1.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a cluster of overlapping leaves
 * Creates dense foliage appearance
 */
export function drawLeafCluster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  leafCount: number = 5,
  size: number = 8,
  color: string = '#6b8f67',
  density: number = 1.0
): void {
  ctx.save();

  for (let i = 0; i < leafCount; i++) {
    // Slight offset and rotation for each leaf in cluster
    const offsetX = (Math.random() - 0.5) * size * density;
    const offsetY = (Math.random() - 0.5) * size * density;
    const rotation = (i / leafCount) * Math.PI * 2;
    const opacity = 0.6 + Math.random() * 0.4;

    ctx.globalAlpha = opacity;

    if (i % 2 === 0) {
      drawSimpleLeaf(ctx, x + offsetX, y + offsetY, size * 0.7, color, rotation);
    } else {
      drawPointedLeaf(ctx, x + offsetX, y + offsetY, size * 0.6, color, rotation);
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw a petal shape
 * Used for scattered accent elements
 */
export function drawPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  rotation: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = color;
  ctx.beginPath();
  // Petal shape - rounded ellipse
  ctx.ellipse(0, 0, width * 0.5, height, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a vine segment with natural wobble
 * Used for Overgrown scene
 */
export function drawVineSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  color: string,
  wobbleAmount: number = 0.1
): void {
  ctx.save();

  // Create wobbling path using Bezier curve
  const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * wobbleAmount * 20;
  const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * wobbleAmount * 20;

  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw organic vine with branching
 * Creates natural-looking plant growth
 */
export function drawOrganicVine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  angle: number,
  thickness: number,
  color: string,
  depth: number = 0,
  maxDepth: number = 3
): void {
  if (depth > maxDepth || thickness < 0.5) return;

  // End point of this segment
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;

  // Draw vine segment
  drawVineSegment(ctx, x, y, endX, endY, thickness, color, 0.08);

  // Recursive branching
  if (depth < maxDepth) {
    const branchLength = length * 0.7;
    const branchThickness = thickness * 0.75;

    // Left branch
    const leftAngle = angle - 0.4 + (Math.random() - 0.5) * 0.2;
    drawOrganicVine(
      ctx,
      endX,
      endY,
      branchLength,
      leftAngle,
      branchThickness,
      color,
      depth + 1,
      maxDepth
    );

    // Right branch
    const rightAngle = angle + 0.4 + (Math.random() - 0.5) * 0.2;
    drawOrganicVine(
      ctx,
      endX,
      endY,
      branchLength,
      rightAngle,
      branchThickness,
      color,
      depth + 1,
      maxDepth
    );
  }
}

/**
 * Draw a flower composed of petals
 * Optional accent element for scenes
 */
export function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  petalCount: number = 5,
  petalSize: number = 6,
  color: string = '#a8c69f',
  centerColor: string = '#f5e5b8'
): void {
  ctx.save();

  // Draw petals
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalX = x + Math.cos(angle) * petalSize * 0.8;
    const petalY = y + Math.sin(angle) * petalSize * 0.8;

    drawPetal(ctx, petalX, petalY, petalSize * 0.6, petalSize, color, angle);
  }

  // Draw center
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(x, y, petalSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw multiple scattered flowers
 * Creates focal interest points
 */
export function drawFlowerCluster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number = 3,
  spread: number = 30
): void {
  for (let i = 0; i < count; i++) {
    const offsetX = (Math.random() - 0.5) * spread;
    const offsetY = (Math.random() - 0.5) * spread;
    const petalCount = 4 + Math.floor(Math.random() * 3);

    drawFlower(ctx, x + offsetX, y + offsetY, petalCount, 4 + Math.random() * 2);
  }
}

/**
 * Draw blurred background plant (for depth)
 * Used in Terrarium and Garden Window scenes
 */
export function drawBlurredPlant(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  blur: number = 4
): void {
  ctx.save();

  // Apply blur effect
  ctx.filter = `blur(${blur}px)`;
  ctx.globalAlpha = 0.4;

  // Draw multiple overlapping leaf shapes to create plant silhouette
  drawLeafCluster(ctx, x, y, 8, size, color, 1.5);

  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw plant silhouette (sharp foreground element)
 * Used for clear foreground layers
 */
export function drawPlantSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  color: string,
  leafCount: number = 6
): void {
  ctx.save();
  ctx.fillStyle = color;

  // Draw stem
  ctx.fillRect(x - 1, y, 2, height);

  // Draw leaves along stem
  for (let i = 0; i < leafCount; i++) {
    const leafY = y + (height / leafCount) * i;
    const leafSize = 4 + (leafCount - i) * 0.5;

    // Alternating left/right
    if (i % 2 === 0) {
      drawSimpleLeaf(ctx, x - leafSize * 0.8, leafY, leafSize, color, -0.3);
    } else {
      drawSimpleLeaf(ctx, x + leafSize * 0.8, leafY, leafSize, color, 0.3);
    }
  }

  ctx.restore();
}
