/**
 * Seedable Deterministic Random Number Generator (Mulberry32).
 * Ensures tests and randomized puzzle setups are strictly reproducible.
 */
export class RNG {
  constructor(seed = 123456789) {
    this.seed = seed >>> 0;
    this.initialSeed = this.seed;
  }

  setSeed(seed) {
    this.seed = (seed >>> 0) || 1;
    this.initialSeed = this.seed;
  }

  reset() {
    this.seed = this.initialSeed;
  }

  /**
   * Returns a float in [0, 1).
   */
  next() {
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns an integer in [min, max] inclusive.
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Shuffles an array in place using Fisher-Yates.
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Picks a random element from an array.
   */
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[this.nextInt(0, array.length - 1)];
  }
}

export const rng = new RNG();
