# Audio Library Organization Patterns

## Common Patterns in Popular Audio Libraries

### 1. **By Instrument/Generator Type** (Most Common)

**Tone.js** organizes by instrument:
```javascript
// Instruments
new Tone.Synth()
new Tone.PolySynth()
new Tone.Sampler()
new Tone.Player()

// Effects
new Tone.Reverb()
new Tone.Delay()
new Tone.Distortion()

// Transport/Timing
Tone.Transport.start()
```

**Pattern**: Core classes organized by **what they generate** (synth, sampler) or **what they process** (reverb, delay).

### 2. **By Effect Chain** (Processing Libraries)

**Web Audio API** (low-level):
```javascript
// Source → Effect → Destination
oscillator → gain → filter → destination
```

**Pattern**: Linear chain organization - source → processor → destination.

### 3. **By Sound Type** (Game Audio Libraries)

**Howler.js** (simpler, game-focused):
```javascript
// By sound type
new Howl({ src: ['sound.mp3'] })
sound.play()
sound.stop()

// Effects applied globally or per-sound
sound.volume(0.5)
sound.rate(1.2)
```

**Pattern**: Simple, flat API - load sound, play sound, control playback.

### 4. **By Preset/Genre** (Music Production)

**Some DAW plugins** organize by:
- Genre presets ("Jazz", "Rock", "Electronic")
- Instrument presets ("Piano", "Guitar", "Drums")
- Effect presets ("Hall Reverb", "Tape Delay")

**Pattern**: Presets grouped by musical context.

### 5. **By Use Case** (Your Current Approach)

**Your music-playground**:
```javascript
ambience.play('deepSea', options)  // By use case/theme
ambience.play('rov', options)
sfx.play('creature')
```

**Pattern**: Organized by **where/how it's used** rather than **what it is**.

## Comparison: Your Library vs. Common Patterns

| Library Type | Organization | Example |
|--------------|--------------|---------|
| **Tone.js** | By instrument/effect type | `new Tone.Synth()` |
| **Howler.js** | By playback control | `sound.play()` |
| **Web Audio API** | By signal flow | `oscillator → gain → destination` |
| **Your Library** | By theme/use case | `ambience.play('deepSea')` |

## Why Theme-Based Makes Sense for You

### Your Use Case:
- **Project-specific**: Deep-sea theme for Narrative OS
- **Future exploration**: Jungle theme, space theme
- **Ambient focus**: Background soundscapes, not instruments
- **Narrative-driven**: Sounds serve the story/theme

### Theme Organization Fits Because:
1. **You're not building a DAW** - You don't need instrument-level control
2. **Ambient soundscapes** - Theme-based presets make sense ("deep sea ambience" vs "synth with reverb")
3. **Narrative projects** - Each project has a theme, so organize by theme
4. **Simpler mental model** - "I want jungle sounds" → `themes.jungle.*`

## When Other Patterns Make More Sense

### Instrument-Based (Tone.js) - Good For:
- Music production tools
- Synthesizers
- When users need fine-grained control
- When building reusable instruments

### Effect Chain (Web Audio API) - Good For:
- Low-level audio processing
- Custom effects
- When you need maximum flexibility
- When building audio engines

### Playback Control (Howler.js) - Good For:
- Game audio
- Simple sound effects
- When you just need "play this file"
- When simplicity > flexibility

## Recommendation

**Your theme-based organization is appropriate** because:

1. **Your domain**: Ambient soundscapes for narrative projects
2. **Your workflow**: "I'm building a deep-sea project" → use deep-sea theme
3. **Your future**: "I'm building a jungle project" → use jungle theme
4. **Not a general-purpose library**: You're not trying to be Tone.js

**However**, consider hybrid approach:

```javascript
// Core (theme-agnostic)
const ambience = new Ambience();
ambience.addLayer(oscillator, filter, gain);  // Low-level control

// Theme presets (convenience)
themes.deepSea.ambience.play('deepSea', options);  // High-level preset
```

This gives you:
- **Theme presets** for quick use (your current approach)
- **Core API** for custom sounds (flexibility)

## Real-World Examples

### Libraries That Use Themes/Presets:
- **Native Instruments Kontakt**: Presets organized by instrument/genre
- **Ableton Live**: Presets organized by category (Ambient, Bass, etc.)
- **Splice Sounds**: Organized by genre/mood

### Libraries That Use Technical Organization:
- **Tone.js**: By instrument/effect type
- **Web Audio API**: By signal flow
- **Howler.js**: By playback control

**Your library is more like Kontakt/Ableton** (preset-based) than Tone.js (instrument-based).

## Conclusion

**Theme-based organization is valid** for your use case. It's:
- ✅ Common in music production tools (presets)
- ✅ Intuitive for narrative/ambient projects
- ✅ Scalable (add new themes easily)
- ✅ Matches your mental model ("I need jungle sounds")

The key is **clear separation**:
- Core API = theme-agnostic building blocks
- Theme presets = convenience wrappers

This is exactly what your architecture proposal does! 🎯
