# Theme Architecture Proposal

## Problem Statement

Currently, both libraries mix **core functionality** (theme-agnostic) with **deep-sea specific presets**. This creates confusion:
- Is `deepSea` a core feature or a theme?
- How do I add jungle sounds without modifying the library?
- What's reusable vs. what's deep-sea specific?

## Proposed Architecture

### 1. Core API (Theme-Agnostic)

**Visual Toolkit Core:**
- `timing`, `amplitude` - Motion constants
- `drift()`, `bob()`, `pulse()` - Motion functions
- `material3D()` - Generic material rendering
- `drawOffsetShadow()` - Generic depth effects
- `calculateIllumination()` - Generic lighting math

**Music Playground Core:**
- `Ambience` class - Generic ambience engine
- `SoundEffect` class - Generic SFX engine
- `ambience.addLayer()` - Generic layering
- `ambience.setVolume()` - Generic controls

### 2. Theme Presets (Namespaced)

**Visual Toolkit:**
```typescript
import { themes } from 'visual-toolkit';

// Deep-sea theme (default/built-in)
themes.deepSea.colors.background
themes.deepSea.colors.bioluminescence
themes.deepSea.particles.marineSnow()
themes.deepSea.recipes.drawROV()

// Future themes
themes.jungle.colors.canopy
themes.jungle.particles.rain()
themes.space.colors.nebula
```

**Music Playground:**
```typescript
import { themes } from 'music-playground';

// Deep-sea theme (default/built-in)
themes.deepSea.ambience.play('deepSea', options)
themes.deepSea.ambience.play('rov', options)
themes.deepSea.sfx.play('creature')

// Future themes
themes.jungle.ambience.play('rain', options)
themes.jungle.sfx.play('bird')
themes.space.ambience.play('nebula', options)
```

### 3. Extension System

**Register Custom Themes:**

```typescript
// Visual Toolkit
import { registerTheme } from 'visual-toolkit';

registerTheme('jungle', {
  colors: {
    canopy: { light: '#2d5016', mid: '#1a3009', dark: '#0f1a05' },
    undergrowth: { ... },
  },
  particles: {
    rain: (count) => createRainParticles(count),
  },
  recipes: {
    drawTree: (ctx, x, y) => { ... },
  },
});

// Then use
themes.jungle.colors.canopy
themes.jungle.particles.rain(50)
```

```typescript
// Music Playground
import { registerTheme } from 'music-playground';

registerTheme('jungle', {
  ambience: {
    play: (preset, options) => {
      if (preset === 'rain') return createRainAmbience(options);
      if (preset === 'wind') return createWindAmbience(options);
    },
  },
  sfx: {
    play: (sound) => {
      if (sound === 'bird') return playBirdCall();
      if (sound === 'insect') return playInsectChirp();
    },
  },
});

// Then use
themes.jungle.ambience.play('rain', { intensity: 0.5 });
```

### 4. Migration Path

**Current API (still works, but deprecated):**
```typescript
import { deepSea, drawROV } from 'visual-toolkit';
import { Ambience } from 'music-playground';

const ambience = new Ambience();
ambience.play('deepSea', options);
```

**New API (recommended):**
```typescript
import { themes } from 'visual-toolkit';
import { themes as audioThemes } from 'music-playground';

// Deep-sea theme (explicit)
themes.deepSea.colors.background
themes.deepSea.recipes.drawROV()

// Audio
const ambience = new audioThemes.deepSea.Ambience();
ambience.play('deepSea', options);
```

**Backward Compatibility:**
- Keep current exports for 1-2 versions
- Add deprecation warnings pointing to `themes.deepSea.*`
- Eventually remove direct exports

### 5. File Structure

**Visual Toolkit:**
```
src/
  core/
    motion.ts          # timing, drift, bob (theme-agnostic)
    materials.ts       # material3D, generic gradients
    lighting.ts        # calculateIllumination (generic)
  themes/
    deepSea/
      colors.ts        # deepSea, bioluminescence palettes
      particles.ts     # marineSnow, bioParticles
      recipes.ts       # drawROV, drawJellyfish
      index.ts         # exports all deepSea stuff
    index.ts           # themes.deepSea, registerTheme()
  index.ts             # exports core + themes.deepSea (for compatibility)
```

**Music Playground:**
```
src/
  core/
    ambience.ts        # Ambience class (generic)
    sound-effect.ts    # SoundEffect class (generic)
  themes/
    deepSea/
      presets.ts       # deepSea, rov, hydrophone generators
      sfx.ts           # creature, sonar sounds
      index.ts         # Ambience/SoundEffect with deepSea presets
    index.ts           # themes.deepSea, registerTheme()
  index.ts             # exports core + themes.deepSea (for compatibility)
```

### 6. Documentation Structure

**README Sections:**
1. **Core API** - Theme-agnostic functions
2. **Built-in Themes** - `themes.deepSea` documentation
3. **Custom Themes** - How to register your own
4. **Migration Guide** - Moving from old API

**Example:**
```markdown
## Core API

Theme-agnostic functions that work for any visual style:

- `timing` - Motion speed constants
- `drift()` - Organic movement
- `material3D()` - 3D material rendering

## Built-in Themes

### Deep Sea Theme

```typescript
import { themes } from 'visual-toolkit';

// Colors
themes.deepSea.colors.background
themes.deepSea.colors.bioluminescence

// Particles
themes.deepSea.particles.marineSnow(100)

// Recipes
themes.deepSea.recipes.drawROV(ctx, x, y)
```

## Custom Themes

See [THEME_GUIDE.md](./THEME_GUIDE.md) for creating your own themes.
```

## Benefits

1. **Clear Separation**: Core vs. theme-specific is obvious
2. **Extensible**: Easy to add jungle, space, etc. without modifying core
3. **No Confusion**: `themes.deepSea.*` makes it clear what's theme-specific
4. **Backward Compatible**: Old API still works during migration
5. **Discoverable**: `themes.*` namespace makes available themes obvious

## Implementation Plan

1. **Phase 1**: Create `themes/` directory structure
2. **Phase 2**: Move deep-sea presets to `themes/deepSea/`
3. **Phase 3**: Add `registerTheme()` function
4. **Phase 4**: Update exports (keep old for compatibility)
5. **Phase 5**: Update documentation
6. **Phase 6**: Add deprecation warnings (optional)
7. **Phase 7**: Remove old exports (future major version)

## Example: Jungle Theme

```typescript
// User's custom theme file
import { registerTheme } from 'visual-toolkit';

registerTheme('jungle', {
  colors: {
    canopy: { light: '#2d5016', mid: '#1a3009', dark: '#0f1a05' },
    undergrowth: { light: '#1a3009', mid: '#0f1a05', dark: '#050803' },
    sunlight: { warm: '#ffd700', filtered: '#8b6914' },
  },
  particles: {
    rain: (count) => {
      // Use core API
      return createDeepParticles(count, {
        color: 'rgba(150, 200, 255, 0.3)',
        speed: { min: 0.01, max: 0.03 },
      });
    },
  },
  recipes: {
    drawTree: (ctx, x, y, height) => {
      // Use core material3D
      const trunkGrad = material3D(ctx, x, y, 30, height, {
        highlight: '#8b6914',
        mid: '#654321',
        shadow: '#3d2817',
      });
      // ... draw tree
    },
  },
});

// Now available
import { themes } from 'visual-toolkit';
themes.jungle.colors.canopy
themes.jungle.particles.rain(100)
```
