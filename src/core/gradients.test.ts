import { describe, it, expect, beforeEach } from 'vitest';
import { material3D, radialGlow, vignette } from './gradients';

describe('gradients', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    ctx = canvas.getContext('2d')!;
  })

  const isCanvasGradient = (value: any): value is CanvasGradient => {
    return value && typeof value === 'object' && 'addColorStop' in value;
  };;

  describe('material3D', () => {
    it('creates linear gradient', () => {
      const gradient = material3D(ctx, 0, 0, 50, 50, {
        highlight: '#ffffff',
        mid: '#888888',
        shadow: '#000000',
      });

      expect(isCanvasGradient(gradient)).toBe(true);
    });

    it('gradient can be used as fillStyle', () => {
      const gradient = material3D(ctx, 0, 0, 50, 50, {
        highlight: '#ffffff',
        mid: '#888888',
        shadow: '#000000',
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 50, 50);

      expect(ctx.fillStyle).toBeTruthy();
    });

    it('creates gradient with correct dimensions', () => {
      const gradient = material3D(ctx, 10, 20, 80, 60, {
        highlight: '#ffffff',
        mid: '#888888',
        shadow: '#000000',
      });

      // Gradient should be created (can't inspect internals, but usage validates)
      expect(gradient).toBeDefined();
    });

    it('works with RGB colors', () => {
      const gradient = material3D(ctx, 0, 0, 100, 100, {
        highlight: 'rgb(255, 255, 255)',
        mid: 'rgb(128, 128, 128)',
        shadow: 'rgb(0, 0, 0)',
      });

      expect(isCanvasGradient(gradient)).toBe(true);
    });

    it('works with RGBA colors', () => {
      const gradient = material3D(ctx, 0, 0, 100, 100, {
        highlight: 'rgba(255, 255, 255, 1)',
        mid: 'rgba(128, 128, 128, 0.8)',
        shadow: 'rgba(0, 0, 0, 1)',
      });

      expect(isCanvasGradient(gradient)).toBe(true);
    });
  });

  describe('radialGlow', () => {
    it('creates radial gradient', () => {
      const gradient = radialGlow(ctx, 50, 50, 0, 50, {
        core: '#ffffff',
        mid: '#ffff00',
        outer: '#ff0000',
      });

      expect(isCanvasGradient(gradient)).toBe(true);
    });

    it('gradient can be used as fillStyle', () => {
      const gradient = radialGlow(ctx, 50, 50, 0, 50, {
        core: '#ffffff',
        mid: '#ffff00',
        outer: '#ff0000',
      });

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2);
      ctx.fill();

      expect(ctx.fillStyle).toBeTruthy();
    });

    it('creates gradient with different radii', () => {
      const gradient1 = radialGlow(ctx, 50, 50, 5, 50, {
        core: '#ffffff',
        mid: '#ffff00',
        outer: '#ff0000',
      });

      const gradient2 = radialGlow(ctx, 50, 50, 20, 100, {
        core: '#ffffff',
        mid: '#ffff00',
        outer: '#ff0000',
      });

      expect(isCanvasGradient(gradient1)).toBe(true);
      expect(isCanvasGradient(gradient2)).toBe(true);
    });

    it('works with RGB colors', () => {
      const gradient = radialGlow(ctx, 50, 50, 0, 50, {
        core: 'rgb(255, 255, 255)',
        mid: 'rgb(255, 255, 0)',
        outer: 'rgb(255, 0, 0)',
      });

      expect(isCanvasGradient(gradient)).toBe(true);
    });

    it('works with RGBA colors', () => {
      const gradient = radialGlow(ctx, 50, 50, 0, 50, {
        core: 'rgba(255, 255, 255, 1)',
        mid: 'rgba(255, 255, 0, 0.5)',
        outer: 'rgba(255, 0, 0, 0)',
      });

      expect(isCanvasGradient(gradient)).toBe(true);
    });
  });

  describe('vignette', () => {
    it('creates radial gradient', () => {
      const gradient = vignette(ctx, 50, 50, 10, 100);

      expect(isCanvasGradient(gradient)).toBe(true);
    });

    it('gradient can be used as fillStyle', () => {
      const gradient = vignette(ctx, 50, 50, 10, 100);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 100, 100);

      expect(ctx.fillStyle).toBeTruthy();
    });

    it('uses default intensity', () => {
      const gradient = vignette(ctx, 50, 50, 10, 100);

      expect(isCanvasGradient(gradient)).toBe(true);
    });

    it('accepts custom intensity values', () => {
      const gradient1 = vignette(ctx, 50, 50, 10, 100, 0.2);
      const gradient2 = vignette(ctx, 50, 50, 10, 100, 0.8);

      expect(isCanvasGradient(gradient1)).toBe(true);
      expect(isCanvasGradient(gradient2)).toBe(true);
    });

    it('handles intensity boundary values', () => {
      const gradient0 = vignette(ctx, 50, 50, 10, 100, 0);
      const gradient1 = vignette(ctx, 50, 50, 10, 100, 1);

      expect(isCanvasGradient(gradient0)).toBe(true);
      expect(isCanvasGradient(gradient1)).toBe(true);
    });
  });
});
