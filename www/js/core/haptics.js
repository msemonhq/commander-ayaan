/**
 * Haptic feedback wrapper.
 * Integrates Capacitor Haptics with Web Vibration API fallback.
 */
class HapticsSystem {
  constructor() {
    this.hasVibrate = typeof navigator !== 'undefined' && Boolean(navigator.vibrate);
  }

  light() {
    try {
      if (window.Capacitor?.Plugins?.Haptics) {
        window.Capacitor.Plugins.Haptics.impact({ style: 'LIGHT' });
      } else if (this.hasVibrate) {
        navigator.vibrate(15);
      }
    } catch {
      // Ignored
    }
  }

  medium() {
    try {
      if (window.Capacitor?.Plugins?.Haptics) {
        window.Capacitor.Plugins.Haptics.impact({ style: 'MEDIUM' });
      } else if (this.hasVibrate) {
        navigator.vibrate(30);
      }
    } catch {
      // Ignored
    }
  }

  selection() {
    try {
      if (window.Capacitor?.Plugins?.Haptics) {
        window.Capacitor.Plugins.Haptics.selectionChanged();
      } else if (this.hasVibrate) {
        navigator.vibrate(10);
      }
    } catch {
      // Ignored
    }
  }
}

export const haptics = new HapticsSystem();
