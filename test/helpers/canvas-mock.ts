import { vi } from 'vitest';

/**
 * Create a mock canvas and context for testing
 */
export function createMockCanvas(width = 800, height = 600) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

/**
 * Get pixel data at specific coordinates
 */
export function getPixelAt(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const imageData = ctx.getImageData(x, y, 1, 1);
  return {
    r: imageData.data[0],
    g: imageData.data[1],
    b: imageData.data[2],
    a: imageData.data[3],
  };
}

/**
 * Get average color of a region
 */
export function getAverageColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  let r = 0, g = 0, b = 0, a = 0;
  const pixelCount = width * height;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    a += data[i + 3];
  }

  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount),
    a: Math.round(a / pixelCount),
  };
}

/**
 * Check if canvas has any non-black pixels
 */
export function canvasHasContent(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0 || data[i + 3] !== 0) {
      return true;
    }
  }
  return false;
}

/**
 * Get canvas data URL for snapshot testing
 */
export function getCanvasSnapshot(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
