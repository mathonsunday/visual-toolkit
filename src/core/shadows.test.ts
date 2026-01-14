import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  drawOffsetShadow,
  applyShadow,
  clearShadow,
  cssGlow,
  cssJellyfishGlow,
  cssFishGlow,
  cssEyeGlow,
  cssHudGlow,
  cssBreathingGlow,
} from './shadows';

describe('shadows', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    ctx = canvas.getContext('2d')!;
  });

  describe('drawOffsetShadow', () => {
    it('saves and restores context', () => {
      const saveSpy = vi.spyOn(ctx, 'save');
      const restoreSpy = vi.spyOn(ctx, 'restore');

      drawOffsetShadow(ctx, () => {});

      expect(saveSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });

    it('translates context by offset', () => {
      const translateSpy = vi.spyOn(ctx, 'translate');

      drawOffsetShadow(ctx, () => {}, 5, 10);

      expect(translateSpy).toHaveBeenCalledWith(5, 10);
    });

    it('uses default offset values', () => {
      const translateSpy = vi.spyOn(ctx, 'translate');

      drawOffsetShadow(ctx, () => {});

      expect(translateSpy).toHaveBeenCalledWith(4, 4);
    });

    it('sets fillStyle before drawing', () => {
      let fillStyleSet = false;
      const drawFn = vi.fn(() => {
        fillStyleSet = ctx.fillStyle !== '';
      });

      drawOffsetShadow(ctx, drawFn, 4, 4, 'rgba(0, 0, 0, 0.4)');

      expect(drawFn).toHaveBeenCalled();
      expect(ctx.fillStyle).toBeTruthy();
    });

    it('calls the drawing function', () => {
      const drawFn = vi.fn();

      drawOffsetShadow(ctx, drawFn);

      expect(drawFn).toHaveBeenCalled();
    });

    it('accepts custom color', () => {
      const color = 'rgba(100, 100, 100, 0.8)';
      const drawFn = () => {};

      drawOffsetShadow(ctx, drawFn, 4, 4, color);

      expect(ctx.fillStyle).toBeTruthy();
    });
  });

  describe('applyShadow', () => {
    it('sets shadowColor', () => {
      const color = 'rgba(0, 0, 0, 0.5)';
      applyShadow(ctx, 10, color);

      expect(ctx.shadowColor).toBe(color);
    });

    it('sets shadowBlur', () => {
      applyShadow(ctx, 20, 'rgba(0, 0, 0, 0.5)');

      expect(ctx.shadowBlur).toBe(20);
    });

    it('sets shadow offsets', () => {
      applyShadow(ctx, 10, 'rgba(0, 0, 0, 0.5)', 5, 8);

      expect(ctx.shadowOffsetX).toBe(5);
      expect(ctx.shadowOffsetY).toBe(8);
    });

    it('uses default offsets', () => {
      applyShadow(ctx, 10, 'rgba(0, 0, 0, 0.5)');

      expect(ctx.shadowOffsetX).toBe(0);
      expect(ctx.shadowOffsetY).toBe(0);
    });

    it('accepts various color formats', () => {
      applyShadow(ctx, 5, '#000000');
      expect(ctx.shadowColor).toBe('#000000');

      applyShadow(ctx, 5, 'rgb(0, 0, 0)');
      expect(ctx.shadowColor).toBe('rgb(0, 0, 0)');

      applyShadow(ctx, 5, 'black');
      expect(ctx.shadowColor).toBe('black');
    });
  });

  describe('clearShadow', () => {
    it('resets shadowColor to transparent', () => {
      applyShadow(ctx, 10, 'black', 5, 5);
      clearShadow(ctx);

      expect(ctx.shadowColor).toBe('transparent');
    });

    it('resets shadowBlur to 0', () => {
      applyShadow(ctx, 10, 'black');
      clearShadow(ctx);

      expect(ctx.shadowBlur).toBe(0);
    });

    it('resets shadowOffsetX to 0', () => {
      applyShadow(ctx, 10, 'black', 5, 0);
      clearShadow(ctx);

      expect(ctx.shadowOffsetX).toBe(0);
    });

    it('resets shadowOffsetY to 0', () => {
      applyShadow(ctx, 10, 'black', 0, 5);
      clearShadow(ctx);

      expect(ctx.shadowOffsetY).toBe(0);
    });
  });

  describe('cssGlow', () => {
    it('returns string for valid color', () => {
      const result = cssGlow('rgba(100, 150, 255, 1)', 'medium');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes rgba values in output', () => {
      const result = cssGlow('rgba(100, 150, 255, 1)', 'medium');

      expect(result).toContain('100');
      expect(result).toContain('150');
      expect(result).toContain('255');
    });

    it('respects subtle intensity', () => {
      const subtle = cssGlow('rgba(100, 100, 255, 1)', 'subtle');
      const medium = cssGlow('rgba(100, 100, 255, 1)', 'medium');

      // Subtle should have smaller alpha values
      expect(subtle).toContain('0.3');
      expect(medium).toContain('0.6');
    });

    it('respects medium intensity', () => {
      const result = cssGlow('rgba(255, 0, 0, 1)', 'medium');

      expect(result).toContain('0.6');
      expect(result).toContain('0.3');
    });

    it('respects strong intensity', () => {
      const result = cssGlow('rgba(255, 0, 0, 1)', 'strong');

      expect(result).toContain('0.9');
      expect(result).toContain('0.5');
    });

    it('uses default intensity if not specified', () => {
      const result = cssGlow('rgba(255, 0, 0, 1)');

      expect(result).toContain('0.6');
    });

    it('returns none for invalid color', () => {
      const result = cssGlow('invalid-color', 'medium');

      expect(result).toBe('none');
    });

    it('handles rgb format', () => {
      const result = cssGlow('rgb(255, 100, 50)', 'medium');

      expect(result).toContain('255');
      expect(result).toContain('100');
      expect(result).toContain('50');
    });
  });

  describe('cssJellyfishGlow', () => {
    it('returns string', () => {
      const result = cssJellyfishGlow();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes box-shadow syntax', () => {
      const result = cssJellyfishGlow();

      expect(result).toContain('0 0');
      expect(result).toContain('rgba');
    });

    it('includes inset shadow', () => {
      const result = cssJellyfishGlow();

      expect(result).toContain('inset');
    });
  });

  describe('cssFishGlow', () => {
    it('returns string', () => {
      const result = cssFishGlow();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes box-shadow syntax', () => {
      const result = cssFishGlow();

      expect(result).toContain('0 0');
      expect(result).toContain('rgba');
    });
  });

  describe('cssEyeGlow', () => {
    it('returns string', () => {
      const result = cssEyeGlow();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes box-shadow syntax', () => {
      const result = cssEyeGlow();

      expect(result).toContain('0 0');
      expect(result).toContain('rgba');
    });
  });

  describe('cssHudGlow', () => {
    it('returns string', () => {
      const result = cssHudGlow();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes box-shadow syntax', () => {
      const result = cssHudGlow();

      expect(result).toContain('0 0');
      expect(result).toContain('rgba');
    });
  });

  describe('cssBreathingGlow', () => {
    it('returns object with dim and bright properties', () => {
      const result = cssBreathingGlow();

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('dim');
      expect(result).toHaveProperty('bright');
    });

    it('includes glow values', () => {
      const result = cssBreathingGlow();

      expect(typeof result.dim).toBe('string');
      expect(typeof result.bright).toBe('string');
      expect(result.dim).toContain('rgba');
      expect(result.bright).toContain('rgba');
    });
  });
});
