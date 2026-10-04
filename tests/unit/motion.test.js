import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Easings, TweenEngine } from '../../www/js/core/tween.js';
import { TransitionCoordinator } from '../../www/js/render/transition.js';

describe('Shared Motion System & Easing Math', () => {
  test('standard easings meet boundary endpoints (t=0 -> 0, t=1 -> 1)', () => {
    const keys = ['out', 'in', 'inOut', 'linear'];
    for (const key of keys) {
      const fn = Easings[key];
      assert.ok(Math.abs(fn(0) - 0) < 0.001, `${key}(0) should be 0`);
      assert.ok(Math.abs(fn(1) - 1) < 0.001, `${key}(1) should be 1`);
    }
  });

  test('spring easing provides overshoot and settles to 1', () => {
    const springFn = Easings.spring;
    assert.equal(springFn(0), 0);
    assert.equal(springFn(1), 1);

    // Overshoot exists: there is some t where springFn(t) > 1
    let hasOvershoot = false;
    for (let t = 0.1; t < 0.9; t += 0.05) {
      if (springFn(t) > 1.0) hasOvershoot = true;
    }
    assert.ok(hasOvershoot, 'Spring easing must overshoot 1.0');
  });

  test('wobble easing oscillates and decays to 0 at t=1', () => {
    const wobbleFn = Easings.wobble;
    assert.equal(wobbleFn(0), 0);
    assert.equal(wobbleFn(1), 0);

    // Peaks in positive and negative directions
    let hasPos = false;
    let hasNeg = false;
    for (let t = 0.05; t < 0.95; t += 0.05) {
      const val = wobbleFn(t);
      if (val > 0.1) hasPos = true;
      if (val < -0.1) hasNeg = true;
    }
    assert.ok(hasPos && hasNeg, 'Wobble must oscillate in both directions');
  });

  test('tween engine completes and cancels safely', () => {
    const engine = new TweenEngine();
    const obj = { x: 0, y: 10 };
    let completed = false;

    const tween = engine.to(obj, { x: 100, y: 50 }, 200, 'out', () => {
      completed = true;
    });

    assert.equal(engine.activeCount, 1);
    engine.update(100);
    assert.ok(obj.x > 0 && obj.x < 100);
    assert.equal(completed, false);

    // Complete remaining
    engine.update(120);
    assert.equal(completed, true);
    assert.equal(obj.x, 100);
    assert.equal(obj.y, 50);
    assert.equal(engine.activeCount, 0);
  });

  test('transition coordinator fastForward clamps duration to <= 100ms', () => {
    const coordinator = new TransitionCoordinator();
    coordinator.startTransition({
      type: 'hub-to-mode',
      duration: 600
    });

    assert.equal(coordinator.isTransitioning, true);
    assert.equal(coordinator.duration, 600);

    // Simulate user tapping during transition
    coordinator.fastForward(80);
    assert.ok(coordinator.duration <= 80);

    // Advance 90ms
    coordinator.update(90);
    assert.equal(coordinator.isTransitioning, false);
    assert.equal(coordinator.progress, 1.0);
  });
});

describe('docs/MOTION.md Inventory Verification', () => {
  test('all documented animations specify reduce-motion variants and obey duration budgets', () => {
    const content = fs.readFileSync('docs/MOTION.md', 'utf8');
    const tableRegex = /\| `([^`]+)` \| ([^|]+) \| ([^|]+) \| `([^`]+)` \| ([^|]+) \|/g;

    let match;
    let count = 0;
    while ((match = tableRegex.exec(content)) !== null) {
      count++;
      const id = match[1].trim();
      const durationStr = match[3].trim();
      const reduceMotion = match[5].trim();

      assert.ok(reduceMotion.length > 5, `Animation ${id} must have a descriptive reduce-motion fallback`);

      // Check transition durations <= 800ms (boot intro skippable <= 2000ms)
      if (id.startsWith('transition_')) {
        const ms = parseInt(durationStr);
        assert.ok(ms <= 800, `Screen transition ${id} must not exceed 800ms (got ${ms}ms)`);
      }
    }

    assert.ok(count >= 15, `Expected at least 15 animations in MOTION.md, found ${count}`);
  });
});
