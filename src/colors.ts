/**
 * COLOR PALETTES
 * 
 * These aren't arbitrary - they're extracted from working code that "feels right".
 * Pure primaries (like #ff0000) look cheap. Real materials have muted, complex hues.
 */

// ============================================
// DEEP SEA - The ocean at depth
// ============================================

export const deepSea = {
  // Background layers - darkest at bottom
  background: {
    surface: '#020810',
    mid: '#051018', 
    deep: '#020a12',
    abyss: '#010508',
    void: '#000000',
  },
  
  // Water itself
  water: {
    ambient: 'rgba(100, 150, 200, 0.03)', // barely-there caustics
    light: 'rgba(180, 200, 220, 0.4)',     // marine snow
    particleDim: 'rgba(180, 200, 230, 0.3)',
  },
  
  // HUD/UI overlays for "ROV footage" aesthetic
  hud: {
    text: 'rgba(77, 208, 225, 0.5)',
    recording: 'rgba(255, 150, 100, 0.7)',
  },
} as const;

// ============================================
// BIOLUMINESCENCE - Living light in darkness
// ============================================

export const bioluminescence = {
  // Cyan/blue glow (most common)
  cyan: {
    core: 'rgba(100, 200, 255, 0.9)',
    mid: 'rgba(80, 180, 255, 0.5)',
    outer: 'rgba(60, 150, 255, 0.2)',
    halo: 'rgba(77, 208, 225, 0.5)',
  },
  
  // Warm glow (specimen eye, warning)
  warm: {
    core: 'rgba(255, 100, 80, 0.8)',
    mid: 'rgba(255, 80, 60, 0.4)',
    outer: 'rgba(200, 50, 50, 0.3)',
  },
  
  // The player's light (cursor glow in TheAbyss)
  playerLight: {
    core: 'rgba(255, 255, 255, 0.9)',
    inner: 'rgba(200, 240, 255, 0.5)',
    mid: 'rgba(180, 220, 255, 0.15)',
    ambient: 'rgba(100, 180, 220, 0.1)',
  },
  
  // Creature-specific hue range (cyan-ish, 180-220 degrees)
  hueRange: { min: 180, max: 220 },
} as const;

// ============================================
// MATERIALS - Physical object colors
// ============================================

export const materials = {
  // ROV yellow/orange (industrial equipment)
  rovYellow: {
    highlight: '#e8a832',
    mid: '#d4942a',
    shadow: '#b87820',
    outline: '#8a5a15',
  },
  
  // Flotation foam orange
  flotation: {
    fill: '#ff6b35',
    outline: '#cc4420',
  },
  
  // Metal/mechanical parts
  metal: {
    light: '#666666',
    mid: '#444444',
    dark: '#333333',
    darkest: '#222222',
  },
  
  // Lens/glass
  lens: {
    body: '#1a1a2e',
    glint: 'rgba(100, 150, 200, 0.5)',
  },
  
  // Panel/structural details
  panel: {
    line: 'rgba(100, 60, 20, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
  
  // Organic creature body (when illuminated)
  creatureFlesh: (illumination: number) => ({
    r: 15 + illumination * 25,
    g: 12 + illumination * 18,
    b: 20 + illumination * 25,
  }),
} as const;

// ============================================
// DARKNESS - Shades of black
// ============================================

export const darkness = {
  // Pure black is rare - these feel more natural
  true: '#000000',
  soft: '#010508',
  tendril: 'rgba(10, 10, 15, 0.9)',
  vignette: 'rgba(0, 0, 0, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.4)',
} as const;

// ============================================
// HELPERS
// ============================================

/** Convert hex to RGB for canvas operations */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/** Generate a color within the bioluminescent hue range */
export function randomBioHue(): number {
  const { min, max } = bioluminescence.hueRange;
  return min + Math.random() * (max - min);
}

/** Create an hsla color string for seekers/particles */
export function bioGlow(hue: number, saturation = 70, lightness = 60, alpha = 0.6): string {
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}
