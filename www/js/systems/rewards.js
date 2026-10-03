/**
 * 3-Tier Feedback & Star Calculation System.
 * Tier 1: Micro (<= 150ms)
 * Tier 2: Round complete (<= 1.5s, stars fill in, praise line rotation)
 * Tier 3: Milestone complete (<= 3s)
 */
import { audio } from '../core/audio.js';
import { voice } from '../core/voice.js';
import { rng } from '../core/rng.js';
import { storage } from '../core/storage.js';

export class RewardsSystem {
  constructor() {
    this.praiseKeys = [
      'praise.line1',
      'praise.line2',
      'praise.line3',
      'praise.line4',
      'praise.line5',
      'praise.line6'
    ];
    this.lastPraiseIndex = -1;
  }

  /**
   * Tier 1 micro feedback: scale pop, <= 6 sparkles, soft note, never blocks input.
   */
  triggerMicro(planetNote = null) {
    if (planetNote) {
      audio.playPlanetNote(planetNote);
    } else {
      audio.playPop();
    }
  }

  /**
   * Calculates stars earned in a round:
   * 3 stars: finished with 0 hints
   * 2 stars: finished with 1 hint
   * 1 star: finished with >= 2 hints (stars are never zero, finishing is an achievement)
   */
  calculateStars(hintsUsed) {
    if (hintsUsed === 0) return 3;
    if (hintsUsed === 1) return 2;
    return 1;
  }

  /**
   * Tier 2 round feedback: <= 1.5s, sound cheer, rotated praise line.
   */
  triggerRoundComplete(hintsUsed) {
    const stars = this.calculateStars(hintsUsed);
    audio.playRoundCheer();

    // Rotate praise line without immediate repetition
    let nextIdx = rng.nextInt(0, this.praiseKeys.length - 1);
    if (nextIdx === this.lastPraiseIndex) {
      nextIdx = (nextIdx + 1) % this.praiseKeys.length;
    }
    this.lastPraiseIndex = nextIdx;
    const praiseKey = this.praiseKeys[nextIdx];
    voice.speak(praiseKey);

    return stars;
  }

  /**
   * Tier 3 milestone feedback: <= 3s, celebratory flourish.
   */
  triggerMilestone() {
    audio.playMilestone();
    voice.speak('parade.mission_complete');
  }
}

export const rewards = new RewardsSystem();
