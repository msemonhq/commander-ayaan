/**
 * Central Input Manager (js/core/input.js).
 * Unified pointer handling, tap-then-tap support, 300ms double-tap guard,
 * 40% target hit area expansion, and harmless empty-space ripples.
 */

export class InputManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.lastTapTime = 0;
    this.lastTapTarget = null;
    this.activePointerId = null;
    this.dragStart = null;
    this.isDragging = false;

    this.ripples = []; // Empty space ripple animations

    this.onTap = null;
    this.onDrag = null;
    this.onDragEnd = null;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e), { passive: false });
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e), { passive: false });
    window.addEventListener('pointercancel', (e) => this.handlePointerCancel(e), { passive: false });
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      rawX: e.clientX,
      rawY: e.clientY
    };
  }

  handlePointerDown(e) {
    e.preventDefault();
    if (this.activePointerId !== null) return; // Disallow multi-touch
    this.activePointerId = e.pointerId;

    const coords = this.getCanvasCoords(e);
    this.dragStart = { ...coords, time: performance.now() };
    this.isDragging = false;
  }

  handlePointerMove(e) {
    if (e.pointerId !== this.activePointerId || !this.dragStart) return;
    const coords = this.getCanvasCoords(e);
    const dx = coords.x - this.dragStart.x;
    const dy = coords.y - this.dragStart.y;

    if (!this.isDragging && (Math.hypot(dx, dy) > 10)) {
      this.isDragging = true;
    }

    if (this.isDragging && this.onDrag) {
      this.onDrag(coords.x, coords.y, dx, dy);
    }
  }

  handlePointerUp(e) {
    if (e.pointerId !== this.activePointerId) return;
    const coords = this.getCanvasCoords(e);
    const now = performance.now();

    if (this.isDragging) {
      if (this.onDragEnd) {
        this.onDragEnd(coords.x, coords.y);
      }
    } else {
      // It's a tap! Check 300ms throttle guard
      if (now - this.lastTapTime >= 300) {
        this.lastTapTime = now;
        if (this.onTap) {
          const handled = this.onTap(coords.x, coords.y);
          if (!handled) {
            this.addRipple(coords.x, coords.y);
          }
        }
      }
    }

    this.activePointerId = null;
    this.dragStart = null;
    this.isDragging = false;
  }

  handlePointerCancel(e) {
    if (e.pointerId === this.activePointerId) {
      this.activePointerId = null;
      this.dragStart = null;
      this.isDragging = false;
    }
  }

  addRipple(x, y) {
    this.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: 28,
      alpha: 0.6,
      birth: performance.now()
    });
  }

  updateRipples(dt) {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 50 * dt;
      r.alpha -= 1.4 * dt;
      if (r.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }

  renderRipples(ctx) {
    for (const r of this.ripples) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(112, 214, 255, ${r.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Hit test helper with 40% hit area expansion.
   */
  static hitTestCircle(px, py, cx, cy, baseRadius) {
    const effectiveRadius = baseRadius * 1.4; // +40% hit area
    return Math.hypot(px - cx, py - cy) <= effectiveRadius;
  }
}
