import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { HintLadder } from '../../www/js/systems/hints.js';

describe('3-Step Gentle Hint Ladder', () => {
  let hints;

  beforeEach(() => {
    hints = new HintLadder();
  });

  test('starts with 0 misses and level 0', () => {
    assert.equal(hints.missCount, 0);
    assert.equal(hints.currentLevel, 0);
  });

  test('Miss 1: returns level 1, wobble target, no auto-solve', () => {
    const res = hints.handleMiss({ targetId: 'earth', correctSlotId: 2 });
    assert.equal(res.level, 1);
    assert.equal(res.lineKey, 'hints.level1');
    assert.equal(res.glowTarget, false);
    assert.equal(res.autoSolve, false);
    assert.equal(res.wobbleTargetId, 'earth');
  });

  test('Miss 2: returns level 2, glowTarget true, correctSlotId provided', () => {
    hints.handleMiss({ targetId: 'earth', correctSlotId: 2 });
    const res = hints.handleMiss({ targetId: 'earth', correctSlotId: 2 });

    assert.equal(res.level, 2);
    assert.equal(res.lineKey, 'hints.level2');
    assert.equal(res.glowTarget, true);
    assert.equal(res.autoSolve, false);
    assert.equal(res.correctSlotId, 2);
  });

  test('Miss 3: returns level 3, autoSolve true with Orbi assistance', () => {
    hints.handleMiss({ targetId: 'earth', correctSlotId: 2 });
    hints.handleMiss({ targetId: 'earth', correctSlotId: 2 });
    const res = hints.handleMiss({ targetId: 'earth', correctSlotId: 2 });

    assert.equal(res.level, 3);
    assert.equal(res.lineKey, 'hints.level3');
    assert.equal(res.glowTarget, true);
    assert.equal(res.autoSolve, true);
    assert.equal(res.correctSlotId, 2);
  });

  test('reset restores miss count to 0', () => {
    hints.handleMiss();
    hints.handleMiss();
    assert.equal(hints.currentLevel, 2);
    hints.reset();
    assert.equal(hints.currentLevel, 0);
  });
});
