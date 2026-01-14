/**
 * Canvas Scene Type Definitions
 *
 * Defines the interface and types for all canvas-based scenes
 */

/**
 * Configuration for a scene
 */
export interface SceneConfig {
  /** Narrative intensity (0-1), affects visual intensity */
  intensity?: number;

  /** Scale multiplier for the scene */
  scale?: number;

  /** How long the scene should play (ms), Infinity for infinite */
  duration?: number;

  /** Optional callback for each frame (frameNum, deltaTime in ms) */
  onFrame?: (frameNum: number, deltaTime: number) => void;

  /** Optional callback when scene completes */
  onComplete?: () => void;
}

/**
 * Cursor position tracking with distance/angle calculations
 */
export interface CursorPos {
  /** X coordinate in canvas space */
  x: number;

  /** Y coordinate in canvas space */
  y: number;

  /** Angle from center (0-360 degrees) */
  angle: number;

  /** Distance from center */
  distance: number;

  /** Is cursor currently over canvas */
  isOver: boolean;
}

/**
 * A canvas-based scene that can be rendered
 *
 * Implementation pattern:
 * - Manage own state
 * - Handle cleanup (listeners, observers, animation frames)
 * - Never interact with DOM outside assigned canvas
 * - Be responsive to canvas resize
 */
export interface CanvasScene {
  /** Human-readable name */
  name: string;

  /** Description of scene */
  description: string;

  /** Default configuration for this scene */
  defaultConfig: Partial<SceneConfig>;

  /**
   * Initialize scene with canvas element and config
   *
   * Called once before rendering starts
   * Should set up all state, observers, and listeners
   */
  init(canvas: HTMLCanvasElement, config: SceneConfig): Promise<void>;

  /**
   * Render current frame
   *
   * Called via requestAnimationFrame
   * ctx will be valid and ready for drawing
   */
  render(ctx: CanvasRenderingContext2D, deltaTime: number): void;

  /**
   * Clean up all resources
   *
   * Called when scene is done:
   * - Remove all event listeners
   * - Disconnect ResizeObserver
   * - Cancel any pending animationFrames
   * - Clear any timers
   */
  cleanup(): void;
}

/**
 * Extended scene that tracks cursor position
 */
export interface InteractiveCanvasScene extends CanvasScene {
  /** Get current cursor position */
  getCursorPos(): CursorPos;

  /** Whether scene is tracking cursor */
  isTrackingCursor(): boolean;
}

/**
 * Particle state for particle-based scenes
 */
export interface Particle {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  size?: number;
  opacity?: number;
  color?: string;
  age?: number;
  maxAge?: number;
  [key: string]: any;
}

/**
 * Creature state for creature-based scenes
 */
export interface Creature {
  x: number;
  y: number;
  size?: number;
  opacity?: number;
  rotation?: number;
  targetX?: number;
  targetY?: number;
  [key: string]: any;
}
