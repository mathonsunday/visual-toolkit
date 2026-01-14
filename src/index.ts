/**
 * VISUAL TOOLKIT
 * 
 * A library encoding premium visual aesthetics with theme support.
 * 
 * Core API: Theme-agnostic functions (motion, materials, lighting)
 * Themes: Theme-specific presets (deepSea, custom themes)
 * 
 * See README.md for design principles and THEME_ARCHITECTURE.md for theme system.
 */

// ============================================
// CORE API (Theme-Agnostic)
// ============================================

// Motion & Animation
export {
  timing,
  amplitude,
  drift,
  bob,
  pulse,
  waver,
  // Seekers
  createSeeker,
  updateSeeker,
  createSeekerSwarm,
  updateSeekerWithDrift,
  updateSeekerSwarm,
  drawBiolumGlow,
  drawSeeker,
  drawSeekerSwarm,
  // CSS
  cssTimings,
  staggerDelay,
  // Types
  type Seeker,
  type SwarmOptions,
} from './core/motion.js';

// Core Gradients (Generic)
export {
  material3D,
  radialGlow,
  vignette,
} from './core/gradients.js';

// Shadows & Depth
export {
  drawOffsetShadow,
  applyShadow,
  clearShadow,
  cssGlow,
  cssJellyfishGlow,
  cssFishGlow,
  cssEyeGlow,
  cssHudGlow,
  cssBreathingGlow,
  depthPresets,
  drawWithDepth,
  type DepthConfig,
} from './core/shadows.js';

// Shapes & Details
export {
  organicRadius,
  organicRadii,
  drawPanelLines,
  drawGrille,
  drawTether,
  drawLens,
  drawLight,
  drawTrackingEye,
  drawTentacle,
} from './core/shapes.js';

// Lighting helpers
export {
  calculateIllumination,
  calculateDirectionalIllumination,
  drawPlayerLight,
  drawOrganicTexture,
  drawCaustics,
} from './core/lighting.js';

// Eye system
export {
  createEye,
  updateEye,
  drawEye,
  createEyes,
  updateEyes,
  drawEyes,
  type Eye,
  type EyeOptions,
} from './core/eyes.js';

// Helpers
export {
  hexToRgb,
} from './core/helpers.js';

// ============================================
// CANVAS SCENES
// ============================================

export {
  scenes,
  type BaseCanvasScene,
  type CanvasScene,
  type SceneConfig,
  type CursorPos,
} from './scenes/index.js';

// ============================================
// THEME SYSTEM
// ============================================

export {
  registerTheme,
  getTheme,
  getThemeNames,
  themes,
  type Theme,
} from './themes/index.js';

// Import themes to auto-register them
import './themes/deepSea/index.js';
import './themes/livingOs/index.js';
import './themes/garden/index.js';

// ============================================
// BACKWARD COMPATIBILITY
// ============================================
// Re-export deep-sea theme items for backward compatibility
// These will be deprecated in a future version

export {
  // Colors
  deepSea,
  bioluminescence,
  materials,
  darkness,
  randomBioHue,
  bioGlow,
  // Gradients
  deepWaterBackground,
  playerLight,
  lightBeam,
  eyeGlow,
  cssDeepWater,
  cssBioGlow,
  cssCreatureBody,
  cssJellyfishBell,
  cssDistantCreature,
  // Particles
  createMarineSnow,
  updateMarineSnow,
  drawMarineSnow,
  createDeepParticles,
  updateDeepParticles,
  createBioParticles,
  drawBioParticles,
  type Particle,
  type BioParticle,
  // Recipes
  drawROV,
  drawLightCone,
  drawJellyfish,
  drawSpecimen,
  type ROVOptions,
  type LightConeOptions,
  type JellyfishOptions,
  type SpecimenOptions,
  // Surfaces
  drawOrganicSurface,
  drawBarnacles,
  drawScarring,
  surfacePalettes,
  type SurfaceType,
  type SurfacePalette,
  type SurfacePreset,
  type OrganicSurfaceOptions,
} from './themes/deepSea/index.js';
