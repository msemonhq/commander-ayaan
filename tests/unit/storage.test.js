import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test runner environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();

// Import storage after setting mock localStorage
const { storage } = await import('../../www/js/core/storage.js');

describe('Storage System', () => {
  beforeEach(() => {
    localStorage.clear();
    storage.reset();
  });

  test('loads default state and profile values', () => {
    const childName = storage.get('profile.childName');
    assert.equal(childName, 'Ayaan');

    const soundEnabled = storage.get('profile.soundEnabled');
    assert.equal(soundEnabled, true);

    const reduceMotion = storage.get('profile.reduceMotion');
    assert.equal(reduceMotion, false);

    const paradeRung = storage.get('modes.parade.rung');
    assert.equal(paradeRung, 1);
  });

  test('get and set work correctly with nested property paths', () => {
    storage.set('profile.childName', 'Commander Zayd');
    assert.equal(storage.get('profile.childName'), 'Commander Zayd');

    storage.set('modes.parade.rung', 3);
    assert.equal(storage.get('modes.parade.rung'), 3);

    // Default value fallback for non-existent path
    const fallback = storage.get('non.existent.path', 'fallback_val');
    assert.equal(fallback, 'fallback_val');
  });

  test('recordPlanetVisit records unique visits without duplicates', () => {
    storage.recordPlanetVisit('earth');
    storage.recordPlanetVisit('mars');
    storage.recordPlanetVisit('earth'); // duplicate

    const visited = storage.get('modes.meet.visitedPlanets');
    assert.deepEqual(visited, ['earth', 'mars']);
  });

  test('reset restores default values', () => {
    storage.set('profile.childName', 'New Name');
    storage.set('modes.parade.rung', 5);
    storage.recordPlanetVisit('saturn');

    storage.reset();

    assert.equal(storage.get('profile.childName'), 'Ayaan');
    assert.equal(storage.get('modes.parade.rung'), 1);
    assert.deepEqual(storage.get('modes.meet.visitedPlanets'), []);
  });

  test('handles corrupted JSON in storage without crashing', () => {
    localStorage.setItem('ayaan_solar_save_v1', '{corrupt json invalid!!}');
    
    // Create new instance of load logic
    const loaded = storage.load();
    assert.ok(loaded);
    assert.equal(loaded.profile.childName, 'Ayaan');
  });
});
