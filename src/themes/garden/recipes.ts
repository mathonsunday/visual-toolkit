/**
 * Garden Theme Viewer Window Recipes
 *
 * Complete scene composition functions following Deep Sea theme pattern.
 * Each function renders a self-contained botanical field recording viewer window.
 */

import * as colors from './colors.js';
import * as gradients from './gradients.js';
import * as particles from './particles.js';
import * as plants from './plants.js';
import * as textures from './textures.js';

// Timing constants
const TIMING = {
  glacial: 0.0008,
  verySlow: 0.001,
  slow: 0.002,
};

/**
 * Garden scene options
 */
export interface GardenSceneOptions {
  /** Current time for animations (default: 0) */
  time?: number;
  /** Growth level 0-100 affecting density/intensity (default: 0) */
  growthLevel?: number;
  /** Overall visual strength 0-1 (default: 1.0) */
  intensity?: number;
  /** Time of day color temperature shift */
  timeOfDay?: 'dawn' | 'day' | 'dusk';
}

// ============================================
// SCENE 1: Soft Garden Window
// ============================================

/** State for Soft Garden particles */
interface SoftGardenState {
  pollenParticles: particles.PollenParticle[];
}

const softGardenState: SoftGardenState = {
  pollenParticles: particles.createPollen(35),
};

/**
 * Draw Soft Garden Window - Ambient sunlit air with floating pollen
 * Aesthetic: Peaceful afternoon light, minimal, contemplative
 *
 * @example
 * drawSoftGardenWindow(ctx, 0, 0, 600, 400, { time: frameCount })
 */
export function drawSoftGardenWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: GardenSceneOptions = {}
): void {
  const { time = 0, intensity = 1.0 } = options;

  ctx.save();
  ctx.translate(x, y);

  // 1. Fill background with warm sunlit gradient
  gradients.softGardenBackground(ctx, width, height);

  // 2. Draw subtle sun ray beams
  ctx.globalAlpha = 0.3 * intensity;
  gradients.drawSunRays(ctx, width, height, 4);
  ctx.globalAlpha = 1;

  // 3. Render pollen particles with glacial drift
  particles.updatePollen(softGardenState.pollenParticles, ctx, width, height, time);

  // 4. Optional accent petals (subtle, distant)
  ctx.globalAlpha = 0.25 * intensity;
  for (let i = 0; i < 6; i++) {
    const px = (Math.sin(time * TIMING.glacial + i) * 0.5 + 0.5) * width;
    const py = (Math.cos(time * TIMING.glacial + i * 0.7) * 0.5 + 0.5) * height;
    plants.drawPetal(ctx, px, py, 3, 5, colors.softGarden.accents.pollen, 0);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ============================================
// SCENE 2: Terrarium View
// ============================================

/** State for Terrarium particles */
interface TerrariumState {
  leafParticles: particles.LeafParticle[];
}

const terrariumState: TerrariumState = {
  leafParticles: particles.createFloatingLeaves(18),
};

/**
 * Draw Terrarium View - Looking into enclosed botanical ecosystem
 * Aesthetic: Layered depth, "specimen study" perspective
 *
 * @example
 * drawTerrariumView(ctx, 0, 0, 600, 400, { time: frameCount, growthLevel: 50 })
 */
export function drawTerrariumView(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: GardenSceneOptions = {}
): void {
  const { time = 0, growthLevel = 0, intensity = 1.0 } = options;

  ctx.save();
  ctx.translate(x, y);

  // 1. Apply multi-layer green depth gradient
  gradients.terrariumBackground(ctx, width, height);

  // 2. Draw background plants (blurred, low opacity)
  ctx.globalAlpha = 0.35 * intensity;
  for (let i = 0; i < 6; i++) {
    const px = (width / 6) * i + (Math.sin(time * TIMING.verySlow + i) * 20);
    const py = height * 0.3 + (Math.random() * 30 - 15);
    plants.drawBlurredPlant(ctx, px, py, 12 + Math.random() * 8, colors.terrarium.foliage.shadow);
  }
  ctx.globalAlpha = 1;

  // 3. Draw midground leaf clusters
  ctx.globalAlpha = 0.6 * intensity;
  for (let i = 0; i < 5; i++) {
    const px = (Math.random() * 0.8 + 0.1) * width;
    const py = (Math.random() * 0.4 + 0.2) * height;
    plants.drawLeafCluster(ctx, px, py, 6, 8, colors.terrarium.foliage.mature, 1.2);
  }
  ctx.globalAlpha = 1;

  // 4. Render floating leaf particles (mid-ground)
  particles.updateFloatingLeaves(terrariumState.leafParticles, ctx, width, height, time);

  // 5. Add foreground plant silhouettes (sharp, darker)
  ctx.globalAlpha = 0.8 * intensity;
  plants.drawPlantSilhouette(
    ctx,
    width * 0.15,
    height * 0.4,
    height * 0.5,
    colors.terrarium.background.shadow,
    7
  );
  plants.drawPlantSilhouette(
    ctx,
    width * 0.85,
    height * 0.35,
    height * 0.55,
    colors.terrarium.background.shadow,
    8
  );
  ctx.globalAlpha = 1;

  // 6. Optional: Glass container edge highlights
  ctx.strokeStyle = `rgba(200, 220, 230, ${0.1 * intensity})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  ctx.restore();
}

// ============================================
// SCENE 3: Garden Through Glass
// ============================================

/** State for Garden Window particles */
interface GardenWindowState {
  dustMotes: particles.DustMote[];
  pollenParticles: particles.PollenParticle[];
}

const gardenWindowState: GardenWindowState = {
  dustMotes: particles.createDustMotes(55),
  pollenParticles: particles.createPollen(15),
};

/**
 * Draw Garden Through Glass - Muted garden viewed through barrier
 * Aesthetic: Emotional distance, surveillance/observation feeling
 *
 * @example
 * drawGardenThroughGlass(ctx, 0, 0, 600, 400, { time: frameCount })
 */
export function drawGardenThroughGlass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: GardenSceneOptions = {}
): void {
  const { time = 0, intensity = 1.0 } = options;

  ctx.save();
  ctx.translate(x, y);

  // 1. Apply muted garden background (desaturated greens)
  gradients.gardenWindowBackground(ctx, width, height);

  // 2. Scatter heavily blurred plant shapes
  ctx.globalAlpha = 0.25 * intensity;
  for (let i = 0; i < 10; i++) {
    const px = (Math.random() * 0.8 + 0.1) * width;
    const py = (Math.random() * 0.6 + 0.1) * height;
    plants.drawBlurredPlant(ctx, px, py, 15 + Math.random() * 10, colors.gardenWindow.garden.soft, 8);
  }
  ctx.globalAlpha = 1;

  // 3. Render dust motes (barely visible, slow Brownian motion)
  particles.updateDustMotes(gardenWindowState.dustMotes, ctx, width, height, time);

  // 4. Apply frosted glass texture overlay
  ctx.globalAlpha = 0.2 * intensity;
  textures.drawFrostedGlassOverlay(ctx, width, height, 0.12);
  ctx.globalAlpha = 1;

  // 5. Add smudges/condensation marks
  ctx.globalAlpha = 0.15 * intensity;
  textures.drawGlassSmudges(ctx, width, height, 6);
  ctx.globalAlpha = 1;

  // 6. Optional: Lens edge vignette
  ctx.globalAlpha = 0.3 * intensity;
  textures.drawVignette(ctx, width, height, 0.25);
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ============================================
// SCENE 4: Overgrown Camera
// ============================================

/** State for Overgrown particles */
interface OvergrownState {
  particles: particles.OvergrownParticle[];
}

const overgrownState: OvergrownState = {
  particles: particles.createOvergrownParticles(75),
};

/**
 * Draw Overgrown Camera - Nature reclaiming the viewport
 * Aesthetic: Wild, abundant, "abandoned camera" aesthetic
 *
 * @example
 * drawOvergrownCamera(ctx, 0, 0, 600, 400, { time: frameCount })
 */
export function drawOvergrownCamera(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: GardenSceneOptions = {}
): void {
  const { time = 0, growthLevel = 0, intensity = 1.0 } = options;

  ctx.save();
  ctx.translate(x, y);

  // 1. Apply rich deep green background gradient
  gradients.overgrownBackground(ctx, width, height);

  // 2. Draw 8-12 vine segments creeping from edges inward
  ctx.globalAlpha = 0.7 * intensity;

  // Left edge vines
  for (let i = 0; i < 3; i++) {
    const startY = (height / 3) * i + (Math.sin(time * TIMING.verySlow + i) * 20);
    plants.drawOrganicVine(
      ctx,
      -10,
      startY,
      60 + i * 20,
      0.2 + Math.random() * 0.3,
      2 + i * 0.5,
      colors.overgrown.growth.vine,
      0,
      2
    );
  }

  // Right edge vines
  for (let i = 0; i < 3; i++) {
    const startY = (height / 3) * i + (Math.cos(time * TIMING.verySlow + i * 1.5) * 20);
    plants.drawOrganicVine(
      ctx,
      width + 10,
      startY,
      60 + i * 20,
      Math.PI - (0.2 + Math.random() * 0.3),
      2 + i * 0.5,
      colors.overgrown.growth.vine,
      0,
      2
    );
  }

  // Top vines
  for (let i = 0; i < 2; i++) {
    const startX = (width / 2.5) * i + (Math.sin(time * TIMING.verySlow + i * 2) * 20);
    plants.drawOrganicVine(
      ctx,
      startX,
      -10,
      50 + i * 15,
      Math.PI / 2 + (Math.random() - 0.5) * 0.4,
      1.5 + i * 0.5,
      colors.overgrown.growth.vine,
      0,
      2
    );
  }

  ctx.globalAlpha = 1;

  // 3. Scatter leaf shapes (varied sizes/rotations) - dense coverage
  ctx.globalAlpha = 0.65 * intensity;
  for (let i = 0; i < 40; i++) {
    const px = Math.random() * width;
    const py = Math.random() * height;
    const leafSize = 3 + Math.random() * 6;
    const rotation = Math.random() * Math.PI * 2;

    if (Math.random() > 0.5) {
      plants.drawSimpleLeaf(ctx, px, py, leafSize, colors.overgrown.growth.leaf, rotation);
    } else {
      plants.drawPointedLeaf(ctx, px, py, leafSize, colors.overgrown.growth.wild, rotation);
    }
  }
  ctx.globalAlpha = 1;

  // 4. Render dense particle system (fragments, pollen)
  particles.updateOvergrownParticles(overgrownState.particles, ctx, width, height, time);

  // 5. Add organic shadow/depth variation
  ctx.globalAlpha = 0.2 * intensity;
  textures.drawOrganicNoise(ctx, width, height, 0.15, 30);
  ctx.globalAlpha = 1;

  // 6. Optional: Lens crack or obstruction effect
  if (growthLevel > 50) {
    ctx.globalAlpha = 0.15 * intensity;
    textures.drawLensDamage(ctx, width, height, 2);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
