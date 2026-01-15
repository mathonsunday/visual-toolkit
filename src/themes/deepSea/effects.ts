/**
 * DEEP SEA SHARED EFFECTS
 *
 * Central export point for all shared visual effects and utilities used by deep-sea scenes.
 * This consolidates Pattern A (core helpers) and Pattern B (theme recipes) into a single
 * coherent effects library for the Scene-First architecture.
 *
 * Usage in scenes:
 * ```typescript
 * import { deepWaterBackground, drawPlayerLight, createMarineSnow, drawEyes } from '../effects';
 *
 * export class MyScene extends BaseCanvasScene {
 *   render(ctx, deltaTime) {
 *     ctx.fillStyle = deepWaterBackground(ctx, height);
 *     ctx.fillRect(0, 0, width, height);
 *     drawPlayerLight(ctx, cursor.x, cursor.y, 200);
 *     // ...
 *   }
 * }
 * ```
 */

// ============================================
// GRADIENTS - Theme-specific backgrounds
// ============================================
export {
  deepWaterBackground,
  playerLight,
  lightBeam,
  eyeGlow,
} from './gradients.js';

// ============================================
// PARTICLES - Dynamic particle systems
// ============================================
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

// ============================================
// LIGHTING - Core lighting effects
// ============================================
export {
  drawPlayerLight,
  calculateIllumination,
  drawOrganicTexture,
  drawCaustics,
} from '../../core/lighting.js';

// ============================================
// SHAPES - Core shape primitives
// ============================================
export {
  drawPanelLines,
  drawGrille,
  drawTether,
  drawLens,
  drawLight,
  drawTrackingEye,
  drawTentacle,
} from '../../core/shapes.js';

// ============================================
// EYES - Complete eye system with tracking
// ============================================
export {
  createEyes,
  updateEyes,
  drawEyes,
  createEye,
  updateEye,
  drawEye,
  type Eye,
} from '../../core/eyes.js';

// ============================================
// MOTION - Animation and timing helpers
// ============================================
export {
  createSeekerSwarm,
  updateSeekerSwarm,
  drawSeekerSwarm,
  createSeeker,
  updateSeeker,
  drawSeeker,
  drawBiolumGlow,
  pulse,
  drift,
  bob,
  waver,
  type Seeker,
  type SwarmOptions,
} from '../../core/motion.js';

// ============================================
// GRADIENTS - Core generic gradients
// ============================================
export {
  material3D,
  radialGlow,
  vignette,
} from '../../core/gradients.js';

// ============================================
// SURFACES - Organic surface rendering
// ============================================
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

// ============================================
// RECIPES - Complete drawable objects
// ============================================
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

// ============================================
// COLORS - Theme color palettes
// ============================================
export {
  deepSea,
  bioluminescence,
  materials,
  darkness,
  randomBioHue,
  bioGlow,
} from './colors.js';
