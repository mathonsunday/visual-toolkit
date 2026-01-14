/**
 * Responsive Canvas Manager
 *
 * Handles canvas resizing to match container and maintains
 * aspect ratio while notifying observers of size changes
 */

export class ResponsiveCanvas {
  private canvas: HTMLCanvasElement;
  private resizeObserver: ResizeObserver | null = null;
  private resizeCallback?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /**
   * Start responsive resizing
   *
   * Canvas will automatically resize to match container
   */
  startResizing(): void {
    if (this.resizeObserver) return; // Already started

    const resize = this.handleResize.bind(this);
    this.resizeObserver = new ResizeObserver(resize);
    this.handleResize(); // Initial resize
    this.resizeObserver.observe(this.canvas.parentElement!);
  }

  /**
   * Stop responsive resizing
   */
  stopResizing(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * Register callback for resize events
   */
  registerResizeCallback(callback: () => void): void {
    this.resizeCallback = callback;
  }

  /**
   * Get current canvas size
   */
  getSize(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  /**
   * Get canvas center
   */
  getCenter(): { x: number; y: number } {
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
  }

  /**
   * Get canvas bounds
   */
  getBounds(): DOMRect {
    return this.canvas.getBoundingClientRect();
  }

  private handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas resolution
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Scale canvas context to match DPR
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Notify observers
    if (this.resizeCallback) {
      this.resizeCallback();
    }
  }
}
