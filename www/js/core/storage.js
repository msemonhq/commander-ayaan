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

class StorageSystem {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      if (typeof localStorage === 'undefined') {
        return { ...DEFAULT_STATE };
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    } catch (err) {
      console.warn('Storage read failed, falling back to default:', err);
      return { ...DEFAULT_STATE };
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
    this.state = { ...DEFAULT_STATE };
    this.save();
  }
}

export const storage = new StorageSystem();
