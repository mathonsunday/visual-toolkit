/**
 * RECIPES - Complete drawable objects
 * 
 * High-level functions that combine primitives into finished visuals.
 * Use these directly, or as reference for how pieces combine.
 */

import { materials } from './colors.js';
import { material3D } from './gradients.js';
import { drawPanelLines, drawGrille, drawLight, drawLens, drawTether } from './shapes.js';
import { pulse } from './motion.js';

// Local timing constants to avoid literal type issues
const TIMING = {
  glacial: 0.0008,
  verySlow: 0.001,
  slow: 0.002,
  medium: 0.003,
};

// ============================================
// ROV (Remotely Operated Vehicle)
// ============================================

export interface ROVOptions {
  /** Show ROV lights (default: true) */
  lightsOn?: boolean;
  /** Show tether going up (default: true) */
  showTether?: boolean;
  /** Show manipulator arm (default: true) */
  showArm?: boolean;
  /** Current time for animations (default: 0) */
  time?: number;
  /** Rotation angle in radians (default: 0) */
  rotation?: number;
}

/**
 * Draw a complete ROV (underwater vehicle)
 * 
 * @example
 * drawROV(ctx, canvas.width / 2, canvas.height / 2, 1.2, {
 *   lightsOn: true,
 *   time: frameCount,
 *   rotation: Math.sin(frameCount * 0.0008) * 0.03
 * });
 */
export function drawROV(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1,
  options: ROVOptions = {}
): void {
  const {
    lightsOn = true,
    showTether = true,
    showArm = true,
    time = 0,
    rotation = 0,
  } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  const bodyW = 80;
  const bodyH = 50;

  // Body shadow (offset)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(-bodyW / 2 + 4, -bodyH / 2 + 4, bodyW, bodyH);

  // Main body with 3D gradient
  ctx.fillStyle = material3D(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, materials.rovYellow);
  ctx.fillRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

  // Body outline
  ctx.strokeStyle = materials.rovYellow.outline;
  ctx.lineWidth = 2;
  ctx.strokeRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH);

  // Panel lines
  drawPanelLines(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, [0.25, 0.75]);

  // Flotation foam (top)
  ctx.fillStyle = materials.flotation.fill;
  ctx.fillRect(-bodyW / 2 + 5, -bodyH / 2 - 15, bodyW - 10, 15);
  ctx.strokeStyle = materials.flotation.outline;
  ctx.lineWidth = 1;
  ctx.strokeRect(-bodyW / 2 + 5, -bodyH / 2 - 15, bodyW - 10, 15);

  // Thrusters (sides)
  ctx.fillStyle = materials.metal.dark;
  ctx.fillRect(-bodyW / 2 - 15, -10, 15, 20);
  ctx.fillRect(bodyW / 2, -10, 15, 20);

  // Thruster grilles
  drawGrille(ctx, -bodyW / 2 - 15, -10, 15, 20, 4, materials.metal.mid);
  drawGrille(ctx, bodyW / 2, -10, 15, 20, 4, materials.metal.mid);

  // Camera pod (bottom center)
  drawLens(ctx, 0, bodyH / 2 + 10, 12, 8);

  // Lights
  if (lightsOn) {
    [-25, 25].forEach(lx => {
      drawLight(ctx, lx, bodyH / 2 + 5, 8, true, time);
    });
  } else {
    [-25, 25].forEach(lx => {
      ctx.fillStyle = materials.metal.mid;
      ctx.beginPath();
      ctx.arc(lx, bodyH / 2 + 5, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Manipulator arm (folded)
  if (showArm) {
    ctx.strokeStyle = materials.metal.mid;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2 + 10, bodyH / 2);
    ctx.lineTo(-bodyW / 2 + 5, bodyH / 2 + 20);
    ctx.lineTo(-bodyW / 2 + 15, bodyH / 2 + 25);
    ctx.stroke();
  }

  // Tether
  if (showTether) {
    drawTether(ctx, 0, -bodyH / 2 - 15, 0, -bodyH / 2 - 100, time);
  }

  ctx.restore();
}

// ============================================
// LIGHT CONE / BEAM
// ============================================

export interface LightConeOptions {
  /** Spread angle in radians (default: 0.5) */
  spread?: number;
  /** Starting opacity (default: 0.15) */
  startOpacity?: number;
  /** Color RGB (default: warm white) */
  color?: { r: number; g: number; b: number };
}

/**
 * Draw a cone of light emanating from a point
 * 
 * @example
 * drawLightCone(ctx, rov.x, rov.y + 50, Math.PI / 2, 300, {
 *   spread: 0.6,
 *   startOpacity: 0.2
 * });
 */
export function drawLightCone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  options: LightConeOptions = {}
): void {
  const {
    spread = 0.5,
    startOpacity = 0.15,
    color = { r: 255, g: 250, b: 230 },
  } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle - Math.PI / 2); // Point "forward" along angle

  // Calculate cone endpoints
  const halfSpread = spread / 2;
  const endWidth = Math.tan(halfSpread) * length;

  // Gradient from source to end
  const grad = ctx.createLinearGradient(0, 0, 0, length);
  grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${startOpacity})`);
  grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${startOpacity * 0.3})`);
  grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-10, 0); // Slight width at source
  ctx.lineTo(-endWidth, length);
  ctx.lineTo(endWidth, length);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ============================================
// JELLYFISH
// ============================================

export interface JellyfishOptions {
  /** Bell width (default: 50) */
  bellWidth?: number;
  /** Number of tentacles (default: 4) */
  tentacleCount?: number;
  /** Current time for animation */
  time?: number;
  /** Glow intensity 0-1 (default: 0.4) */
  glowIntensity?: number;
}

/**
 * Draw a complete bioluminescent jellyfish
 * 
 * @example
 * drawJellyfish(ctx, 200, 150, {
 *   bellWidth: 60,
 *   time: frameCount,
 *   glowIntensity: 0.5
 * });
 */
export function drawJellyfish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  options: JellyfishOptions = {}
): void {
  const {
    bellWidth = 50,
    tentacleCount = 4,
    time = 0,
    glowIntensity = 0.4,
  } = options;

  const bellHeight = bellWidth * 0.7;
  const pulseScale = pulse(time, TIMING.slow, 0.95, 1.05);

  ctx.save();
  ctx.translate(x, y);

  // Outer glow
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bellWidth * 1.5);
  glowGrad.addColorStop(0, `rgba(150, 200, 255, ${glowIntensity * 0.3})`);
  glowGrad.addColorStop(0.5, `rgba(150, 200, 255, ${glowIntensity * 0.1})`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, bellWidth * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Bell (dome)
  ctx.scale(pulseScale, 1 / pulseScale); // Breathing effect
  
  const bellGrad = ctx.createRadialGradient(0, -bellHeight * 0.3, 0, 0, 0, bellWidth);
  bellGrad.addColorStop(0, `rgba(180, 220, 255, ${glowIntensity})`);
  bellGrad.addColorStop(0.4, `rgba(150, 200, 255, ${glowIntensity * 0.5})`);
  bellGrad.addColorStop(0.7, `rgba(120, 180, 255, ${glowIntensity * 0.25})`);
  bellGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = bellGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, bellWidth / 2, bellHeight / 2, 0, 0, Math.PI, true);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = `rgba(200, 230, 255, ${glowIntensity * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(0, -bellHeight * 0.15, bellWidth * 0.25, bellHeight * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tentacles
  const tentacleSpacing = bellWidth / (tentacleCount + 1);
  const baseY = bellHeight * 0.3;

  for (let i = 0; i < tentacleCount; i++) {
    const tx = -bellWidth / 2 + tentacleSpacing * (i + 1);
    const tentacleLength = 40 + (i % 2) * 15;
    const wave = Math.sin(time * TIMING.slow + i * 0.8) * 5;

    const tentGrad = ctx.createLinearGradient(tx, baseY, tx + wave, baseY + tentacleLength);
    tentGrad.addColorStop(0, `rgba(150, 200, 255, ${glowIntensity * 0.5})`);
    tentGrad.addColorStop(0.5, `rgba(150, 200, 255, ${glowIntensity * 0.2})`);
    tentGrad.addColorStop(1, 'transparent');

    ctx.strokeStyle = tentGrad;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, baseY);
    ctx.quadraticCurveTo(tx + wave * 0.5, baseY + tentacleLength * 0.5, tx + wave, baseY + tentacleLength);
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================
// SPECIMEN (Mysterious creature)
// ============================================

export interface SpecimenOptions {
  /** Body width (default: 70) */
  width?: number;
  /** Current time for animation */
  time?: number;
  /** How much light is on it 0-1 (default: 0) */
  illumination?: number;
  /** Target for eye tracking */
  lookAt?: { x: number; y: number };
}

/**
 * Draw a mysterious deep-sea specimen
 * Reveals more disturbing details when illuminated
 * 
 * @example
 * drawSpecimen(ctx, 300, 200, {
 *   time: frameCount,
 *   illumination: 0.5,
 *   lookAt: { x: mouseX, y: mouseY }
 * });
 */
export function drawSpecimen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  options: SpecimenOptions = {}
): void {
  const {
    width = 70,
    time = 0,
    illumination = 0,
    lookAt,
  } = options;

  const height = width * 0.65;
  const bob = Math.sin(time * TIMING.verySlow) * 3;
  const sway = Math.sin(time * TIMING.glacial) * 0.02;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(sway);

  // Body - darker when not illuminated
  const bodyAlpha = 0.6 + illumination * 0.3;
  const bodyGrad = ctx.createRadialGradient(-width * 0.1, -height * 0.1, 0, 0, 0, width * 0.7);
  bodyGrad.addColorStop(0, `rgba(${20 + illumination * 15}, ${30 + illumination * 10}, ${40 + illumination * 10}, ${bodyAlpha})`);
  bodyGrad.addColorStop(0.5, `rgba(15, 25, 35, ${bodyAlpha * 0.8})`);
  bodyGrad.addColorStop(0.8, `rgba(10, 20, 30, ${bodyAlpha * 0.5})`);
  bodyGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bioluminescent organ (always visible)
  const glowPulse = pulse(time, TIMING.medium, 0.6, 1);
  const glowX = -width * 0.1;
  const glowY = -height * 0.05;
  const glowSize = 8 * glowPulse;

  const organGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowSize * 2);
  organGrad.addColorStop(0, `rgba(255, 100, 80, ${0.8 * glowPulse})`);
  organGrad.addColorStop(0.4, `rgba(255, 80, 60, ${0.4 * glowPulse})`);
  organGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = organGrad;
  ctx.beginPath();
  ctx.arc(glowX, glowY, glowSize * 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  const eyeX = width * 0.15;
  const eyeY = -height * 0.1;
  const eyeSize = 4 + illumination * 2;

  // Eye glow
  const eyeGlowSize = 15 + illumination * 10;
  const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeGlowSize);
  eyeGrad.addColorStop(0, `rgba(200, 50, 50, ${0.6 + illumination * 0.3})`);
  eyeGrad.addColorStop(0.5, `rgba(150, 30, 30, ${0.2 + illumination * 0.2})`);
  eyeGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeGlowSize, 0, Math.PI * 2);
  ctx.fill();

  // Eye core
  ctx.fillStyle = `rgba(200, 50, 50, ${0.8 + illumination * 0.2})`;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  // Pupil (tracks lookAt if provided)
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  if (lookAt) {
    const dx = lookAt.x - (x + eyeX);
    const dy = lookAt.y - (y + eyeY);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      pupilOffsetX = (dx / dist) * 2;
      pupilOffsetY = (dy / dist) * 2;
    }
  }

  ctx.fillStyle = 'rgba(10, 0, 0, 0.9)';
  ctx.beginPath();
  if (illumination > 0.4) {
    // Slit pupil when illuminated
    ctx.ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 1.5, eyeSize * 0.6, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 2, 0, Math.PI * 2);
  }
  ctx.fill();

  // REVEALED: Second eye (only when illuminated)
  if (illumination > 0.3) {
    const eye2Alpha = (illumination - 0.3) * 1.4;
    const eye2X = width * 0.05;
    const eye2Y = height * 0.15;

    ctx.fillStyle = `rgba(180, 40, 40, ${eye2Alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
