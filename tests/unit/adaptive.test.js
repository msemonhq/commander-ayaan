import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AdaptiveEngine } from '../../www/js/systems/adaptive.js';
import { storage } from '../../www/js/core/storage.js';

describe('Adaptive Difficulty Engine', () => {
  let adaptive;

  beforeEach(() => {
    storage.reset();
    adaptive = new AdaptiveEngine({ maxRungs: { parade: 5 } });
  });

  test('starts at rung 1 by default', () => {
    assert.equal(adaptive.getRung('parade'), 1);
  });

  test('promotes rung after 3 consecutive rounds with 0 hints', () => {
    // Round 1: 0 hints
    let res = adaptive.recordRoundResult('parade', 0);
    assert.equal(res.rung, 1);
    assert.equal(res.promoted, false);

    // Round 2: 0 hints
    res = adaptive.recordRoundResult('parade', 0);
    assert.equal(res.rung, 1);
    assert.equal(res.promoted, false);

    // Round 3: 0 hints -> Promote!
    res = adaptive.recordRoundResult('parade', 0);
    assert.equal(res.rung, 2);
    assert.equal(res.promoted, true);
    assert.equal(adaptive.getRung('parade'), 2);
  });

  test('does not promote beyond max rung (5)', () => {
    adaptive.setRung('parade', 5);
    for (let i = 0; i < 3; i++) {
      adaptive.recordRoundResult('parade', 0);
    }
    assert.equal(adaptive.getRung('parade'), 5);
  });

  test('demotes rung after 2 consecutive rounds that reached 3rd hint level (>= 3 hints)', () => {
    adaptive.setRung('parade', 3);

    // Round 1: 3 hints
    let res = adaptive.recordRoundResult('parade', 3);
    assert.equal(res.rung, 3);
    assert.equal(res.demoted, false);

    // Round 2: 3 hints -> Demote!
    res = adaptive.recordRoundResult('parade', 3);
    assert.equal(res.rung, 2);
    assert.equal(res.demoted, true);
    assert.equal(adaptive.getRung('parade'), 2);
  });

  test('does not demote below minimum rung (1)', () => {
    adaptive.setRung('parade', 1);
    for (let i = 0; i < 2; i++) {
      adaptive.recordRoundResult('parade', 3);
    }
    assert.equal(adaptive.getRung('parade'), 1);
  });

  test('1 or 2 hints resets streaks without changing rung', () => {
    adaptive.setRung('parade', 2);
    adaptive.recordRoundResult('parade', 0);
    adaptive.recordRoundResult('parade', 0);

    // 1 hint interrupts 0-hint streak
    const res = adaptive.recordRoundResult('parade', 1);
    assert.equal(res.rung, 2);
    assert.equal(res.noHintStreak, 0);
    assert.equal(res.maxHintStreak, 0);

    // Needs 3 fresh 0-hint wins
    adaptive.recordRoundResult('parade', 0);
    adaptive.recordRoundResult('parade', 0);
    const promoteRes = adaptive.recordRoundResult('parade', 0);
    assert.equal(promoteRes.rung, 3);
    assert.equal(promoteRes.promoted, true);
  });
});
