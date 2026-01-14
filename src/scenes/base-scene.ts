/**
 * Base Scene Class
 *
 * Abstract base class for all canvas scenes.
 * Handles common lifecycle: initialization, rendering, cleanup.
 * Derived classes override specific behavior.
 */

import type { CanvasScene, SceneConfig, CursorPos } from './types';
import { AnimationLoop } from './utilities/animation-loop';
import { ResponsiveCanvas } from './utilities/responsive-canvas';
import { CursorManager } from './utilities/cursor-manager';

export abstract class BaseCanvasScene implements CanvasScene {
  abstract name: string;
  abstract description: string;
  abstract defaultConfig: Partial<SceneConfig>;

  protected canvas!: HTMLCanvasElement;
  protected ctx!: CanvasRenderingContext2D;
  protected config!: SceneConfig;

  protected animationLoop?: AnimationLoop;
  protected responsiveCanvas?: ResponsiveCanvas;
  protected cursorManager?: CursorManager;

  protected frameNum = 0;
  protected deltaTime = 0;

  /**
   * Initialize scene
   *
   * Sets up canvas context, utilities, and calls onInit hook
   */
  async init(canvas: HTMLCanvasElement, config: SceneConfig): Promise<void> {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = { ...this.defaultConfig, ...config };

    // Set up responsive canvas resizing
    this.responsiveCanvas = new ResponsiveCanvas(canvas);
    this.responsiveCanvas.registerResizeCallback(() => this.onCanvasResize());
    this.responsiveCanvas.startResizing();

    // Set up animation loop
    this.animationLoop = new AnimationLoop((frameNum, deltaTime) => {
      this.frameNum = frameNum;
      this.deltaTime = deltaTime;
      this.render(this.ctx, deltaTime);

      // Call user callback if provided
      if (this.config.onFrame) {
        this.config.onFrame(frameNum, deltaTime);
      }
    });

    // Call derived class initialization
    await this.onInit();

    // Start animation
    this.animationLoop.start();
  }

  /**
   * Render current frame
   *
   * Derived classes should override this method
   */
  abstract render(ctx: CanvasRenderingContext2D, deltaTime: number): void;

  /**
   * Clean up resources
   *
   * Stops animation and removes all listeners
   */
  cleanup(): void {
    this.animationLoop?.stop();
    this.responsiveCanvas?.stopResizing();
    this.cursorManager?.stopTracking();
    this.onCleanup();
  }

  /**
   * Hook: Called during initialization after utilities are set up
   *
   * Derived classes override to do custom initialization
   */
  protected async onInit(): Promise<void> {}

  /**
   * Hook: Called when canvas is resized
   *
   * Derived classes override to recalculate dimensions
   */
  protected onCanvasResize(): void {}

  /**
   * Hook: Called during cleanup
   *
   * Derived classes override to clean up custom resources
   */
  protected onCleanup(): void {}

  /**
   * Enable cursor tracking
   */
  protected startCursorTracking(): void {
    if (!this.cursorManager) {
      this.cursorManager = new CursorManager(this.canvas);
    }
    this.cursorManager.startTracking();

    // Update cursor manager when canvas resizes
    if (this.responsiveCanvas) {
      const originalOnResize = this.onCanvasResize.bind(this);
      const wrappedOnResize = () => {
        this.cursorManager?.updateCenter();
        originalOnResize();
      };
      this.onCanvasResize = wrappedOnResize;
    }
  }

  /**
   * Get current cursor position
   */
  protected getCursorPos(): CursorPos {
    return this.cursorManager?.getPosition() ?? {
      x: -1000,
      y: -1000,
      angle: 0,
      distance: 0,
      isOver: false
    };
  }

  /**
   * Get canvas size
   */
  protected getCanvasSize(): { width: number; height: number } {
    return this.responsiveCanvas?.getSize() ?? {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  /**
   * Get canvas center
   */
  protected getCanvasCenter(): { x: number; y: number } {
    return this.responsiveCanvas?.getCenter() ?? {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
  }
}
