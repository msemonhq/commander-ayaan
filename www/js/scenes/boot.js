/**
 * Boot Screen Scene (js/scenes/boot.js).
 * Rising Sun behind Earth, Orbi floats in, "Tap to Start" unlocks WebAudio.
 * Duration <= 2 seconds, immediately skippable by tap.
 */
import { sunRenderer } from '../render/sun.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { planetRenderer } from '../render/planet.js';
import { audio } from '../core/audio.js';
import { i18n } from '../core/i18n.js';

export class BootScene {
  constructor() {
    this.elapsed = 0;
    this.maxDuration = 2.0; // 2 seconds animation
    this.sunProgress = 0;
    this.orbiX = 0;
    this.orbiY = 0;
    this.started = false;
  }

  enter() {
    this.elapsed = 0;
    this.started = false;
    this.buildUI();
  }

  exit() {
    // UI elements cleared by scene manager
  }

  buildUI() {
    const overlay = this.sceneManager.uiOverlay;
    if (!overlay) return;

    overlay.innerHTML = `
      <div style="position:absolute; bottom: 18%; left: 50%; transform: translateX(-50%); pointer-events: auto; text-align: center;">
        <button id="btn-boot-start" class="btn-primary" aria-label="${i18n.t('app.boot_cta')}">
          ${i18n.t('app.boot_cta')}
        </button>
      </div>
    `;

    const startBtn = document.getElementById('btn-boot-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStart());
    }
  }

  handleStart() {
    if (this.started) return;
    this.started = true;
    audio.unlock();
    audio.playPop();
    this.sceneManager.switch('hub');
  }

  handleTap(x, y) {
    this.handleStart();
    return true;
  }

  update(dt) {
    this.elapsed += dt;
    this.sunProgress = Math.min(1.0, this.elapsed / 1.6);
    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
  }

  render(ctx, width, height) {
    // Clear space background
    ctx.fillStyle = '#0A0D24';
    ctx.fillRect(0, 0, width, height);

    // Parallax stars
    starfield.render(ctx);

    const cx = width / 2;
    const cy = height / 2;

    // Rising Sun from bottom edge
    const sunTargetY = height * 0.72;
    const sunStartY = height + 100;
    const sunY = sunStartY + (sunTargetY - sunStartY) * Math.sin(this.sunProgress * Math.PI * 0.5);
    sunRenderer.render(ctx, cx, sunY, Math.min(width, height) * 0.38);

    // Earth floating in foreground
    const earthRadius = Math.min(width, height) * 0.12;
    planetRenderer.renderPlanet(ctx, 'earth', cx - width * 0.22, height * 0.45, earthRadius, {});

    // Orbi floating in from top right
    const orbiTargetX = cx + width * 0.2;
    const orbiTargetY = height * 0.35;
    const orbiStartX = width + 80;
    const orbiX = orbiStartX + (orbiTargetX - orbiStartX) * Math.min(1.0, this.elapsed / 1.2);
    orbiRenderer.render(ctx, orbiX, orbiTargetY, 72, 'cheer');

    // Title text: Commander Ayaan
    ctx.save();
    ctx.font = '800 clamp(28px, 6vw, 48px) var(--font-display, sans-serif)';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 179, 0, 0.6)';
    ctx.shadowBlur = 16;
    ctx.fillText('Commander Ayaan', cx, height * 0.22);
    ctx.restore();
  }
}
