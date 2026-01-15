/**
 * SHAPE HELPERS
 * 
 * Organic shapes have asymmetric curves. Mechanical shapes have precise details.
 * This module provides helpers for both.
 */

// ============================================
// ORGANIC SHAPES (CSS)
// ============================================

/**
 * Generate organic border-radius values
 * Real creatures aren't perfectly round - asymmetry is key
 */
export function organicRadius(): string {
  const values = [
    40 + Math.random() * 30,
    40 + Math.random() * 30,
    40 + Math.random() * 30,
    40 + Math.random() * 30,
  ];
  return `${values[0]}% ${values[1]}% ${values[2]}% ${values[3]}%`;
}

/**
 * Preset organic border-radius patterns
 */
export const organicRadii = {
  /** Slightly asymmetric blob */
  blob: '60% 50% 45% 55%',
  
  /** Fish body shape */
  fish: '60% 40% 40% 60%',
  
  /** Jellyfish bell */
  bell: '50% 50% 40% 40%',
  
  /** Creature head */
  head: '55% 45% 50% 50%',
  
  /** Flowing tail */
  tail: '30% 70% 60% 40%',
} as const;

// ============================================
// MECHANICAL DETAILS (CANVAS)
// ============================================

/**
 * Draw panel lines on a surface (ROV style)
 *
 * @deprecated Use Scene-First architecture. Pattern A helpers being phased out in v3.0.
 * See: docs/SCENE_FIRST_ARCHITECTURE.md
 */
export function drawPanelLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  linePositions: number[] = [0.25, 0.75], // normalized positions
  color = 'rgba(100, 60, 20, 0.5)'
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  
  for (const pos of linePositions) {
    const lineX = x + width * pos;
    ctx.beginPath();
    ctx.moveTo(lineX, y);
    ctx.lineTo(lineX, y + height);
    ctx.stroke();
  }
}

/**
 * Draw grille/vent pattern (thruster style)
 *
 * @deprecated Use Scene-First architecture. Pattern A helpers being phased out in v3.0.
 * See: docs/SCENE_FIRST_ARCHITECTURE.md
 */
export function drawGrille(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  lineCount = 4,
  color = '#555'
): void {
  ctx.strokeStyle = color;
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

/**
 * Draw a dashed tether/cable
 */
export function drawTether(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  time: number,
  wobbleAmount = 10,
  color = 'rgba(80, 80, 80, 0.6)'
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  
  // Add sine wave wobble
  const midX = startX + Math.sin(time * 0.002) * wobbleAmount;
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(midX, endY);
  ctx.stroke();
  
  ctx.setLineDash([]); // reset
}

/**
 * Draw a lens with glint
 */
export function drawLens(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  outerColor = '#222',
  innerColor = '#1a1a2e',
  glintColor = 'rgba(100, 150, 200, 0.5)'
): void {
  // Outer ring
  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner lens
  ctx.fillStyle = innerColor;
  ctx.beginPath();
  ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Glint highlight
  ctx.fillStyle = glintColor;
  ctx.beginPath();
  ctx.arc(x - 2, y - 2, innerRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a light housing with optional glow
 */
export function drawLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  isOn: boolean,
  time: number
): void {
  // Housing
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  if (isOn) {
    const intensity = 0.8 + Math.sin(time * 0.005) * 0.1;
    
    // Glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 8);
    glow.addColorStop(0, `rgba(255, 250, 230, ${intensity})`);
    glow.addColorStop(0.2, `rgba(255, 240, 200, ${intensity * 0.5})`);
    glow.addColorStop(1, 'rgba(255, 240, 200, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright center
    ctx.fillStyle = `rgba(255, 255, 240, ${intensity})`;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================
// CREATURE PARTS
// ============================================

/**
 * Draw creature eye that tracks a point
 */
export function drawTrackingEye(
  ctx: CanvasRenderingContext2D,
  eyeX: number,
  eyeY: number,
  eyeSize: number,
  targetX: number,
  targetY: number,
  illumination = 0 // 0-1, how much light is on it
): void {
  // Eye socket glow
  const glowSize = 30 + illumination * 30;
  const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, glowSize);
  eyeGlow.addColorStop(0, `rgba(${180 + illumination * 75}, ${60 + illumination * 40}, ${60 + illumination * 20}, 0.8)`);
  eyeGlow.addColorStop(0.5, `rgba(${120 + illumination * 60}, 40, 40, 0.3)`);
  eyeGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, glowSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye core
  const currentSize = eyeSize * (1 + illumination * 0.5);
  ctx.fillStyle = `rgba(${200 + illumination * 55}, ${80 + illumination * 80}, ${60 + illumination * 40}, 1)`;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, currentSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupil tracking
  const dx = targetX - eyeX;
  const dy = targetY - eyeY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const pupilOffsetX = dist > 0 ? (dx / dist) * 3 : 0;
  const pupilOffsetY = dist > 0 ? (dy / dist) * 3 : 0;
  
  ctx.fillStyle = 'rgba(10, 0, 0, 1)';
  ctx.beginPath();
  
  if (illumination > 0.4) {
    // Slit pupil when illuminated
    ctx.ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 2, currentSize * 0.7, 0, 0, Math.PI * 2);
  } else {
    // Round pupil in darkness
    ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 4 - illumination * 2, 0, Math.PI * 2);
  }
  ctx.fill();
}

/**
 * Draw tentacle segment path
 */
export function drawTentacle(
  ctx: CanvasRenderingContext2D,
  segments: Array<{ x: number; y: number }>,
  thickness: number,
  color = 'rgba(10, 10, 15, 0.9)'
): void {
  if (segments.length < 2) return;
  
  ctx.beginPath();
  ctx.moveTo(segments[0].x, segments[0].y);
  
  for (let i = 1; i < segments.length; i++) {
    ctx.lineTo(segments[i].x, segments[i].y);
  }
  
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.stroke();
}
