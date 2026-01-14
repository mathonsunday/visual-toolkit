/**
 * Cursor Position Manager
 *
 * Handles mouse position tracking within canvas bounds,
 * with calculations for distance and angle
 */

import type { CursorPos } from '../types';

export class CursorManager {
  private canvas: HTMLCanvasElement;
  private pos: CursorPos = {
    x: -1000,
    y: -1000,
    angle: 0,
    distance: 0,
    isOver: false
  };
  private centerX = 0;
  private centerY = 0;

  private onMouseMove = this.handleMouseMove.bind(this);
  private onMouseLeave = this.handleMouseLeave.bind(this);
  private onMouseEnter = this.handleMouseEnter.bind(this);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.updateCenter();
  }

  /**
   * Start tracking mouse position
   */
  startTracking(): void {
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    this.canvas.addEventListener('mouseenter', this.onMouseEnter);
  }

  /**
   * Stop tracking mouse position
   */
  stopTracking(): void {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('mouseenter', this.onMouseEnter);
  }

  /**
   * Get current cursor position
   */
  getPosition(): CursorPos {
    return { ...this.pos };
  }

  /**
   * Check if cursor is over canvas
   */
  isOver(): boolean {
    return this.pos.isOver;
  }

  /**
   * Update canvas center (call after canvas resize)
   */
  updateCenter(): void {
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    this.pos.x = x;
    this.pos.y = y;

    // Calculate distance from center
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    this.pos.distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate angle from center (0 = right, 90 = down, 180 = left, 270 = up)
    this.pos.angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (this.pos.angle < 0) {
      this.pos.angle += 360;
    }

    this.pos.isOver = true;
  }

  private handleMouseLeave(): void {
    this.pos.x = -1000;
    this.pos.y = -1000;
    this.pos.isOver = false;
  }

  private handleMouseEnter(): void {
    this.pos.isOver = true;
  }
}
