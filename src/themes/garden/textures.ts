/**
 * Garden Theme Texture Effects
 *
 * Glass overlays, depth fog, and other atmospheric effects
 */

/**
 * Draw frosted glass texture effect
 * Creates barrier/distance feeling for Garden Through Glass scene
 */
export function drawFrostedGlassOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.15
): void {
  ctx.save();

  // Base frosted tint
  ctx.fillStyle = `rgba(245, 248, 250, ${intensity * 0.3})`;
  ctx.fillRect(0, 0, width, height);

  // Add subtle noise pattern
  for (let i = 0; i < width; i += 8) {
    for (let j = 0; j < height; j += 8) {
      const opacity = Math.random() * intensity * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(i, j, Math.random() * 4 + 2, Math.random() * 4 + 2);
    }
  }

  ctx.restore();
}

/**
 * Draw smudges and condensation marks on glass
 * Organic, random streaks for realism
 */
export function drawGlassSmudges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  smudgeCount: number = 8
): void {
  ctx.save();

  for (let i = 0; i < smudgeCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const smudgeWidth = 20 + Math.random() * 40;
    const smudgeHeight = 3 + Math.random() * 8;

    // Create smudge gradient
    const grad = ctx.createLinearGradient(x, y, x, y + smudgeHeight * 2);
    grad.addColorStop(0, `rgba(220, 230, 235, ${Math.random() * 0.08})`);
    grad.addColorStop(0.5, `rgba(200, 210, 220, ${Math.random() * 0.1})`);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, smudgeWidth, smudgeHeight);
  }

  ctx.restore();
}

/**
 * Draw atmospheric depth fog
 * Creates atmospheric perspective and distance
 */
export function drawDepthFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseColor: string = 'rgba(255, 255, 255, 0.3)',
  layerCount: number = 3
): void {
  ctx.save();

  for (let i = 0; i < layerCount; i++) {
    const yStart = (height / layerCount) * i;
    const layerHeight = height / layerCount;
    const alpha = (1 / layerCount) * (i + 1) * 0.15;

    // Gradient within each layer
    const grad = ctx.createLinearGradient(0, yStart, 0, yStart + layerHeight);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.5})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, yStart, width, layerHeight);
  }

  ctx.restore();
}

/**
 * Draw vignette effect (darkened edges)
 * Draws attention to center, creates cinematic feeling
 */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.3
): void {
  ctx.save();

  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.8
  );

  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.6, `rgba(0, 0, 0, ${intensity * 0.3})`);
  grad.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

/**
 * Draw organic noise texture
 * Creates natural-looking surface variation
 */
export function drawOrganicNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.2,
  scale: number = 20
): void {
  ctx.save();

  for (let x = 0; x < width; x += scale) {
    for (let y = 0; y < height; y += scale) {
      const noise = Math.random() * intensity;
      ctx.fillStyle = `rgba(0, 0, 0, ${noise})`;
      ctx.fillRect(x, y, scale, scale);
    }
  }

  ctx.restore();
}

/**
 * Draw lens reflection (small bright spot)
 * Adds optical realism
 */
export function drawLensReflection(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 40,
  intensity: number = 0.3
): void {
  ctx.save();

  const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
  grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
  grad.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.3})`);
  grad.addColorStop(1, 'transparent');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw lens damage/crack effect
 * Optional effect for Overgrown Camera scene
 */
export function drawLensDamage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  crackCount: number = 3
): void {
  ctx.save();

  ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';

  for (let i = 0; i < crackCount; i++) {
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = startY + (Math.random() - 0.5) * 200;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    // Create jagged line
    for (let j = 0; j < 10; j++) {
      const x = startX + ((endX - startX) * j) / 10 + (Math.random() - 0.5) * 10;
      const y = startY + ((endY - startY) * j) / 10 + (Math.random() - 0.5) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw light rays/beam effect
 * Creates directional light feeling
 */
export function drawLightRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rayCount: number = 4,
  intensity: number = 0.2
): void {
  ctx.save();

  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI / rayCount) * i - Math.PI / 8;
    const startX = width / 2;
    const startY = -height * 0.2;

    const endX = startX + Math.cos(angle) * width * 1.5;
    const endY = startY + Math.sin(angle) * height * 2;

    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    grad.addColorStop(0, `rgba(255, 248, 235, ${intensity})`);
    grad.addColorStop(0.5, `rgba(255, 240, 220, ${intensity * 0.5})`);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(startX - Math.sin(angle) * width * 0.3, startY + Math.cos(angle) * height * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw edge vignette with custom color
 * Frames the scene with a border effect
 */
export function drawEdgeVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string = 'rgba(0, 0, 0, 0.3)',
  edgeWidth: number = 40
): void {
  ctx.save();

  // Top
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, edgeWidth);

  // Bottom
  ctx.fillRect(0, height - edgeWidth, width, edgeWidth);

  // Left
  ctx.fillRect(0, 0, edgeWidth, height);

  // Right
  ctx.fillRect(width - edgeWidth, 0, edgeWidth, height);

  ctx.restore();
}

/**
 * Draw subtle animation pulse/shimmer effect
 * Creates subtle liveliness
 */
export function drawAnimatedShimmer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  time: number,
  intensity: number = 0.15
): void {
  ctx.save();

  // Create wave effect
  const shimmer = Math.sin(time * 0.002) * intensity;
  ctx.fillStyle = `rgba(255, 255, 255, ${shimmer})`;
  ctx.fillRect(x, y, width, height);

  ctx.restore();
}
