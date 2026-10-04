/**
 * Shared Motion System: Tween Engine (js/core/tween.js).
 * Provides tweens, springs, timelines, stagger, cancel, and fast-forward.
 * Driven by the fixed-step clock and respectful of reduce-motion preferences.
 */

export const Easings = {
  // Standard arrivals
  out: (t) => 1 - Math.pow(1 - t, 3),
  // Standard departures
  in: (t) => t * t * t,
  // Smooth camera and screen shifts
  inOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  // Spring pop preset (overshoot and settle)
  spring: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  // Big spring preset for large elements
  springBig: (t) => {
    const s = 1.70158;
    return (t = t - 1) * t * ((s + 1) * t + s) + 1;
  },
  // Decaying wobble for gentle misses (2 cycles, decaying)
  wobble: (t) => {
    if (t >= 1) return 0;
    const decay = 1 - t;
    return Math.sin(t * Math.PI * 4) * decay;
  },
  linear: (t) => t
};

class ActiveTween {
  constructor(options) {
    this.id = options.id || Math.random().toString(36).substring(2, 9);
    this.target = options.target;
    this.from = { ...options.from };
    this.to = { ...options.to };
    this.duration = options.duration || 300; // ms
    this.delay = options.delay || 0; // ms
    this.easing = typeof options.easing === 'function' ? options.easing : (Easings[options.easing] || Easings.out);
    this.onUpdate = options.onUpdate || null;
    this.onComplete = options.onComplete || null;
    
    this.elapsed = 0;
    this.isDone = false;
    this.isCancelled = false;
  }

  update(dtMs, reduceMotion = false) {
    if (this.isDone || this.isCancelled) return true;

    this.elapsed += dtMs;
    if (this.elapsed < this.delay) return false;

    const activeTime = this.elapsed - this.delay;
    const duration = reduceMotion ? Math.min(this.duration, 100) : this.duration;
    const progress = duration <= 0 ? 1 : Math.min(1, activeTime / duration);
    const eased = this.easing(progress);

    if (this.target) {
      for (const key of Object.keys(this.to)) {
        const startVal = this.from[key] !== undefined ? this.from[key] : (this.target[key] || 0);
        const endVal = this.to[key];
        this.target[key] = startVal + (endVal - startVal) * eased;
      }
    }

    if (this.onUpdate) {
      this.onUpdate(eased, progress);
    }

    if (progress >= 1) {
      this.isDone = true;
      if (this.target) {
        for (const key of Object.keys(this.to)) {
          this.target[key] = this.to[key];
        }
      }
      if (this.onComplete) this.onComplete();
      return true;
    }

    return false;
  }

  fastForward(maxDurationMs = 100) {
    // Accelerate to near completion or end
    this.duration = Math.min(this.duration, maxDurationMs);
    this.elapsed = this.duration + this.delay;
    this.update(0);
  }

  cancel() {
    this.isCancelled = true;
    this.isDone = true;
  }
}

export class TweenEngine {
  constructor() {
    this.tweens = [];
    this.maxActiveTweens = 150;
    this.reduceMotion = false;
  }

  setReduceMotion(enabled) {
    this.reduceMotion = !!enabled;
  }

  to(target, toProps, duration = 300, easing = 'out', onComplete = null) {
    if (this.tweens.length >= this.maxActiveTweens) {
      // Evict oldest finished or least priority
      this.tweens.shift();
    }

    const fromProps = {};
    for (const key of Object.keys(toProps)) {
      fromProps[key] = target[key] !== undefined ? target[key] : 0;
    }

    const tween = new ActiveTween({
      target,
      from: fromProps,
      to: toProps,
      duration: this.reduceMotion ? Math.min(duration, 100) : duration,
      easing,
      onComplete
    });

    this.tweens.push(tween);
    return tween;
  }

  custom({ duration = 300, easing = 'out', onUpdate, onComplete, delay = 0 }) {
    const tween = new ActiveTween({
      duration: this.reduceMotion ? Math.min(duration, 100) : duration,
      easing,
      onUpdate,
      onComplete,
      delay
    });

    this.tweens.push(tween);
    return tween;
  }

  stagger(items, makeProps, durationPerItem = 300, staggerMs = 80, easing = 'out', onAllComplete = null) {
    let completedCount = 0;
    const total = items.length;
    if (total === 0) {
      if (onAllComplete) onAllComplete();
      return [];
    }

    return items.map((item, idx) => {
      const delay = idx * staggerMs;
      const props = typeof makeProps === 'function' ? makeProps(item, idx) : makeProps;
      return new ActiveTween({
        target: item,
        from: { ...props.from },
        to: { ...props.to },
        duration: this.reduceMotion ? Math.min(durationPerItem, 100) : durationPerItem,
        delay,
        easing,
        onComplete: () => {
          completedCount++;
          if (completedCount === total && onAllComplete) {
            onAllComplete();
          }
        }
      });
    });
  }

  update(dtMs) {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const isComplete = this.tweens[i].update(dtMs, this.reduceMotion);
      if (isComplete) {
        this.tweens.splice(i, 1);
      }
    }
  }

  fastForwardAll(maxDurationMs = 100) {
    for (const tween of this.tweens) {
      tween.fastForward(maxDurationMs);
    }
    this.tweens = [];
  }

  cancelAll() {
    for (const tween of this.tweens) {
      tween.cancel();
    }
    this.tweens = [];
  }

  get activeCount() {
    return this.tweens.length;
  }
}

export const tweenEngine = new TweenEngine();
