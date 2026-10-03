/**
 * Smooth Camera Glide & Zoom System (js/sim/camera.js).
 * Provides cinematic ease-out glide when focusing on planets.
 */
export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;

    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 1.0;

    this.lerpSpeed = 4.5;
  }

  setImmediate(x, y, zoom = 1.0) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.targetX = x;
    this.targetY = y;
    this.targetZoom = zoom;
  }

  glideTo(x, y, zoom = 1.0) {
    this.targetX = x;
    this.targetY = y;
    this.targetZoom = zoom;
  }

  reset() {
    this.glideTo(0, 0, 1.0);
  }

  update(dt) {
    const factor = Math.min(1.0, this.lerpSpeed * dt);
    this.x += (this.targetX - this.x) * factor;
    this.y += (this.targetY - this.y) * factor;
    this.zoom += (this.targetZoom - this.zoom) * factor;
  }

  /**
   * Applies camera transform to 2D context.
   */
  apply(ctx, width, height) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-width / 2 - this.x, -height / 2 - this.y);
  }

  restore(ctx) {
    ctx.restore();
  }

  /**
   * Transforms screen pointer coordinate to world coordinate.
   */
  screenToWorld(screenX, screenY, width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const worldX = (screenX - cx) / this.zoom + cx + this.x;
    const worldY = (screenY - cy) / this.zoom + cy + this.y;
    return { x: worldX, y: worldY };
  }
}

export const camera = new Camera();
