/**
 * 3-Step Gentle Hint Ladder (js/systems/hints.js).
 * Never says "wrong", keeps learning safe, gentle, and informative.
 * - Miss 1: gentle boop, wobble, Orbi tilts head, demonstration replays
 * - Miss 2: demonstration replays slower, correct target breathes with soft glow
 * - Miss 3: Orbi co-play (Orbi & ghost hand place it together)
 */
import { audio } from '../core/audio.js';
import { voice } from '../core/voice.js';

export class HintLadder {
  constructor() {
    this.missCount = 0;
    this.glowTarget = false;
    this.correctTargetId = null;
  }

  reset() {
    this.missCount = 0;
    this.glowTarget = false;
    this.correctTargetId = null;
  }

  get currentLevel() {
    return Math.min(3, this.missCount);
  }

  get level() {
    return this.currentLevel;
  }

  /**
   * Registers a missed placement/action and returns hint instructions.
   * @param {Object} context - e.g. { targetId, targetElement, correctSlotId }
   * @returns {{ level: number, lineKey: string, glowTarget: boolean, autoSolve: boolean }}
   */
  handleMiss(context = {}) {
    this.missCount += 1;
    const lvl = this.currentLevel;
    this.correctTargetId = context.correctSlotId || context.targetId || null;
    this.glowTarget = (lvl >= 2);

    // Always gentle boop sound
    audio.playBoop();

    if (lvl === 1) {
      voice.speak('hints.level1');
      return {
        level: 1,
        lineKey: 'hints.level1',
        glowTarget: false,
        autoSolve: false,
        wobbleTargetId: context.targetId
      };
    } else if (lvl === 2) {
      voice.speak('hints.level2');
      return {
        level: 2,
        lineKey: 'hints.level2',
        glowTarget: true,
        autoSolve: false,
        correctSlotId: context.correctSlotId
      };
    } else {
      // Level 3: Orbi assists directly
      voice.speak('hints.level3');
      return {
        level: 3,
        lineKey: 'hints.level3',
        glowTarget: true,
        autoSolve: true,
        correctSlotId: context.correctSlotId,
        targetId: context.targetId
      };
    }
  }

  recordMiss(correctSlotId) {
    return this.handleMiss({ correctSlotId });
  }
}

export const hints = new HintLadder();
