/**
 * Leviathan Scene
 *
 * Encounter with a massive, ancient creature revealed by light.
 * The leviathan's eye reacts to cursor position (ROV light). The creature
 * reveals detail only when illuminated - a second eye, surface scarring,
 * and bonus bioluminescent spots appear as you shine light on it.
 *
 * Features:
 * - Eye tracking that responds to light proximity
 * - Pupil dilation (round) and contraction (slit) based on illumination
 * - Light-responsive body details (scarring, secondary eye)
 * - Bioluminescent spots that increase with illumination
 * - Small seeker creatures attracted to the light
 * - Atmospheric cursor-based light beam
 *
 * Usage:
 * ```typescript
 * const scene = scenes.deepSea.leviathan;
 * await scene.init(canvas, { intensity: 0.8, duration: Infinity });
 * // ... later ...
 * scene.cleanup();
 * ```
 */

import { BaseCanvasScene } from '../../base-scene';
import { SceneConfig } from '../../types';

interface Seeker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  glow: number;
}

interface Leviathan {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  size: number;
  opacity: number;
  active: boolean;
  direction: number;
}

export class LeviathanScene extends BaseCanvasScene {
  name = 'Leviathan';
  description = 'Encounter with a massive, ancient creature';

  defaultConfig: SceneConfig = {
    intensity: 0.8,
    duration: Infinity,
  };

  private time = 0;
  private leviathan: Leviathan = {
    x: -400,
    y: 0,
    targetY: 0,
    speed: 1.5,
    size: 280,
    opacity: 0,
    active: true,
    direction: 1,
  };
  private seekers: Seeker[] = [];

  protected async onInit(): Promise<void> {
    // Initialize seekers (small bioluminescent creatures)
    this.seekers = [];
    for (let i = 0; i < 15; i++) {
      this.seekers.push({
        x: Math.random() * 600,
        y: Math.random() * 400,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 3,
        glow: 0.3 + Math.random() * 0.4,
      });
    }

    // Initialize leviathan position
    this.leviathan.y = this.canvas!.height * 0.5;
    this.leviathan.targetY = this.leviathan.y + (Math.random() - 0.5) * 50;
  }

  protected onCanvasResize(): void {
    // Update leviathan vertical position on resize
    this.leviathan.y = this.canvas!.height * 0.5;
    this.leviathan.targetY = this.leviathan.y + (Math.random() - 0.5) * 50;
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const width = this.canvas!.width / window.devicePixelRatio;
    const height = this.canvas!.height / window.devicePixelRatio;

    // Clear with dark background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Get mouse/cursor position from CursorManager if available
    const mouse = this.cursorManager ? this.cursorManager.getPosition() : { x: -1000, y: -1000 };
    const mouseInCanvas = mouse.x >= 0 && mouse.x <= width && mouse.y >= 0 && mouse.y <= height;
    const cursorX = mouseInCanvas ? mouse.x : -1000;
    const cursorY = mouseInCanvas ? mouse.y : -1000;

    // Draw seekers (small bioluminescent creatures)
    this.seekers.forEach((seeker) => {
      // Drift slowly
      seeker.x += seeker.vx;
      seeker.y += seeker.vy;
      seeker.vx *= 0.98;
      seeker.vy *= 0.98;
      seeker.vx += (Math.random() - 0.5) * 0.1;
      seeker.vy += (Math.random() - 0.5) * 0.1;

      // ATTRACTED to light (cursor)
      if (cursorX > 0) {
        const toLight = { x: cursorX - seeker.x, y: cursorY - seeker.y };
        const lightDist = Math.sqrt(toLight.x * toLight.x + toLight.y * toLight.y);
        if (lightDist < 200 && lightDist > 0) {
          const attraction = (1 - lightDist / 200) * 0.3;
          seeker.vx += (toLight.x / lightDist) * attraction;
          seeker.vy += (toLight.y / lightDist) * attraction;
          seeker.glow = Math.min(1, seeker.glow + 0.02);
        }
      }

      // Wrap around
      if (seeker.x < 0) seeker.x = width;
      if (seeker.x > width) seeker.x = 0;
      if (seeker.y < 0) seeker.y = height;
      if (seeker.y > height) seeker.y = 0;

      // Flee from leviathan (overrides light attraction)
      const dx = seeker.x - this.leviathan.x;
      const dy = seeker.y - this.leviathan.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.leviathan.size * 1.5 && dist > 0) {
        const force = (1 - dist / (this.leviathan.size * 1.5)) * 3;
        seeker.vx += (dx / dist) * force;
        seeker.vy += (dy / dist) * force;
        seeker.glow = Math.min(1, seeker.glow + 0.1); // Light up in fear
      }
      seeker.glow = Math.max(0.3, seeker.glow - 0.01);

      // Draw seeker
      const grad = ctx.createRadialGradient(
        seeker.x, seeker.y, 0,
        seeker.x, seeker.y, seeker.size * 4
      );
      grad.addColorStop(0, `rgba(100, 200, 220, ${seeker.glow})`);
      grad.addColorStop(0.5, `rgba(60, 150, 180, ${seeker.glow * 0.3})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(seeker.x, seeker.y, seeker.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // LEVIATHAN
    if (this.leviathan.active) {
      this.leviathan.x += this.leviathan.speed * this.leviathan.direction;
      this.leviathan.y += (this.leviathan.targetY - this.leviathan.y) * 0.01;

      // Opacity based on position
      const distFromEdge = Math.min(
        this.leviathan.x + 300,
        width - this.leviathan.x + 400
      );
      this.leviathan.opacity = Math.min(0.8, distFromEdge / 500);

      // How close is the light to the leviathan?
      const lightToLevX = cursorX - this.leviathan.x;
      const lightToLevY = cursorY - this.leviathan.y;
      const lightToLevDist = Math.sqrt(lightToLevX * lightToLevX + lightToLevY * lightToLevY);
      const illumination = cursorX > 0
        ? Math.max(0, 1 - lightToLevDist / (this.leviathan.size * 1.5))
        : 0;

      ctx.save();

      // Darker area around leviathan
      const blockRadius = this.leviathan.size * 1.8;
      const blockGrad = ctx.createRadialGradient(
        this.leviathan.x, this.leviathan.y, this.leviathan.size * 0.5,
        this.leviathan.x, this.leviathan.y, blockRadius
      );
      blockGrad.addColorStop(0, `rgba(0, 0, 0, ${this.leviathan.opacity * 0.8})`);
      blockGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = blockGrad;
      ctx.beginPath();
      ctx.arc(this.leviathan.x, this.leviathan.y, blockRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main body - reveals color when illuminated
      ctx.globalAlpha = this.leviathan.opacity;
      const bodyColor =
        illumination > 0.1
          ? `rgb(${15 + illumination * 25}, ${12 + illumination * 18}, ${20 + illumination * 25})`
          : '#050308';
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(this.leviathan.x, this.leviathan.y, this.leviathan.size, this.leviathan.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // REVEALED BY LIGHT: Surface texture / scarring
      if (illumination > 0.2) {
        ctx.globalAlpha = this.leviathan.opacity * illumination * 0.6;
        for (let i = 0; i < 8; i++) {
          const ridgeX = this.leviathan.x - this.leviathan.size * 0.6 + i * this.leviathan.size * 0.18;
          const ridgeY = this.leviathan.y;
          ctx.strokeStyle = `rgba(60, 50, 70, ${illumination})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ridgeX, ridgeY, 8, this.leviathan.size * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = this.leviathan.opacity;
      }

      // Trailing tail
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(this.leviathan.x - this.leviathan.direction * this.leviathan.size, this.leviathan.y);
      ctx.quadraticCurveTo(
        this.leviathan.x - this.leviathan.direction * this.leviathan.size * 1.5,
        this.leviathan.y + Math.sin(this.time * 0.003) * 30,
        this.leviathan.x - this.leviathan.direction * this.leviathan.size * 2.2,
        this.leviathan.y + Math.sin(this.time * 0.002) * 50
      );
      ctx.quadraticCurveTo(
        this.leviathan.x - this.leviathan.direction * this.leviathan.size * 1.5,
        this.leviathan.y - Math.sin(this.time * 0.003) * 20,
        this.leviathan.x - this.leviathan.direction * this.leviathan.size,
        this.leviathan.y
      );
      ctx.fill();

      // Eye - REACTS to illumination
      const eyeX = this.leviathan.x + this.leviathan.direction * this.leviathan.size * 0.5;
      const eyeY = this.leviathan.y - this.leviathan.size * 0.08;
      const eyeIllumination =
        cursorX > 0
          ? Math.max(
              0,
              1 - Math.sqrt(Math.pow(cursorX - eyeX, 2) + Math.pow(cursorY - eyeY, 2)) / 200
            )
          : 0;

      // Eye gets bigger and brighter when you shine light on it
      const eyeSize = 8 + eyeIllumination * 6;
      const eyeGlowSize = 30 + eyeIllumination * 30;

      // Eye glow - intensifies with light
      const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeGlowSize);
      eyeGlow.addColorStop(
        0,
        `rgba(${180 + eyeIllumination * 75}, ${60 + eyeIllumination * 40}, ${60 + eyeIllumination * 20}, ${
          this.leviathan.opacity * (0.8 + eyeIllumination * 0.2)
        })`
      );
      eyeGlow.addColorStop(
        0.5,
        `rgba(${120 + eyeIllumination * 60}, 40, 40, ${this.leviathan.opacity * (0.3 + eyeIllumination * 0.3)})`
      );
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeGlowSize, 0, Math.PI * 2);
      ctx.fill();

      // Eye core - pulses when illuminated
      const eyePulse = eyeIllumination > 0.3 ? Math.sin(this.time * 0.01) * 0.2 : 0;
      ctx.fillStyle = `rgba(${200 + eyeIllumination * 55}, ${80 + eyeIllumination * 80}, ${
        60 + eyeIllumination * 40
      }, ${this.leviathan.opacity})`;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeSize * (1 + eyePulse), 0, Math.PI * 2);
      ctx.fill();

      // Pupil - tracks the light, contracts to slit when illuminated
      const toPlayerDist = Math.sqrt(Math.pow(cursorX - eyeX, 2) + Math.pow(cursorY - eyeY, 2)) || 1;
      const pupilOffsetX = cursorX > 0 ? ((cursorX - eyeX) / toPlayerDist) * 3 : 0;
      const pupilOffsetY = cursorY > 0 ? ((cursorY - eyeY) / toPlayerDist) * 3 : 0;

      ctx.fillStyle = `rgba(10, 0, 0, ${this.leviathan.opacity})`;
      ctx.beginPath();
      if (eyeIllumination > 0.4) {
        // Slit pupil when illuminated
        ctx.ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 2, eyeSize * 0.7, 0, 0, Math.PI * 2);
      } else {
        // Round pupil in darkness
        ctx.arc(
          eyeX + pupilOffsetX,
          eyeY + pupilOffsetY,
          4 - eyeIllumination * 2,
          0,
          Math.PI * 2
        );
      }
      ctx.fill();

      // REVEALED BY LIGHT: Second eye
      if (illumination > 0.4) {
        const eye2X = this.leviathan.x + this.leviathan.direction * this.leviathan.size * 0.3;
        const eye2Y = this.leviathan.y + this.leviathan.size * 0.12;
        const eye2Vis = (illumination - 0.4) * 1.6;

        const eye2Glow = ctx.createRadialGradient(eye2X, eye2Y, 0, eye2X, eye2Y, 20);
        eye2Glow.addColorStop(0, `rgba(180, 60, 60, ${this.leviathan.opacity * eye2Vis * 0.6})`);
        eye2Glow.addColorStop(1, 'transparent');
        ctx.fillStyle = eye2Glow;
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(200, 80, 60, ${this.leviathan.opacity * eye2Vis})`;
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bioluminescent spots along body
      const baseSpotCount = 6;
      const bonusSpots = Math.floor(illumination * 8);
      for (let i = 0; i < baseSpotCount + bonusSpots; i++) {
        const isBonus = i >= baseSpotCount;
        const spotX =
          this.leviathan.x - this.leviathan.direction * (this.leviathan.size * 0.3 + ((i % 8) * this.leviathan.size * 0.25));
        const spotY =
          this.leviathan.y +
          Math.sin(i * 1.5 + this.time * 0.002) * (this.leviathan.size * 0.15) +
          (isBonus ? ((i % 2 ? -1 : 1) * this.leviathan.size * 0.2) : 0);
        const spotSize = 4 + Math.sin(this.time * 0.005 + i) * 2;
        const spotAlpha = isBonus ? illumination * 0.8 : 1;

        const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize * 3);
        spotGrad.addColorStop(0, `rgba(80, 180, 200, ${this.leviathan.opacity * 0.6 * spotAlpha})`);
        spotGrad.addColorStop(0.5, `rgba(60, 140, 160, ${this.leviathan.opacity * 0.2 * spotAlpha})`);
        spotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Reset when offscreen and loop
      if (this.leviathan.x > width + this.leviathan.size * 2.5) {
        this.leviathan.x = -this.leviathan.size * 2;
        this.leviathan.y = height * 0.3 + Math.random() * height * 0.4;
        this.leviathan.targetY = this.leviathan.y + (Math.random() - 0.5) * 80;
        this.leviathan.speed = 1.2 + Math.random() * 1;
      }
    }

    // LIGHT SOURCE (cursor) - draw last so it's on top
    if (cursorX > 0) {
      const lightRadius = 120;
      const lightGrad = ctx.createRadialGradient(
        cursorX, cursorY, 0,
        cursorX, cursorY, lightRadius
      );
      lightGrad.addColorStop(0, 'rgba(200, 220, 255, 0.15)');
      lightGrad.addColorStop(0.3, 'rgba(150, 180, 220, 0.08)');
      lightGrad.addColorStop(0.6, 'rgba(100, 140, 180, 0.03)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, lightRadius, 0, Math.PI * 2);
      ctx.fill();

      // Small bright core
      const coreGrad = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 8);
      coreGrad.addColorStop(0, 'rgba(220, 240, 255, 0.4)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.2,
      width / 2, height / 2, height
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    this.time += 16;
  }

  protected onCleanup(): void {
    // Cleanup handled by AnimationLoop and ResponsiveCanvas
  }
}

export const leviathan = new LeviathanScene();
