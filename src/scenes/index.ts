/**
 * Canvas Scenes
 *
 * Reusable, parameterizable canvas-based scenes:
 * - Procedurally generated
 * - Interactive (some with cursor tracking)
 * - High performance (60+ FPS)
 * - Memory safe (proper cleanup)
 *
 * Usage:
 * ```typescript
 * import { scenes } from 'visual-toolkit';
 *
 * const scene = scenes.deepSea.leviathan;
 * await scene.init(canvas, { intensity: 0.7, duration: Infinity });
 *
 * // ... later ...
 * scene.cleanup();
 * ```
 */

export * from './types';
export * from './base-scene';
export * from './utilities';

// Re-export theme scenes
import { deepSea } from './themes/deep-sea';
export const scenes = { deepSea };
