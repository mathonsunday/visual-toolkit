import { describe, it, expect } from 'vitest';
import { timing, amplitude, drift, bob, pulse, waver, createSeeker, updateSeeker, createSeekerSwarm } from './motion';

describe('motion', () => {
  describe('timing constants', () => {
    it('provides glacial timing constant', () => {
      expect(timing.glacial).toBe(0.0008);
    });

    it('provides verySlow timing constant', () => {
      expect(timing.verySlow).toBe(0.001);
    });

    it('provides slow timing constant', () => {
      expect(timing.slow).toBe(0.002);
    });

    it('provides medium timing constant', () => {
      expect(timing.medium).toBe(0.003);
    });

    it('provides fast timing constant', () => {
      expect(timing.fast).toBe(0.005);
    });

    it('provides rapid timing constant', () => {
      expect(timing.rapid).toBe(0.01);
    });

    it('timing values are in ascending order', () => {
      expect(timing.glacial).toBeLessThan(timing.verySlow);
      expect(timing.verySlow).toBeLessThan(timing.slow);
      expect(timing.slow).toBeLessThan(timing.medium);
      expect(timing.medium).toBeLessThan(timing.fast);
      expect(timing.fast).toBeLessThan(timing.rapid);
    });
  });

  describe('amplitude constants', () => {
    it('provides micro amplitude', () => {
      expect(amplitude.micro).toBe(0.02);
    });

    it('provides small amplitude', () => {
      expect(amplitude.small).toBe(0.03);
    });

    it('provides medium amplitude', () => {
      expect(amplitude.medium).toBe(0.1);
    });

    it('provides large amplitude', () => {
      expect(amplitude.large).toBe(0.3);
    });

    it('amplitude values are in ascending order', () => {
      expect(amplitude.micro).toBeLessThan(amplitude.small);
      expect(amplitude.small).toBeLessThan(amplitude.medium);
      expect(amplitude.medium).toBeLessThan(amplitude.large);
    });
  });

  describe('drift', () => {
    it('returns object with x, y, rotation properties', () => {
      const result = drift(0);
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('rotation');
    });

    it('at time=0, returns small values', () => {
      const result = drift(0);
      expect(Math.abs(result.x)).toBeLessThan(0.1);
      expect(Math.abs(result.y)).toBeLessThan(0.1);
      expect(Math.abs(result.rotation)).toBeLessThan(0.1);
    });

    it('varies over time', () => {
      const result1 = drift(0);
      const result2 = drift(1000);
      const result3 = drift(5000);

      // Should not all be the same
      const allSame =
        result1.x === result2.x && result2.x === result3.x &&
        result1.y === result2.y && result2.y === result3.y;
      expect(allSame).toBe(false);
    });

    it('respects custom timing parameters', () => {
      // Use larger time and different timing to make difference obvious
      const slowDrift = drift(100000, 0.0001, 0.0001);
      const fastDrift = drift(100000, 0.01, 0.01);

      // At same time, fast timing should produce different values than slow
      const slowMagnitude = Math.abs(slowDrift.x) + Math.abs(slowDrift.y) + Math.abs(slowDrift.rotation);
      const fastMagnitude = Math.abs(fastDrift.x) + Math.abs(fastDrift.y) + Math.abs(fastDrift.rotation);

      expect(slowMagnitude).not.toBe(fastMagnitude);
    });
  });

  describe('bob', () => {
    it('returns number', () => {
      const result = bob(0);
      expect(typeof result).toBe('number');
    });

    it('at time=0, returns 0', () => {
      expect(bob(0)).toBeCloseTo(0, 5);
    });

    it('oscillates between min and max', () => {
      const values = [];
      for (let t = 0; t < 1000; t += 100) {
        values.push(bob(t, timing.slow, 0.02));
      }

      const max = Math.max(...values);
      const min = Math.min(...values);

      expect(max).toBeLessThanOrEqual(0.02);
      expect(min).toBeGreaterThanOrEqual(-0.02);
    });

    it('respects custom height parameter', () => {
      const small = bob(500, timing.slow, 0.01);
      const large = bob(500, timing.slow, 0.1);

      expect(Math.abs(large)).toBeGreaterThan(Math.abs(small));
    });
  });

  describe('pulse', () => {
    it('oscillates between min and max', () => {
      const min = 0.8;
      const max = 1.2;

      const values = [];
      for (let t = 0; t < 1000; t += 100) {
        values.push(pulse(t, timing.medium, min, max));
      }

      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);

      expect(maxValue).toBeLessThanOrEqual(max);
      expect(minValue).toBeGreaterThanOrEqual(min);
    });

    it('uses default min and max when not specified', () => {
      const result = pulse(500);
      expect(result).toBeGreaterThanOrEqual(0.8);
      expect(result).toBeLessThanOrEqual(1.2);
    });

    it('varies smoothly over time', () => {
      const result1 = pulse(0, timing.slow);
      const result2 = pulse(100, timing.slow);
      const result3 = pulse(200, timing.slow);

      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
    });
  });

  describe('waver', () => {
    it('returns object with x and y properties', () => {
      const result = waver(0, 0);
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
    });

    it('varies by segment index', () => {
      const result1 = waver(1000, 0);
      const result2 = waver(1000, 5);
      const result3 = waver(1000, 10);

      // Different indices should produce different values
      const allSame =
        result1.x === result2.x && result2.x === result3.x &&
        result1.y === result2.y && result2.y === result3.y;
      expect(allSame).toBe(false);
    });

    it('varies over time', () => {
      const result1 = waver(0, 0);
      const result2 = waver(500, 0);
      const result3 = waver(1000, 0);

      const allSame =
        result1.x === result2.x && result2.x === result3.x &&
        result1.y === result2.y && result2.y === result3.y;
      expect(allSame).toBe(false);
    });
  });

  describe('createSeeker', () => {
    it('creates seeker with valid position', () => {
      const seeker = createSeeker(800, 600);

      expect(seeker.x).toBeGreaterThanOrEqual(0);
      expect(seeker.x).toBeLessThanOrEqual(800);
      expect(seeker.y).toBeGreaterThanOrEqual(0);
      expect(seeker.y).toBeLessThanOrEqual(600);
    });

    it('creates seeker with all required properties', () => {
      const seeker = createSeeker(800, 600);

      expect(seeker).toHaveProperty('x');
      expect(seeker).toHaveProperty('y');
      expect(seeker).toHaveProperty('vx');
      expect(seeker).toHaveProperty('vy');
      expect(seeker).toHaveProperty('size');
      expect(seeker).toHaveProperty('maxSpeed');
      expect(seeker).toHaveProperty('awareness');
      expect(seeker).toHaveProperty('timidity');
      expect(seeker).toHaveProperty('glow');
      expect(seeker).toHaveProperty('hue');
    });

    it('initializes velocity to zero', () => {
      const seeker = createSeeker(800, 600);
      expect(seeker.vx).toBe(0);
      expect(seeker.vy).toBe(0);
    });

    it('creates seekers with varied sizes', () => {
      const sizes = [];
      for (let i = 0; i < 10; i++) {
        sizes.push(createSeeker(800, 600).size);
      }

      const uniqueSizes = new Set(sizes);
      expect(uniqueSizes.size).toBeGreaterThan(1);
    });

    it('creates seekers with hue in expected range', () => {
      for (let i = 0; i < 5; i++) {
        const seeker = createSeeker(800, 600);
        expect(seeker.hue).toBeGreaterThanOrEqual(180);
        expect(seeker.hue).toBeLessThanOrEqual(220);
      }
    });
  });

  describe('updateSeeker', () => {
    it('updates position based on velocity', () => {
      const seeker = createSeeker(800, 600);
      const initialX = seeker.x;
      const initialY = seeker.y;

      seeker.vx = 5;
      seeker.vy = 3;
      updateSeeker(seeker, 400, 300, 0, 800, 600);

      expect(seeker.x).not.toBe(initialX);
      expect(seeker.y).not.toBe(initialY);
    });

    it('wraps position at canvas edges', () => {
      const seeker = createSeeker(800, 600);
      seeker.x = -100;
      seeker.y = 700;

      updateSeeker(seeker, 400, 300, 0, 800, 600);

      expect(seeker.x).toBeGreaterThanOrEqual(-50);
      expect(seeker.x).toBeLessThanOrEqual(800 + 50);
      expect(seeker.y).toBeGreaterThanOrEqual(-50);
      expect(seeker.y).toBeLessThanOrEqual(600 + 50);
    });

    it('applies friction to velocity', () => {
      const seeker = createSeeker(800, 600);
      seeker.vx = 10;
      seeker.vy = 10;

      updateSeeker(seeker, 1000, 1000, 0, 800, 600); // Far away light

      // Velocity should be reduced by friction (0.98)
      expect(Math.abs(seeker.vx) + Math.abs(seeker.vy)).toBeLessThan(20);
    });

    it('limits velocity to maxSpeed', () => {
      const seeker = createSeeker(800, 600);
      seeker.vx = 100;
      seeker.vy = 100;

      updateSeeker(seeker, 400, 300, 0, 800, 600);

      const speed = Math.sqrt(seeker.vx * seeker.vx + seeker.vy * seeker.vy);
      expect(speed).toBeLessThanOrEqual(seeker.maxSpeed + 0.1); // Small tolerance for floating point
    });

    it('approaches light when within awareness and speed is low', () => {
      const seeker = createSeeker(800, 600);
      seeker.x = 400;
      seeker.y = 300;
      seeker.vx = 0;
      seeker.vy = 0;
      seeker.awareness = 500;

      updateSeeker(seeker, 450, 350, 1, 800, 600); // Slow light movement, close proximity

      // Seeker should move toward light
      expect(seeker.vx + seeker.vy).toBeGreaterThan(0);
    });

    it('flees light when it moves too fast', () => {
      const seeker = createSeeker(800, 600);
      seeker.x = 400;
      seeker.y = 300;
      seeker.vx = 0;
      seeker.vy = 0;
      seeker.awareness = 500;
      seeker.timidity = 0.5;

      updateSeeker(seeker, 450, 350, 100, 800, 600); // Fast light movement

      // Seeker should flee (move away from light)
      const dx = 450 - seeker.x;
      const dy = 350 - seeker.y;
      const distAfter = Math.sqrt(dx * dx + dy * dy);

      // After update, seeker should be farther from light
      expect(distAfter).toBeGreaterThan(50);
    });

    it('modifies glow value based on behavior', () => {
      const seeker1 = createSeeker(800, 600);
      seeker1.x = 400;
      seeker1.y = 300;
      seeker1.awareness = 500;
      seeker1.glow = 0;

      updateSeeker(seeker1, 450, 350, 1, 800, 600);
      expect(seeker1.glow).toBeGreaterThan(0);

      const seeker2 = createSeeker(800, 600);
      seeker2.x = 400;
      seeker2.y = 300;
      seeker2.awareness = 100; // Can't see light
      seeker2.glow = 1;

      updateSeeker(seeker2, 600, 600, 0, 800, 600);
      expect(seeker2.glow).toBeLessThan(1);
    });
  });

  describe('createSeekerSwarm', () => {
    it('creates correct number of seekers', () => {
      const swarm = createSeekerSwarm(10, 800, 600);
      expect(swarm).toHaveLength(10);
    });

    it('creates seekers with valid positions', () => {
      const swarm = createSeekerSwarm(20, 800, 600);

      swarm.forEach(seeker => {
        expect(seeker.x).toBeGreaterThanOrEqual(0);
        expect(seeker.x).toBeLessThanOrEqual(800);
        expect(seeker.y).toBeGreaterThanOrEqual(0);
        expect(seeker.y).toBeLessThanOrEqual(600);
      });
    });

    it('respects uniform spawn bias', () => {
      const swarm = createSeekerSwarm(50, 800, 600, { spawnBias: 'uniform' });

      // Uniform distribution should have seekers across full canvas
      const xs = swarm.map(s => s.x);
      const ys = swarm.map(s => s.y);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      // Should be reasonably spread (not all clustered)
      expect(maxX - minX).toBeGreaterThan(200);
      expect(maxY - minY).toBeGreaterThan(200);
    });

    it('respects center spawn bias', () => {
      const swarm = createSeekerSwarm(50, 800, 600, { spawnBias: 'center' });

      // Center-biased should cluster near center (400, 300)
      const distances = swarm.map(s => {
        return Math.sqrt(Math.pow(s.x - 400, 2) + Math.pow(s.y - 300, 2));
      });

      const averageDistance = distances.reduce((a, b) => a + b) / distances.length;
      expect(averageDistance).toBeLessThan(300); // Average distance less than half diagonal
    });

    it('respects size range', () => {
      const sizeRange: [number, number] = [5, 10];
      const swarm = createSeekerSwarm(20, 800, 600, { sizeRange });

      swarm.forEach(seeker => {
        expect(seeker.size).toBeGreaterThanOrEqual(sizeRange[0]);
        expect(seeker.size).toBeLessThanOrEqual(sizeRange[1]);
      });
    });

    it('respects speed range', () => {
      const speedRange: [number, number] = [0.5, 2];
      const swarm = createSeekerSwarm(20, 800, 600, { speedRange });

      swarm.forEach(seeker => {
        expect(seeker.maxSpeed).toBeGreaterThanOrEqual(speedRange[0]);
        expect(seeker.maxSpeed).toBeLessThanOrEqual(speedRange[1]);
      });
    });

    it('respects hue range', () => {
      const hueRange: [number, number] = [200, 250];
      const swarm = createSeekerSwarm(20, 800, 600, { hueRange });

      swarm.forEach(seeker => {
        expect(seeker.hue).toBeGreaterThanOrEqual(hueRange[0]);
        expect(seeker.hue).toBeLessThanOrEqual(hueRange[1]);
      });
    });
  });
});
