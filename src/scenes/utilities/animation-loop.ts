/**
 * Animation Loop Manager
 *
 * Handles requestAnimationFrame lifecycle with frame counting
 * and delta time calculation
 */

export class AnimationLoop {
  private animationId: number | null = null;
  private frameCount = 0;
  private lastFrameTime = 0;
  private isRunning = false;

  constructor(
    private onFrame: (frameNum: number, deltaTime: number) => void
  ) {}

  /**
   * Start animation loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.render();
  }

  /**
   * Stop animation loop
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
  }

  /**
   * Reset frame counter
   */
  reset(): void {
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  /**
   * Get current frame number
   */
  getFrameNum(): number {
    return this.frameCount;
  }

  /**
   * Check if animation is running
   */
  isRunning_(): boolean {
    return this.isRunning;
  }

  private render = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.onFrame(this.frameCount, deltaTime);
    this.frameCount++;

    this.animationId = requestAnimationFrame(this.render);
  };
}
