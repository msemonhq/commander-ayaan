/**
 * Session System & Pacing (js/systems/session.js).
 * Tracks playtime, rounds completed, and triggers gentle break reminders.
 */
import { storage } from '../core/storage.js';
import { events } from '../core/events.js';

export class SessionTracker {
  constructor() {
    this.sessionStartTime = Date.now();
    this.totalActiveSeconds = 0;
    this.roundsCompleted = 0;
    this.hintsUsedInSession = 0;
    this.timerInterval = null;
    this.restLimitMinutes = 15;
    this.restAlertTriggered = false;
  }

  start() {
    this.sessionStartTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.tick(), 1000);
  }

  tick() {
    this.totalActiveSeconds += 1;
    const minutes = this.totalActiveSeconds / 60;
    if (!this.restAlertTriggered && this.restLimitMinutes > 0 && minutes >= this.restLimitMinutes) {
      this.restAlertTriggered = true;
      events.emit('session:rest_needed');
    }
  }

  recordRound(hintsUsed) {
    this.roundsCompleted += 1;
    this.hintsUsedInSession += hintsUsed;
    this.persistLog();
  }

  persistLog() {
    const log = storage.get('sessionLog', []);
    log.push({
      timestamp: new Date().toISOString(),
      durationSeconds: this.totalActiveSeconds,
      rounds: this.roundsCompleted,
      hints: this.hintsUsedInSession
    });
    // Keep last 10 session summaries
    if (log.length > 10) log.shift();
    storage.set('sessionLog', log);
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}

export const session = new SessionTracker();
