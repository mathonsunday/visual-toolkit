# Scene Extraction Guide

**Purpose:** Step-by-step guide for extracting scenes from narrative-os or living-os into visual-toolkit

**Duration:** 2 hours (previously 3-4 hours with higher bug risk)

**Architecture:** Scene-First - scenes are self-contained and reuse shared effects

---

## Checklist

### Pre-Extraction (15 minutes)
- [ ] Understand what the scene does visually (what creatures, effects, interactions?)
- [ ] Identify the visual style/theme (deep-sea, living-os, garden, etc.)
- [ ] Check if similar scenes already exist in visual-toolkit
- [ ] Review the target theme's `effects.ts` file to see available utilities

### Extraction (90 minutes)
- [ ] Create new scene class extending BaseCanvasScene
- [ ] Implement `name`, `description`, `defaultConfig`
- [ ] Implement `onInit()` - initialize data and effects
- [ ] Implement `render()` - draw the scene each frame
- [ ] Replace inline effects with imports from `effects.ts`
- [ ] Test rendering, cursor tracking, canvas resize

### Integration (15 minutes)
- [ ] Register scene in theme's `index.ts`
- [ ] Export from `src/index.ts`
- [ ] Write basic tests
- [ ] Verify visual output matches original

### Verification (20 minutes)
- [ ] Run test suite (all tests passing)
- [ ] Visual regression test (compare to original)
- [ ] Check bundle build (no errors)
- [ ] Verify cursor tracking works
- [ ] Test on 1x, 2x, and 3x device pixel ratios

---

## Step 1: Create the Scene File

Create a new file in the appropriate theme:
- Deep Sea: `src/scenes/themes/deep-sea/your-scene.ts`
- Living OS: `src/scenes/themes/living-os/your-scene.ts`
- Garden: `src/scenes/themes/garden/your-scene.ts`

```typescript
/**
 * YOUR SCENE NAME - Brief description
 *
 * Visual characteristics:
 * - What creatures or objects appear?
 * - What is the lighting style?
 * - What interactions occur?
 */

import { BaseCanvasScene, CanvasScene, SceneConfig, CursorPos } from '../../base-scene.js';
import {
  // Import shared effects from the theme
  deepWaterBackground,
  drawPlayerLight,
  createMarineSnow,
  updateMarineSnow,
  drawMarineSnow,
  vignette,
} from '../effects.js';

export class YourSceneClass extends BaseCanvasScene {
  name = 'Your Scene Name';
  description = 'Brief description of what the scene shows';

  defaultConfig: Partial<SceneConfig> = {
    width: 1024,
    height: 768,
  };

  // ============================================
  // SCENE STATE
  // ============================================

  // Add properties for things that change over time
  private particles: Particle[] = [];
  private time = 0;
  // ... other state

  // ============================================
  // LIFECYCLE
  // ============================================

  /**
   * Initialize scene - called once when scene loads
   * Use this to set up initial state and start animations
   */
  protected async onInit(): Promise<void> {
    // Enable cursor tracking if your scene responds to mouse
    this.startCursorTracking();

    const { width, height } = this.getCanvasSize();

    // Initialize particles using shared effect
    this.particles = createMarineSnow(10);

    // Initialize scene-specific objects
    // ...
  }

  /**
   * Render - called every frame (60fps)
   * This is where you draw everything
   */
  render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const { width, height } = this.getCanvasSize();
    const cursor = this.getCursorPos();

    // ============================================
    // BACKGROUND
    // ============================================

    // Use theme effect for background
    ctx.fillStyle = deepWaterBackground(ctx, height);
    ctx.fillRect(0, 0, width, height);

    // ============================================
    // SCENE-SPECIFIC CONTENT
    // ============================================

    // Only code that's unique to this scene
    this.updateAndDraw(ctx, width, height, deltaTime);

    // ============================================
    // SHARED EFFECTS
    // ============================================

    // Player light (ROV spotlight)
    if (cursor.isOver) {
      drawPlayerLight(ctx, cursor.x, cursor.y, 200);
    }

    // Particles
    updateMarineSnow(this.particles, 'down');
    drawMarineSnow(ctx, this.particles, width, height);

    // Vignette (darkens edges)
    ctx.fillStyle = vignette(ctx, width / 2, height / 2, height * 0.25, height * 0.85, 0.4);
    ctx.fillRect(0, 0, width, height);

    // Update time for animations
    this.time += deltaTime;
  }

  // ============================================
  // SCENE-SPECIFIC IMPLEMENTATION
  // ============================================

  private updateAndDraw(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void {
    // All the unique logic for this scene
    // Draw creatures, objects, effects that are specific to this scene
  }
}
```

---

## Step 2: Identify Available Effects

Check the theme's `effects.ts` file to see what you can reuse:

```bash
# Deep Sea - most complete effects library
cat src/themes/deepSea/effects.ts

# Living OS - growth, plant, motion effects
cat src/themes/livingOs/effects.ts

# Garden - botanical effects
cat src/themes/garden/effects.ts
```

**Common effects you'll likely use:**
- `deepWaterBackground()` or equivalent - Background gradient
- `drawPlayerLight()` / `drawVignette()` - Lighting
- `createMarineSnow()` + `drawMarineSnow()` - Floating particles
- `createEyes()` + `updateEyes()` + `drawEyes()` - Eye tracking
- `pulse()`, `drift()`, `bob()` - Animation helpers

---

## Step 3: Replace Inline Code with Effects

### Pattern: Background Gradient

**Before (Inline - DON'T):**
```typescript
// 15 lines of gradient code in every scene
const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
bgGrad.addColorStop(0, '#020911');
bgGrad.addColorStop(0.5, '#010508');
bgGrad.addColorStop(1, '#000305');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, width, height);
```

**After (Using Effect - DO):**
```typescript
// 1 line
ctx.fillStyle = deepWaterBackground(ctx, height);
ctx.fillRect(0, 0, width, height);
```

### Pattern: Player Light / Spotlight

**Before (Inline - DON'T):**
```typescript
// 20+ lines of radial gradients and drawing
if (cursor.isOver) {
  const grad = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 200);
  grad.addColorStop(0, 'rgba(200, 240, 255, 0.15)');
  // ... more color stops
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, 200, 0, Math.PI * 2);
  ctx.fill();
  // ... core drawing code
}
```

**After (Using Effect - DO):**
```typescript
// 1 line
if (cursor.isOver) {
  drawPlayerLight(ctx, cursor.x, cursor.y, 200);
}
```

### Pattern: Particles

**Before (Inline - DON'T):**
```typescript
// 30+ lines of particle creation and updating
const particles: Particle[] = [];
for (let i = 0; i < 10; i++) {
  particles.push({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.008 + 0.003,
    alpha: Math.random() * 0.5 + 0.2,
  });
}

// In render:
for (const p of particles) {
  p.y += p.speed;
  // wrapping code...
  ctx.beginPath();
  ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(180, 200, 220, ${p.alpha})`;
  ctx.fill();
}
```

**After (Using Effect - DO):**
```typescript
// In onInit:
this.particles = createMarineSnow(10); // That's it!

// In render:
updateMarineSnow(this.particles, 'down');
drawMarineSnow(ctx, this.particles, width, height);
```

### Pattern: Eyes with Light Tracking

**Before (Inline - DON'T):**
```typescript
// 130 lines of eye logic (blinking, pupil tracking, illumination)
const eyes = [];
for (let i = 0; i < 10; i++) {
  eyes.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 8 + Math.random() * 4,
    openness: 1,
    awareness: 150,
    // ... more properties
  });
}

// Manual blinking logic
// Manual pupil tracking
// Manual illumination calculation
// 100+ lines of drawing code
```

**After (Using Effect - DO):**
```typescript
// In onInit:
this.eyes = createEyes([
  { x: 200, y: 150, size: 12 },
  { x: 300, y: 150, size: 12 },
  // ... more eyes
]);

// In render:
updateEyes(this.eyes, cursor.x, cursor.y, deltaTime);
drawEyes(ctx, this.eyes);
```

---

## Step 4: Register the Scene

Add your scene to the theme's `index.ts`:

```typescript
// src/scenes/themes/deep-sea/index.ts

import { deepSea as deepSeaTheme } from '../../../themes/deepSea/index.js';

// Import your new scene
import { YourSceneClass } from './your-scene.js';

// ... existing scenes

// Export collection
export const deepSea = {
  // ... existing scenes
  yourScene: new YourSceneClass(),
};

// Update default export if needed
export default deepSea;
```

Then export from main `src/index.ts`:

```typescript
// src/index.ts
export { scenes } from './scenes/index.js';

// Users can now access:
// scenes.deepSea.yourScene
```

---

## Step 5: Write Tests

Create a basic test file:

```typescript
// src/scenes/themes/deep-sea/your-scene.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { YourSceneClass } from './your-scene.js';

describe('YourSceneClass', () => {
  let scene: YourSceneClass;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    scene = new YourSceneClass();
  });

  it('should initialize without errors', async () => {
    await scene.init(canvas, {});
    expect(scene.name).toBe('Your Scene Name');
  });

  it('should render without errors', () => {
    const ctx = canvas.getContext('2d')!;
    expect(() => {
      scene.render(ctx, 16); // ~60fps
    }).not.toThrow();
  });

  it('should clean up properly', () => {
    scene.cleanup();
    // If you have cleanup logic, verify it ran
  });
});
```

---

## Step 6: Verify

### Visual Regression Testing

1. **Capture original** - Take screenshot of scene in narrative-os/living-os
2. **Capture extracted** - Take screenshot of scene in visual-toolkit
3. **Compare** - Use pixel-by-pixel comparison allowing 1% difference for antialiasing
4. **Check interactions** - Verify cursor tracking works, canvas resizes properly

### Run Test Suite

```bash
npm test
```

All 303 tests should pass. If not:
- Fix the failing tests
- Don't proceed until all pass

### Build & Bundle

```bash
npm run build
```

Should complete without errors or warnings.

---

## Common Patterns

### Animation with Time

Use `this.time` which increments each frame:

```typescript
private time = 0;

render(ctx, dt) {
  // ... drawing code

  // Pulse effect
  const pulse = (Math.sin(this.time * 0.003) + 1) / 2; // 0-1
  const glowSize = 20 + pulse * 10;

  // Drift effect
  const drift = Math.sin(this.time * 0.002) * 5;
  ctx.translate(drift, 0);

  this.time += dt;
}
```

### Cursor Tracking

```typescript
protected async onInit(): Promise<void> {
  this.startCursorTracking(); // Enable cursor events
}

render(ctx, dt) {
  const cursor = this.getCursorPos();

  if (cursor.isOver) {
    // Draw light at cursor position
    drawPlayerLight(ctx, cursor.x, cursor.y, 200);
  }
}
```

### Canvas Size Handling

```typescript
render(ctx, dt) {
  const { width, height } = this.getCanvasSize();
  const center = this.getCanvasCenter();

  // Width and height are actual canvas dimensions (respects DPR)
  // Safe to use for drawing operations
  ctx.fillRect(0, 0, width, height);
}

protected onCanvasResize(): void {
  // Called when canvas is resized
  // Re-initialize things that depend on canvas size
}
```

---

## Troubleshooting

### Scene looks different from original

**Check:**
1. Are all effects being called? Print to console to verify
2. Are parameters correct? (width, height, colors, options)
3. Is the theme correct? (deep-sea vs living-os colors)
4. Are you using the latest effect signatures?

### Test failures

**Check:**
1. `npm test` - Run full test suite to see failures
2. Is your scene properly registered in index.ts?
3. Are you exporting the scene class?

### Rendering performance issues

**Optimize:**
1. Reduce particle count if too many
2. Use canvas context efficiently (batch draws)
3. Check if you're creating objects every frame (should be in onInit)
4. Use `drawOrganicSurface` instead of inline simplex noise

### Cursor tracking not working

**Check:**
1. Did you call `this.startCursorTracking()` in `onInit()`?
2. Are you using `this.getCursorPos()` to get coordinates?
3. Is `cursor.isOver` true when mouse is over canvas?

---

## Quick Reference

### File Structure
```
src/scenes/themes/deep-sea/
├── shadows.ts              ← Scene implementation
├── leviathan.ts
├── wall.ts
├── your-scene.ts           ← Your new scene
├── index.ts                ← Register here
└── your-scene.test.ts      ← Tests

src/themes/deepSea/
├── colors.ts               ← Color palettes
├── gradients.ts            ← Gradient functions
├── particles.ts            ← Particle systems
├── effects.ts              ← All shared effects (USE THIS!)
└── index.ts
```

### Typical Render Method Structure
```typescript
render(ctx, deltaTime) {
  // 1. Get canvas/cursor info
  const { width, height } = this.getCanvasSize();
  const cursor = this.getCursorPos();

  // 2. Background (1-3 lines using effects)
  ctx.fillStyle = deepWaterBackground(ctx, height);
  ctx.fillRect(0, 0, width, height);

  // 3. Scene-specific content (bulk of code)
  this.updateAndDrawContent(ctx, width, height, deltaTime);

  // 4. Shared overlays (3-10 lines using effects)
  if (cursor.isOver) drawPlayerLight(ctx, cursor.x, cursor.y, 200);
  updateMarineSnow(this.particles, 'down');
  drawMarineSnow(ctx, this.particles, width, height);

  // 5. Vignette (1-2 lines)
  ctx.fillStyle = vignette(ctx, width/2, height/2, height*0.25, height*0.85, 0.4);
  ctx.fillRect(0, 0, width, height);

  // 6. Update time
  this.time += deltaTime;
}
```

---

## See Also

- [SCENE_FIRST_ARCHITECTURE.md](./SCENE_FIRST_ARCHITECTURE.md) - Architecture guide
- [README.md](./README.md) - Library overview
- Example scenes:
  - `src/scenes/themes/deep-sea/shadows.ts` - Simple example
  - `src/scenes/themes/deep-sea/leviathan.ts` - Complex example with eyes
  - `src/scenes/themes/deep-sea/wall.ts` - Organic surface example

---

**Last Updated:** January 2026
**Target Duration:** 2 hours
