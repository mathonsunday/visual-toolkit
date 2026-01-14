/**
 * Giant Squid Scene - Massive tentacle encounter
 *
 * A haunting scene featuring a single massive tentacle that drags across
 * the screen with organic wave motion. The squid is never fully visible,
 * creating a sense of vast, unseen presence.
 *
 * Features:
 * - Single massive tentacle with 50+ segments
 * - Organic wave motion along entire length
 * - Suction cups with shading detail
 * - Bioluminescent chromatophores pulsing along flesh
 * - Texture detail lines for surface realism
 * - Responsive ROV light (cursor)
 * - Marine snow particles
 * - Heavy vignette for abyss depth
 */

import { BaseCanvasScene } from '../../base-scene';
import type { SceneConfig, CursorPos } from '../../types';

interface TentaclePoint {
  x: number;
  y: number;
  thickness: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
}

interface Tentacle {
  progress: number;
  yCenter: number;
  thickness: number;
  phase: number;
}

export class GiantSquidScene extends BaseCanvasScene {
  name = 'Giant Squid';
  description = 'Encounter with massive cephalopod';
  defaultConfig: Partial<SceneConfig> = {
    intensity: 0.8,
    scale: 1,
    duration: Infinity
  };

  private particles: Particle[] = [];
  private tentacle: Tentacle = {
    progress: 0,
    yCenter: 0.5,
    thickness: 120,
    phase: 0
  };
  private time = 0;

  protected async onInit(): Promise<void> {
    // Enable cursor tracking for light
    this.startCursorTracking();
    this.initializeParticles();
  }

  protected onCanvasResize(): void {
    // Particles don't need resize handling
  }

  protected onCleanup(): void {
    // Clear arrays
    this.particles = [];
  }

  private initializeParticles(): void {
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.0003 + 0.0001,
        drift: Math.random() * 0.0002 - 0.0001,
        alpha: Math.random() * 0.3 + 0.1
      });
    }
  }

  private drawMassiveTentacle(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Tentacle moves from left to right across frame
    const headX = -width * 0.3 + this.tentacle.progress * width * 1.6;
    const wave = this.time * 0.0008;

    // Build tentacle as series of segments
    const segments = 50;
    const points: TentaclePoint[] = [];

    for (let i = 0; i <= segments; i++) {
      const ratio = i / segments;

      // X position trails behind the "head"
      const segmentX = headX - ratio * width * 0.8;

      // Y position with organic wave motion
      const baseY = height * this.tentacle.yCenter;
      const waveY = Math.sin(wave + ratio * 3) * height * 0.15;
      const slowWave = Math.sin(wave * 0.3 + ratio * 1.5) * height * 0.08;
      const segmentY = baseY + waveY + slowWave;

      // Thickness tapers toward the tip (offscreen left)
      const segmentThickness = this.tentacle.thickness * (1 - ratio * 0.6);

      points.push({ x: segmentX, y: segmentY, thickness: segmentThickness });
    }

    // Draw tentacle body (thick fleshy arm)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];

      // Skip if completely off screen
      if (p0.x < -100 && p1.x < -100) continue;
      if (p0.x > width + 100 && p1.x > width + 100) continue;

      // Color gradient - deep red/maroon flesh
      const ratio = i / points.length;
      const r = 70 + ratio * 30;
      const g = 20 + ratio * 15;
      const b = 35 + ratio * 15;

      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = (p0.thickness + p1.thickness) / 2;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    // Draw suction cups along the underside
    for (let i = 2; i < points.length - 2; i += 3) {
      const p = points[i];

      // Skip if off screen
      if (p.x < -50 || p.x > width + 50) continue;

      const cupSize = p.thickness * 0.25;

      // Get angle of tentacle at this point
      const dx = points[i + 1].x - points[i - 1].x;
      const dy = points[i + 1].y - points[i - 1].y;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;

      // Place cup on the "underside"
      const cupX = p.x + Math.cos(angle) * p.thickness * 0.35;
      const cupY = p.y + Math.sin(angle) * p.thickness * 0.35;

      // Outer ring (rim of sucker)
      ctx.beginPath();
      ctx.arc(cupX, cupY, cupSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(50, 15, 25, 0.9)';
      ctx.fill();

      // Inner dark center
      ctx.beginPath();
      ctx.arc(cupX, cupY, cupSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 5, 10, 0.95)';
      ctx.fill();

      // Highlight ring
      ctx.beginPath();
      ctx.arc(cupX, cupY, cupSize * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 40, 50, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Bioluminescent chromatophores - sparse, pulsing
    for (let i = 5; i < points.length - 5; i += 8) {
      const p = points[i];
      if (p.x < 0 || p.x > width) continue;

      const pulsePhase = this.time * 0.002 + i * 0.3;
      const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;
      const spotSize = 4 + pulse * 3;
      const alpha = 0.3 + pulse * 0.4;

      // Main spot
      ctx.beginPath();
      ctx.arc(p.x, p.y, spotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80, 180, 220, ${alpha})`;
      ctx.fill();

      // Glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, spotSize * 4);
      glow.addColorStop(0, `rgba(80, 180, 220, ${alpha * 0.4})`);
      glow.addColorStop(1, 'rgba(80, 180, 220, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, spotSize * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Texture/detail lines along the flesh
    ctx.strokeStyle = 'rgba(40, 10, 20, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 4; i < points.length - 4; i += 6) {
      const p = points[i];
      if (p.x < 0 || p.x > width) continue;

      const dx = points[i + 1].x - points[i - 1].x;
      const dy = points[i + 1].y - points[i - 1].y;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(
        p.x + Math.cos(angle) * p.thickness * 0.4,
        p.y + Math.sin(angle) * p.thickness * 0.4
      );
      ctx.lineTo(
        p.x - Math.cos(angle) * p.thickness * 0.4,
        p.y - Math.sin(angle) * p.thickness * 0.4
      );
      ctx.stroke();
    }
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();
    const cursor = this.getCursorPos();

    // Dark abyss background
    ctx.fillStyle = '#020306';
    ctx.fillRect(0, 0, width, height);

    // Subtle blue depth gradient
    const depthGrad = ctx.createLinearGradient(0, 0, 0, height);
    depthGrad.addColorStop(0, 'rgba(5, 15, 30, 0.4)');
    depthGrad.addColorStop(1, 'rgba(0, 5, 15, 0.2)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw particles (marine snow)
    for (const p of this.particles) {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }

      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 180, 200, ${p.alpha})`;
      ctx.fill();
    }

    // ROV light follows cursor
    if (cursor.isOver && cursor.x > 0 && cursor.x < width) {
      const lightGrad = ctx.createRadialGradient(
        cursor.x, cursor.y, 0,
        cursor.x, cursor.y, 180
      );
      lightGrad.addColorStop(0, 'rgba(200, 220, 255, 0.12)');
      lightGrad.addColorStop(0.5, 'rgba(150, 180, 220, 0.04)');
      lightGrad.addColorStop(1, 'rgba(100, 150, 200, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 180, 0, Math.PI * 2);
      ctx.fill();
    }

    // Animate tentacle progress (slowly drags across)
    if (this.time > 1000) {
      this.tentacle.progress = Math.min((this.time - 1000) / 12000, 1.2);
    }

    // Draw the massive tentacle
    this.drawMassiveTentacle(ctx, width, height);

    // Heavy vignette for depth
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.2,
      width / 2, height / 2, height * 0.9
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    this.time += 16;
  }
}

export const giantSquid = new GiantSquidScene();
