/**
 * ROV Exterior Scene
 *
 * External camera feed showing the ROV Nereid viewed from support vessel cameras.
 * Renders mechanical ROV with detailed components: body, thrusters, lights, manipulator arm.
 * Features organic drift, light glows, tether wobble, and subtle caustics.
 *
 * Usage:
 * ```typescript
 * const scene = scenes.deepSea.rovExterior;
 * await scene.init(canvas, { intensity: 0.7, duration: Infinity });
 * // ... later ...
 * scene.cleanup();
 * ```
 */

import { BaseCanvasScene } from '../../base-scene';
import { SceneConfig, Particle } from '../../types';

interface Particle3D {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export class ROVExteriorScene extends BaseCanvasScene {
  name = 'ROV Exterior';
  description = 'External camera - ROV Nereid descent';

  defaultConfig: SceneConfig = {
    intensity: 0.7,
    duration: Infinity,
  };

  private time = 0;
  private particles: Particle3D[] = [];

  // Timing multipliers (slower = more premium)
  private readonly timing = {
    glacial: 0.0008,  // ROV rotation
    verySlow: 0.001,  // drift
    slow: 0.002,      // light pulse
  };

  // Color palettes from toolkit
  private readonly deepSea = {
    surface: '#020810',
    mid: '#051018',
    deep: '#020a12',
    abyss: '#010508',
  };

  private readonly materials = {
    rovYellow: { highlight: '#e8a832', mid: '#d4942a', shadow: '#b87820', outline: '#8a5a15' },
    flotation: { fill: '#ff6b35', outline: '#cc4420' },
    metal: { light: '#666', mid: '#444', dark: '#333', darkest: '#222' },
    lens: { body: '#1a1a2e', glint: 'rgba(100, 150, 200, 0.5)' },
    panel: { line: 'rgba(100, 60, 20, 0.5)' },
  };

  // ROV state
  private readonly rov = { x: 0.5, y: 0.45 };

  protected async onInit(): Promise<void> {
    // Initialize marine snow particles (varied sizes, speeds, alphas)
    this.particles = [];
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,      // 0.5 - 2.5px varied
        speed: Math.random() * 0.008 + 0.003,
        alpha: Math.random() * 0.5 + 0.2,   // 0.2 - 0.7 varied
      });
    }
  }

  protected onCanvasResize(): void {
    // ResizeObserver handled by ResponsiveCanvas utility
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const w = this.canvas!.width / window.devicePixelRatio;
    const h = this.canvas!.height / window.devicePixelRatio;

    // Deep water background (toolkit: 4-stop gradient for depth)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, this.deepSea.surface);
    bgGrad.addColorStop(0.3, this.deepSea.mid);
    bgGrad.addColorStop(0.6, this.deepSea.deep);
    bgGrad.addColorStop(1, this.deepSea.abyss);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle caustics (very faint light from above)
    for (let i = 0; i < 3; i++) {
      const cx = (Math.sin(this.time * this.timing.glacial + i) * 0.3 + 0.5) * w;
      const cGrad = ctx.createRadialGradient(cx, h * 0.1, 0, cx, h * 0.1, 150);
      cGrad.addColorStop(0, 'rgba(100, 150, 200, 0.03)');
      cGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, w, h * 0.4);
    }

    // Marine snow (toolkit: varied properties prevent artificial look)
    for (const p of this.particles) {
      p.y -= p.speed;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 220, ${p.alpha})`;
      ctx.fill();
    }

    // ROV with organic drift
    const d = this.drift(this.time);
    const rovX = (this.rov.x + d.x) * w;
    const rovY = (this.rov.y + d.y) * h;
    this.drawROV(ctx, rovX, rovY, 1.2);

    // Light beams into darkness
    ctx.save();
    ctx.translate(rovX, rovY);
    ctx.rotate(d.rotation);

    const beamGrad = ctx.createLinearGradient(0, 50, 0, h * 0.6);
    beamGrad.addColorStop(0, 'rgba(255, 250, 230, 0.15)');
    beamGrad.addColorStop(0.5, 'rgba(200, 220, 255, 0.05)');
    beamGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-35, 50);
    ctx.lineTo(-80, h * 0.5);
    ctx.lineTo(80, h * 0.5);
    ctx.lineTo(35, 50);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Vignette (toolkit: darkens edges, focuses center)
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    this.time += 16;
  }

  protected onCleanup(): void {
    // Cleanup handled by AnimationLoop and ResponsiveCanvas
  }

  // === HELPER METHODS ===

  private drift(t: number) {
    return {
      x: Math.sin(t * this.timing.verySlow) * 0.02 + Math.sin(t * this.timing.slow) * 0.01,
      y: Math.cos(t * this.timing.verySlow * 1.1) * 0.02 + Math.cos(t * this.timing.slow * 0.9) * 0.006,
      rotation: Math.sin(t * this.timing.glacial) * 0.03,
    };
  }

  private material3D(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colors: any) {
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, colors.highlight);
    grad.addColorStop(0.5, colors.mid);
    grad.addColorStop(1, colors.shadow);
    return grad;
  }

  private drawPanelLines(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, positions: number[]) {
    ctx.strokeStyle = this.materials.panel.line;
    ctx.lineWidth = 1;
    for (const pos of positions) {
      const lineX = x + width * pos;
      ctx.beginPath();
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX, y + height);
      ctx.stroke();
    }
  }

  private drawGrille(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, lineCount: number) {
    ctx.strokeStyle = this.materials.metal.light;
    ctx.lineWidth = 2;
    const spacing = height / (lineCount + 1);
    for (let i = 1; i <= lineCount; i++) {
      const lineY = y + spacing * i;
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + width, lineY);
      ctx.stroke();
    }
  }

  private drawLens(ctx: CanvasRenderingContext2D, x: number, y: number, outerR: number, innerR: number) {
    ctx.fillStyle = this.materials.metal.darkest;
    ctx.beginPath();
    ctx.arc(x, y, outerR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.materials.lens.body;
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.materials.lens.glint;
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, innerR * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawLight(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, isOn: boolean) {
    ctx.fillStyle = this.materials.metal.mid;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (isOn) {
      const intensity = 0.8 + Math.sin(this.time * this.timing.slow) * 0.1;

      // Multi-layer glow (toolkit principle: single glow looks flat)
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 8);
      glow.addColorStop(0, `rgba(255, 250, 230, ${intensity})`);
      glow.addColorStop(0.2, `rgba(255, 240, 200, ${intensity * 0.5})`);
      glow.addColorStop(1, 'rgba(255, 240, 200, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 240, ${intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawTether(ctx: CanvasRenderingContext2D, startX: number, startY: number, endY: number, wobbleAmt: number) {
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    const midX = startX + Math.sin(this.time * this.timing.slow) * wobbleAmt;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawROV(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);

    const d = this.drift(this.time);
    ctx.rotate(d.rotation);
    ctx.scale(scale, scale);

    const bodyW = 80;
    const bodyH = 50;

    // Shadow first (toolkit: offset shadows create depth)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-bodyW / 2 + 4, -bodyH / 2 + 4, bodyW, bodyH);

    // Main body with 3D gradient
    ctx.fillStyle = this.material3D(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, this.materials.rovYellow);
    ctx.fillRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

    // Outline
    ctx.strokeStyle = this.materials.rovYellow.outline;
    ctx.lineWidth = 2;
    ctx.strokeRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

    // Panel lines
    this.drawPanelLines(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, [0.25, 0.75]);

    // Flotation foam (top)
    ctx.fillStyle = this.materials.flotation.fill;
    ctx.fillRect(-bodyW / 2 + 5, -bodyH / 2 - 15, bodyW - 10, 15);
    ctx.strokeStyle = this.materials.flotation.outline;
    ctx.strokeRect(-bodyW / 2 + 5, -bodyH / 2 - 15, bodyW - 10, 15);

    // Thrusters
    ctx.fillStyle = this.materials.metal.dark;
    ctx.fillRect(-bodyW / 2 - 15, -10, 15, 20);
    ctx.fillRect(bodyW / 2, -10, 15, 20);

    // Thruster grilles
    this.drawGrille(ctx, -bodyW / 2 - 15, -10, 15, 20, 4);
    this.drawGrille(ctx, bodyW / 2, -10, 15, 20, 4);

    // Camera lens
    this.drawLens(ctx, 0, bodyH / 2 + 10, 12, 8);

    // Lights
    this.drawLight(ctx, -25, bodyH / 2 + 5, 8, true);
    this.drawLight(ctx, 25, bodyH / 2 + 5, 8, true);

    // Manipulator arm
    ctx.strokeStyle = this.materials.metal.light;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2 + 10, bodyH / 2);
    ctx.lineTo(-bodyW / 2 + 5, bodyH / 2 + 20);
    ctx.lineTo(-bodyW / 2 + 15, bodyH / 2 + 25);
    ctx.stroke();

    // Tether
    this.drawTether(ctx, 0, -bodyH / 2 - 15, -bodyH / 2 - 100, 10);

    ctx.restore();
  }
}

export const rovExterior = new ROVExteriorScene();
