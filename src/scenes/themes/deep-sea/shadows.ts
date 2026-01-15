/**
 * Shadows Scene - Jellyfish-like creatures drifting in the deep
 *
 * A passive, atmospheric scene featuring jellyfish-like shadow creatures
 * that drift slowly through the water with gentle pulsing animations.
 * Optional cursor tracking for light illumination effect.
 *
 * Features:
 * - 4-7 jellyfish-like creatures with individual movement
 * - Gentle drifting physics with slow velocity changes
 * - Pulsing bell animation
 * - Tentacle animation with wave effects
 * - Optional light illumination from cursor
 * - Marine snow particles for atmospheric effect
 * - Vignette edge darkening
 */

import { BaseCanvasScene } from '../../base-scene';
import type { SceneConfig, CursorPos } from '../../types';

interface Shadow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  bellSize: number;
  tentacleCount: number;
  angle: number;
  angleSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
  timeOffset: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export class ShadowsScene extends BaseCanvasScene {
  name = 'Shadows';
  description = 'Jellyfish-like creatures drifting in the deep';
  defaultConfig: Partial<SceneConfig> = {
    intensity: 0.5,
    scale: 1,
    duration: Infinity
  };

  private shadows: Shadow[] = [];
  private particles: Particle[] = [];
  private time = 0;
  private lastW = 0;
  private lastH = 0;

  protected async onInit(): Promise<void> {
    // Enable cursor tracking for light illumination effect
    this.startCursorTracking();

    // Initialize marine snow particles
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.5 + Math.random() * 1.5,
        speed: 0.0005 + Math.random() * 0.001,
        alpha: 0.1 + Math.random() * 0.2,
      });
    }

    // Initialize shadow creatures
    this.resizeShadows();
  }

  protected onCanvasResize(): void {
    // Trigger shadow regeneration on significant resize
    const { width, height } = this.getCanvasSize();
    if (
      this.shadows.length === 0 ||
      Math.abs(width - this.lastW) > 20 ||
      Math.abs(height - this.lastH) > 20
    ) {
      this.resizeShadows();
    }
  }

  protected onCleanup(): void {
    // Clear all arrays
    this.shadows = [];
    this.particles = [];
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();
    const cursor = this.getCursorPos();

    // Background - deep water gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0f2e');
    bgGrad.addColorStop(0.5, '#020810');
    bgGrad.addColorStop(1, '#000305');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Update and draw shadows (scene-specific)
    this.updateAndDrawShadows(ctx, width, height);

    // Player light - simple radial glow
    if (cursor.isOver) {
      const lightGrad = ctx.createRadialGradient(
        cursor.x, cursor.y, 0,
        cursor.x, cursor.y, 200
      );
      lightGrad.addColorStop(0, 'rgba(200, 240, 255, 0.3)');
      lightGrad.addColorStop(0.5, 'rgba(100, 180, 220, 0.1)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 200, 0, Math.PI * 2);
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

    // Vignette edge darkening
    const vigGrad = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.25,
      width / 2, height / 2, height * 0.85
    );
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    this.time += deltaTime;
  }

  private resizeShadows(): void {
    const { width, height } = this.getCanvasSize();

    this.shadows = [];

    // Create 4-7 aquatic shadow creatures (jellyfish-like)
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      this.shadows.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2, // SLOWER movement
        vy: (Math.random() - 0.5) * 1.5 - 0.5, // Slight upward drift
        size: 60 + Math.random() * 80, // Creature size
        bellSize: 40 + Math.random() * 50, // Jellyfish bell
        tentacleCount: 5 + Math.floor(Math.random() * 4), // 5-9 tentacles
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.03, // Slow rotation
        pulsePhase: Math.random() * Math.PI * 2, // Pulsing animation
        pulseSpeed: 0.5 + Math.random() * 0.5,
        timeOffset: Math.random() * 1000
      });
    }

    this.lastW = width;
    this.lastH = height;
  }

  private calculateIllumination(
    shadowX: number,
    shadowY: number,
    cursor: CursorPos
  ): number {
    if (!cursor.isOver) {
      return 0;
    }

    const dx = shadowX - cursor.x;
    const dy = shadowY - cursor.y;
    const distToLightSq = dx * dx + dy * dy;
    const lightRadius = 200;
    const lightRadiusSq = lightRadius * lightRadius;

    // Softer, more gradual falloff
    if (distToLightSq < lightRadiusSq) {
      return Math.pow(1 - Math.sqrt(distToLightSq) / lightRadius, 2.5);
    }
    return 0;
  }

  private updateAndDrawShadows(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    const cursor = this.getCursorPos();

    // Update shadows
    for (const shadow of this.shadows) {
      // Slow, drifting movement
      shadow.x += shadow.vx;
      shadow.y += shadow.vy;
      shadow.angle += shadow.angleSpeed;

      // Gentle pulsing (jellyfish-like)
      shadow.pulsePhase += shadow.pulseSpeed * 0.01;

      // Occasional gentle direction changes (not frantic)
      if (Math.random() < 0.01) {
        shadow.vx += (Math.random() - 0.5) * 0.5;
        shadow.vy += (Math.random() - 0.5) * 0.3;
      }

      // Wrap around edges
      if (shadow.x < -shadow.size * 2) {
        shadow.x = width + shadow.size;
      }
      if (shadow.x > width + shadow.size * 2) {
        shadow.x = -shadow.size;
      }
      if (shadow.y < -shadow.size * 2) {
        shadow.y = height + shadow.size;
      }
      if (shadow.y > height + shadow.size * 2) {
        shadow.y = -shadow.size;
      }

      // Limit max speed (slow)
      const speed = Math.sqrt(shadow.vx ** 2 + shadow.vy ** 2);
      if (speed > 3) {
        shadow.vx = (shadow.vx / speed) * 3;
        shadow.vy = (shadow.vy / speed) * 3;
      }

      // Gentle friction
      shadow.vx *= 0.995;
      shadow.vy *= 0.995;
    }

    // Draw shadows
    for (const shadow of this.shadows) {
      ctx.save();

      const t = this.time * 0.001 + shadow.timeOffset;
      const pulse = Math.sin(shadow.pulsePhase) * 0.15 + 1; // Pulsing bell
      const bellSize = shadow.bellSize * pulse;

      ctx.translate(shadow.x, shadow.y);
      ctx.rotate(shadow.angle);

      // Draw jellyfish bell (umbrella-shaped top)
      ctx.beginPath();
      const bellSegments = 12;
      for (let i = 0; i <= bellSegments; i++) {
        const angle = (i / bellSegments) * Math.PI * 2;
        const radius =
          bellSize * (0.7 + Math.sin(angle * 3 + t) * 0.1); // Slight waviness
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius - bellSize * 0.3; // Positioned above center
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Calculate illumination from light source
      const illumination = this.calculateIllumination(
        shadow.x,
        shadow.y,
        cursor
      );

      // Fill bell
      const baseAlpha = 0.8;
      const litAlpha = baseAlpha + illumination * 0.08;
      ctx.fillStyle = `rgba(5, 3, 8, ${litAlpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      // Draw tentacles hanging down from bell
      const tentacleLength = shadow.size * 1.5;
      for (let i = 0; i < shadow.tentacleCount; i++) {
        const tentacleAngle = (i / shadow.tentacleCount) * Math.PI * 2;
        const startX = Math.cos(tentacleAngle) * bellSize * 0.6;
        const startY = Math.sin(tentacleAngle) * bellSize * 0.3;

        // Build tentacle path points
        const tentacleSegments = 8;
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        for (let j = 1; j <= tentacleSegments; j++) {
          const t_tent = j / tentacleSegments;
          const x =
            startX + Math.sin(t * 1.5 + i + t_tent * 2) * bellSize * 0.15;
          const y =
            startY +
            t_tent * tentacleLength +
            Math.sin(t * 2 + i * 2 + t_tent * 3) * bellSize * 0.1;
          ctx.lineTo(x, y);
        }

        // Draw tentacle with same illumination as bell
        const tentacleBaseAlpha = 0.8;
        const tentacleAlpha = tentacleBaseAlpha + illumination * 0.08;
        ctx.strokeStyle = `rgba(5, 3, 8, ${tentacleAlpha})`;
        ctx.lineWidth = bellSize * 0.1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.stroke();
      }

      ctx.restore();
    }
  }

}

// Export instance for convenience
export const shadows = new ShadowsScene();
