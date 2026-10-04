import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CoachSystem } from '../../www/js/systems/coach.js';
import { GestureRecognizer } from '../../www/js/core/gestures.js';
import { events } from '../../www/js/core/events.js';

describe('Coach System & Idle Ladder', () => {
  test('idle ladder activates stages at 3s, 6s, and 10s', () => {
    const coach = new CoachSystem();
    coach.setExpectedAction({
      id: 'test-action',
      target: { x: 100, y: 100, radius: 50, id: 'test-target' },
      gesture: 'tap',
      immediate: false
    });

    assert.equal(coach.state.orbiLooking, false);
    assert.equal(coach.state.showGhostHand, false);
    assert.equal(coach.state.targetGlowing, false);

    // Advance 3.1s -> Orbi looks at target
    coach.update(3.1);
    assert.equal(coach.state.orbiLooking, true);
    assert.equal(coach.state.showGhostHand, false);
    assert.equal(coach.state.targetGlowing, false);

    // Advance 3.0s (total 6.1s) -> Ghost hand demonstrates
    coach.update(3.0);
    assert.equal(coach.state.orbiLooking, true);
    assert.equal(coach.state.showGhostHand, true);
    assert.equal(coach.state.targetGlowing, false);

    // Advance 4.0s (total 10.1s) -> Target breathes with soft glow
    coach.update(4.0);
    assert.equal(coach.state.orbiLooking, true);
    assert.equal(coach.state.showGhostHand, true);
    assert.equal(coach.state.targetGlowing, true);
  });

  test('user activity resets idle ladder back to 0s', () => {
    const coach = new CoachSystem();
    coach.setExpectedAction({
      id: 'test-action',
      target: { x: 100, y: 100, radius: 50, id: 'test-target' },
      gesture: 'tap'
    });

    coach.update(8.0);
    assert.equal(coach.state.showGhostHand, true);

    // Emit user input activity
    events.emit('input:activity', { x: 100, y: 100 });
    assert.equal(coach.state.orbiLooking, false);
    assert.equal(coach.state.showGhostHand, false);
    assert.equal(coach.state.targetGlowing, false);
  });

  test('immediate flag initializes ghost hand demo without waiting', () => {
    const coach = new CoachSystem();
    coach.setExpectedAction({
      id: 'boot-sun',
      target: { x: 200, y: 200, radius: 60, id: 'boot-sun' },
      gesture: 'tap',
      immediate: true
    });

    assert.equal(coach.state.showGhostHand, true);
  });
});

describe('Gesture Recognizer Thresholds & Snapping', () => {
  test('checkSnap calculates attraction within 1.5 radius', () => {
    // Mock minimal canvas
    const gestures = new GestureRecognizer(null);
    const itemX = 100;
    const itemY = 100;
    const itemRadius = 40;
    const slotX = 140;
    const slotY = 100;
    const slotRadius = 40;

    // Distance = 40px, snap threshold = 40 * 1.5 = 60px -> within range
    const snapClose = gestures.checkSnap(itemX, itemY, itemRadius, slotX, slotY, slotRadius);
    assert.equal(snapClose.isNearby, true);
    assert.ok(snapClose.attraction > 0);

    // Far away: dist = 100px -> out of range
    const snapFar = gestures.checkSnap(100, 100, itemRadius, 200, 100, slotRadius);
    assert.equal(snapFar.isNearby, false);
    assert.equal(snapFar.attraction, 0);
  });

  test('hold timer threshold is 1.5 seconds or less', () => {
    const gestures = new GestureRecognizer(null);
    assert.ok(gestures.holdDuration <= 1500, 'Hold duration must be <= 1500ms');
    assert.ok(gestures.holdDuration >= 800, 'Hold duration must be long enough to avoid false taps');
  });

  test('drag threshold prevents micro finger jitter from dragging', () => {
    const gestures = new GestureRecognizer(null);
    assert.ok(gestures.dragThreshold >= 8 && gestures.dragThreshold <= 15);
  });
});
