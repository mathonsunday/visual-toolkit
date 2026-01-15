/**
 * PARTICLE SYSTEMS
 * 
 * Marine snow, bioluminescent particles, debris - these create atmosphere.
 * The key: varied sizes, speeds, and alphas. Uniform particles look artificial.
 */

import { deepSea } from './colors.js';

// ============================================
// PARTICLE TYPES
// ============================================

export interface Particle {
  x: number;         // 0-1 normalized position
  y: number;
  size: number;
  speed: number;
  alpha: number;
  phase?: number;    // for pulsing/wobble
}

// ============================================
// MARINE SNOW
// ============================================

/**
 * Create marine snow particles (organic debris floating in water)
 * These drift slowly downward relative to camera
 *
 * @deprecated Still supported, but recommended to use via effects.ts in Scene-First architecture.
 * See: docs/SCENE_FIRST_ARCHITECTURE.md
 */
export function createMarineSnow(count = 80): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2 + 0.5,        // 0.5 - 2.5px
    speed: Math.random() * 0.008 + 0.003, // very slow
    alpha: Math.random() * 0.5 + 0.2,     // 0.2 - 0.7
  }));
}

/**
 * Update marine snow (moves upward when ROV descends, or down normally)
 */
export function updateMarineSnow(
  particles: Particle[],
  direction: 'up' | 'down' = 'down'
): void {
  const mult = direction === 'up' ? -1 : 1;
  
  for (const p of particles) {
    p.y += p.speed * mult;
    
    // Wrap at edges
    if (direction === 'up' && p.y < -0.05) {
      p.y = 1.05;
      p.x = Math.random();
    } else if (direction === 'down' && p.y > 1.05) {
      p.y = -0.05;
      p.x = Math.random();
    }
  }
}

/**
 * Draw marine snow particles
 */
export function drawMarineSnow(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number
): void {
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 200, 220, ${p.alpha})`;
    ctx.fill();
  }
}

// ============================================
// DEEP PARTICLES (sparse, for void scenes)
// ============================================

/**
 * Sparse particles for extremely deep scenes (anglerfish, leviathan)
 */
export function createDeepParticles(count = 12): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.002 + 0.001, // even slower
    alpha: Math.random() * 0.3 + 0.1,     // dimmer
    phase: Math.random() * Math.PI * 2,
  }));
}

/**
 * Update deep particles with slight wobble
 */
export function updateDeepParticles(particles: Particle[], time: number): void {
  for (const p of particles) {
    p.y += p.speed;
    p.x += Math.sin(time * 0.001 + (p.phase ?? 0)) * 0.0005;
    
    if (p.y > 1.05) {
      p.y = -0.05;
      p.x = Math.random();
    }
  }
}

// ============================================
// CSS PARTICLE HELPERS
// ============================================

/**
 * Generate CSS for marine snow overlay
 * Creates positioned divs that animate with CSS
 */
export function cssMarineSnowParticle(index: number): {
  style: string;
  animation: string;
} {
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 5;
  const size = Math.random() > 0.5 ? 3 : 2;
  const alpha = Math.random() > 0.5 ? 0.3 : 0.4;
  
  return {
    style: `
      position: absolute;
      left: ${left}%;
      top: ${top}%;
      width: ${size}px;
      height: ${size}px;
      background: rgba(200, 220, 255, ${alpha});
      border-radius: 50%;
      animation: snow-drift 8s linear infinite;
      animation-delay: ${delay}s;
    `.trim(),
    animation: `
      @keyframes snow-drift {
        0% { transform: translateY(-20px) translateX(0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(300px) translateX(20px); opacity: 0; }
      }
    `.trim(),
  };
}

/**
 * Generate HTML for a marine snow container
 */
export function htmlMarineSnow(count = 20): string {
  const particles = Array.from({ length: count }, (_, i) => {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 5;
    return `<div class="snow-particle" style="left: ${left}%; top: ${top}%; animation-delay: ${delay}s;"></div>`;
  });
  
  return `<div class="marine-snow">${particles.join('\n')}</div>`;
}

/**
 * CSS for marine snow container and particles
 */
export const cssMarineSnowStyles = `
  .marine-snow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  
  .snow-particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(200, 220, 255, 0.4);
    border-radius: 50%;
    animation: snow-drift 8s linear infinite;
  }
  
  .snow-particle:nth-child(odd) {
    width: 3px;
    height: 3px;
    background: rgba(180, 200, 230, 0.3);
  }
  
  @keyframes snow-drift {
    0% { transform: translateY(-20px) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(300px) translateX(20px); opacity: 0; }
  }
`;

// ============================================
// BIOLUMINESCENT PARTICLES
// ============================================

export interface BioParticle extends Particle {
  hue: number;
  pulseSpeed: number;
}

/**
 * Create bioluminescent particles (glowing organisms)
 */
export function createBioParticles(count = 15): BioParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 4 + 2,
    speed: Math.random() * 0.002 + 0.001,
    alpha: Math.random() * 0.6 + 0.3,
    hue: 180 + Math.random() * 40, // cyan range
    pulseSpeed: Math.random() * 0.003 + 0.002,
    phase: Math.random() * Math.PI * 2,
  }));
}

/**
 * Draw bioluminescent particles with glow
 */
export function drawBioParticles(
  ctx: CanvasRenderingContext2D,
  particles: BioParticle[],
  width: number,
  height: number,
  time: number
): void {
  for (const p of particles) {
    const pulse = (Math.sin(time * p.pulseSpeed + (p.phase ?? 0)) + 1) / 2;
    const currentAlpha = p.alpha * (0.5 + pulse * 0.5);
    const currentSize = p.size * (0.8 + pulse * 0.4);
    
    const x = p.x * width;
    const y = p.y * height;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentSize * 3);
    gradient.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${currentAlpha})`);
    gradient.addColorStop(0.5, `hsla(${p.hue}, 60%, 40%, ${currentAlpha * 0.3})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, currentSize * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright core
    ctx.fillStyle = `hsla(${p.hue}, 50%, 80%, ${currentAlpha})`;
    ctx.beginPath();
    ctx.arc(x, y, currentSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
