/**
 * Seekers Scene - Bioluminescent seekers attracted to light
 *
 * A dynamic scene featuring a swarm of small bioluminescent creatures
 * that are drawn to light sources (like the ROV cursor). The seekers
 * exhibit realistic behavior: attraction to light, timidity (flee if
 * light moves too fast), and complex swarming dynamics.
 *
 * Features:
 * - 50 individual seeker creatures with unique properties
 * - Light-seeking behavior with realistic physics
 * - Flee behavior when threatened (light moves too fast)
 * - Orbital nervous behavior when too close to light
 * - Wandering behavior in darkness
 * - Bioluminescent glow that pulses with intensity
 * - Marine snow particle system for atmosphere
 * - Vignette edge darkening
 */

import { BaseCanvasScene } from '../../base-scene';
import type { SceneConfig } from '../../types';
import {
  deepWaterBackground,
  drawPlayerLight,
  createMarineSnow,
  updateMarineSnow,
  drawMarineSnow,
  vignette,
  createSeekerSwarm,
  updateSeekerSwarm,
  drawSeekerSwarm,
  type Particle,
  type Seeker,
} from '../../../themes/deepSea/effects.js';

export class SeekersScene extends BaseCanvasScene {
  name = 'Seekers';
  description = 'Bioluminescent seekers attracted to light';

  defaultConfig: Partial<SceneConfig> = {
    intensity: 1,
    scale: 1,
    duration: Infinity,
  };

  // ============================================
  // SCENE STATE
  // ============================================

  private seekers: Seeker[] = [];
  private particles: Particle[] = [];
  private time = 0;
  private lastCursorX = 0;
  private lastCursorY = 0;

  // ============================================
  // LIFECYCLE
  // ============================================

  /**
   * Initialize scene - called once when scene loads
   */
  protected async onInit(): Promise<void> {
    // Enable cursor tracking - seekers respond to light (cursor)
    this.startCursorTracking();

    const { width, height } = this.getCanvasSize();

    // Create seeker swarm using shared effect
    // 50 seekers with center-biased spawn distribution
    this.seekers = createSeekerSwarm(50, width, height, {
      spawnBias: 'center',
      sizeRange: [2, 8],
      speedRange: [1, 4],
      hueRange: [180, 220],
      centerDrift: 0.02, // Prevent edge clustering
    });

    // Create marine snow particles using shared effect
    this.particles = createMarineSnow(10);

    this.lastCursorX = width / 2;
    this.lastCursorY = height / 2;
  }

  /**
   * Render - called every frame
   */
  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();
    const cursor = this.getCursorPos();

    // ============================================
    // BACKGROUND
    // ============================================

    // Use shared deep water background
    ctx.fillStyle = deepWaterBackground(ctx, height);
    ctx.fillRect(0, 0, width, height);

    // ============================================
    // SEEKERS (PRIMARY SCENE CONTENT)
    // ============================================

    // Calculate cursor movement speed for flee behavior
    const cursorSpeed = Math.sqrt(
      (cursor.x - this.lastCursorX) ** 2 + (cursor.y - this.lastCursorY) ** 2
    );

    // Update seeker behavior using shared effect
    updateSeekerSwarm(
      this.seekers,
      cursor.x,
      cursor.y,
      cursorSpeed,
      width,
      height,
      0.02 // centerDrift
    );

    // Draw seeker swarm using shared effect
    drawSeekerSwarm(ctx, this.seekers, {
      lightX: cursor.x,
      lightY: cursor.y,
      lightRadius: 200,
      time: this.time,
    });

    // ============================================
    // SHARED EFFECTS
    // ============================================

    // Player light (ROV spotlight) using shared effect
    if (cursor.isOver) {
      drawPlayerLight(ctx, cursor.x, cursor.y, 200);
    }

    // Marine snow particles using shared effects
    updateMarineSnow(this.particles, 'down');
    drawMarineSnow(ctx, this.particles, width, height);

    // Vignette (darkens edges) using shared effect
    ctx.fillStyle = vignette(ctx, width / 2, height / 2, height * 0.25, height * 0.85, 0.4);
    ctx.fillRect(0, 0, width, height);

    // ============================================
    // STATE UPDATES
    // ============================================

    // Track cursor movement for flee behavior
    this.lastCursorX = cursor.x;
    this.lastCursorY = cursor.y;

    // Update time for animations
    this.time += deltaTime;
  }

  /**
   * Cleanup - called when scene is destroyed
   */
  protected onCleanup(): void {
    // Clear all arrays
    this.seekers = [];
    this.particles = [];
  }
}

// Export instance for convenience
export const seekers = new SeekersScene();
