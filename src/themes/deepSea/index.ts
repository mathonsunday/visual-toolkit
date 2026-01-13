/**
 * DEEP SEA THEME
 * 
 * Complete deep-sea marine biology theme with colors, gradients, particles, recipes, and surfaces.
 */

import { registerTheme } from '../index.js';
import * as colors from './colors.js';
import * as gradients from './gradients.js';
import * as particles from './particles.js';
import * as recipes from './recipes.js';
import * as surfaces from './surfaces.js';

// Register the deep-sea theme
registerTheme('deepSea', {
  colors,
  gradients,
  particles,
  recipes,
  surfaces,
});

// Export everything for direct access
export {
  colors,
  gradients,
  particles,
  recipes,
  surfaces,
};

// Re-export commonly used items
export {
  deepSea,
  bioluminescence,
  materials,
  darkness,
  randomBioHue,
  bioGlow,
} from './colors.js';

export {
  deepWaterBackground,
  playerLight,
  lightBeam,
  eyeGlow,
  cssDeepWater,
  cssBioGlow,
  cssCreatureBody,
  cssJellyfishBell,
  cssDistantCreature,
} from './gradients.js';

export {
  createMarineSnow,
  updateMarineSnow,
  drawMarineSnow,
  createDeepParticles,
  updateDeepParticles,
  createBioParticles,
  drawBioParticles,
  type Particle,
  type BioParticle,
} from './particles.js';

export {
  drawROV,
  drawLightCone,
  drawJellyfish,
  drawSpecimen,
  type ROVOptions,
  type LightConeOptions,
  type JellyfishOptions,
  type SpecimenOptions,
} from './recipes.js';

export {
  drawOrganicSurface,
  surfacePalettes,
  drawBarnacles,
  drawScarring,
  type SurfaceType,
  type SurfacePalette,
  type SurfacePreset,
  type OrganicSurfaceOptions,
} from './surfaces.js';
