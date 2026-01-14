/**
 * Garden Theme Color Palettes
 *
 * Four distinct garden viewing experiences:
 * - Soft Garden: Warm, sunlit, peaceful ambient air
 * - Terrarium: Layered depth, specimen study perspective
 * - Garden Window: Muted, distant, through-glass barrier
 * - Overgrown: Rich, wild, nature reclaiming space
 */

/**
 * Soft Garden Window - Sunlit pollen and warm air
 * Aesthetic: Peaceful afternoon light with floating particles
 */
export const softGarden = {
  background: {
    light: '#faf6f1',    // Warm cream - sky/air
    mid: '#efe8dc',      // Soft beige - midtone
    dark: '#dfd4c8',     // Muted tan - depth
  },
  accents: {
    pollen: '#f5e5b8',   // Golden yellow pollen
    warmth: '#ffd9a3',   // Peachy glow
    sunRay: '#fff8eb',   // Subtle sun ray highlight
  },
  particles: {
    pollen: {
      bright: 'rgba(245, 229, 184, 0.6)',
      mid: 'rgba(235, 215, 160, 0.4)',
      dim: 'rgba(220, 200, 140, 0.2)',
    }
  }
};

/**
 * Terrarium View - Enclosed botanical ecosystem
 * Aesthetic: Looking into layered garden with depth
 */
export const terrarium = {
  background: {
    surface: '#c8d5b9',  // Light sage - surface plants
    mid: '#7a9b76',      // Medium green - midground
    deep: '#4a6b47',     // Deep forest - background
    shadow: '#2d4a2c',   // Dark moss - shadow areas
  },
  foliage: {
    new: '#a8c69f',      // Fresh, new growth
    mature: '#6b8f67',   // Established leaves
    shadow: '#4a6247',   // Shadowed/older foliage
    accent: '#8fb581',   // Highlighted areas
  },
  particles: {
    leaves: {
      light: 'rgba(168, 198, 159, 0.5)',
      mid: 'rgba(107, 143, 103, 0.35)',
      dark: 'rgba(74, 98, 71, 0.2)',
    }
  }
};

/**
 * Garden Through Glass - Muted, distant, observed
 * Aesthetic: Viewing garden through frosted/smudged glass barrier
 */
export const gardenWindow = {
  glass: {
    tint: 'rgba(245, 248, 250, 0.3)',     // Frosted overlay tint
    edge: 'rgba(220, 230, 235, 0.5)',     // Glass edge highlights
    smudge: 'rgba(200, 210, 220, 0.15)',  // Smudge marks
  },
  garden: {
    muted: '#b8c9b5',    // Desaturated green viewed through glass
    soft: '#9db09a',     // Distance-softened tone
    distant: '#8a998763', // Far background, very muted
  },
  particles: {
    dust: {
      bright: 'rgba(220, 230, 240, 0.25)',
      dim: 'rgba(180, 200, 220, 0.12)',
      veryDim: 'rgba(150, 170, 190, 0.05)',
    }
  }
};

/**
 * Overgrown Camera - Wild, invasive growth
 * Aesthetic: Nature reclaiming the camera/viewport
 */
export const overgrown = {
  background: {
    dense: '#3d5a3c',    // Rich, deep green base
    vibrant: '#5a7f58',  // Lush midtone
    light: '#7fa67d',    // Sunlit areas
  },
  growth: {
    vine: '#4f6b4e',     // Woody vine color
    leaf: '#6d8f6b',     // Abundant, healthy leaves
    wild: '#5f9a5c',     // Verdant, chaotic growth
    shadow: '#3a5538',   // Deep shadow under dense growth
  },
  particles: {
    fragments: {
      bright: 'rgba(127, 166, 125, 0.6)',
      mid: 'rgba(95, 154, 92, 0.4)',
      dim: 'rgba(62, 85, 60, 0.2)',
    }
  }
};

/**
 * Helper function: Get color with optional opacity override
 * @example
 * const color = withAlpha('#ff0000', 0.5); // 'rgba(255, 0, 0, 0.5)'
 */
export function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Interpolate between two hex colors
 * @example
 * const mid = interpolateColor('#c8d5b9', '#4a6b47', 0.5); // Halfway blend
 */
export function interpolateColor(
  color1: string,
  color2: string,
  t: number
): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
