/**
 * Garden Theme - Botanical Field Recording Viewer Windows
 *
 * Four self-contained garden scenes representing different perspectives:
 * - Soft Garden Window: Peaceful sunlit pollen
 * - Terrarium View: Layered botanical specimen study
 * - Garden Through Glass: Muted, distant barrier view
 * - Overgrown Camera: Wild nature reclaiming space
 */

import { registerTheme } from '../index.js';

// Import theme components
import * as colors from './colors.js';
import * as gradients from './gradients.js';
import * as particles from './particles.js';
import * as plants from './plants.js';
import * as textures from './textures.js';
import * as recipes from './recipes.js';

// Register the garden theme
registerTheme('garden', {
  colors,
  gradients,
  particles,
  plants,
  textures,
  recipes,
});

// Export all components for direct access
export { colors, gradients, particles, plants, textures, recipes };

// Convenience exports for scene recipes
export {
  drawSoftGardenWindow,
  drawTerrariumView,
  drawGardenThroughGlass,
  drawOvergrownCamera,
  type GardenSceneOptions,
} from './recipes.js';

// Export color palettes for direct use
export {
  softGarden,
  terrarium,
  gardenWindow,
  overgrown,
  withAlpha,
  interpolateColor,
} from './colors.js';
