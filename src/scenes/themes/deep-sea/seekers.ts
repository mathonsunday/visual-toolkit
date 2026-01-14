/**
 * Seekers Scene - Bioluminescent swarm intelligence
 *
 * A dynamic scene featuring a swarm of bioluminescent organisms that
 * respond to cursor (ROV light) position. The seekers exhibit collective
 * behavior, attraction to light, and beautiful glow effects.
 *
 * Features:
 * - Swarm of 50 bioluminescent creatures
 * - Responsive to cursor (ROV light) position and movement
 * - Individual creature glow based on proximity to light
 * - Center-biased spawning to prevent edge clustering
 * - Marine snow particles for atmosphere
 * - ROV spotlight effect following cursor
 * - Soft vignette edge darkening
 */

import { BaseCanvasScene } from '../../base-scene';
import type { SceneConfig, CursorPos } from '../../types';

interface Seeker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  brightness: number;
  bodyHue: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export class SeekersScene extends BaseCanvasScene {
  name = 'Seekers';
  description = 'Bioluminescent swarm responding to light';
  defaultConfig: Partial<SceneConfig> = {
    intensity: 0.7,
    scale: 1,
    duration: Infinity
  };

  private seekers: Seeker[] = [];
  private particles: Particle[] = [];
  private time = 0;

  protected async onInit(): Promise<void> {
    // Enable cursor tracking for light attraction
    this.startCursorTracking();
    this.initializeParticles();
    this.resizeSeekersSwarm();
  }

  protected onCanvasResize(): void {
    const { width, height } = this.getCanvasSize();
    if (this.seekers.length === 0) {
      this.resizeSeekersSwarm();
    }
  }

  protected onCleanup(): void {
    // Clear arrays
    this.seekers = [];
    this.particles = [];
  }

  private initializeParticles(): void {
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.5 + Math.random() * 1.5,
        speed: 0.0005 + Math.random() * 0.001,
        alpha: 0.1 + Math.random() * 0.2,
      });
    }
  }

  private resizeSeekersSwarm(): void {
    const { width, height } = this.getCanvasSize();

    // Create swarm with center-biased spawning
    this.seekers = [];
    for (let i = 0; i < 50; i++) {
      // Center-biased spawn using Gaussian-like distribution
      let angle = Math.random() * Math.PI * 2;
      let distance = Math.random() * Math.random() * 100; // More center-biased
      let sx = width / 2 + Math.cos(angle) * distance;
      let sy = height / 2 + Math.sin(angle) * distance;

      // Clamp to canvas
      sx = Math.max(0, Math.min(width, sx));
      sy = Math.max(0, Math.min(height, sy));

      this.seekers.push({
        x: sx,
        y: sy,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 5,
        brightness: 0.4 + Math.random() * 0.4,
        bodyHue: 190 + Math.random() * 20 // Cyan hues
      });
    }
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();
    const cursor = this.getCursorPos();

    // Deep water background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#020810');
    bgGrad.addColorStop(0.5, '#010508');
    bgGrad.addColorStop(1, '#000305');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Calculate light speed for behavioral response
    const lightSpeed = Math.sqrt(
      (cursor.x - (cursor.x - (deltaTime * 0.1))) ** 2 +
      (cursor.y - (cursor.y - (deltaTime * 0.1))) ** 2
    );

    // Update seekers - attract to cursor, avoid edges, apply physics
    for (const seeker of this.seekers) {
      // Attraction to light (cursor)
      const dx = cursor.x - seeker.x;
      const dy = cursor.y - seeker.y;
      const distToLight = Math.sqrt(dx * dx + dy * dy);

      if (cursor.isOver && distToLight < 300) {
        // Attracted to light
        const angle = Math.atan2(dy, dx);
        const attractForce = Math.max(0, 1 - distToLight / 300) * 0.15;
        seeker.vx += Math.cos(angle) * attractForce;
        seeker.vy += Math.sin(angle) * attractForce;
      } else {
        // Random drift when not attracted
        seeker.vx += (Math.random() - 0.5) * 0.05;
        seeker.vy += (Math.random() - 0.5) * 0.05;
      }

      // Center drift - prevent edge clustering
      const centerDx = width / 2 - seeker.x;
      const centerDy = height / 2 - seeker.y;
      const distToCenter = Math.sqrt(centerDx * centerDx + centerDy * centerDy);

      if (distToCenter > 200) {
        const centerAngle = Math.atan2(centerDy, centerDx);
        const centerForce = Math.max(0, (distToCenter - 200) / 200) * 0.02;
        seeker.vx += Math.cos(centerAngle) * centerForce;
        seeker.vy += Math.sin(centerAngle) * centerForce;
      }

      // Apply velocity
      seeker.x += seeker.vx;
      seeker.y += seeker.vy;

      // Friction
      seeker.vx *= 0.98;
      seeker.vy *= 0.98;

      // Boundary wrapping with smooth edges
      if (seeker.x < -10) seeker.x = width + 10;
      if (seeker.x > width + 10) seeker.x = -10;
      if (seeker.y < -10) seeker.y = height + 10;
      if (seeker.y > height + 10) seeker.y = -10;
    }

    // Draw seekers with glow
    // Sort by depth (y position)
    const sortedSeekers = [...this.seekers].sort((a, b) => a.y - b.y);

    for (const seeker of sortedSeekers) {
      const dx = cursor.x - seeker.x;
      const dy = cursor.y - seeker.y;
      const distToLight = Math.sqrt(dx * dx + dy * dy);

      // Brightness based on proximity to light
      let brightness = seeker.brightness;
      if (cursor.isOver && distToLight < 300) {
        brightness = 0.6 + Math.max(0, 1 - distToLight / 300) * 0.4;
      }

      // Glow halo
      const glowRadius = seeker.size * 3;
      const glowGrad = ctx.createRadialGradient(
        seeker.x, seeker.y, 0,
        seeker.x, seeker.y, glowRadius
      );
      glowGrad.addColorStop(0, `hsla(${seeker.bodyHue}, 100%, 60%, ${brightness * 0.6})`);
      glowGrad.addColorStop(0.5, `hsla(${seeker.bodyHue}, 100%, 50%, ${brightness * 0.2})`);
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(seeker.x, seeker.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = `hsla(${seeker.bodyHue}, 100%, 50%, ${brightness})`;
      ctx.beginPath();
      ctx.arc(seeker.x, seeker.y, seeker.size, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `hsla(${seeker.bodyHue}, 100%, 70%, ${brightness * 0.8})`;
      ctx.beginPath();
      ctx.arc(seeker.x, seeker.y, seeker.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Marine snow particles
    for (const p of this.particles) {
      p.y += p.speed;
      p.x += Math.sin(this.time * 0.001 + p.y * 5) * 0.0003;

      if (p.y > 1.05) {
        p.y = -0.05;
        p.x = Math.random();
      }

      ctx.fillStyle = `rgba(150, 180, 200, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // ROV spotlight effect - dimmer to let seekers shine
    if (cursor.isOver && cursor.x > 0 && cursor.x < width) {
      for (let i = 3; i >= 1; i--) {
        const layerRadius = 100 * (i / 2);
        const alpha = 0.08 / i;
        const grad = ctx.createRadialGradient(
          cursor.x, cursor.y, 0,
          cursor.x, cursor.y, layerRadius
        );
        grad.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
        grad.addColorStop(0.5, `rgba(100, 180, 220, ${alpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small bright core
      const core = ctx.createRadialGradient(
        cursor.x, cursor.y, 0,
        cursor.x, cursor.y, 10
      );
      core.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      core.addColorStop(0.5, 'rgba(200, 240, 255, 0.3)');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft vignette
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.3,
      width / 2, height / 2, height * 0.85
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    this.time += 16;
  }
}

export const seekers = new SeekersScene();
