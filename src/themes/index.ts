/**
 * THEME REGISTRATION SYSTEM
 * 
 * Allows registering custom themes and accessing built-in themes.
 */

export interface Theme {
  colors?: Record<string, any>;
  gradients?: Record<string, any>;
  particles?: Record<string, any>;
  recipes?: Record<string, any>;
  surfaces?: Record<string, any>;
  [key: string]: any; // Allow any theme-specific properties
}

const registeredThemes: Record<string, Theme> = {};

/**
 * Register a custom theme
 * 
 * @example
 * registerTheme('jungle', {
 *   colors: { canopy: { light: '#2d5016', mid: '#1a3009' } },
 *   particles: { rain: (count) => createRainParticles(count) },
 * });
 */
export function registerTheme(name: string, theme: Theme): void {
  if (registeredThemes[name]) {
    console.warn(`Theme "${name}" is already registered. Overwriting.`);
  }
  registeredThemes[name] = theme;
}

/**
 * Get a registered theme
 */
export function getTheme(name: string): Theme | undefined {
  return registeredThemes[name];
}

/**
 * Get all registered theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(registeredThemes);
}

/**
 * Themes object - access registered themes
 * 
 * @example
 * import { themes } from 'visual-toolkit';
 * themes.deepSea.colors.background
 * themes.jungle.particles.rain(50)
 */
export const themes: Record<string, Theme> = new Proxy({} as Record<string, Theme>, {
  get(target, prop: string) {
    if (typeof prop !== 'string') return undefined;
    return registeredThemes[prop];
  },
  ownKeys() {
    return Object.keys(registeredThemes);
  },
  has(target, prop: string) {
    return prop in registeredThemes;
  },
});
