/**
 * Garden Theme Particle Systems
 *
 * Pollen, floating leaves, and dust motes for each garden scene.
 * Design principle: VARIED sizes, speeds, and alphas (never uniform)
 */

// Timing constants (matching Deep Sea theme philosophy: SLOWNESS)
const TIMING = {
  glacial: 0.0008,
  verySlow: 0.001,
  slow: 0.002,
};

/**
 * Pollen Particle interface - for Soft Garden Window
 */
export interface PollenParticle {
  x: number;
  y: number;
  size: number; // 0.8-3px (varied)
  speed: number; // vertical drift speed
  alpha: number; // opacity 0.15-0.4
  driftPhase: number; // horizontal wobble phase
}

/**
 * Create pollen particles for Soft Garden scene
 * 30-40 particles with glacial, organic drift
 */
export function createPollen(count: number = 35): PollenParticle[] {
  const particles: PollenParticle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.8 + Math.random() * 2.2, // 0.8-3px (varied)
      speed: 0.001 + Math.random() * 0.004, // 0.001-0.005
      alpha: 0.15 + Math.random() * 0.25, // 0.15-0.4
      driftPhase: Math.random() * Math.PI * 2,
    });
  }

  return particles;
}

/**
 * Update and render pollen particles
 * Slow vertical fall with horizontal drift wobble
 */
export function updatePollen(
  particles: PollenParticle[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  particles.forEach((particle) => {
    // Slow vertical drift downward
    particle.y += particle.speed * time;

    // Wrap at bottom and top
    if (particle.y > 110) particle.y = -10;
    if (particle.y < -5) particle.y = 105;

    // Horizontal wobble using sine wave
    const wobble = Math.sin(time * TIMING.glacial + particle.driftPhase) * 0.3;
    const screenX = (particle.x + wobble) * (width / 100);
    const screenY = particle.y * (height / 100);

    // Draw pollen as small glowing circle
    ctx.save();
    ctx.fillStyle = `rgba(245, 229, 184, ${particle.alpha})`;
    ctx.beginPath();
    ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
    ctx.fill();

    // Optional: subtle glow
    ctx.strokeStyle = `rgba(255, 240, 220, ${particle.alpha * 0.5})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  });
}

/**
 * Leaf Particle interface - for Terrarium View
 */
export interface LeafParticle {
  x: number;
  y: number;
  size: number; // 3-8px (varied organic)
  speed: number; // glacial movement
  alpha: number; // depth-based opacity
  rotation: number; // leaf rotation angle
  rotationSpeed: number; // slow tumble
  shape: 'oval' | 'pointed' | 'round'; // leaf variety
}

/**
 * Create floating leaf particles for Terrarium scene
 * 15-20 particles with slow tumble and drift
 */
export function createFloatingLeaves(count: number = 18): LeafParticle[] {
  const shapes: ('oval' | 'pointed' | 'round')[] = ['oval', 'pointed', 'round'];
  const particles: LeafParticle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 5, // 3-8px
      speed: 0.0008 + Math.random() * 0.0022, // 0.0008-0.003 (glacial)
      alpha: 0.2 + Math.random() * 0.3, // 0.2-0.5 (varied depth)
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * TIMING.verySlow,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }

  return particles;
}

/**
 * Update and render floating leaf particles
 * Slow tumbling rotation with vertical/horizontal drift
 */
export function updateFloatingLeaves(
  particles: LeafParticle[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  particles.forEach((particle) => {
    // Slow drift - combination of vertical and horizontal movement
    particle.y += particle.speed * time * 0.5;
    particle.x += Math.sin(time * TIMING.glacial + particle.y * 0.01) * particle.speed * 0.3;

    // Slow rotation (tumble)
    particle.rotation += particle.rotationSpeed * time;

    // Wrap at screen edges
    if (particle.y > 110) particle.y = -10;
    if (particle.x < -10) particle.x = 110;
    if (particle.x > 110) particle.x = -10;

    const screenX = particle.x * (width / 100);
    const screenY = particle.y * (height / 100);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = `rgba(107, 143, 103, ${particle.alpha})`;

    // Draw leaf shape based on type
    switch (particle.shape) {
      case 'oval':
        ctx.ellipse(0, 0, particle.size * 1.5, particle.size, 0, 0, Math.PI * 2);
        break;
      case 'pointed':
        // Pointed leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -particle.size);
        ctx.quadraticCurveTo(particle.size * 0.7, 0, 0, particle.size);
        ctx.quadraticCurveTo(-particle.size * 0.7, 0, 0, -particle.size);
        break;
      case 'round':
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        break;
    }

    ctx.fill();
    ctx.restore();
  });
}

/**
 * Dust Mote interface - for Garden Through Glass
 */
export interface DustMote {
  x: number;
  y: number;
  z: number; // depth layer 0-1
  size: number; // 0.5-1.5px (tiny)
  speed: number; // very slow movement
  alpha: number; // barely visible
  phase: number; // Brownian motion phase
}

/**
 * Create dust motes for Garden Through Glass scene
 * 50-60 particles with barely-perceptible Brownian motion
 */
export function createDustMotes(count: number = 55): DustMote[] {
  const particles: DustMote[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random(), // depth layer
      size: 0.5 + Math.random() * 1, // 0.5-1.5px
      speed: 0.0005 + Math.random() * 0.0015, // 0.0005-0.002
      alpha: 0.08 + Math.random() * 0.17, // 0.08-0.25 (barely visible)
      phase: Math.random() * Math.PI * 2,
    });
  }

  return particles;
}

/**
 * Update and render dust motes
 * Slow, random Brownian motion (like dust in air)
 */
export function updateDustMotes(
  particles: DustMote[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  particles.forEach((particle) => {
    // Brownian-like random walk
    particle.x += Math.sin(time * particle.speed + particle.phase) * particle.speed * 0.5;
    particle.y += Math.cos(time * particle.speed + particle.phase * 1.3) * particle.speed * 0.5;

    // Wrap at edges
    particle.x = (particle.x + 100) % 100;
    particle.y = (particle.y + 100) % 100;

    const screenX = particle.x * (width / 100);
    const screenY = particle.y * (height / 100);

    // Draw dust mote (tiny circle)
    ctx.save();
    // Opacity varies with depth
    const depthAlpha = particle.alpha * (0.5 + particle.z * 0.5);
    ctx.fillStyle = `rgba(220, 230, 240, ${depthAlpha})`;
    ctx.beginPath();
    ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

/**
 * Combined particle interface for Overgrown scene
 * Mix of pollen, leaf fragments, and debris
 */
export interface OvergrownParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  rotation: number;
  type: 'fragment' | 'pollen'; // particle type
}

/**
 * Create dense particle system for Overgrown Camera
 * 70-80 mixed particles (pollen + leaf fragments)
 */
export function createOvergrownParticles(count: number = 75): OvergrownParticle[] {
  const particles: OvergrownParticle[] = [];

  for (let i = 0; i < count; i++) {
    const isFragment = Math.random() > 0.6; // 40% fragments, 60% pollen

    particles.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: isFragment ? 1.5 + Math.random() * 3 : 0.8 + Math.random() * 2,
      speed: 0.0008 + Math.random() * 0.003,
      alpha: 0.2 + Math.random() * 0.35,
      rotation: Math.random() * Math.PI * 2,
      type: isFragment ? 'fragment' : 'pollen',
    });
  }

  return particles;
}

/**
 * Update and render dense overgrown particles
 * Faster, more chaotic than other scenes
 */
export function updateOvergrownParticles(
  particles: OvergrownParticle[],
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  particles.forEach((particle) => {
    // Faster, more chaotic movement than other scenes
    particle.y += particle.speed * time * 1.2;
    particle.x += Math.sin(time * particle.speed + particle.y) * particle.speed * 0.8;

    // Visible rotation for fragments
    if (particle.type === 'fragment') {
      particle.rotation += particle.speed * time * 0.3;
    }

    // Wrap at edges
    if (particle.y > 110) particle.y = -10;
    if (particle.x < -10) particle.x = 110;
    if (particle.x > 110) particle.x = -10;

    const screenX = particle.x * (width / 100);
    const screenY = particle.y * (height / 100);

    ctx.save();
    ctx.translate(screenX, screenY);

    if (particle.type === 'fragment') {
      // Draw leaf fragment (rotated rectangle)
      ctx.rotate(particle.rotation);
      ctx.fillStyle = `rgba(95, 154, 92, ${particle.alpha})`;
      ctx.fillRect(-particle.size * 0.3, -particle.size * 0.6, particle.size * 0.6, particle.size);
    } else {
      // Draw pollen circle
      ctx.fillStyle = `rgba(127, 166, 125, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}
