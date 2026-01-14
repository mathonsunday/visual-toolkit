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
import { SeekersScene } from './seekers';

// Export scene instances
export const shadows = new ShadowsScene();
export const seekers = new SeekersScene();

// Export all scenes as a collection
export const deepSea = {
  shadows,
  seekers,
};

// Export types
export type { ShadowsScene, SeekersScene };
