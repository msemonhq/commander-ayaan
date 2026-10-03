/**
 * Fixed-Timestep Game Loop (js/core/loop.js).
 * 1/120s simulation accumulator with rendering interpolation.
 * Clamps dt on resume/blur to eliminate physics teleporting.
 */

const FIXED_DT = 1 / 120; // 120Hz fixed physics step
const MAX_FRAME_DT = 0.1; // 100ms clamp limit

export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;

    this.isRunning = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.animFrameId = null;

    // Performance tracking (p95 frame time calculation)
    this.frameTimes = [];
    this.maxSamples = 120;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.animFrameId = requestAnimationFrame(this.step.bind(this));
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  step(timestamp) {
    if (!this.isRunning) return;

    const frameStart = performance.now();
    let frameDelta = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Clamp huge dt jumps caused by backgrounding or app pauses
    if (frameDelta > MAX_FRAME_DT) {
      frameDelta = MAX_FRAME_DT;
    }

    this.accumulator += frameDelta;

    // Fixed simulation updates
    let safetyCounter = 0;
    while (this.accumulator >= FIXED_DT && safetyCounter < 10) {
      this.updateFn(FIXED_DT);
      this.accumulator -= FIXED_DT;
      safetyCounter++;
    }

    // Alpha for visual interpolation
    const alpha = this.accumulator / FIXED_DT;
    this.renderFn(alpha);

    // Record frame time for budget check
    const frameDuration = performance.now() - frameStart;
    this.recordFrameTime(frameDuration);

    this.animFrameId = requestAnimationFrame(this.step.bind(this));
  }

  recordFrameTime(durationMs) {
    this.frameTimes.push(durationMs);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  getP95FrameTime() {
    if (this.frameTimes.length === 0) return 0;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }
}
