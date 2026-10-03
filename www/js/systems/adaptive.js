/**
 * Adaptive Difficulty Engine (js/systems/adaptive.js).
 * Moves up one rung after 3 consecutive rounds with no hints (0 hints).
 * Moves down one rung after 2 consecutive rounds that reached the 3rd hint level (>= 3 hints).
 * Changes are silent and strictly deterministic.
 */
import { storage } from '../core/storage.js';

export class AdaptiveEngine {
  constructor(options = {}) {
    this.maxRungs = options.maxRungs || { parade: 5, default: 5 };
    this.minRung = 1;
  }

  getRung(mode = 'parade') {
    return storage.get(`modes.${mode}.rung`, 1);
  }

  setRung(mode, rung) {
    const max = this.maxRungs[mode] || 5;
    const clamped = Math.max(this.minRung, Math.min(max, rung));
    storage.set(`modes.${mode}.rung`, clamped);
    storage.set(`modes.${mode}.consecutiveNoHintWins`, 0);
    storage.set(`modes.${mode}.consecutiveMaxHintLosses`, 0);
    return clamped;
  }

  /**
   * Records outcome of a round.
   * @param {string} mode - e.g. 'parade'
   * @param {number} hintsUsed - Number of hints consumed (0, 1, 2, >=3)
   * @returns {{ rung: number, promoted: boolean, demoted: boolean }}
   */
  recordRoundResult(mode, hintsUsed) {
    let currentRung = this.getRung(mode);
    const maxRung = this.maxRungs[mode] || 5;

    let noHintStreak = storage.get(`modes.${mode}.consecutiveNoHintWins`, 0);
    let maxHintStreak = storage.get(`modes.${mode}.consecutiveMaxHintLosses`, 0);

    let promoted = false;
    let demoted = false;

    if (hintsUsed === 0) {
      noHintStreak += 1;
      maxHintStreak = 0;
      if (noHintStreak >= 3) {
        if (currentRung < maxRung) {
          currentRung += 1;
          promoted = true;
        }
        noHintStreak = 0;
      }
    } else if (hintsUsed >= 3) {
      maxHintStreak += 1;
      noHintStreak = 0;
      if (maxHintStreak >= 2) {
        if (currentRung > this.minRung) {
          currentRung -= 1;
          demoted = true;
        }
        maxHintStreak = 0;
      }
    } else {
      // 1 or 2 hints: stable performance, reset streaks
      noHintStreak = 0;
      maxHintStreak = 0;
    }

    storage.set(`modes.${mode}.rung`, currentRung);
    storage.set(`modes.${mode}.consecutiveNoHintWins`, noHintStreak);
    storage.set(`modes.${mode}.consecutiveMaxHintLosses`, maxHintStreak);

    return {
      rung: currentRung,
      promoted,
      demoted,
      noHintStreak,
      maxHintStreak
    };
  }
}

export const adaptive = new AdaptiveEngine();
