/**
 * Wall Scene
 *
 * Encounter with a massive organic surface covered in watching eyes.
 * The wall is generated using simplex noise and Bezier curves to create
 * an organic, living appearance. Eyes track the cursor (ROV light),
 * opening when illuminated and closing in darkness.
 *
 * Features:
 * - Organic surface with simplex noise for texture
 * - Bezier curve "veins" with variable thickness
 * - Light-responsive subsurface scattering
 * - 12 eyes scattered across surface
 * - Eye tracking: Pupils follow cursor position
 * - Illumination response: Eyes brighten and dilate when lit
 * - Pupil morphing: Round in darkness, slit when illuminated
 * - Blinking animation with random timing
 * - Sparse particle system
 * - Multi-layer spotlight effect
 * - Heavy vignette for atmospheric depth
 *
 * Usage:
 * ```typescript
 * const scene = scenes.deepSea.wall;
 * await scene.init(canvas, { intensity: 0.8, duration: Infinity });
 * // ... later ...
 * scene.cleanup();
 * ```
 */

import { BaseCanvasScene } from '../../base-scene';
import { SceneConfig } from '../../types';

interface Eye {
  x: number;
  y: number;
  size: number;
  openness: number;
  awareness: number;
  blinkTimer: number;
  isBlinking: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export class WallScene extends BaseCanvasScene {
  name = 'The Wall';
  description = 'A massive organic surface covered in watching eyes';

  defaultConfig: SceneConfig = {
    intensity: 0.8,
    duration: Infinity,
  };

  private time = 0;
  private eyes: Eye[] = [];
  private particles: Particle[] = [];
  private mottledBase: HTMLCanvasElement | null = null;

  // Timing multipliers
  private readonly timing = {
    glacial: 0.0008,
    verySlow: 0.001,
    slow: 0.002,
    medium: 0.003,
  };

  private readonly palette = {
    base: { r: 28, g: 22, b: 26 },
    mid: { r: 38, g: 30, b: 35 },
    highlight: { r: 58, g: 48, b: 52 },
    shadow: { r: 18, g: 14, b: 18 },
    vein: { r: 50, g: 28, b: 35 },
    veinHighlight: { r: 85, g: 50, b: 55 },
  };

  // Simplex noise constants
  private readonly F2 = 0.5 * (Math.sqrt(3) - 1);
  private readonly G2 = (3 - Math.sqrt(3)) / 6;
  private readonly grad3 = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
  private perm: number[] = [];

  protected async onInit(): Promise<void> {
    // Initialize permutation array for simplex noise
    this.perm = this.createPerm(42);

    // Initialize eyes scattered across wall
    this.eyes = [];
    for (let i = 0; i < 12; i++) {
      this.eyes.push({
        x: Math.random() * 0.85 + 0.075,
        y: Math.random() * 0.85 + 0.075,
        size: 5 + Math.random() * 12,
        openness: 0,
        awareness: 100 + Math.random() * 120,
        blinkTimer: Math.random() * 500,
        isBlinking: false,
      });
    }

    // Initialize sparse particles
    this.particles = [];
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.002 + 0.001,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }
  }

  protected onCanvasResize(): void {
    // Reset mottled base on resize so it's regenerated with new dimensions
    this.mottledBase = null;
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();
    const w = width;
    const h = height;

    // Get cursor position from CursorManager if available
    const cursor = this.cursorManager ? this.cursorManager.getPosition() : { x: -1000, y: -1000 };
    const light = {
      x: cursor.x >= 0 && cursor.x <= w ? cursor.x : -1000,
      y: cursor.y >= 0 && cursor.y <= h ? cursor.y : -1000,
    };

    // Draw organic surface
    this.drawOrganicSurface(ctx, w, h, {
      lightX: light.x,
      lightY: light.y,
      time: this.time,
    });

    // Player light (ROV spotlight)
    if (light.x > 0 && light.x < w) {
      // Multiple concentric glows for soft falloff
      for (let i = 5; i >= 1; i--) {
        const layerRadius = 150 * (i / 2);
        const alpha = 0.12 / i;
        const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, layerRadius);
        grad.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
        grad.addColorStop(0.5, `rgba(100, 180, 220, ${alpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright core
      const core = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 15);
      core.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      core.addColorStop(0.5, 'rgba(200, 240, 255, 0.5)');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(light.x, light.y, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update and draw eyes
    for (const eye of this.eyes) {
      const eyeX = eye.x * w;
      const eyeY = eye.y * h;

      // Calculate illumination based on distance to light
      let illumination = 0;
      if (light.x > 0) {
        const dx = light.x - eyeX;
        const dy = light.y - eyeY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < eye.awareness) {
          illumination = 1 - dist / eye.awareness;
          illumination = illumination * illumination; // exponential falloff
        }
      }

      // Eye opens when illuminated, closes in darkness
      const targetOpenness = illumination > 0.1 ? Math.min(illumination * 1.5, 1) : 0;
      eye.openness += (targetOpenness - eye.openness) * 0.05; // smooth transition

      // Occasional blink when open
      if (eye.openness > 0.5) {
        eye.blinkTimer++;
        if (eye.blinkTimer > 200 && Math.random() < 0.008) {
          eye.isBlinking = true;
          setTimeout(() => {
            eye.isBlinking = false;
          }, 120);
          eye.blinkTimer = 0;
        }
      }

      const displayOpenness = eye.isBlinking ? eye.openness * 0.1 : eye.openness;

      this.drawTrackingEye(ctx, eyeX, eyeY, eye.size, light.x, light.y, illumination, displayOpenness);
    }

    // Sparse particles
    for (const p of this.particles) {
      p.y += p.speed;
      p.x += Math.sin(this.time * this.timing.verySlow + p.y * 10) * 0.0005;
      if (p.y > 1.05) {
        p.y = -0.05;
        p.x = Math.random();
      }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 180, 200, ${p.alpha})`;
      ctx.fill();
    }

    // Heavy vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    this.time += 16;
  }

  protected onCleanup(): void {
    // Cleanup handled by AnimationLoop and ResponsiveCanvas
  }

  // === PRIVATE HELPER METHODS ===

  private createPerm(seed: number): number[] {
    const perm = Array.from({ length: 256 }, (_, i) => i);
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return [...perm, ...perm];
  }

  private simplex2D(x: number, y: number): number {
    const s = (x + y) * this.F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * this.G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + this.G2;
    const y1 = y0 - j1 + this.G2;
    const x2 = x0 - 1 + 2 * this.G2;
    const y2 = y0 - 1 + 2 * this.G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.perm[ii + this.perm[jj]] % 8;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 8;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 8;
    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * (this.grad3[gi0][0] * x0 + this.grad3[gi0][1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * (this.grad3[gi1][0] * x1 + this.grad3[gi1][1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * (this.grad3[gi2][0] * x2 + this.grad3[gi2][1] * y2);
    }
    return 70 * (n0 + n1 + n2);
  }

  private fbm(x: number, y: number, octaves = 4): number {
    let value = 0;
    let amp = 0.5;
    let freq = 1;
    let maxVal = 0;
    for (let i = 0; i < octaves; i++) {
      value += amp * this.simplex2D(x * freq, y * freq);
      maxVal += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return value / maxVal;
  }

  private drawOrganicSurface(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    options: { lightX: number; lightY: number; time: number }
  ) {
    const { lightX, lightY, time } = options;

    // 1. MOTTLED BASE - per-pixel noise (render once, reuse)
    if (!this.mottledBase || this.mottledBase.width !== w || this.mottledBase.height !== h) {
      this.mottledBase = document.createElement('canvas');
      this.mottledBase.width = w;
      this.mottledBase.height = h;
      const mCtx = this.mottledBase.getContext('2d')!;
      const imageData = mCtx.createImageData(w, h);
      const data = imageData.data;
      const scale = 0.008;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n1 = this.fbm(x * scale, y * scale, 4);
          const n2 = this.fbm(x * scale * 2 + 100, y * scale * 2 + 100, 3);
          const blend = (n1 + 1) / 2;
          const detail = (n2 + 1) / 2;

          let r: number;
          let g: number;
          let b: number;
          if (blend < 0.4) {
            const t = blend / 0.4;
            r = this.palette.shadow.r + (this.palette.base.r - this.palette.shadow.r) * t;
            g = this.palette.shadow.g + (this.palette.base.g - this.palette.shadow.g) * t;
            b = this.palette.shadow.b + (this.palette.base.b - this.palette.shadow.b) * t;
          } else if (blend < 0.7) {
            const t = (blend - 0.4) / 0.3;
            r = this.palette.base.r + (this.palette.mid.r - this.palette.base.r) * t;
            g = this.palette.base.g + (this.palette.mid.g - this.palette.base.g) * t;
            b = this.palette.base.b + (this.palette.mid.b - this.palette.base.b) * t;
          } else {
            const t = (blend - 0.7) / 0.3;
            r = this.palette.mid.r + (this.palette.highlight.r - this.palette.mid.r) * t * 0.3;
            g = this.palette.mid.g + (this.palette.highlight.g - this.palette.mid.g) * t * 0.3;
            b = this.palette.mid.b + (this.palette.highlight.b - this.palette.mid.b) * t * 0.3;
          }

          r += (detail - 0.5) * 10;
          g += (detail - 0.5) * 8;
          b += (detail - 0.5) * 10;

          const idx = (y * w + x) * 4;
          data[idx] = Math.max(0, Math.min(255, r));
          data[idx + 1] = Math.max(0, Math.min(255, g));
          data[idx + 2] = Math.max(0, Math.min(255, b));
          data[idx + 3] = 255;
        }
      }
      mCtx.putImageData(imageData, 0, 0);
    }
    ctx.drawImage(this.mottledBase, 0, 0);

    // 2. BEZIER VEINS with varied thickness
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let v = 0; v < 6; v++) {
      const edge = Math.floor((this.simplex2D(v * 100, 0) + 1) * 2) % 4;
      const edgePos = (this.simplex2D(v * 50, v * 50) + 1) / 2;
      let x: number;
      let y: number;
      let angle: number;

      switch (edge) {
        case 0:
          x = edgePos * w;
          y = -20;
          angle = Math.PI / 2 + this.simplex2D(v * 30, 0) * 0.4;
          break;
        case 1:
          x = w + 20;
          y = edgePos * h;
          angle = Math.PI + this.simplex2D(v * 30, 100) * 0.4;
          break;
        case 2:
          x = edgePos * w;
          y = h + 20;
          angle = -Math.PI / 2 + this.simplex2D(v * 30, 200) * 0.4;
          break;
        default:
          x = -20;
          y = edgePos * h;
          angle = this.simplex2D(v * 30, 300) * 0.4;
      }

      // Generate vein path
      let thickness = 5 + Math.abs(this.simplex2D(v * 20, v * 20)) * 4;
      const points: Array<{ x: number; y: number; t: number }> = [{ x, y, t: thickness }];

      for (let i = 0; i < 12; i++) {
        const angleNoise = this.simplex2D(v * 1000 + i * 10, 0) * 0.5;
        angle += angleNoise;
        const segLen = 25 + this.simplex2D(v * 1000 + i * 20, 0) * 15;
        const pulse = Math.sin(time * 0.002 + i * 0.5) * 2;

        x += Math.cos(angle) * segLen;
        y += Math.sin(angle) * segLen + pulse;

        const thickNoise = this.simplex2D(v * 1000 + i * 15, 500);
        thickness *= 0.92 + thickNoise * 0.1;
        if (thickNoise > 0.6) thickness *= 1.15;

        points.push({ x, y, t: Math.max(0.5, thickness) });
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) break;
      }

      // Draw with bezier curves
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        const avgT = (p1.t + p2.t) / 2;

        // Shadow
        ctx.strokeStyle = `rgba(${this.palette.shadow.r}, ${this.palette.shadow.g}, ${this.palette.shadow.b}, 0.4)`;
        ctx.lineWidth = avgT + 2;
        ctx.beginPath();
        ctx.moveTo(p1.x + 1, p1.y + 1);
        ctx.bezierCurveTo(cp1x + 1, cp1y + 1, cp2x + 1, cp2y + 1, p2.x + 1, p2.y + 1);
        ctx.stroke();

        // Main vein
        ctx.strokeStyle = `rgba(${this.palette.vein.r}, ${this.palette.vein.g}, ${this.palette.vein.b}, 0.7)`;
        ctx.lineWidth = avgT;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        ctx.stroke();

        // Highlight
        ctx.strokeStyle = `rgba(${this.palette.veinHighlight.r}, ${this.palette.veinHighlight.g}, ${this.palette.veinHighlight.b}, 0.25)`;
        ctx.lineWidth = avgT * 0.4;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y - avgT * 0.25);
        ctx.bezierCurveTo(cp1x, cp1y - avgT * 0.25, cp2x, cp2y - avgT * 0.25, p2.x, p2.y - avgT * 0.25);
        ctx.stroke();
      }
    }

    // 3. LIGHT RESPONSE - subsurface scattering
    if (lightX > 0 && lightY > 0) {
      const scatter = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 200);
      scatter.addColorStop(
        0,
        `rgba(${this.palette.veinHighlight.r + 20}, ${this.palette.veinHighlight.g}, ${this.palette.veinHighlight.b - 10}, 0.15)`
      );
      scatter.addColorStop(0.3, `rgba(${this.palette.vein.r + 15}, ${this.palette.vein.g}, ${this.palette.vein.b}, 0.1)`);
      scatter.addColorStop(0.6, `rgba(${this.palette.mid.r + 10}, ${this.palette.mid.g + 5}, ${this.palette.mid.b + 5}, 0.05)`);
      scatter.addColorStop(1, 'transparent');
      ctx.fillStyle = scatter;
      ctx.fillRect(0, 0, w, h);

      const highlight = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 100);
      highlight.addColorStop(
        0,
        `rgba(${this.palette.highlight.r + 40}, ${this.palette.highlight.g + 35}, ${this.palette.highlight.b + 30}, 0.2)`
      );
      highlight.addColorStop(0.5, `rgba(${this.palette.highlight.r + 20}, ${this.palette.highlight.g + 15}, ${this.palette.highlight.b + 10}, 0.08)`);
      highlight.addColorStop(1, 'transparent');
      ctx.fillStyle = highlight;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawTrackingEye(
    ctx: CanvasRenderingContext2D,
    eyeX: number,
    eyeY: number,
    eyeSize: number,
    targetX: number,
    targetY: number,
    illumination: number,
    openness: number
  ) {
    if (openness < 0.05) return; // Too closed to see

    const actualSize = eyeSize * openness;

    // Eye socket glow - brighter when illuminated
    const glowSize = (30 + illumination * 30) * openness;
    const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, glowSize);
    const r = 180 + illumination * 75;
    const g = 60 + illumination * 40;
    const b = 60 + illumination * 20;
    eyeGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.8 * openness})`);
    eyeGlow.addColorStop(0.5, `rgba(${120 + illumination * 60}, 40, 40, ${0.3 * openness})`);
    eyeGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Eye core
    ctx.fillStyle = `rgba(${200 + illumination * 55}, ${80 + illumination * 80}, ${60 + illumination * 40}, ${openness})`;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, actualSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupil - tracks the light
    const dx = targetX - eyeX;
    const dy = targetY - eyeY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pupilOffsetX = dist > 0 ? (dx / dist) * actualSize * 0.3 : 0;
    const pupilOffsetY = dist > 0 ? (dy / dist) * actualSize * 0.3 : 0;

    ctx.fillStyle = `rgba(10, 0, 0, ${openness})`;
    ctx.beginPath();

    if (illumination > 0.4) {
      // Slit pupil when bright light
      ctx.ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 2 * openness, actualSize * 0.7, 0, 0, Math.PI * 2);
    } else {
      // Round pupil in dimness
      ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, (4 - illumination * 2) * openness, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

export const wall = new WallScene();
