/**
 * LIVING OS THEME - Color Palettes
 * 
 * Plant biology research OS theme with organic, nature-based colors.
 * Colors transition from pleasant to unsettling as growth level increases.
 */

export const livingOs = {
  // Bark/Brown tones
  bark: {
    dark: { r: 29, g: 20, b: 23 },      // #1d1417 - Darkest bark
    mid: { r: 61, g: 40, b: 23 },       // #3d2817 - Medium bark
    light: { r: 92, g: 61, b: 42 },     // #5c3d2a - Light bark
  },
  
  // Foliage/Green tones
  foliage: {
    dark: { r: 29, g: 58, b: 45 },      // #1d3a2d - Dark, old growth
    mid: { r: 45, g: 90, b: 61 },       // #2d5a3d - Medium foliage
    light: { r: 61, g: 106, b: 77 },    // #3d6a4d - Light foliage
    vibrant: { r: 77, g: 122, b: 93 },  // #4d7a5d - New growth
  },
  
  // Growth/New growth (lighter, more vibrant)
  growth: {
    new: { r: 90, g: 122, b: 77 },      // #5a7a4d - Fresh growth
    young: { r: 106, g: 138, b: 93 },   // #6a8a5d - Young growth
  },
  
  // Decay/Old growth (darker, withered)
  decay: {
    old: { r: 29, g: 58, b: 45 },       // #1d3a2d - Old growth
    withered: { r: 23, g: 45, b: 35 },  // #172d23 - Withered
  },
  
  // Unsettling variations (for higher growth levels)
  unsettling: {
    hungry: { r: 100, g: 80, b: 60 },   // #64503c - Hungry, pulsing
    satisfied: { r: 60, g: 80, b: 60 }, // #3c503c - Satisfied, dormant
    starving: { r: 40, g: 50, b: 40 },  // #283228 - Starving, dark
  },
};

/**
 * Convert RGB object to hex string
 */
export function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const r = Math.round(rgb.r).toString(16).padStart(2, '0');
  const g = Math.round(rgb.g).toString(16).padStart(2, '0');
  const b = Math.round(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Convert RGB object to rgba string
 */
export function rgbToRgba(rgb: { r: number; g: number; b: number }, alpha: number = 1): string {
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`;
}

/**
 * Get color based on growth level (0-100)
 * Transitions from pleasant to unsettling
 */
export function getGrowthColor(growthLevel: number): { r: number; g: number; b: number } {
  const level = Math.max(0, Math.min(100, growthLevel));
  
  if (level < 20) {
    // Early: Pleasant, natural colors
    return livingOs.foliage.mid;
  } else if (level < 50) {
    // Mid: Slightly off, more vibrant
    const t = (level - 20) / 30;
    return {
      r: Math.round(livingOs.foliage.mid.r + (livingOs.growth.new.r - livingOs.foliage.mid.r) * t),
      g: Math.round(livingOs.foliage.mid.g + (livingOs.growth.new.g - livingOs.foliage.mid.g) * t),
      b: Math.round(livingOs.foliage.mid.b + (livingOs.growth.new.b - livingOs.foliage.mid.b) * t),
    };
  } else if (level < 80) {
    // Advanced: Unsettling, hungry
    const t = (level - 50) / 30;
    return {
      r: Math.round(livingOs.growth.new.r + (livingOs.unsettling.hungry.r - livingOs.growth.new.r) * t),
      g: Math.round(livingOs.growth.new.g + (livingOs.unsettling.hungry.g - livingOs.growth.new.g) * t),
      b: Math.round(livingOs.growth.new.b + (livingOs.unsettling.hungry.b - livingOs.growth.new.b) * t),
    };
  } else {
    // Final: Starving, dark
    const t = (level - 80) / 20;
    return {
      r: Math.round(livingOs.unsettling.hungry.r + (livingOs.unsettling.starving.r - livingOs.unsettling.hungry.r) * t),
      g: Math.round(livingOs.unsettling.hungry.g + (livingOs.unsettling.starving.g - livingOs.unsettling.hungry.g) * t),
      b: Math.round(livingOs.unsettling.hungry.b + (livingOs.unsettling.starving.b - livingOs.unsettling.hungry.b) * t),
    };
  }
}
