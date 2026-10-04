/**
 * Wordless Boot Screen Scene (js/scenes/boot.js).
 * Strictly wordless:
 * - Softly glowing Sun in the center with a gentle pulsing ring
 * - Translucent ghost hand demonstrating the tap
 * - Touch anywhere starts the game, unlocks WebAudio
 * - Animated intro (Sun blooms, camera pulls back, Orbi floats in)
 * - Duration <= 1.8 seconds, instantly skippable by a touch
 */
import { sunRenderer } from '../render/sun.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { planetRenderer } from '../render/planet.js';
import { ghostHand } from '../render/hand.js';
import { audio } from '../core/audio.js';
import { coach } from '../systems/coach.js';
import { transition } from '../render/transition.js';
import { Easings } from '../core/tween.js';

export class BootScene {
  constructor() {
    this.elapsed = 0;
    this.isStarting = false;
    this.introElapsed = 0;
    this.introDuration = 1.6; // seconds
    this.width = 800;
    this.height = 600;
  }

  enter() {
    this.elapsed = 0;
    this.isStarting = false;
    this.introElapsed = 0;

    // Register immediate coach action on the Sun so ghost hand shows tap
    const cx = this.width / 2;
    const cy = this.height / 2;
    coach.setExpectedAction({
      id: 'boot-sun',
      target: { x: cx, y: cy, radius: 52, id: 'boot-sun' },
      gesture: 'tap',
      from: { x: cx, y: cy },
      immediate: true
    });

    // Clear UI overlay - wordless
    if (this.sceneManager && this.sceneManager.uiOverlay) {
      this.sceneManager.uiOverlay.innerHTML = '';
    }
  }

  exit() {
    coach.clearExpectedAction();
  }

  handleTap(x, y) {
    if (!this.isStarting) {
      this.isStarting = true;
      audio.unlock();
      audio.playPop();
      coach.clearExpectedAction();
      transition.startTransition({
        type: 'boot-to-hub',
        duration: 1600,
        onComplete: () => {
          this.sceneManager.switch('hub');
        }
      });
      return true;
    } else {
      // Touch during transition immediately fast-forwards into Hub
      transition.fastForward(80);
      return true;
    }
  }

  update(dt) {
    this.elapsed += dt;
    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
    ghostHand.update(dt);

    if (this.isStarting) {
      this.introElapsed += dt;
      if (this.introElapsed >= this.introDuration) {
        this.sceneManager.switch('hub');
      }
    }
  }

  render(ctx, width, height) {
    this.width = width;
    this.height = height;

    // Deep cosmic space
    ctx.fillStyle = '#0A0D24';
    ctx.fillRect(0, 0, width, height);

    starfield.resize(width, height);
    starfield.render(ctx);

    const cx = width / 2;
    const cy = height / 2;

    if (!this.isStarting) {
      // 1. Initial State: Center glowing Sun with pulsing invite ring
      const sunR = Math.min(width, height) * 0.12;
      sunRenderer.render(ctx, cx, cy, sunR);

      // Gentle pulsing invitation ring
      const pulsePhase = (this.elapsed * 2.5) % (Math.PI * 2);
      const ringR = sunR * (1.25 + 0.15 * Math.sin(pulsePhase));
      const ringAlpha = 0.4 + 0.25 * Math.cos(pulsePhase);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 224, 130, ${ringAlpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Translucent ghost hand tapping the Sun
      const coachTarget = coach.getTarget();
      if (coachTarget) {
        ghostHand.render(ctx, coachTarget);
      }
    } else {
      // 2. Intro Transition State: Sun blooms, camera pulls back, Earth & Orbi glide in
      const p = Math.min(1.0, this.introElapsed / this.introDuration);
      const ease = Easings.out(p);

      // Sun blooms and moves to its Hub position
      const sunTargetY = height * 0.5;
      const sunTargetR = Math.min(width, height) * 0.15;
      const curSunY = cy + (sunTargetY - cy) * ease;
      const curSunR = (Math.min(width, height) * 0.12) + (sunTargetR - Math.min(width, height) * 0.12) * ease;
      sunRenderer.render(ctx, cx, curSunY, curSunR);

      // Earth flies out to its orbit
      const earthRadius = Math.min(width, height) * 0.055;
      const earthTargetX = cx - width * 0.28;
      const earthTargetY = cy + height * 0.15;
      const earthX = cx + (earthTargetX - cx) * ease;
      const earthY = cy + (earthTargetY - cy) * ease;
      planetRenderer.renderPlanet(ctx, 'earth', earthX, earthY, earthRadius, {});

      // Orbi floats in on a curved glide from top-right
      const orbiStartX = width + 60;
      const orbiStartY = -40;
      const orbiTargetX = cx + width * 0.26;
      const orbiTargetY = cy - height * 0.18;
      const orbiX = orbiStartX + (orbiTargetX - orbiStartX) * ease;
      const orbiY = orbiStartY + (orbiTargetY - orbiStartY) * ease;
      orbiRenderer.render(ctx, orbiX, orbiY, 68, 'cheer');
    }
  }
}
