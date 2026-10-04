/**
 * Core Gesture Recognizer (js/core/gestures.js).
 * Converts raw pointer events into tap, drag (with velocity/weight/inertia), hold (<=1.5s), and flick.
 * Enforces:
 * - 40% hit area expansion (visible radius * 1.4)
 * - 300ms double-tap throttle per target
 * - Empty space tap gentle ripple
 * - Tap-then-tap selection alternative
 * - Attraction and snap calculation within 1.5 radius of slots
 */
import { events } from './events.js';
import { haptics } from './haptics.js';

export class GestureRecognizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.activePointerId = null;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.startTime = 0;
    this.lastTime = 0;
    
    // Drag state
    this.isDragging = false;
    this.dragThreshold = 10; // px threshold before drag starts
    this.vx = 0;
    this.vy = 0;
    this.draggedEntity = null;
    this.dragVisualX = 0;
    this.dragVisualY = 0;
    this.dragTilt = 0;

    // Hold timer
    this.holdTimer = null;
    this.holdDuration = 800; // ms (0.8s <= 1.5s)
    this.holdFired = false;

    // Throttling
    this.lastTapTime = 0;
    this.lastTapTargetId = null;

    // Tap-then-tap state
    this.selectedEntity = null;

    // Listeners for scenes
    this.handlers = {
      onTap: null,
      onDragStart: null,
      onDragMove: null,
      onDragEnd: null,
      onHold: null,
      onHoldEnd: null,
      onFlick: null,
      findEntityAt: null // Provided by scene: (x, y) => entity
    };

    // Visual ripple effect storage
    this.ripples = [];

    this.bindEvents();
  }

  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  clearHandlers() {
    this.handlers = {
      onTap: null,
      onDragStart: null,
      onDragMove: null,
      onDragEnd: null,
      onHold: null,
      onHoldEnd: null,
      onFlick: null,
      findEntityAt: null
    };
    this.selectedEntity = null;
    this.draggedEntity = null;
  }

  bindEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
    this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
    this.canvas.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
    this.canvas.addEventListener('pointercancel', (e) => this.onPointerCancel(e), { passive: false });
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * (this.canvas.clientWidth / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.clientHeight / rect.height),
      cssX: e.clientX - rect.left,
      cssY: e.clientY - rect.top
    };
  }

  onPointerDown(e) {
    if (this.activePointerId !== null) return;
    this.activePointerId = e.pointerId;

    const coords = this.getCanvasCoords(e);
    this.startX = coords.cssX;
    this.startY = coords.cssY;
    this.currentX = coords.cssX;
    this.currentY = coords.cssY;
    this.dragVisualX = coords.cssX;
    this.dragVisualY = coords.cssY;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.vx = 0;
    this.vy = 0;
    this.isDragging = false;
    this.holdFired = false;

    // Reset coach idle timer whenever screen is touched
    events.emit('input:activity', { x: coords.cssX, y: coords.cssY });

    // Identify grabbable entity with 40% hit expansion
    const entity = this.handlers.findEntityAt ? this.handlers.findEntityAt(coords.cssX, coords.cssY, 1.4) : null;
    this.draggedEntity = entity;

    // Start hold timer
    this.holdTimer = setTimeout(() => {
      if (!this.isDragging && this.activePointerId !== null) {
        this.holdFired = true;
        haptics.tick();
        if (this.handlers.onHold) {
          this.handlers.onHold({ x: this.currentX, y: this.currentY, entity: this.draggedEntity });
        }
      }
    }, this.holdDuration);
  }

  onPointerMove(e) {
    if (e.pointerId !== this.activePointerId) return;

    const coords = this.getCanvasCoords(e);
    const now = performance.now();
    const dt = Math.max(1, now - this.lastTime);
    this.lastTime = now;

    const dx = coords.cssX - this.currentX;
    const dy = coords.cssY - this.currentY;

    // Instantaneous velocity
    this.vx = (dx / dt) * 1000;
    this.vy = (dy / dt) * 1000;

    this.currentX = coords.cssX;
    this.currentY = coords.cssY;

    const distMoved = Math.hypot(coords.cssX - this.startX, coords.cssY - this.startY);

    if (!this.isDragging && distMoved > this.dragThreshold) {
      this.isDragging = true;
      if (this.holdTimer) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
      }
      if (this.handlers.onDragStart) {
        this.handlers.onDragStart({
          startX: this.startX,
          startY: this.startY,
          entity: this.draggedEntity
        });
      }
    }

    if (this.isDragging) {
      // Weight & slight lag: visual position follows pointer with slight ease
      this.dragVisualX += (this.currentX - this.dragVisualX) * 0.45;
      this.dragVisualY += (this.currentY - this.dragVisualY) * 0.45;
      // Slight tilt in travel direction (max 15 deg)
      const targetTilt = Math.max(-0.25, Math.min(0.25, this.vx * 0.0003));
      this.dragTilt += (targetTilt - this.dragTilt) * 0.2;

      if (this.handlers.onDragMove) {
        this.handlers.onDragMove({
          x: this.currentX,
          y: this.currentY,
          visualX: this.dragVisualX,
          visualY: this.dragVisualY,
          tilt: this.dragTilt,
          vx: this.vx,
          vy: this.vy,
          entity: this.draggedEntity
        });
      }
    }
  }

  onPointerUp(e) {
    if (e.pointerId !== this.activePointerId) return;
    this.activePointerId = null;

    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    const coords = this.getCanvasCoords(e);
    const now = performance.now();
    const totalTime = now - this.startTime;
    const speed = Math.hypot(this.vx, this.vy);

    if (this.isDragging) {
      this.isDragging = false;
      // Check for flick/sling gesture: speed > 600 px/s
      if (speed > 600 && totalTime < 800) {
        if (this.handlers.onFlick) {
          this.handlers.onFlick({
            x: coords.cssX,
            y: coords.cssY,
            vx: this.vx,
            vy: this.vy,
            speed,
            entity: this.draggedEntity
          });
        }
      }

      if (this.handlers.onDragEnd) {
        this.handlers.onDragEnd({
          x: coords.cssX,
          y: coords.cssY,
          visualX: this.dragVisualX,
          visualY: this.dragVisualY,
          vx: this.vx,
          vy: this.vy,
          entity: this.draggedEntity
        });
      }
    } else if (this.holdFired) {
      // Hold released!
      if (this.handlers.onHoldEnd) {
        this.handlers.onHoldEnd({
          x: coords.cssX,
          y: coords.cssY,
          entity: this.draggedEntity
        });
      }
    } else {
      // Tap detected!
      const entity = this.handlers.findEntityAt ? this.handlers.findEntityAt(coords.cssX, coords.cssY, 1.4) : null;
      const targetId = entity ? (entity.id || entity.name || 'entity') : 'empty';

      // 300ms double-tap throttle on same target
      if (now - this.lastTapTime < 300 && this.lastTapTargetId === targetId) {
        return;
      }
      this.lastTapTime = now;
      this.lastTapTargetId = targetId;

      if (!entity) {
        // Tap on empty space: harmless tiny ripple
        this.addRipple(coords.cssX, coords.cssY);
      }

      // Tap-then-tap logic: if entity tapped, select or place
      if (this.handlers.onTap) {
        this.handlers.onTap({
          x: coords.cssX,
          y: coords.cssY,
          entity
        });
      }
    }

    this.holdFired = false;
    this.draggedEntity = null;
  }

  onPointerCancel(e) {
    if (e.pointerId === this.activePointerId) {
      this.activePointerId = null;
      if (this.holdTimer) clearTimeout(this.holdTimer);
      if (this.holdFired && this.handlers.onHoldEnd) {
        this.handlers.onHoldEnd({
          x: this.currentX,
          y: this.currentY,
          entity: this.draggedEntity
        });
      }
      this.holdFired = false;
      this.isDragging = false;
      this.draggedEntity = null;
    }
  }

  addRipple(x, y) {
    this.ripples.push({
      x,
      y,
      radius: 6,
      maxRadius: 28,
      alpha: 0.5,
      life: 0
    });
  }

  updateRipples(dt) {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.life += dt;
      r.radius += dt * 45;
      r.alpha = Math.max(0, 0.5 * (1 - r.radius / r.maxRadius));
      if (r.radius >= r.maxRadius || r.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }

  renderRipples(ctx) {
    if (this.ripples.length === 0) return;
    ctx.save();
    for (const r of this.ripples) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(112, 214, 255, ${r.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Snapping helper: checks whether dragged item is within ~1.5 of target radius
  checkSnap(itemX, itemY, itemRadius, slotX, slotY, slotRadius) {
    const dist = Math.hypot(itemX - slotX, itemY - slotY);
    const snapDistance = (itemRadius || 36) * 1.5;
    const isNearby = dist <= snapDistance;
    return {
      isNearby,
      dist,
      attraction: isNearby ? Math.max(0, 1 - dist / snapDistance) : 0
    };
  }
}
