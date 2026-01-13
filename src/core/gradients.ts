/**
 * CORE GRADIENT GENERATORS (Theme-Agnostic)
 * 
 * Generic gradient functions that work for any theme.
 * Theme-specific gradients are in themes/[theme]/gradients.ts
 */

// ============================================
// CANVAS GRADIENTS
// ============================================

/**
 * Material gradient for 3D form (simulates light from above)
 * Use for: Equipment, solid objects, any 3D surface
 */
export function material3D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: { highlight: string; mid: string; shadow: string }
): CanvasGradient {
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, colors.highlight);
  grad.addColorStop(0.5, colors.mid);
  grad.addColorStop(1, colors.shadow);
  return grad;
}

/**
 * Radial glow gradient for light sources
 * Use for: Any glowing effect, lights, eyes
 */
export function radialGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  colors: { core: string; mid: string; outer: string }
): CanvasGradient {
  const grad = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
  grad.addColorStop(0, colors.core);
  grad.addColorStop(0.4, colors.mid);
  grad.addColorStop(0.7, colors.outer);
  grad.addColorStop(1, 'transparent');
  return grad;
}

/**
 * Vignette gradient (darkens edges, focuses center)
 * Generic - works for any theme
 */
export function vignette(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  intensity = 0.5
): CanvasGradient {
  const grad = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
  return grad;
}
