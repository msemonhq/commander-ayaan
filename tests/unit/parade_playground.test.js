import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ParadeScene } from '../../www/js/scenes/parade.js';
import { PlaygroundScene } from '../../www/js/scenes/playground.js';
import { hints } from '../../www/js/systems/hints.js';
import { adaptive } from '../../www/js/systems/adaptive.js';

const mockPlanets = JSON.parse(fs.readFileSync('www/js/data/planets.json', 'utf8'));

describe('Planet Parade Rung Mechanics & Auto-Solve', () => {
  let parade;

  beforeEach(() => {
    parade = new ParadeScene();
    parade.sceneManager = {
      game: { planetsData: mockPlanets },
      uiOverlay: { innerHTML: '' },
      switch: () => {}
    };
    hints.reset();
  });

  test('Rung 3 "Who lives here?": 2 neighbours pre-placed and 3 candidate choices in tray', () => {
    adaptive.setRung('parade', 3);
    parade.currentRung = 3;
    parade.startRound();

    assert.equal(parade.slots.length, 3, 'Rung 3 must have 3 slots');
    // Pre-filled neighbours: slot 0 and slot 2
    assert.equal(parade.slots[0].isFilled, true, 'Slot 0 (neighbour) must be pre-filled');
    assert.equal(parade.slots[1].isFilled, false, 'Slot 1 (middle) must be empty for player');
    assert.equal(parade.slots[2].isFilled, true, 'Slot 2 (neighbour) must be pre-filled');

    // Tray must contain 3 selectable candidate planets
    assert.equal(parade.tray.length, 3, 'Tray must have 3 candidate choices');
    assert.ok(parade.tray.every(t => !t.isPlaced), 'All 3 candidate planets in tray must be unplaced');

    // Earth must be among the candidate choices
    const hasTarget = parade.tray.some(t => t.id === parade.slots[1].planetId);
    assert.equal(hasTarget, true, 'Tray must contain the correct target planet');
  });

  test('Rung 5: Chapter 1 has 4 inner planets; Chapter 2 has 8 slots with 4 pre-filled', () => {
    adaptive.setRung('parade', 5);
    parade.currentRung = 5;
    parade.r5Chapter = 1;
    parade.startRound();

    // Chapter 1
    assert.equal(parade.slots.length, 4, 'Chapter 1 must have 4 inner planet slots');
    assert.equal(parade.tray.length, 4, 'Chapter 1 must have 4 tray planets');

    // Chapter 2
    parade.r5Chapter = 2;
    parade.startRound();

    assert.equal(parade.slots.length, 8, 'Chapter 2 must show all 8 slots');
    const prePlacedCount = parade.slots.filter(s => s.isFilled).length;
    assert.equal(prePlacedCount, 4, 'Inner 4 planets must be pre-placed in Chapter 2');

    const emptyCount = parade.slots.filter(s => !s.isFilled).length;
    assert.equal(emptyCount, 4, 'Outer 4 slots must be empty for player placement');
    assert.equal(parade.tray.length, 4, 'Tray must contain 4 outer planets to place');
  });

  test('handleDrag updates dragged planet visual coordinates', () => {
    adaptive.setRung('parade', 1);
    parade.currentRung = 1;
    parade.startRound();

    const firstItem = parade.tray[0];
    parade.handleDragStart({ startX: firstItem.x, startY: firstItem.y });
    assert.equal(parade.draggedItem, firstItem);

    parade.handleDrag({ visualX: 350, visualY: 220 });
    assert.equal(firstItem.x, 350, 'handleDrag must update item.x');
    assert.equal(firstItem.y, 220, 'handleDrag must update item.y');
  });

  test('Miss 3 autoSolve completes the round if it places the final remaining slot', () => {
    adaptive.setRung('parade', 1);
    parade.currentRung = 1;
    parade.startRound();

    // Fill all slots except the first one
    for (let i = 1; i < parade.slots.length; i++) {
      parade.slots[i].isFilled = true;
    }

    let roundCompleted = false;
    parade.handleRoundComplete = () => {
      roundCompleted = true;
    };

    // Attempt miss 1
    const targetSlot = parade.slots[0];
    const wrongItem = parade.tray.find(t => t.id !== targetSlot.planetId);
    parade.attemptPlacement(wrongItem, targetSlot);
    assert.equal(roundCompleted, false);

    // Attempt miss 2
    parade.attemptPlacement(wrongItem, targetSlot);
    assert.equal(roundCompleted, false);

    // Attempt miss 3 (triggers autoSolve co-play)
    parade.attemptPlacement(wrongItem, targetSlot);
    assert.equal(roundCompleted, true, 'Miss 3 autoSolve on final slot must complete the round');
  });
});

describe('Planet Playground Tactile Toys & Hold State', () => {
  let playground;

  beforeEach(() => {
    playground = new PlaygroundScene();
    playground.sceneManager = {
      game: { planetsData: mockPlanets },
      uiOverlay: { innerHTML: '' },
      switch: () => {}
    };
    playground.planetsData = mockPlanets;
  });

  test('Sun press-and-hold swells light and settles only upon release (handleHoldEnd)', () => {
    const sunObj = mockPlanets.find(p => p.id === 'sun');
    playground.focusedPlanet = sunObj;

    // Press and hold initiated
    playground.handleHold({ x: 400, y: 300 });
    assert.equal(playground.isSunHeld, true);

    // Advance 5 frames (approx 80ms)
    for (let i = 0; i < 5; i++) {
      playground.update(0.016);
    }
    assert.ok(playground.sunLightMultiplier > 1.05, 'Light must swell while held');
    assert.equal(playground.isSunHeld, true, 'isSunHeld must persist across frames while held');

    // Hold released
    playground.handleHoldEnd({ x: 400, y: 300 });
    assert.equal(playground.isSunHeld, false);

    // Advance 10 frames -> light settles back toward 1.0
    for (let i = 0; i < 10; i++) {
      playground.update(0.016);
    }
    assert.ok(playground.sunLightMultiplier < 1.15, 'Light must settle back towards 1.0 after release');
  });

  test('Mars press-and-hold billows dust storm and settles upon release', () => {
    const marsObj = mockPlanets.find(p => p.id === 'mars');
    playground.focusedPlanet = marsObj;

    playground.handleHold({ x: 400, y: 300 });
    assert.equal(playground.isMarsHeld, true);

    for (let i = 0; i < 10; i++) {
      playground.update(0.016);
    }
    assert.ok(playground.marsStormIntensity > 0.1, 'Dust storm must intensify while held');
    assert.equal(playground.isMarsHeld, true);

    playground.handleHoldEnd({ x: 400, y: 300 });
    assert.equal(playground.isMarsHeld, false);

    for (let i = 0; i < 20; i++) {
      playground.update(0.016);
    }
    assert.equal(playground.marsStormIntensity, 0, 'Dust storm must settle to 0 after release');
  });

  test('Mercury flick triggers fast lap and 4 dots light up progressively', () => {
    const mercuryObj = mockPlanets.find(p => p.id === 'mercury');
    playground.focusedPlanet = mercuryObj;

    playground.handleFlick({ vx: 800, vy: 0, speed: 800 });
    assert.equal(playground.mercuryFastLap, 1.0);
    assert.equal(playground.mercuryDotRingPhase, 0);

    // Mid-lap (lap progress ~50%)
    playground.update(0.7);
    assert.ok(playground.mercuryDotRingPhase >= 1, 'Dots must begin lighting up progressively');

    // End of lap
    playground.update(1.0);
    assert.equal(playground.mercuryDotRingPhase, 4, 'All 4 dots must be lit upon completion of lap');
  });
});
