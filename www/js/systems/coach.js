/**
 * Coach System (js/systems/coach.js).
 * Coordinates the wordless assistance and idle ladder:
 * - 3s: Orbi looks at target
 * - 6s: Ghost hand demonstrates gesture
 * - 10s: Target breathes with soft glow
 * Resets immediately on user interaction.
 * Exposes current target for tests via window.__game.getCoachTarget().
 */
import { events } from '../core/events.js';

export class CoachSystem {
  constructor() {
    this.idleTime = 0; // seconds
    this.currentAction = null;
    this.isActive = true;

    // Listen to user input to reset idle timer
    events.on('input:activity', () => {
      this.resetIdle();
    });
  }

  setExpectedAction(action) {
    /**
     * action: {
     *   id: string,
     *   target: { x, y, radius, id },
     *   gesture: 'tap' | 'drag' | 'hold' | 'flick',
     *   from: { x, y },
     *   to: { x, y },
     *   immediate: boolean (e.g. first mechanic encounter or Boot screen)
     * }
     */
    this.currentAction = action;
    this.idleTime = (action && action.immediate) ? 6.0 : 0.0;
  }

  clearExpectedAction() {
    this.currentAction = null;
    this.idleTime = 0;
  }

  resetIdle() {
    // If the action was set to immediate, allow reset after user starts interacting
    this.idleTime = 0;
  }

  update(dt) {
    if (!this.currentAction) {
      this.idleTime = 0;
      return;
    }

    this.idleTime += dt;
  }

  get state() {
    if (!this.currentAction) {
      return {
        orbiLooking: false,
        showGhostHand: false,
        targetGlowing: false,
        action: null
      };
    }

    return {
      orbiLooking: this.idleTime >= 3.0,
      showGhostHand: this.idleTime >= 6.0,
      targetGlowing: this.idleTime >= 10.0,
      idleTime: this.idleTime,
      action: this.currentAction
    };
  }

  getTarget() {
    if (!this.currentAction) return null;
    return {
      ...this.currentAction.target,
      gesture: this.currentAction.gesture,
      from: this.currentAction.from || this.currentAction.target,
      to: this.currentAction.to || null,
      idleState: this.state
    };
  }
}

export const coach = new CoachSystem();
