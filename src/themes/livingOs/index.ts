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
} from './colors.js';

export {
  drawGrowingRoots,
  drawVines,
  drawGrowthIndicator,
  type GrowthOptions,
  type GrowthIndicatorOptions,
} from './growth.js';

export {
  drawLeaf,
  drawLeaves,
  type LeafOptions,
} from './plants.js';

export {
  drawBarkTexture,
  drawOrganicSurface,
  type BarkTextureOptions,
} from './textures.js';

export {
  calculateSway,
  calculateDrift,
  applySway,
  applyDrift,
  type SwayOptions,
  type DriftOptions,
} from './motion.js';
