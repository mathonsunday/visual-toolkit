# Visual Toolkit

A library encoding premium visual aesthetics with theme support. Extracted from working code that "feels right."

**Built-in Theme**: Deep-sea marine biology (`themes.deepSea`)  
**Extensible**: Register custom themes for jungle, space, or any aesthetic.

## Installation

### With a build system (TypeScript/ES modules)

```bash
npm install visual-toolkit
# or copy the src/ folder into your project
```

### Without a build system (plain JS)

Include the browser bundle directly:

```html
<script src="dist/visual-toolkit.min.js"></script>
<script>
  // Everything is available on window.VisualToolkit
  const { drawROV, drawJellyfish, timing, deepSea } = VisualToolkit;
</script>
```

---

## Architecture: Core + Themes

The library is organized into **core API** (theme-agnostic) and **themes** (presets):

```typescript
// Core API - works for any theme
import { timing, drift, material3D } from 'visual-toolkit';

// Theme presets - deep-sea specific
import { themes } from 'visual-toolkit';
themes.deepSea.colors.background
themes.deepSea.particles.marineSnow(100)
themes.deepSea.recipes.drawROV(ctx, x, y)
```

**Backward Compatibility**: The old API still works:
```typescript
import { deepSea, drawROV } from 'visual-toolkit'; // Still works!
```

See [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) for details.

---

## Why This Exists

LLMs generate generic visuals. They default to:
- Pure primaries (`#ff0000`, `#00ff00`)
- 1-2 second animations
- Flat colors
- Symmetric shapes
- Obvious effects

This toolkit encodes patterns that make visuals feel **premium** - not photorealistic, but crafted. Like a Pixar movie, not a stock image.

---

## Core Principles

### 1. Slowness Creates Premium

Generic animations use 1-2 second durations. Deep-sea creatures move glacially.

```typescript
import { timing } from 'visual-toolkit';

// DON'T: Math.sin(time * 0.1) — too fast, looks mechanical
// DO: Math.sin(time * timing.glacial) — barely perceptible, feels organic

// Timing multipliers (applied to frame counter ~16/frame):
timing.glacial  // 0.0008 - ROV rotation, leviathan approach
timing.verySlow // 0.001  - gentle drift
timing.slow     // 0.002  - light pulse, creature movement
timing.medium   // 0.003  - bio-pulse
timing.fast     // 0.005  - flee behavior
```

### 2. Flat Colors Look Cheap

Real materials have gradients suggesting 3D form. The key: 3-stop gradients with highlight → mid → shadow.

```typescript
import { materials, material3D } from 'visual-toolkit';

// DON'T: ctx.fillStyle = '#ffff00'; — pure yellow looks fake
// DO: Use the ROV yellow palette
const grad = material3D(ctx, x, y, width, height, materials.rovYellow);
// Creates: #e8a832 (highlight) → #d4942a (mid) → #b87820 (shadow)
```

### 3. Depth Through Layers

The secret to premium visuals: offset shadows drawn BEFORE the main shape.

```typescript
import { drawOffsetShadow, drawWithDepth, depthPresets } from 'visual-toolkit';

// Draw shadow first, then fill
drawOffsetShadow(ctx, () => ctx.fillRect(x, y, w, h), 4, 4);
ctx.fillRect(x, y, w, h);

// Or use the preset system
drawWithDepth(ctx, 'equipment', () => ctx.fillRect(x, y, w, h), gradient);
```

### 4. Organic Shapes Are Asymmetric

Creatures aren't perfectly round. Asymmetric border-radius creates life.

```typescript
import { organicRadii, organicRadius } from 'visual-toolkit';

// DON'T: border-radius: 50%;
// DO:
element.style.borderRadius = organicRadii.blob;  // '60% 50% 45% 55%'
element.style.borderRadius = organicRadius();    // random organic values
```

### 5. Glow Has Layers

Single-layer glows look flat. Stack multiple shadows with different blur radii.

```typescript
import { cssGlow, cssJellyfishGlow } from 'visual-toolkit';

// Multi-layer glow
element.style.boxShadow = cssGlow('rgba(100, 200, 255, 0.6)', 'medium');
// Creates: 0 0 20px rgba(..., 0.6), 0 0 40px rgba(..., 0.3)

// Jellyfish: outer glow + inner shadow for depth
element.style.boxShadow = cssJellyfishGlow();
```

---

## Themes

The library supports multiple themes. The **deep-sea theme** is built-in and auto-registered.

### Using Built-in Themes

```typescript
import { themes } from 'visual-toolkit';

// Deep-sea theme (built-in)
themes.deepSea.colors.background
themes.deepSea.colors.bioluminescence
themes.deepSea.particles.marineSnow(100)
themes.deepSea.recipes.drawROV(ctx, x, y)
themes.deepSea.gradients.deepWaterBackground(ctx, height)
```

### Registering Custom Themes

```typescript
import { registerTheme } from 'visual-toolkit';

registerTheme('jungle', {
  colors: {
    canopy: { light: '#2d5016', mid: '#1a3009', dark: '#0f1a05' },
  },
  particles: {
    rain: (count) => createRainParticles(count),
  },
  recipes: {
    drawTree: (ctx, x, y) => { /* ... */ },
  },
});

// Now available
themes.jungle.colors.canopy
themes.jungle.particles.rain(50)
```

See [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) for complete theme system documentation.

---

## Color Palettes

### Deep Sea Theme

Not "dark blue" - specific colors that feel like depth:

```typescript
import { deepSea } from 'visual-toolkit';

// Background layers (darkest at bottom)
deepSea.background.surface  // '#020810'
deepSea.background.mid      // '#051018'
deepSea.background.deep     // '#020a12'
deepSea.background.abyss    // '#010508'
```

### Bioluminescence

Cyan-ish hues (180-220°) with proper glow falloff:

```typescript
import { bioluminescence, bioGlow, randomBioHue } from 'visual-toolkit';

// Preset colors
bioluminescence.cyan.core   // 'rgba(100, 200, 255, 0.9)'
bioluminescence.warm.core   // 'rgba(255, 100, 80, 0.8)'

// Generate creature colors
const hue = randomBioHue();  // 180-220
const color = bioGlow(hue, 70, 60, 0.6);  // hsla string
```

### Materials

Real equipment colors, not primaries:

```typescript
import { materials } from 'visual-toolkit';

// ROV body (not #ffff00)
materials.rovYellow.highlight  // '#e8a832'
materials.rovYellow.mid        // '#d4942a'
materials.rovYellow.shadow     // '#b87820'

// Metal (not #000000)
materials.metal.light   // '#666666'
materials.metal.dark    // '#333333'
```

---

## Motion

### Drift & Bob

Organic movement combines multiple frequencies:

```typescript
import { drift, bob, pulse } from 'visual-toolkit';

function animate(time) {
  // ROV-style floating
  const movement = drift(time);
  rov.x += movement.x;
  rov.y += movement.y;
  rov.rotation = movement.rotation;
  
  // Jellyfish bob
  jellyfish.y += bob(time);
  
  // Glow pulse
  const scale = pulse(time, timing.medium, 0.8, 1.2);
}
```

### Tendril Physics

Follow-the-leader with organic waviness:

```typescript
import { createTendril, updateTendril } from 'visual-toolkit';

// Create
const tendril = createTendril(0, screenHeight / 2, 12);

// Each frame
updateTendril(tendril, mouseX, mouseY, time, recoilFactor);

// Draw
ctx.beginPath();
ctx.moveTo(tendril.startX, tendril.startY);
tendril.segments.forEach(seg => ctx.lineTo(seg.x, seg.y));
ctx.stroke();
```

### Seeker Behavior

Creatures that approach light, flee when it moves fast:

```typescript
import { createSeeker, updateSeeker } from 'visual-toolkit';

const seekers = Array.from({ length: 40 }, () => 
  createSeeker(canvas.width, canvas.height)
);

function animate() {
  for (const seeker of seekers) {
    updateSeeker(seeker, lightX, lightY, mouseSpeed, width, height);
    // Seeker now has updated x, y, glow, hue
  }
}
```

---

## Particles

### Marine Snow

```typescript
import { createMarineSnow, updateMarineSnow, drawMarineSnow } from 'visual-toolkit';

const particles = createMarineSnow(80);

function animate() {
  updateMarineSnow(particles, 'down');  // or 'up' for descending ROV
  drawMarineSnow(ctx, particles, width, height);
}
```

### CSS Version

```typescript
import { htmlMarineSnow, cssMarineSnowStyles } from 'visual-toolkit';

// Add to your page
document.head.innerHTML += `<style>${cssMarineSnowStyles}</style>`;
container.innerHTML += htmlMarineSnow(20);
```

---

## Shapes

### Mechanical Details

```typescript
import { drawPanelLines, drawGrille, drawLight, drawLens } from 'visual-toolkit';

// ROV panel lines
drawPanelLines(ctx, x, y, width, height, [0.25, 0.75]);

// Thruster grilles
drawGrille(ctx, x, y, width, height, 4);

// Lights with glow
drawLight(ctx, x, y, 8, true, time);

// Camera lens with glint
drawLens(ctx, x, y, 12, 8);
```

### Creature Parts

```typescript
import { drawTrackingEye, drawTentacle } from 'visual-toolkit';

// Eye that follows player, reacts to light
drawTrackingEye(ctx, eyeX, eyeY, 8, playerX, playerY, illumination);

// Tentacle from segment array
drawTentacle(ctx, tendril.segments, tendril.thickness);
```

---

## CSS Helpers

### Gradients

```typescript
import { cssDeepWater, cssBioGlow, cssCreatureBody } from 'visual-toolkit';

element.style.background = cssDeepWater();
glow.style.background = cssBioGlow('cyan');
creature.style.background = cssCreatureBody(0.8);
```

### Timing

```typescript
import { cssTimings, staggerDelay } from 'visual-toolkit';

element.style.animationDuration = cssTimings.drift;  // '8s'
element.style.animationDelay = staggerDelay(index);  // '0.9s' for index 3
```

---

## Full Example: Simple Deep Sea Scene

```typescript
import {
  deepSea,
  timing,
  deepWaterBackground,
  createMarineSnow,
  updateMarineSnow,
  drawMarineSnow,
  createBioParticles,
  drawBioParticles,
  vignette,
} from 'visual-toolkit';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const snow = createMarineSnow(60);
const bio = createBioParticles(12);
let time = 0;

function render() {
  // Background
  ctx.fillStyle = deepWaterBackground(ctx, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Particles
  updateMarineSnow(snow, 'down');
  drawMarineSnow(ctx, snow, canvas.width, canvas.height);
  drawBioParticles(ctx, bio, canvas.width, canvas.height, time);
  
  // Vignette
  ctx.fillStyle = vignette(ctx, canvas.width/2, canvas.height/2, 
    canvas.height * 0.3, canvas.height * 0.8);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  time += 16;
  requestAnimationFrame(render);
}

render();
```

---

## Recipes (Complete Objects)

High-level functions that draw complete objects, combining all the primitives.

### ROV (Underwater Vehicle)

```typescript
import { drawROV } from 'visual-toolkit';

function render() {
  drawROV(ctx, canvas.width / 2, canvas.height * 0.4, 1.2, {
    lightsOn: true,
    showTether: true,
    showArm: true,
    time: frameCount,
    rotation: Math.sin(frameCount * 0.0008) * 0.03,
  });
}
```

### Light Cone

```typescript
import { drawLightCone } from 'visual-toolkit';

// Draw cone of light from ROV pointing down
drawLightCone(ctx, rovX, rovY + 50, Math.PI / 2, 300, {
  spread: 0.6,        // radians
  startOpacity: 0.2,
  color: { r: 255, g: 250, b: 230 },
});
```

### Jellyfish

```typescript
import { drawJellyfish } from 'visual-toolkit';

drawJellyfish(ctx, 200, 150, {
  bellWidth: 60,
  tentacleCount: 4,
  time: frameCount,
  glowIntensity: 0.5,
});
```

### Specimen (Mysterious Creature)

```typescript
import { drawSpecimen } from 'visual-toolkit';

// Reveals more details when illuminated
drawSpecimen(ctx, 300, 200, {
  width: 70,
  time: frameCount,
  illumination: 0.5,  // 0-1, how much light is on it
  lookAt: { x: mouseX, y: mouseY },  // eye tracking
});
```

---

## Browser Bundle (No Build System)

For projects without TypeScript/bundlers, use the pre-built browser bundle:

```html
<script src="path/to/visual-toolkit.min.js"></script>
<script>
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let time = 0;

  function render() {
    // Clear with deep water gradient
    ctx.fillStyle = VisualToolkit.deepWaterBackground(ctx, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ROV
    VisualToolkit.drawROV(ctx, canvas.width / 2, 150, 1, {
      lightsOn: true,
      time: time,
    });

    // Draw light beams
    VisualToolkit.drawLightCone(ctx, canvas.width / 2, 200, Math.PI / 2, 250);

    // Draw creatures
    VisualToolkit.drawJellyfish(ctx, 100, 300, { time: time });
    VisualToolkit.drawSpecimen(ctx, 400, 280, { time: time, illumination: 0.3 });

    // Vignette
    ctx.fillStyle = VisualToolkit.vignette(ctx, canvas.width/2, canvas.height/2, 
      canvas.height * 0.3, canvas.height * 0.8);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 16;
    requestAnimationFrame(render);
  }

  render();
</script>
```

---

## Lighting Helpers

### Calculate Illumination

```typescript
import { calculateIllumination } from 'visual-toolkit';

// How lit is this creature by the player's light?
const illumination = calculateIllumination(mouseX, mouseY, creatureX, creatureY, 250);

if (illumination > 0.4) {
  // Reveal hidden details
}
```

Uses squared falloff for natural light decay.

### Draw Player Light

```typescript
import { drawPlayerLight } from 'visual-toolkit';

// Complete multi-layer light effect in one call
drawPlayerLight(ctx, mouseX, mouseY, 120, {
  intensity: 1,
  pulseTime: frameCount,  // optional subtle pulse
});
```

### Organic Surface Texture

```typescript
import { drawOrganicTexture } from 'visual-toolkit';

// Fill background first
ctx.fillStyle = '#0a0a12';
ctx.fillRect(0, 0, width, height);

// Add living texture
drawOrganicTexture(ctx, width, height, {
  density: 25,
  color: { r: 20, g: 30, b: 40 },
  intensity: 0.15,
  time: frameCount,  // optional slow movement
});
```

### Caustics

```typescript
import { drawCaustics } from 'visual-toolkit';

// Light filtering through water at top of scene
drawCaustics(ctx, width, height, frameCount, {
  count: 5,
  heightRatio: 0.4,
  intensity: 0.03,
});
```

---

## Eye System

For scenes with multiple reactive eyes that track, blink, and dilate.

### Create and Update Eyes

```typescript
import { createEye, updateEye, drawEye } from 'visual-toolkit';

// Create eyes
const eyes = [
  createEye({ x: 100, y: 150, size: 8 }),
  createEye({ x: 400, y: 200, size: 6, hue: 30 }),  // orange eye
  createEye({ x: 250, y: 300, size: 10, awarenessRadius: 300 }),
];

function render() {
  // Update all eyes (handles blinking, tracking, dilation)
  for (const eye of eyes) {
    updateEye(eye, mouseX, mouseY, 16);
  }
  
  // Draw all eyes
  for (const eye of eyes) {
    drawEye(ctx, eye);
  }
}
```

### Batch Operations

```typescript
import { createEyes, updateEyes, drawEyes } from 'visual-toolkit';

const eyes = createEyes([
  { x: 100, y: 150, size: 8 },
  { x: 400, y: 200, size: 6 },
]);

function render() {
  updateEyes(eyes, mouseX, mouseY, 16);
  drawEyes(ctx, eyes);
}
```

### Eye Properties

Eyes automatically:
- Track the light source (pupil follows)
- Contract pupils in bright light (slit at illumination > 0.4)
- Dilate pupils in darkness
- Blink at random intervals
- Glow brighter when illuminated

---

## Note: Tendrils Removed

Tendril support (`createTendril`, `updateTendril`, `drawTendril`, etc.) was removed from the library due to fundamental challenges with creating convincing appendage behavior:

- **Disembodiment problem**: Even with reach limits and base mass rendering, tendrils often looked like floating worms rather than attached appendages
- **Synchronization issues**: Multiple tendrils reacting to the same light source moved identically, lacking independent behavior
- **Visual quality**: Despite bezier curves and multi-layer rendering, results often looked artificial compared to simpler approaches

**Alternative approach**: For creature appendages, consider custom creature shapes (like jellyfish bells with tentacles) rather than generic tendril physics.

---

## Seeker Swarms

For scenes with many bioluminescent creatures.

### Create with Center Bias

```typescript
import { createSeekerSwarm, updateSeekerSwarm, drawSeekerSwarm } from 'visual-toolkit';

// Center-biased swarm that won't cluster at edges
const seekers = createSeekerSwarm(40, canvas.width, canvas.height, {
  spawnBias: 'center',  // 'uniform' | 'center' | 'edges'
  sizeRange: [2, 8],
  speedRange: [1, 4],
  hueRange: [180, 220],
});
```

### Update with Center Drift

```typescript
// centerDrift prevents edge clustering when wandering
updateSeekerSwarm(seekers, mouseX, mouseY, mouseSpeed, width, height, 0.02);
```

### Draw with Proper Layering

```typescript
// Dim seekers render behind, bright ones in front
drawSeekerSwarm(ctx, seekers, {
  lightX: mouseX,
  lightY: mouseY,
  lightRadius: 200,
  time: frameCount,
});
```

### Reusable Bioluminescent Glow

```typescript
import { drawBiolumGlow } from 'visual-toolkit';

// For any glowing point - creatures, particles, etc.
drawBiolumGlow(ctx, x, y, size, hue, intensity, time);
```

---

## Organic Surfaces

Draw surfaces that read as SOLID (flesh, rock, membrane) - not void or holes.

### The Problem
Radial gradients look like holes/sockets. That's bad when you're drawing a wall with eyes on it.

### The Solution
`drawOrganicSurface()` uses directional patterns (veins, grain, ridges) instead of radial gradients.

```typescript
import { drawOrganicSurface, drawEyes } from 'visual-toolkit';

// Draw the wall FIRST
drawOrganicSurface(ctx, canvas.width, canvas.height, {
  preset: 'visible',     // 'visible' | 'subtle' | 'dramatic'
  type: 'fleshy',        // 'fleshy' | 'abyssal' | 'rocky' | 'membranous'
  lightX: mouseX,        // Surface responds to light
  lightY: mouseY,
  lightRadius: 200,
  time: frameCount,      // Optional subtle animation
});

// THEN draw eyes on top
drawEyes(ctx, eyes);
```

### Visibility Presets

| Preset | Use Case |
|--------|----------|
| `visible` | Main features (The Wall) - clear, high-contrast |
| `subtle` | Background texture - muted, ambient depth |
| `dramatic` | Horror scenes - high vein density, strong light response |

### Performance: Caching the Base Layer

The per-pixel noise is expensive. For animated scenes, cache to offscreen canvas:

```typescript
// Cache once
const offscreen = document.createElement('canvas');
offscreen.width = width; offscreen.height = height;
drawOrganicSurface(offscreen.getContext('2d'), width, height, { 
  preset: 'visible',
  type: 'fleshy',
  time: 0,  // static base
});

// In render loop - reuse cached base
ctx.drawImage(offscreen, 0, 0);

// Draw dynamic elements on top
drawFleshLightResponse(ctx, ...);  // light
drawEyes(ctx, eyes);               // eyes
```

### Surface Types

| Type | Description |
|------|-------------|
| `fleshy` | Whale/squid flesh, reddish veins, subsurface scattering |
| `abyssal` | Deep-sea creature, blue-gray with bioluminescent hints |
| `rocky` | Cave wall, gray-blue tones |
| `membranous` | Thin tissue, purple tones, visible veins |

### Additional Surface Elements

```typescript
import { drawBarnacles, drawScarring } from 'visual-toolkit';

// Add barnacle clusters (raised bumps, NOT holes)
drawBarnacles(ctx, 200, 150, 40, { count: 10 });

// Add scarring (linear marks that read as scratches)
drawScarring(ctx, 100, 200, 80, { angle: 0.3, width: 4 });
```

### Surface Light Response

When you provide `lightX` and `lightY`, the surface:
- Shows highlights where light hits
- Has subsurface scattering for fleshy/membranous types (warm glow)
- Reveals texture without creating "hole" artifacts

---

## Performance Considerations

### Shadow Blur

`ctx.shadowBlur` is expensive. Recommended limits:

- **6-12px** for most shadows
- **Avoid** blur > 20px unless necessary
- Consider using offset shadows without blur for better performance

### Segment Counts

Fewer segments perform better:

- **8-12 segments** for organic shapes (tendrils, creatures)
- **Avoid** 20+ segments unless detail is critical
- Each segment adds draw calls

### Light Layers

Multiple light layers can be costly:

- **1-2 layers** recommended for most scenes
- Each additional layer adds full-screen gradient operations
- Consider caching static light layers to offscreen canvas

### Organic Surface Caching

The per-pixel noise in `drawOrganicSurface` is expensive. For animated scenes:

```typescript
// Cache once
const offscreen = document.createElement('canvas');
offscreen.width = width; offscreen.height = height;
drawOrganicSurface(offscreen.getContext('2d'), width, height, { 
  preset: 'visible',
  type: 'fleshy',
  time: 0,  // static base
});

// In render loop - reuse cached base
ctx.drawImage(offscreen, 0, 0);
// Then draw dynamic elements (light response, eyes, seekers)
```

### General Tips

- **Batch operations**: Draw similar elements together (e.g., all seekers, then all particles)
- **Cull off-screen**: Skip rendering elements outside viewport
- **Reduce gradients**: Prefer solid colors where possible
- **Limit particles**: 50-100 particles perform well; 500+ may cause issues

---

## License

ISC
