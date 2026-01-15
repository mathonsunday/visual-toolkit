/**
 * Deep Sea Theme Scenes
 *
 * Canvas scenes for the deep sea narrative OS theme.
 * Each scene is a reusable component extending BaseCanvasScene.
 *
 * Usage:
 * ```typescript
 * import { scenes } from 'visual-toolkit';
 * const scene = scenes.deepSea.shadows;
 * await scene.init(canvas, { intensity: 0.5 });
 * // ... later ...
 * scene.cleanup();
 * ```
 */

import { ShadowsScene } from './shadows';
import { GiantSquidScene } from './giant-squid';
import { ROVExteriorScene } from './rov-exterior';
import { LeviathanScene } from './leviathan';
import { WallScene } from './wall';

// Export scene instances
export const shadows = new ShadowsScene();
export const giantSquid = new GiantSquidScene();
export const rovExterior = new ROVExteriorScene();
export const leviathan = new LeviathanScene();
export const wall = new WallScene();

// Export all scenes as a collection
export const deepSea = {
  shadows,
  giantSquid,
  rovExterior,
  leviathan,
  wall,
};

// Export types
export type { ShadowsScene, GiantSquidScene, ROVExteriorScene, LeviathanScene, WallScene };
