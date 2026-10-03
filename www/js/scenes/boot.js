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
      <div class="top-bar">
        <div class="top-bar-left">
          <span class="scale-badge">${i18n.t('app.title')}</span>
        </div>
        <div class="top-bar-right">
          <button id="boot-btn-mute" class="btn-icon" aria-label="${audio.isMuted ? i18n.t('app.unmute') : i18n.t('app.mute')}">
            <svg viewBox="0 0 24 24">
              ${audio.isMuted 
                ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>' 
                : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'}
            </svg>
          </button>
        </div>
      </div>
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

    const muteBtn = document.getElementById('boot-btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        audio.toggleMute();
        this.buildUI();
      });
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
