/**
 * VISUAL TOOLKIT
 * 
 * A library encoding premium deep-sea visual aesthetics.
 * See README.md for design principles.
 */

// Colors & Palettes
export {
  deepSea,
  bioluminescence,
  materials,
  darkness,
  hexToRgb,
  randomBioHue,
  bioGlow,
} from './colors.js';

// Motion & Animation
export {
  timing,
  amplitude,
  drift,
  bob,
  pulse,
  waver,
  createTendril,
  updateTendril,
  createSeeker,
  updateSeeker,
  cssTimings,
  staggerDelay,
  type Tendril,
  type TendrilSegment,
  type Seeker,
} from './motion.js';

// Gradients
export {
  deepWaterBackground,
  material3D,
  radialGlow,
  playerLight,
  lightBeam,
  vignette,
  eyeGlow,
  cssDeepWater,
  cssBioGlow,
  cssCreatureBody,
  cssJellyfishBell,
  cssDistantCreature,
} from './gradients.js';

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
} from './shadows.js';

// Particles
export {
  createMarineSnow,
  updateMarineSnow,
  drawMarineSnow,
  createDeepParticles,
  updateDeepParticles,
  cssMarineSnowParticle,
  htmlMarineSnow,
  cssMarineSnowStyles,
  createBioParticles,
  drawBioParticles,
  type Particle,
  type BioParticle,
} from './particles.js';

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
} from './shapes.js';
