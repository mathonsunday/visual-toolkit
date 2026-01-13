/**
 * DEEP SEA THEME - Gradient Presets
 * 
 * Theme-specific gradients using deep-sea color palettes.
 */

import { deepSea, bioluminescence } from './colors.js';
import { radialGlow } from '../../core/gradients.js';

// ============================================
// CANVAS GRADIENTS
// ============================================

/**
 * Deep water background gradient (vertical)
 * Creates the characteristic dark blue that gets darker with depth
 */
export function deepWaterBackground(
  ctx: CanvasRenderingContext2D,
  height: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, deepSea.background.surface);
  grad.addColorStop(0.3, deepSea.background.mid);
  grad.addColorStop(0.6, deepSea.background.deep);
  grad.addColorStop(1, deepSea.background.abyss);
  return grad;
}

/**
 * Player light gradient (cursor/flashlight in darkness)
 * Multiple layers for realistic falloff
 */
export function playerLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  intensity = 1
): CanvasGradient[] {
  const gradients: CanvasGradient[] = [];
  
  // Multiple concentric glows for soft falloff
  for (let i = 5; i >= 1; i--) {
    const layerRadius = radius * (i / 2);
    const alpha = (0.15 / i) * intensity;
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
    grad.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
    grad.addColorStop(0.5, `rgba(100, 180, 220, ${alpha * 0.5})`);
    grad.addColorStop(1, 'transparent');
    gradients.push(grad);
  }
  
  // Bright core
  const core = ctx.createRadialGradient(x, y, 0, x, y, 15);
  core.addColorStop(0, `rgba(255, 255, 255, ${0.9 * intensity})`);
  core.addColorStop(0.5, `rgba(200, 240, 255, ${0.5 * intensity})`);
  core.addColorStop(1, 'transparent');
  gradients.push(core);
  
  return gradients;
}

/**
 * ROV light beam (cone of light into darkness)
 */
export function lightBeam(
  ctx: CanvasRenderingContext2D,
  startY: number,
  endY: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(0, startY, 0, endY);
  grad.addColorStop(0, 'rgba(255, 250, 230, 0.15)');
  grad.addColorStop(0.5, 'rgba(200, 220, 255, 0.05)');
  grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
  return grad;
}

/**
 * Creature eye gradient (ominous glow)
 */
export function eyeGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  illumination = 0
): CanvasGradient {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
  
  // Eye gets brighter and more orange when illuminated
  const r = 180 + illumination * 75;
  const g = 60 + illumination * 40;
  const b = 60 + illumination * 20;
  
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
  grad.addColorStop(0.5, `rgba(${120 + illumination * 60}, 40, 40, 0.3)`);
  grad.addColorStop(1, 'transparent');
  
  return grad;
}

// ============================================
// CSS GRADIENT STRINGS
// ============================================

/**
 * CSS deep water background
 */
export function cssDeepWater(): string {
  return `linear-gradient(
    180deg,
    ${deepSea.background.surface} 0%,
    ${deepSea.background.mid} 30%,
    ${deepSea.background.deep} 60%,
    ${deepSea.background.abyss} 100%
  )`;
}

/**
 * CSS radial glow for bioluminescence
 */
export function cssBioGlow(color: 'cyan' | 'warm' = 'cyan'): string {
  const colors = bioluminescence[color];
  return `radial-gradient(
    circle,
    ${colors.core} 0%,
    ${colors.mid} 30%,
    ${colors.outer} 60%,
    transparent 70%
  )`;
}

/**
 * CSS creature body (translucent, organic)
 */
export function cssCreatureBody(opacity = 0.8): string {
  return `radial-gradient(
    ellipse at 40% 40%,
    rgba(20, 30, 40, ${opacity}) 0%,
    rgba(15, 25, 35, ${opacity * 0.8}) 50%,
    rgba(10, 20, 30, ${opacity * 0.5}) 80%,
    transparent 100%
  )`;
}

/**
 * CSS jellyfish bell (translucent, lit from above)
 */
export function cssJellyfishBell(): string {
  return `radial-gradient(
    ellipse at 50% 30%,
    rgba(180, 220, 255, 0.4) 0%,
    rgba(150, 200, 255, 0.2) 40%,
    rgba(120, 180, 255, 0.1) 70%,
    transparent 100%
  )`;
}

/**
 * CSS distant creature (barely visible shape)
 */
export function cssDistantCreature(): string {
  return `radial-gradient(
    ellipse at center,
    rgba(10, 20, 35, 0.8) 0%,
    transparent 70%
  )`;
}
