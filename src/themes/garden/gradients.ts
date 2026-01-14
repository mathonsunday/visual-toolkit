/**
 * Garden Theme Gradients
 *
 * Background gradient functions for each viewer window scene.
 * These establish the foundational atmosphere for each garden aesthetic.
 */

import { softGarden, terrarium, gardenWindow, overgrown } from './colors.js';

/**
 * Soft Garden Window - Warm, sunlit gradient
 * Creates peaceful afternoon light atmosphere
 */
export function softGardenBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Vertical gradient from light (top) to warm (bottom)
  const grad = ctx.createLinearGradient(0, 0, 0, height);

  // Sky/top - bright warm light
  grad.addColorStop(0, softGarden.background.light);

  // Mid - gradual transition
  grad.addColorStop(0.5, softGarden.background.mid);

  // Bottom - slightly warmer tone for depth
  grad.addColorStop(1, softGarden.background.dark);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Terrarium View - Multi-layer depth gradient
 * Creates "looking into" perspective with layered greens
 */
export function terrariumBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Layer 1: Background (deepest)
  const grad1 = ctx.createLinearGradient(0, 0, 0, height);
  grad1.addColorStop(0, terrarium.background.deep);
  grad1.addColorStop(1, terrarium.background.shadow);

  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, width, height);

  // Layer 2: Midground with slight opacity
  const grad2 = ctx.createLinearGradient(0, height * 0.2, 0, height);
  grad2.addColorStop(0, terrarium.background.mid);
  grad2.addColorStop(1, terrarium.background.deep);

  ctx.fillStyle = grad2;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, height * 0.3, width, height * 0.7);
  ctx.globalAlpha = 1;

  // Layer 3: Surface (brightest) - only upper portion
  const grad3 = ctx.createLinearGradient(0, 0, 0, height * 0.4);
  grad3.addColorStop(0, terrarium.background.surface);
  grad3.addColorStop(1, terrarium.background.mid);

  ctx.fillStyle = grad3;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(0, 0, width, height * 0.4);
  ctx.globalAlpha = 1;
}

/**
 * Garden Through Glass - Muted, distant gradient
 * Creates soft, obscured garden view (like looking through frosted glass)
 */
export function gardenWindowBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Base muted gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);

  grad.addColorStop(0, gardenWindow.garden.soft);
  grad.addColorStop(0.5, gardenWindow.garden.muted);
  grad.addColorStop(1, gardenWindow.garden.distant);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Frosted glass tint overlay
  ctx.fillStyle = gardenWindow.glass.tint;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Overgrown Camera - Rich, wild gradient
 * Creates dense, deep green background for invasive growth
 */
export function overgrownBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Base deep green gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);

  grad.addColorStop(0, overgrown.background.vibrant);
  grad.addColorStop(0.4, overgrown.background.dense);
  grad.addColorStop(0.7, overgrown.background.dense);
  grad.addColorStop(1, overgrown.growth.shadow);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Add subtle radial shadow from edges (nature creeping in)
  const radialGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.8
  );

  radialGrad.addColorStop(0, 'transparent');
  radialGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
  radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

  ctx.fillStyle = radialGrad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Create depth layers helper
 * Generates semi-transparent rectangles for atmospheric perspective
 * @param ctx Canvas context
 * @param baseColor Base color to use for layers
 * @param width Canvas width
 * @param height Canvas height
 * @param layerCount Number of depth layers (default: 3)
 */
export function applyDepthLayers(
  ctx: CanvasRenderingContext2D,
  baseColor: string,
  width: number,
  height: number,
  layerCount: number = 3
): void {
  for (let i = 0; i < layerCount; i++) {
    const alpha = (1 / layerCount) * (i + 1) * 0.2; // Max 20% opacity per layer
    const yStart = (height / layerCount) * i;
    const layerHeight = height / layerCount;

    ctx.fillStyle = baseColor.includes('rgba')
      ? baseColor.replace(/[\d.]+\)$/, `${alpha})`)
      : `rgba(0, 0, 0, ${alpha})`;

    ctx.fillRect(0, yStart, width, layerHeight);
  }
}

/**
 * Draw sun ray beams
 * Creates diagonal light beams for Soft Garden aesthetic
 */
export function drawSunRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rayCount: number = 4
): void {
  ctx.save();

  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI / rayCount) * (i + 0.5) - Math.PI / 4;
    const startX = width * 0.5;
    const startY = height * -0.2;

    // Create linear gradient for each ray
    const endX = startX + Math.cos(angle) * width;
    const endY = startY + Math.sin(angle) * height * 1.5;

    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    grad.addColorStop(0, 'rgba(255, 248, 235, 0.3)');
    grad.addColorStop(0.5, 'rgba(255, 240, 220, 0.1)');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + Math.cos(angle) * width * 1.5, startY + Math.sin(angle) * height * 2);
    ctx.lineTo(
      startX - Math.sin(angle) * (width * 0.15),
      startY + Math.cos(angle) * (height * 0.15)
    );
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Apply frosted glass texture effect
 * Subtle noise overlay for Garden Through Glass scene
 */
export function applyFrostedGlassEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.1
): void {
  // Create simple noise texture using canvas pattern
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 100;
  noiseCanvas.height = 100;

  const noiseCtx = noiseCanvas.getContext('2d');
  if (!noiseCtx) return;

  // Generate noise pattern
  for (let x = 0; x < 100; x += 5) {
    for (let y = 0; y < 100; y += 5) {
      const opacity = Math.random() * intensity;
      noiseCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      noiseCtx.fillRect(x, y, 5, 5);
    }
  }

  // Apply noise as pattern
  const pattern = ctx.createPattern(noiseCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Draw atmospheric depth fog
 * Creates sense of atmospheric perspective
 */
export function drawAtmosphericFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseAlpha: number = 0.3
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, height);

  grad.addColorStop(0, `rgba(255, 255, 255, ${baseAlpha * 0.5})`);
  grad.addColorStop(0.5, `rgba(255, 255, 255, ${baseAlpha})`);
  grad.addColorStop(1, `rgba(255, 255, 255, ${baseAlpha * 0.3})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}
