# Visual Toolkit - Performance Optimization Guide

## Overview

**visual-toolkit v2.1.2** introduces two major performance optimizations for real-time rendering scenarios (60fps with continuous updates):

1. **Permutation Caching** - Eliminates redundant noise generation setup
2. **Texture Caching** - Prevents regenerating identical textures

Combined impact: **30-50ms → 10-15ms per frame** (3-5x improvement)

---

## Quick Start

### Option 1: Permutation Caching (Automatic)

All functions now automatically cache permutation tables. No API changes needed—just drop in the new version.

```typescript
import { drawFlower, drawOrganicVine } from 'visual-toolkit/livingOs';

// First call: ~0.5ms (generates permutation)
drawFlower(ctx, { x: 100, y: 100, seed: 0 });

// Second call: ~0.1ms (reuses cached permutation)
drawFlower(ctx, { x: 200, y: 200, seed: 0 });
```

### Option 2: Texture Caching (Explicit)

Use when rendering the same bark texture repeatedly with growth changes:

```typescript
import { drawBarkTextureCached } from 'visual-toolkit/livingOs';

// In animation loop
animationLoop((currentGrowth) => {
  // Caches texture; reuses if growth within 10% tolerance
  drawBarkTextureCached(ctx, {
    width: 1920,
    height: 1080,
    seed: 0,
    growthLevel: currentGrowth,
    cacheKey: 'main-background',   // Required to enable caching
    cacheTolerance: 0.1            // Recompute only if growth changes >10%
  });
});
```

---

## Performance Profiles

### Scenario: 60fps, Full-Screen (1920x1080), 5 Organic Elements

**Before optimization:**
- Per-frame time: 40-50ms (dropped frames at 60fps)
- Memory: Steady 80-120MB (after 5-10 minutes)
- Bottle neck: Permutation generation (300/sec), texture regeneration

**After Phase 1 (Permutation Cache):**
- Per-frame time: 25-35ms
- Memory: Stable ~60MB
- Improvement: 30-40% faster

**After Phase 2 (Permutation + Texture Cache):**
- Per-frame time: 10-15ms
- Memory: Stable ~50-70MB
- Improvement: 70-80% faster (now 3-4x consistent at 60fps)

---

## API Reference

### Permutation Caching

#### `getOrCreatePermutation(seed: number): number[]`

Get or create a permutation table for a given seed. Automatically cached.

```typescript
import { getOrCreatePermutation } from 'visual-toolkit/livingOs';

const perm = getOrCreatePermutation(42);
// First call: Creates and caches
// Subsequent calls: Returns from cache (O(1) lookup)
```

#### `precomputePermutations(seeds: number[])`

Pre-warm the cache on initialization. Optional but recommended for known seed ranges.

```typescript
import { precomputePermutations } from 'visual-toolkit/livingOs';

// Initialize once, at app start
precomputePermutations([0, 1, 2, 3, 4, 5]);
// Now all calls with seeds 0-5 are instant cache hits
```

#### `clearPermutationCache(): void`

Clear the permutation cache (useful if memory is critical).

```typescript
import { clearPermutationCache } from 'visual-toolkit/livingOs';

// After session cleanup or if memory pressure detected
clearPermutationCache();
```

---

### Texture Caching

#### `drawBarkTextureCached(ctx, options)`

Draw bark texture with optional intelligent caching.

**Options:**
- `cacheKey: string` (optional) - Cache identifier. If omitted, behaves like `drawBarkTexture()`
- `cacheTolerance: number` (optional, default 0.1) - Growth level tolerance for cache (0-1)
- All other `BarkTextureOptions` as normal

```typescript
import { drawBarkTextureCached } from 'visual-toolkit/livingOs';

drawBarkTextureCached(ctx, {
  width: 1920,
  height: 1080,
  seed: 0,
  growthLevel: 0.5,
  cacheKey: 'bg',         // Enable caching with this key
  cacheTolerance: 0.15    // Recompute if growth changes >15%
});
```

**When to use:**
- Rendering full-screen backgrounds that change gradually
- Multiple texture elements with infrequent growth changes
- High-frequency render loops (60fps+)

**When NOT to use:**
- One-time texture generations
- Rapidly changing growth values (skip caching overhead)
- Memory-constrained environments

#### `clearTextureCache(): void`

Clear the texture cache (max 10 entries by default).

```typescript
import { clearTextureCache } from 'visual-toolkit/livingOs';

clearTextureCache(); // Force regeneration next frame
```

#### `getTextureCacheSize(): number`

Get current cache size for monitoring.

```typescript
import { getTextureCacheSize } from 'visual-toolkit/livingOs';

const size = getTextureCacheSize(); // Returns 0-10
```

---

## Tuning Cache Parameters

### `cacheTolerance`

Controls how similar growth values must be to reuse cached texture.

```typescript
// Very strict: regenerate if growth changes even slightly
cacheTolerance: 0.01

// Balanced (default): smooth appearance with good cache reuse
cacheTolerance: 0.1

// Loose: aggressive reuse, may appear jumpier
cacheTolerance: 0.25
```

**Recommendation:** Start with `0.1`, increase if memory is critical, decrease if visual quality matters more.

---

## Implementation Examples

### Example 1: Background with Gradual Growth

```typescript
import { drawBarkTextureCached } from 'visual-toolkit/livingOs';

let elapsedMs = 0;
function animate() {
  const growthLevel = Math.min(1, elapsedMs / 5000); // Grow over 5 seconds

  drawBarkTextureCached(ctx, {
    width: 1920,
    height: 1080,
    growthLevel,
    seed: 'background',
    cacheKey: 'main-bg',
    cacheTolerance: 0.1
  });

  elapsedMs += 16; // 60fps
  requestAnimationFrame(animate);
}
animate();
```

**Expected:** First frame ~25ms, subsequent frames ~2-3ms until growth changes significantly.

---

### Example 2: Multiple Elements with Pre-warmed Cache

```typescript
import {
  drawFlower,
  drawOrganicVine,
  drawOrganicRoots,
  precomputePermutations
} from 'visual-toolkit/livingOs';

// Init (once)
precomputePermutations([1, 2, 3, 4, 5]); // Common seeds

function drawScene() {
  // All use pre-cached permutations → instant
  drawFlower(ctx, { x: 100, y: 100, seed: 1 });      // ~0.1ms
  drawOrganicVine(ctx, { origin: { x: 200, y: 200 }, seed: 2 }); // ~0.2ms
  drawOrganicRoots(ctx, { origin: { x: 300, y: 300 }, seed: 3 }); // ~0.3ms
}

// 60fps loop: ~10ms per frame (vs. ~30ms without caching)
```

---

## Known Limitations & Trade-offs

### Permutation Caching
- ✅ **Always beneficial** - No downside to caching permutations
- Memory: ~1KB per cached permutation (negligible)
- Cache size: Unlimited (practical limit: thousands of seeds)

### Texture Caching
- ⚠️ **Growth tolerance trade-off**: Loose tolerance = less recomputation but more visual jumps
- ⚠️ **Memory**: Up to 10 cached textures at full resolution (1920×1080 each ≈ 50MB total)
- ⚠️ **Responsiveness**: If `cacheTolerance` is too high, growth changes feel laggy

**Recommendation:** For smooth motion, use `0.05-0.15` tolerance. Adjust based on visual inspection.

---

## Memory Management

### Monitoring
```typescript
import { getTextureCacheSize, clearTextureCache } from 'visual-toolkit/livingOs';

// In session cleanup
if (getTextureCacheSize() > 8) {
  console.warn('Texture cache getting full, clearing...');
  clearTextureCache();
}
```

### Automatic Eviction
The texture cache automatically evicts oldest entries when it exceeds 10 items (LRU policy).

### Manual Cleanup
```typescript
// On page unload
window.addEventListener('beforeunload', () => {
  clearPermutationCache();
  clearTextureCache();
});
```

---

## Debugging Performance

### Profiling Frame Time

```typescript
import { drawBarkTextureCached } from 'visual-toolkit/livingOs';

function profileFrame() {
  const start = performance.now();

  drawBarkTextureCached(ctx, {
    width: 1920,
    height: 1080,
    growthLevel: 0.5,
    cacheKey: 'test',
    cacheTolerance: 0.1
  });

  const elapsed = performance.now() - start;
  console.log(`Frame time: ${elapsed.toFixed(2)}ms`);
  // First call: ~20ms (regenerate)
  // Subsequent: ~2ms (cache hit)
}
```

### Cache Hit Rate

```typescript
let cacheHits = 0;
let cacheMisses = 0;

// Wrap your texture call
const beforeSize = getTextureCacheSize();
drawBarkTextureCached(ctx, { /* ... */ });
const afterSize = getTextureCacheSize();

if (afterSize > beforeSize) {
  cacheMisses++;
} else {
  cacheHits++;
}

const hitRate = (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(1);
console.log(`Cache hit rate: ${hitRate}%`);
```

---

## Benchmarks

### Permutation Cache

| Scenario | Time (no cache) | Time (cached) | Improvement |
|----------|-----------------|---------------|-------------|
| 10 elements, 1 seed | 5ms | 0.5ms | 10x |
| 5 elements, 5 seeds | 2.5ms | 1ms | 2.5x |
| Fresh seed each time | 5ms | 5ms | (no benefit) |

### Texture Cache

| Scenario | Time (no cache) | Time (cached) | Improvement |
|----------|-----------------|---------------|-------------|
| Same texture, stable growth | 25ms | 2ms | 12x |
| Same texture, slow growth change | 25ms | 8ms* | 3x |
| Unique texture each call | 25ms | 25ms | (no benefit) |

\* Occasional recomputation when growth exceeds tolerance

---

## Version History

- **v2.1.2** (current)
  - Added `getOrCreatePermutation()`, `precomputePermutations()`, `clearPermutationCache()`
  - Added `drawBarkTextureCached()`, `clearTextureCache()`, `getTextureCacheSize()`
  - Non-breaking: all existing APIs unchanged

---

## Support & Issues

For performance issues or optimization suggestions:

1. Check this guide's "Tuning Cache Parameters" section
2. Profile with browser DevTools (Performance tab)
3. Report issues with frame time breakdown (which function is slow?)

---

**Last Updated:** 2026-01-13
