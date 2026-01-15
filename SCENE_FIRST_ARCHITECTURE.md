# Scene-First Architecture Guide

**Status:** Active (Phase 1 complete as of January 2026)
**Target Audience:** Scene developers, library maintainers
**Previous Pattern:** Three conflicting patterns (Pattern A helpers, Pattern B recipes, Pattern C scenes)
**Current Pattern:** Scene-First - unified, self-contained scenes using shared effects utilities

---

## Quick Start

### The Old Way (Avoid)
```typescript
// ❌ Anti-pattern: Inline everything
export class MyScene extends BaseCanvasScene {
  render(ctx, deltaTime) {
    // Background gradient - duplicated in every scene
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#020911');
    // ... 20 more lines

    // Player light - duplicated in every scene
    const lightGrad = ctx.createRadialGradient(...);
    // ... 15 more lines

    // Particles - duplicated in every scene
    for (const p of this.particles) {
      // ... 10 more lines
    }
  }
}
```

### The New Way (Use This)
```typescript
// ✅ Scene-First: Clean, reuses shared effects
import {
  deepWaterBackground,
  drawPlayerLight,
  createMarineSnow,
  drawMarineSnow,
  vignette,
} from '../effects';

export class MyScene extends BaseCanvasScene {
  private particles: Particle[] = [];

  protected async onInit(): Promise<void> {
    this.startCursorTracking();
    this.particles = createMarineSnow(10);
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();
    const cursor = this.getCursorPos();

    // ✅ Use helper: one line
    ctx.fillStyle = deepWaterBackground(ctx, height);
    ctx.fillRect(0, 0, width, height);

    // ✅ Scene-specific logic (what makes this scene unique)
    this.drawMyUniqueContent(ctx, width, height);

    // ✅ Use helper: one line
    if (cursor.isOver) {
      drawPlayerLight(ctx, cursor.x, cursor.y, 200);
    }

    // ✅ Use helper: two lines
    updateMarineSnow(this.particles, 'down');
    drawMarineSnow(ctx, this.particles, width, height);

    // ✅ Use helper: one line
    ctx.fillStyle = vignette(ctx, width/2, height/2, height*0.25, height*0.85, 0.4);
    ctx.fillRect(0, 0, width, height);
  }

  private drawMyUniqueContent(ctx, w, h) {
    // Only scene-specific code here
  }
}
```

---

## What is Scene-First Architecture?

Scene-First is a design pattern where:

1. **Each scene is self-contained** - Includes all its own logic
2. **Scenes reuse shared effects** - Not duplicated, imported from `effects.ts`
3. **Effects are cohesive per theme** - Deep-sea scenes use deep-sea effects, garden scenes use garden effects
4. **Clear separation of concerns** - Scene-specific logic stays in the scene, shared code in effects

**Why?**
- 🎯 Single responsibility - each file has one job
- 🔄 Code reuse - fix a bug in effects, all scenes benefit
- 🧠 Mental clarity - one pattern instead of three conflicting ones
- 📦 Small bundle size - no dead code duplicates
- 🚀 Faster extraction - new scenes take 2 hours not 3+

---

## Available Effects by Theme

### Deep Sea (`src/themes/deepSea/effects.ts`)

#### Gradients
```typescript
import { deepWaterBackground, playerLight, eyeGlow } from '../effects';

// Use in render:
ctx.fillStyle = deepWaterBackground(ctx, height);
ctx.fillRect(0, 0, width, height);

// or
ctx.fillStyle = playerLight(ctx, cursorX, cursorY, { intensity: 1.0 });
```

#### Particles
```typescript
import { createMarineSnow, updateMarineSnow, drawMarineSnow } from '../effects';

// In onInit:
this.particles = createMarineSnow(10); // Create 10 particles

// In render:
updateMarineSnow(this.particles, 'down'); // Move downward
drawMarineSnow(ctx, this.particles, width, height); // Draw
```

#### Lighting
```typescript
import { drawPlayerLight, calculateIllumination } from '../effects';

// ROV light source
if (cursor.isOver) {
  drawPlayerLight(ctx, cursor.x, cursor.y, 200);
}

// Calculate how bright an object should be near light
const brightness = calculateIllumination(objectX, objectY, lightX, lightY, 150);
```

#### Eyes
```typescript
import { createEyes, updateEyes, drawEyes } from '../effects';

// In onInit:
this.eyes = createEyes([
  { x: 0.3, y: 0.4, size: 12 },
  { x: 0.7, y: 0.4, size: 12 },
]);

// In render:
updateEyes(this.eyes, cursor.x, cursor.y, deltaTime);
drawEyes(ctx, this.eyes);
```

#### Organic Surfaces
```typescript
import { drawOrganicSurface } from '../effects';

// Draw living wall/flesh
drawOrganicSurface(ctx, width, height, {
  type: 'fleshy',
  preset: 'visible',
  lightX: cursor.x,
  lightY: cursor.y,
  time: this.time,
});
```

#### Motion & Animation
```typescript
import { pulse, drift, bob, createSeekerSwarm, updateSeekerSwarm, drawSeekerSwarm } from '../effects';

// Pulsing effect
const glowIntensity = pulse(this.time, 0.003, 0.8, 1.2); // speed, min, max

// Drifting objects
const offset = drift(this.time, 0.001, 0.002);
ctx.translate(offset.x, offset.y);

// Floating creatures
const bobOffset = bob(this.time, 0.002, 0.02);
y += bobOffset;

// Seeker swarm (attracted to light)
const seekers = createSeekerSwarm(50, width, height);
updateSeekerSwarm(seekers, cursor.x, cursor.y, cursorSpeed, width, height);
drawSeekerSwarm(ctx, seekers, { lightX: cursor.x, lightY: cursor.y });
```

#### Core Utilities
```typescript
import { vignette, radialGlow, material3D } from '../effects';

// Vignette (darkens edges)
ctx.fillStyle = vignette(ctx, centerX, centerY, innerRadius, outerRadius, 0.4);
ctx.fillRect(0, 0, width, height);

// Radial glow (any glowing effect)
ctx.fillStyle = radialGlow(ctx, x, y, 20, 100, {
  core: 'rgba(200, 255, 255, 0.8)',
  mid: 'rgba(100, 200, 255, 0.4)',
  outer: 'rgba(0, 100, 200, 0.1)',
});
ctx.fillRect(x - 100, y - 100, 200, 200);

// Material 3D shading
ctx.fillStyle = material3D(ctx, x, y, width, height, {
  highlight: '#FFD700',
  mid: '#DAA520',
  shadow: '#8B4513',
});
```

---

### Living OS (`src/themes/livingOs/effects.ts`)

#### Growth & Roots
```typescript
import { drawGrowingRoots, drawVines, calculateSway } from '../effects';

// Animated root network
drawGrowingRoots(ctx, x, y, {
  depth: 5,
  angleVariation: 0.3,
});

// Vine drawing
drawVines(ctx, startX, startY, endX, endY, {
  segments: 20,
  waviness: 0.5,
});

// Sway animation for plants
const sway = calculateSway(this.time, { speed: 0.5, magnitude: 10 });
ctx.translate(sway.x, sway.y);
```

#### Plants
```typescript
import { drawLeaf, drawFlower } from '../effects';

// Individual leaf
drawLeaf(ctx, x, y, { size: 20, rotation: 0.5 });

// Flower with petals
drawFlower(ctx, x, y, {
  petalCount: 5,
  size: 30,
  color: '#FF69B4',
});
```

#### Textures & Surfaces
```typescript
import { drawBarkTexture, drawOrganicSurface, woodPalettes } from '../effects';

// Wood bark pattern
drawBarkTexture(ctx, x, y, width, height, {
  palette: woodPalettes.cedar,
  noiseScale: 0.1,
});

// Organic surface (moss, lichen, growth)
drawOrganicSurface(ctx, width, height, {
  type: 'moss',
  colorBase: '#2d5016',
});
```

#### Motion Helpers
```typescript
import { calculateGrowthProgress, applyGrowthTiming, GROWTH_TIMING } from '../effects';

// Growth animation progression
const progress = calculateGrowthProgress(this.time, GROWTH_TIMING.slow);

// Apply sway timing to movement
const offset = applyGrowthTiming(this.time, {
  type: 'sway',
  speed: 'slow',
  magnitude: 15,
});
```

---

### Garden (`src/themes/garden/effects.ts`)

Similar structure - includes colors, gradients, particles, plants, textures, and recipes specific to garden theme.

```typescript
import {
  softGarden,
  drawSoftGardenWindow,
  drawPollenParticles,
} from '../effects';

// Use garden-specific colors
ctx.fillStyle = softGarden.background;

// Draw complete garden scene recipe
drawSoftGardenWindow(ctx, width, height, options);

// Draw pollen particles
drawPollenParticles(ctx, this.pollen, width, height, this.time);
```

---

## When to Add to Effects

Add a function to `effects.ts` when it:

1. **Is used by multiple scenes** - Code reuse
2. **Is theme-specific** - Belongs in the theme's effects
3. **Is self-contained** - Doesn't depend on scene state
4. **Solves a common problem** - Gradients, particles, animations

### Example: Should this be in effects.ts?

**✅ YES - Common pattern**
```typescript
// Multiple scenes need this
export function drawPlayerLight(ctx, x, y, radius) { /* ... */ }
```

**✅ YES - Theme-specific utility**
```typescript
// Only garden scenes use this
export function drawPollenParticles(ctx, particles, ...) { /* ... */ }
```

**❌ NO - Scene-specific**
```typescript
// Only LeviathanScene uses this unique logic
drawLeviathanTentacles() { /* ... */ }
// Keep in LeviathanScene.ts
```

**❌ NO - Depends on scene state**
```typescript
// Needs access to this.seekers, this.time from scene
drawMyComplexBehavior() { /* ... */ }
// Keep in scene class
```

---

## Migration Guide: Old to New

### Before (Pattern A - Helpers)
```typescript
import {
  createSeekerSwarm,
  updateSeekerSwarm,
  drawSeekerSwarm,
  createMarineSnow,
  // ... 10 more imports
} from 'visual-toolkit';

export class SeekersScene extends BaseCanvasScene {
  render(ctx, dt) {
    // Have to know which Pattern A functions to use
    updateSeekerSwarm(this.seekers, cursor.x, cursor.y, ...);
    drawSeekerSwarm(ctx, this.seekers);
  }
}
```

### After (Scene-First)
```typescript
import {
  createSeekerSwarm,
  updateSeekerSwarm,
  drawSeekerSwarm,
  deepWaterBackground,
  drawPlayerLight,
} from '../effects';

export class SeekersScene extends BaseCanvasScene {
  render(ctx, dt) {
    // Clear intent: using effects from this theme
    ctx.fillStyle = deepWaterBackground(ctx, height);
    ctx.fillRect(0, 0, width, height);

    updateSeekerSwarm(this.seekers, cursor.x, cursor.y, ...);
    drawSeekerSwarm(ctx, this.seekers);

    drawPlayerLight(ctx, cursor.x, cursor.y, 200);
  }
}
```

**Key differences:**
- Effects imported from `../effects` instead of the root package
- Clear signal: "I'm using deep-sea effects"
- All common patterns in one place
- Easier to find what's available

---

## Deprecation Timeline

### Now (v2.2+)
- ✅ Pattern A/B functions still work
- ⚠️ Deprecation warnings in JSDoc and console
- 📖 Documentation points to Scene-First pattern
- ✅ New scenes use Scene-First

### v2.3+
- ✅ Pattern A/B functions still work
- ✅ All existing scenes migrated to Scene-First
- 📖 Scene-First is standard pattern

### v3.0 (Future Major Release)
- ❌ Pattern A/B functions removed
- ✅ Only Scene-First pattern available
- 📦 ~12 KB smaller bundle
- 🎯 100% consistent library design

---

## Troubleshooting

**Q: I need a function that isn't in effects.ts**

A: Add it! If multiple scenes would use it:
1. Implement the function in the appropriate module (gradients.ts, particles.ts, etc.)
2. Export it from effects.ts
3. Document it in this guide
4. Update the scene imports

**Q: My scene effect looks different from before**

A: You're likely using a slightly different function signature or parameters. Check:
1. Function parameters match (width, height, color options, etc.)
2. Drawing context is set correctly before calling
3. Time/animation values are being passed properly

**Q: Can I still use Pattern A directly?**

A: For now, yes - it's not removed until v3.0. But it's not recommended:
- You're avoiding the consistent effects library
- Your code won't be maintainable as others move to Scene-First
- You'll need to migrate eventually anyway

**Q: Should I add all my logic to effects.ts?**

A: No! Only shared utilities. Scene-specific logic stays in the scene class:
- Wall features in WallScene
- Leviathan-specific eye behavior in LeviathanScene
- Unique animations in SeekersScene

The 80/20 rule: 80% reusable effects, 20% scene-specific implementation.

---

## Examples

### Example 1: Simple Floating Creatures Scene
```typescript
import {
  deepWaterBackground,
  createMarineSnow,
  updateMarineSnow,
  drawMarineSnow,
  vignette,
} from '../effects';

export class FloatingCreaturesScene extends BaseCanvasScene {
  name = 'Floating Creatures';
  description = 'Jellyfish-like creatures drifting';

  private particles: Particle[] = [];
  private creatures: Creature[] = [];

  protected async onInit(): Promise<void> {
    this.startCursorTracking();
    const { width, height } = this.getCanvasSize();

    // Use shared effect to create particles
    this.particles = createMarineSnow(15);

    // Scene-specific: create creatures
    this.creatures = this.initializeCreatures(width, height);
  }

  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();

    // Use shared background
    ctx.fillStyle = deepWaterBackground(ctx, height);
    ctx.fillRect(0, 0, width, height);

    // Scene-specific logic
    this.updateAndDrawCreatures(ctx, deltaTime, width, height);

    // Use shared particles
    updateMarineSnow(this.particles, 'down');
    drawMarineSnow(ctx, this.particles, width, height);

    // Use shared vignette
    ctx.fillStyle = vignette(ctx, width/2, height/2, height*0.25, height*0.85, 0.4);
    ctx.fillRect(0, 0, width, height);
  }

  private initializeCreatures(w: number, h: number): Creature[] {
    // Implementation...
  }

  private updateAndDrawCreatures(ctx, dt, w, h) {
    // Implementation...
  }
}
```

### Example 2: Scene Using Eyes + Lighting
```typescript
import {
  createEyes,
  updateEyes,
  drawEyes,
  drawPlayerLight,
  calculateIllumination,
} from '../effects';

export class AwareCreatureScene extends BaseCanvasScene {
  name = 'Aware Creature';
  private creature: Creature;
  private eyes: Eye[];

  protected async onInit(): Promise<void> {
    this.startCursorTracking();

    // Use shared eye system
    this.eyes = createEyes([
      { x: 200, y: 150, size: 20 },
      { x: 300, y: 150, size: 20 },
    ]);

    this.creature = { x: 250, y: 300 };
  }

  render(ctx, dt) {
    const { width, height } = this.getCanvasSize();
    const cursor = this.getCursorPos();

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Player light
    if (cursor.isOver) {
      drawPlayerLight(ctx, cursor.x, cursor.y, 200);
    }

    // Update eyes to look at light
    updateEyes(this.eyes, cursor.x, cursor.y, dt);
    drawEyes(ctx, this.eyes);

    // Calculate how illuminated the creature is
    const illumination = calculateIllumination(
      this.creature.x,
      this.creature.y,
      cursor.x,
      cursor.y,
      150
    );

    // Draw creature (brightness based on illumination)
    ctx.fillStyle = `rgba(200, 150, 100, ${illumination})`;
    ctx.beginPath();
    ctx.arc(this.creature.x, this.creature.y, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

---

## See Also

- [README.md](./README.md) - Library overview
- [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) - Theme system details
- Individual theme documentation in `src/themes/*/README.md` (if available)

---

**Last Updated:** January 2026
**Maintained by:** visual-toolkit team
