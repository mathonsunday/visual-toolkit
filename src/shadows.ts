/**
 * SHADOW & DEPTH PATTERNS
 * 
 * The secret to "premium" visuals: layered depth.
 * Flat shapes look cheap. Offset shadows and multi-layer glows create dimension.
 */

import { darkness } from './colors.js';

// ============================================
// CANVAS SHADOW HELPERS
// ============================================

/**
 * Draw an offset shadow beneath a shape
 * Call this BEFORE drawing the main shape
 */
export function drawOffsetShadow(
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  offsetX = 4,
  offsetY = 4,
  color = darkness.shadow
): void {
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.fillStyle = color;
  drawFn();
  ctx.restore();
}

/**
 * Apply canvas shadow settings for soft glow/shadow
 */
export function applyShadow(
  ctx: CanvasRenderingContext2D,
  blur: number,
  color: string,
  offsetX = 0,
  offsetY = 0
): void {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
}

/**
 * Clear shadow settings
 */
export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// ============================================
// CSS BOX-SHADOW PATTERNS
// ============================================

/**
 * Multi-layer glow for bioluminescent elements
 * Use for: Glowing creatures, UI elements, highlights
 */
export function cssGlow(
  color: string,
  intensity: 'subtle' | 'medium' | 'strong' = 'medium'
): string {
  const multipliers = {
    subtle: [0.3, 0.15],
    medium: [0.6, 0.3],
    strong: [0.9, 0.5],
  };
  const [inner, outer] = multipliers[intensity];
  
  // Extract RGB from color string
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return 'none';
  
  const [, r, g, b] = match;
  
  return `
    0 0 20px rgba(${r}, ${g}, ${b}, ${inner}),
    0 0 40px rgba(${r}, ${g}, ${b}, ${outer})
  `.trim();
}

/**
 * Jellyfish-style glow (outer glow + inner shadow for depth)
 */
export function cssJellyfishGlow(): string {
  return `
    0 0 20px rgba(150, 200, 255, 0.3),
    inset 0 -10px 20px rgba(100, 180, 255, 0.2)
  `.trim();
}

/**
 * Small fish glow
 */
export function cssFishGlow(): string {
  return `
    0 0 10px rgba(100, 200, 255, 0.5),
    0 0 20px rgba(80, 180, 255, 0.3)
  `.trim();
}

/**
 * Specimen eye glow (warm, ominous)
 */
export function cssEyeGlow(): string {
  return `
    0 0 15px rgba(255, 100, 80, 0.6),
    0 0 30px rgba(255, 80, 60, 0.3)
  `.trim();
}

/**
 * HUD element glow (subtle cyan)
 */
export function cssHudGlow(): string {
  return `0 0 10px rgba(77, 208, 225, 0.3)`;
}

/**
 * File icon glow (breathing animation in CSS)
 * Returns keyframe values for animation
 */
export function cssBreathingGlow(): { dim: string; bright: string } {
  return {
    dim: '0 0 10px rgba(77, 208, 225, 0.2)',
    bright: '0 0 25px rgba(77, 208, 225, 0.5)',
  };
}

// ============================================
// DEPTH STACKING PRESETS
// ============================================

/**
 * ROV-style object depth (shadow offset + outline)
 */
export interface DepthConfig {
  shadowOffset: { x: number; y: number };
  shadowColor: string;
  outlineWidth: number;
  outlineColor: string;
}

export const depthPresets: Record<string, DepthConfig> = {
  /** Heavy equipment like ROV body */
  equipment: {
    shadowOffset: { x: 4, y: 4 },
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    outlineWidth: 2,
    outlineColor: '#8a5a15',
  },
  
  /** Lighter elements like flotation */
  light: {
    shadowOffset: { x: 2, y: 2 },
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    outlineWidth: 1,
    outlineColor: '#cc4420',
  },
  
  /** Creatures (no hard shadow, soft glow) */
  creature: {
    shadowOffset: { x: 0, y: 0 },
    shadowColor: 'transparent',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
};

/**
 * Draw an object with proper depth (shadow → fill → outline)
 */
export function drawWithDepth(
  ctx: CanvasRenderingContext2D,
  preset: keyof typeof depthPresets,
  drawShape: () => void,
  fillGradient: CanvasGradient | string
): void {
  const config = depthPresets[preset];
  
  // 1. Shadow
  if (config.shadowOffset.x !== 0 || config.shadowOffset.y !== 0) {
    ctx.save();
    ctx.translate(config.shadowOffset.x, config.shadowOffset.y);
    ctx.fillStyle = config.shadowColor;
    drawShape();
    ctx.restore();
  }
  
  // 2. Fill
  ctx.fillStyle = fillGradient;
  drawShape();
  
  // 3. Outline
  if (config.outlineWidth > 0) {
    ctx.strokeStyle = config.outlineColor;
    ctx.lineWidth = config.outlineWidth;
    drawShape();
    ctx.stroke();
  }
}
