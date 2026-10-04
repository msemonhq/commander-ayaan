/**
 * Shared-Element Screen Transition Coordinator (js/render/transition.js).
 * Coordinates transitions between scenes:
 * - Boot to Hub (1.8s, planets fan out from Sun into orbits, stations drift in, Orbi glides in)
 * - Hub to mode (550ms, station grows to fill screen, planets slide away and dim)
 * - Mode to Hub (550ms, game shrinks into station, hub re-forms)
 * 
 * Non-blocking guarantee:
 * Touching the screen during any transition immediately fast-forwards it
 * to completion within <= 100ms and smoothly handles input.
 */
import { Easings } from '../core/tween.js';

export class TransitionCoordinator {
  constructor() {
    this.isTransitioning = false;
    this.type = 'none'; // 'boot-to-hub', 'hub-to-mode', 'mode-to-hub', 'round-advance'
    this.duration = 550; // ms
    this.elapsed = 0; // ms
    this.progress = 0; // 0..1
    this.easedProgress = 0;
    this.sharedElement = null; // { fromX, fromY, fromR, toX, toY, toR, type }
    this.onComplete = null;
    this.reduceMotion = false;
  }

  setReduceMotion(enabled) {
    this.reduceMotion = !!enabled;
  }

  startTransition({ type, duration = 550, sharedElement = null, onComplete = null }) {
    this.isTransitioning = true;
    this.type = type;
    this.duration = this.reduceMotion ? Math.min(duration, 150) : duration;
    this.elapsed = 0;
    this.progress = 0;
    this.easedProgress = 0;
    this.sharedElement = sharedElement;
    this.onComplete = onComplete;
  }

  fastForward(maxDurationMs = 100) {
    if (!this.isTransitioning) return;
    const remaining = this.duration - this.elapsed;
    if (remaining > maxDurationMs) {
      this.duration = this.elapsed + maxDurationMs;
    }
  }

  forceComplete() {
    if (!this.isTransitioning) return;
    this.progress = 1.0;
    this.easedProgress = 1.0;
    this.isTransitioning = false;
    const cb = this.onComplete;
    this.onComplete = null;
    if (cb) cb();
  }

  update(dtMs) {
    if (!this.isTransitioning) return;

    this.elapsed += dtMs;
    this.progress = this.duration <= 0 ? 1 : Math.min(1.0, this.elapsed / this.duration);

    if (this.type === 'boot-to-hub') {
      this.easedProgress = Easings.out(this.progress);
    } else {
      this.easedProgress = Easings.inOut(this.progress);
    }

    if (this.progress >= 1.0) {
      this.isTransitioning = false;
      const cb = this.onComplete;
      this.onComplete = null;
      if (cb) cb();
    }
  }

  /**
   * Renders the shared element growth/shrink overlay if applicable.
   */
  render(ctx, width, height) {
    if (!this.isTransitioning || !this.sharedElement) return;

    const el = this.sharedElement;
    const p = this.easedProgress;

    ctx.save();
    if (this.type === 'hub-to-mode') {
      // Station expands from its hub slot to full viewport
      const curX = el.fromX + (width / 2 - el.fromX) * p;
      const curY = el.fromY + (height / 2 - el.fromY) * p;
      const maxRadius = Math.hypot(width, height) * 0.75;
      const curR = el.fromR + (maxRadius - el.fromR) * p;

      // Soft vignette halo expanding outward
      const halo = ctx.createRadialGradient(curX, curY, el.fromR * p, curX, curY, curR);
      halo.addColorStop(0, 'rgba(36, 46, 107, 0.95)');
      halo.addColorStop(0.7, 'rgba(24, 32, 82, 0.85)');
      halo.addColorStop(1, 'rgba(10, 13, 36, 0.0)');

      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(curX, curY, curR, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'mode-to-hub') {
      // Reversal: vignette shrinks back to station
      const invP = 1 - p;
      const curX = el.toX + (width / 2 - el.toX) * invP;
      const curY = el.toY + (height / 2 - el.toY) * invP;
      const maxRadius = Math.hypot(width, height) * 0.75;
      const curR = el.toR + (maxRadius - el.toR) * invP;

      const halo = ctx.createRadialGradient(curX, curY, el.toR * invP, curX, curY, curR);
      halo.addColorStop(0, 'rgba(36, 46, 107, 0.95)');
      halo.addColorStop(0.7, 'rgba(24, 32, 82, 0.85)');
      halo.addColorStop(1, 'rgba(10, 13, 36, 0.0)');

      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(curX, curY, curR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export const transition = new TransitionCoordinator();
