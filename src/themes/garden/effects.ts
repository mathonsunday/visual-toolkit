/**
 * GARDEN SHARED EFFECTS
 *
 * Central export point for all shared visual effects and utilities used by garden scenes.
 * This follows the Scene-First architecture where scenes are self-contained and reuse
 * shared effects from this module.
 *
 * Usage in scenes:
 * ```typescript
 * import {
 *   drawSoftGardenWindow,
 *   softGarden,
 *   drawPollenParticles,
 * } from '../effects';
 *
 * export class GardenScene extends BaseCanvasScene {
 *   render(ctx, deltaTime) {
 *     ctx.fillStyle = softGarden.background;
 *     ctx.fillRect(0, 0, width, height);
 *     drawPollenParticles(ctx, this.particles, deltaTime);
 *     // ...
 *   }
 * }
 * ```
 */

// ============================================
// COLORS - Theme color palettes
// ============================================
export {
  softGarden,
  terrarium,
  gardenWindow,
  overgrown,
  withAlpha,
  interpolateColor,
} from './colors.js';

// ============================================
// GRADIENTS - Background and lighting
// ============================================
export * from './gradients.js';

// ============================================
// PARTICLES - Pollen and floating elements
// ============================================
export * from './particles.js';

// ============================================
// PLANTS - Plant elements (leaves, flowers)
// ============================================
export * from './plants.js';

// ============================================
// TEXTURES - Organic surface rendering
// ============================================
export * from './textures.js';

// ============================================
// RECIPES - Complete drawable scenes/objects
// ============================================
export {
  drawSoftGardenWindow,
  drawTerrariumView,
  drawGardenThroughGlass,
  drawOvergrownCamera,
  type GardenSceneOptions,
} from './recipes.js';

// ============================================
// CORE UTILITIES - Shared infrastructure
// ============================================
export {
  vignette,
  radialGlow,
  material3D,
} from '../../core/gradients.js';

export {
  createEyes,
  updateEyes,
  drawEyes,
  createEye,
  updateEye,
  drawEye,
  type Eye,
} from '../../core/eyes.js';

export {
  calculateIllumination,
  drawPlayerLight,
} from '../../core/lighting.js';
