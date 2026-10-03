/**
 * Versioned Save Data & Settings Storage.
 * Wraps localStorage and Capacitor Preferences safely with fallbacks.
 */
const STORAGE_KEY = 'ayaan_solar_save_v1';
const CURRENT_VERSION = 1;

const DEFAULT_STATE = {
  version: CURRENT_VERSION,
  profile: {
    childName: 'Ayaan',
    soundEnabled: true,
    reduceMotion: false
  },
  modes: {
    parade: {
      rung: 1,
      totalStars: 0,
      consecutiveNoHintWins: 0,
      consecutiveMaxHintLosses: 0
    },
    meet: {
      visitedPlanets: []
    }
  },
  passport: {
    stamps: []
  },
  sessionLog: []
};

function getDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

class StorageSystem {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      if (typeof localStorage === 'undefined') {
        return getDefaultState();
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      const defaults = getDefaultState();
      return {
        ...defaults,
        ...parsed,
        profile: { ...defaults.profile, ...(parsed.profile || {}) },
        modes: {
          ...defaults.modes,
          parade: { ...defaults.modes.parade, ...(parsed.modes?.parade || {}) },
          meet: { ...defaults.modes.meet, ...(parsed.modes?.meet || {}) }
        },
        passport: { ...defaults.passport, ...(parsed.passport || {}) },
        sessionLog: Array.isArray(parsed.sessionLog) ? parsed.sessionLog : defaults.sessionLog
      };
    } catch (err) {
      console.warn('Storage read failed, falling back to default:', err);
      return getDefaultState();
    }
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (err) {
      console.warn('Storage write failed:', err);
    }
  }

  get(path, defaultValue = null) {
    const keys = path.split('.');
    let curr = this.state;
    for (const k of keys) {
      if (curr == null || typeof curr !== 'object') return defaultValue;
      curr = curr[k];
    }
    return curr !== undefined ? curr : defaultValue;
  }

  set(path, value) {
    const keys = path.split('.');
    let curr = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!curr[k] || typeof curr[k] !== 'object') {
        curr[k] = {};
      }
      curr = curr[k];
    }
    curr[keys[keys.length - 1]] = value;
    this.save();
  }

  recordPlanetVisit(planetId) {
    const visited = this.get('modes.meet.visitedPlanets', []);
    if (!visited.includes(planetId)) {
      visited.push(planetId);
      this.set('modes.meet.visitedPlanets', visited);
    }
  }

  reset() {
    this.state = getDefaultState();
    this.save();
  }
}

export const storage = new StorageSystem();
