/**
 * Hub Scene: Mission Control (js/scenes/hub.js).
 * Living solar system background: Sun, 8 orbiting planets on rails, Orbi floating.
 * Exactly two doors (Meet the Planets, Planet Parade), plus mute button.
 * Every planet in background is tappable: plays note and emits sparkles.
 */
import { sunRenderer } from '../render/sun.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { particles } from '../render/particles.js';
import { spriteCache } from '../render/sprites.js';
import { calculateOrbitPosition } from '../sim/orbits.js';
import { audio } from '../core/audio.js';
import { i18n } from '../core/i18n.js';
import { storage } from '../core/storage.js';
import { adaptive } from '../systems/adaptive.js';
import { InputManager } from '../core/input.js';

export class HubScene {
  constructor(planetsData = []) {
    this.planets = planetsData;
    this.time = 0;
    this.planetStates = new Map();
    this.tappedPlanetFeedback = null;
  }

  setPlanets(planetsData) {
    this.planets = planetsData;
  }

  enter() {
    this.time = 0;
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
          <span class="scale-badge">${i18n.t('hub.title')}</span>
        </div>
        <div class="top-bar-right">
          <button id="hub-btn-parent" class="btn-icon" aria-label="${i18n.t('app.parent_gate_button')}" title="${i18n.t('app.parent_gate_button')}">
            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
          </button>
          <button id="hub-btn-mute" class="btn-icon" aria-label="${audio.isMuted ? i18n.t('app.unmute') : i18n.t('app.mute')}">
            <svg viewBox="0 0 24 24">
              ${audio.isMuted 
                ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>' 
                : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'}
            </svg>
          </button>
        </div>
      </div>

      <div class="hub-doors-container">
        <!-- Door 1: Meet the Planets -->
        <button id="door-meet" class="hub-door" aria-label="${i18n.t('hub.meet_door')}">
          <svg class="hub-door-icon" viewBox="0 0 24 24" fill="#70D6FF">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span class="hub-door-label">${i18n.t('hub.meet_door')}</span>
        </button>

        <!-- Door 2: Planet Parade -->
        <button id="door-parade" class="hub-door" aria-label="${i18n.t('hub.parade_door')}">
          <svg class="hub-door-icon" viewBox="0 0 24 24" fill="#FFA000">
            <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3.5-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm5-4C10.67 3.5 9 5.17 9 7.25s1.67 3.75 3.5 3.75 3.5-1.67 3.5-3.75S14.33 3.5 12.5 3.5zm7 7c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-3.5 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span class="hub-door-label">${i18n.t('hub.parade_door')}</span>
        </button>
      </div>
    `;

    document.getElementById('door-meet').addEventListener('click', () => {
      audio.playPop();
      this.sceneManager.switch('meet');
    });

    document.getElementById('door-parade').addEventListener('click', () => {
      audio.playPop();
      this.sceneManager.switch('parade');
    });

    const muteBtn = document.getElementById('hub-btn-mute');
    muteBtn.addEventListener('click', () => {
      audio.toggleMute();
      this.buildUI();
    });

    // Parent Gate 3-second hold listener
    const parentBtn = document.getElementById('hub-btn-parent');
    let holdTimer = null;

    const startHold = () => {
      parentBtn.classList.add('holding');
      holdTimer = setTimeout(() => {
        parentBtn.classList.remove('holding');
        audio.playPop();
        this.showArithmeticGate();
      }, 3000);
    };

    const cancelHold = () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
        parentBtn.classList.remove('holding');
      }
    };

    parentBtn.addEventListener('pointerdown', startHold);
    parentBtn.addEventListener('pointerup', cancelHold);
    parentBtn.addEventListener('pointerleave', cancelHold);
    parentBtn.addEventListener('pointercancel', cancelHold);
  }

  showArithmeticGate() {
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 4) + 1;
    const sum = a + b;
    const choices = [sum, sum - 1, sum + 2].sort(() => Math.random() - 0.5);

    const overlay = this.sceneManager.uiOverlay;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="confirm-home-dialog">
        <div class="confirm-home-title">${i18n.t('app.parent_gate_title')}</div>
        <p style="color:var(--ink-secondary); font-size:1.15rem;">${i18n.t('app.parent_gate_prompt', { a, b })}</p>
        <div class="gate-choices-row">
          ${choices.map(c => `<button class="gate-choice-btn" data-val="${c}">${c}</button>`).join('')}
        </div>
        <button id="gate-btn-cancel" class="btn-primary" style="margin-top:12px; font-size:1rem; min-height:48px;">${i18n.t('app.close')}</button>
      </div>
    `;
    overlay.appendChild(modal);

    modal.querySelectorAll('.gate-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        if (val === sum) {
          audio.playPop();
          modal.remove();
          this.showParentCornerModal();
        } else {
          audio.playBoop();
          btn.style.borderColor = '#FF7043';
          setTimeout(() => {
            modal.remove();
            this.showArithmeticGate();
          }, 350);
        }
      });
    });

    document.getElementById('gate-btn-cancel')?.addEventListener('click', () => {
      modal.remove();
    });
  }

  showParentCornerModal() {
    const overlay = this.sceneManager.uiOverlay;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const currentRung = adaptive.getRung('parade');
    const reduceMotion = storage.get('profile.reduceMotion', false);

    modal.innerHTML = `
      <div class="parent-dialog">
        <h2>${i18n.t('app.parent_corner_title')}</h2>
        
        <div class="parent-card-box">
          <strong>${i18n.t('app.parent_open_question_title')}</strong>
          <p style="font-size:0.95rem; color:#FFFFFF;">"${i18n.t('app.parent_open_question')}"</p>
        </div>

        <div class="parent-card-box">
          <strong>${i18n.t('app.parent_closing_reflection')}</strong>
        </div>

        <div class="parent-card-box">
          <strong>${i18n.t('app.parent_parade_rung')}:</strong>
          <div class="parent-rungs-row">
            ${[1, 2, 3, 4, 5].map(r => `
              <button class="parent-rung-btn ${r === currentRung ? 'active' : ''}" data-rung="${r}">${r}</button>
            `).join('')}
          </div>
        </div>

        <div class="parent-card-box" style="flex-direction:row; justify-content:space-between; align-items:center;">
          <span>${i18n.t('app.parent_reduce_motion')}</span>
          <input type="checkbox" id="chk-reduce-motion" ${reduceMotion ? 'checked' : ''} style="width:24px; height:24px; cursor:pointer;" />
        </div>

        <button id="parent-btn-done" class="btn-primary" style="margin-top:8px;">${i18n.t('app.close')}</button>
      </div>
    `;

    overlay.appendChild(modal);

    modal.querySelectorAll('.parent-rung-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = parseInt(btn.dataset.rung, 10);
        adaptive.setRung('parade', r);
        modal.querySelectorAll('.parent-rung-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        audio.playPop();
      });
    });

    const chkMotion = document.getElementById('chk-reduce-motion');
    if (chkMotion) {
      chkMotion.addEventListener('change', (e) => {
        storage.set('profile.reduceMotion', e.target.checked);
      });
    }

    document.getElementById('parent-btn-done')?.addEventListener('click', () => {
      audio.playPop();
      modal.remove();
    });
  }

  handleTap(x, y) {
    // Check if user tapped Sun
    if (this.sunPos && InputManager.hitTestCircle(x, y, this.sunPos.x, this.sunPos.y, this.sunPos.radius)) {
      audio.playTone('G3', 0.4, 'triangle');
      particles.emit(x, y, { color: '#FFA000', count: 8 });
      return true;
    }

    // Check if user tapped any orbiting planet
    for (const [id, pos] of this.planetStates.entries()) {
      if (InputManager.hitTestCircle(x, y, pos.x, pos.y, pos.radius)) {
        const planetData = this.planets.find(p => p.id === id);
        if (planetData) {
          audio.playPlanetNote(planetData.freq || planetData.note);
          particles.emit(pos.x, pos.y, { color: planetData.color || '#FFE082', count: 6 });
          pos.scalePop = 1.35;
          return true;
        }
      }
    }

    return false;
  }

  update(dt) {
    this.time += dt;
    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
    particles.update(dt);

    // Update scale pops on tapped planets
    for (const pos of this.planetStates.values()) {
      if (pos.scalePop && pos.scalePop > 1.0) {
        pos.scalePop -= dt * 2.0;
        if (pos.scalePop < 1.0) pos.scalePop = 1.0;
      }
    }
  }

  render(ctx, width, height) {
    ctx.fillStyle = '#0A0D24';
    ctx.fillRect(0, 0, width, height);

    starfield.render(ctx);

    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);

    // Sun at center
    const sunRadius = minDim * 0.12;
    this.sunPos = { x: cx, y: cy, radius: sunRadius };
    sunRenderer.render(ctx, cx, cy, sunRadius);

    // Render orbits and planets on rails
    const maxRadius = Math.max(width, height) * 0.46;
    const minRadius = sunRadius * 1.5;
    const orbitStep = (maxRadius - minRadius) / 8;

    const planetsToRender = this.planets.filter(p => p.id !== 'sun');

    for (let i = 0; i < planetsToRender.length; i++) {
      const p = planetsToRender[i];
      const orbitR = minRadius + i * orbitStep;

      // Draw faint orbit guide rail
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Calculate position
      const phase = (i * 1.25);
      const coords = calculateOrbitPosition(i + 1, this.time, phase, cx, cy, orbitR);

      const basePlanetR = Math.max(8, minDim * 0.024 * (p.radius_ratio || 1.0));
      const currentPos = this.planetStates.get(p.id) || { scalePop: 1.0 };
      const drawRadius = basePlanetR * (currentPos.scalePop || 1.0);

      this.planetStates.set(p.id, {
        x: coords.x,
        y: coords.y,
        radius: drawRadius,
        scalePop: currentPos.scalePop || 1.0
      });

      spriteCache.drawCachedPlanet(ctx, p.id, coords.x, coords.y, drawRadius);
    }

    // Orbi floating near bottom right
    const orbiX = width * 0.82;
    const orbiY = height * 0.78;
    orbiRenderer.render(ctx, orbiX, orbiY, 56, 'idle');

    particles.render(ctx);
  }
}
