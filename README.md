# Visual Toolkit

A library encoding premium deep-sea visual aesthetics. Extracted from working code that "feels right."

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
timing.slow     // 0.002  - light pulse, tendril movement
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

## Color Palettes

### Deep Sea

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

## License

ISC
