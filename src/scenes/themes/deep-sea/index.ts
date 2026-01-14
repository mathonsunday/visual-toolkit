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

// Export scene instances
export const shadows = new ShadowsScene();

// Export all scenes as a collection
export const deepSea = {
  shadows,
};

// Export types
export type { ShadowsScene };
