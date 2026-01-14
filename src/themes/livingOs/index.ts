/**
 * LIVING OS THEME
 * 
 * Plant biology research OS theme with organic, nature-based visual effects.
 * Colors, growth patterns, plant elements, textures, and motion effects.
 */

import { registerTheme } from '../index.js';
import * as colors from './colors.js';
import * as growth from './growth.js';
import * as plants from './plants.js';
import * as textures from './textures.js';
import * as motion from './motion.js';

// Register the living OS theme
registerTheme('livingOs', {
  colors,
  growth,
  plants,
  textures,
  motion,
});

// Export everything for direct access
export {
  colors,
  growth,
  plants,
  textures,
  motion,
};

// Re-export commonly used items
export {
  livingOs,
  rgbToHex,
  rgbToRgba,
  getGrowthColor,
  addAlphaToColor,
} from './colors.js';

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

export {
  drawLeaf,
  drawLeaves,
  drawFlower,
  type LeafOptions,
  type FlowerOptions,
} from './plants.js';

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
