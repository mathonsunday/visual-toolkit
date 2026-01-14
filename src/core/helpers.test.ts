import { describe, it, expect } from 'vitest';
import { hexToRgb } from './helpers';

describe('helpers', () => {
  describe('hexToRgb', () => {
    it('converts valid 6-digit hex color to RGB', () => {
      const result = hexToRgb('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('handles lowercase hex', () => {
      const result = hexToRgb('#00ff00');
      expect(result).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('handles hex without hash prefix', () => {
      const result = hexToRgb('0000FF');
      expect(result).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('converts white', () => {
      const result = hexToRgb('#FFFFFF');
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('converts black', () => {
      const result = hexToRgb('#000000');
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('converts mid-tone colors', () => {
      const result = hexToRgb('#808080');
      expect(result).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('returns zero RGB for invalid hex', () => {
      expect(hexToRgb('invalid')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#12345')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('parses complex colors correctly', () => {
      const result = hexToRgb('#A5C3FF');
      expect(result).toEqual({ r: 165, g: 195, b: 255 });
    });
  });
});
