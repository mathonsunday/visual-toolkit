/**
 * LIVING OS SHARED EFFECTS
 *
 * Central export point for all shared visual effects and utilities used by living-os scenes.
 * This follows the Scene-First architecture where scenes are self-contained and reuse
 * shared effects from this module.
 *
 * Usage in scenes:
 * ```typescript
 * import { drawGrowingRoots, drawOrganicSurface, calculateSway } from '../effects';
 *
 * export class MyScene extends BaseCanvasScene {
 *   render(ctx, deltaTime) {
 *     const sway = calculateSway(this.time, { speed: 0.5, magnitude: 10 });
 *     drawGrowingRoots(ctx, x, y, { sway });
 *     // ...
 *   }
 * }
 * ```
 */

// ============================================
// COLORS - Theme color palettes
// ============================================
export {
  livingOs,
  rgbToHex,
  rgbToRgba,
  getGrowthColor,
  addAlphaToColor,
} from './colors.js';

// ============================================
// GROWTH - Root and vine drawing
// ============================================
export {
  drawGrowingRoots,
  drawVines,
  drawGrowthIndicator,
  drawOrganicVine,
  drawOrganicRoots,
  type GrowthOptions,
  type GrowthIndicatorOptions,
  type OrganicVineOptions,
  type OrganicRootOptions,
} from './growth.js';

// ============================================
// PLANTS - Plant elements (leaves, flowers)
// ============================================
export {
  drawLeaf,
  drawLeaves,
  drawFlower,
  type LeafOptions,
  type FlowerOptions,
} from './plants.js';

// ============================================
// TEXTURES - Organic surface rendering
// ============================================
export {
  drawBarkTexture,
  drawBarkTextureCached,
  drawOrganicSurface,
  woodPalettes,
  getOrCreatePermutation,
  precomputePermutations,
  clearPermutationCache,
  clearTextureCache,
  getTextureCacheSize,
  type BarkTextureOptions,
  type WoodPalette,
  type WoodType,
} from './textures.js';

// ============================================
// MOTION - Animation and timing helpers
// ============================================
export {
  calculateSway,
  calculateDrift,
  applySway,
  applyDrift,
  calculateGrowthProgress,
  calculateTipGrowthMultiplier,
  calculatePulse,
  calculateScalePulse,
  applyGrowthTiming,
  GROWTH_TIMING,
  type SwayOptions,
  type DriftOptions,
  type GrowthAnimationOptions,
  type PulseOptions,
  type GrowthTimingPreset,
} from './motion.js';

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
