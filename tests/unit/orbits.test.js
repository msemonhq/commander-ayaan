import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getAngularSpeed, calculateOrbitPosition } from '../../www/js/sim/orbits.js';

describe('Orbital Mechanics & Speeds', () => {
  test('strictly monotone speed hierarchy: inner planets orbit faster than outer planets', () => {
    // 1: Mercury, 2: Venus, 3: Earth, 4: Mars, 5: Jupiter, 6: Saturn, 7: Uranus, 8: Neptune
    for (let lane = 1; lane < 8; lane++) {
      const innerSpeed = getAngularSpeed(lane);
      const outerSpeed = getAngularSpeed(lane + 1);
      assert.ok(
        innerSpeed > outerSpeed,
        `Lane ${lane} speed (${innerSpeed}) must be strictly faster than lane ${lane + 1} speed (${outerSpeed})`
      );
    }
  });

  test('calculateOrbitPosition returns deterministic circular coordinates', () => {
    const cx = 400;
    const cy = 300;
    const r = 150;
    const pos0 = calculateOrbitPosition(1, 0, 0, cx, cy, r);
    assert.equal(Math.round(pos0.x), cx + r);
    assert.equal(Math.round(pos0.y), cy);

    // Period calculation
    const omega = getAngularSpeed(1);
    const period = (2 * Math.PI) / omega;
    const posFullLoop = calculateOrbitPosition(1, period, 0, cx, cy, r);
    assert.equal(Math.round(posFullLoop.x), cx + r);
    assert.equal(Math.round(posFullLoop.y), cy);
  });
});
