/**
 * Meet the Planets Scene (js/scenes/meet.js).
 * Free exploration: no goals, no scoring, camera glide, signature animations, verified facts.
 */
import { sunRenderer } from '../render/sun.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { particles } from '../render/particles.js';
import { moonRenderer } from '../render/moon.js';
import { planetRenderer } from '../render/planet.js';
import { spriteCache } from '../render/sprites.js';
import { camera } from '../sim/camera.js';
import { calculateOrbitPosition } from '../sim/orbits.js';
import { audio } from '../core/audio.js';
import { voice } from '../core/voice.js';
import { storage } from '../core/storage.js';
import { i18n } from '../core/i18n.js';
import { InputManager } from '../core/input.js';

export class MeetScene {
  constructor(planetsData = []) {
    this.planets = planetsData;
    this.time = 0;
    this.focusedPlanet = null;
    this.factIndex = 0;
    this.signatureStates = new Map();
    this.planetWorldCoords = new Map();
  }

  setPlanets(planetsData) {
    this.planets = planetsData;
  }

  enter() {
    this.time = 0;
    this.focusedPlanet = null;
    this.factIndex = 0;
    camera.setImmediate(0, 0, 1.0);
    this.initSignatureStates();
    this.buildUI();
  }

  exit() {
    camera.reset();
  }

  initSignatureStates() {
    this.signatureStates.clear();
    for (const p of this.planets) {
      this.signatureStates.set(p.id, {
        active: false,
        timer: 0,
        spinAngle: 0,
        swirlAngle: 0,
        tilt: -0.35,
        rollAngle: Math.PI * 0.54,
        windOffset: 0,
        lapProgress: 0,
        moonAngle: 0
      });
    }
  }

  buildUI() {
    const overlay = this.sceneManager.uiOverlay;
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="top-bar">
        <div class="top-bar-left">
          <button id="meet-btn-home" class="btn-icon" aria-label="${i18n.t('app.home')}">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </button>
          <span class="scale-badge">${i18n.t('app.not_to_scale')}</span>
        </div>
        <div class="top-bar-right">
          <button id="meet-btn-mute" class="btn-icon" aria-label="${audio.isMuted ? i18n.t('app.unmute') : i18n.t('app.mute')}">
            <svg viewBox="0 0 24 24">
              ${audio.isMuted 
                ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>' 
                : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'}
            </svg>
          </button>
        </div>
      </div>

      <div id="meet-dialogue-wrap" class="orbi-bubble-wrap">
        <div class="orbi-bubble" id="meet-dialogue-bubble">
          <div class="orbi-avatar-badge">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#FFFFFF">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            </svg>
          </div>
          <div class="orbi-speech-content">
            <div id="meet-subtitle" class="orbi-subtitle">
              ${this.focusedPlanet 
                ? i18n.t(`planet.${this.focusedPlanet.id}.fact${this.factIndex + 1}`) 
                : i18n.t('meet.instruction')}
            </div>
            ${this.focusedPlanet ? `
              <button id="meet-btn-more-fact" class="orbi-secondary-btn" aria-label="${i18n.t('meet.more_fact_button')}">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>
                ${i18n.t('meet.more_fact_button')}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    document.getElementById('meet-btn-home').addEventListener('click', () => {
      audio.playPop();
      this.sceneManager.switch('hub');
    });

    document.getElementById('meet-btn-mute').addEventListener('click', () => {
      audio.toggleMute();
      this.buildUI();
    });

    const moreBtn = document.getElementById('meet-btn-more-fact');
    if (moreBtn) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMoreFact();
      });
    }

    const dialogueBubble = document.getElementById('meet-dialogue-bubble');
    if (dialogueBubble) {
      dialogueBubble.addEventListener('click', () => {
        voice.skip();
      });
    }
  }

  toggleMoreFact() {
    if (!this.focusedPlanet) return;
    this.factIndex = (this.factIndex + 1) % 2;
    const factKey = `planet.${this.focusedPlanet.id}.fact${this.factIndex + 1}`;
    voice.speak(factKey);
    const subtitleEl = document.getElementById('meet-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = i18n.t(factKey);
    }
  }

  focusOnPlanet(planet) {
    this.focusedPlanet = planet;
    this.factIndex = 0;
    storage.recordPlanetVisit(planet.id);

    // Audio feedback
    audio.playPlanetNote(planet.freq || planet.note);

    // Speak fact 1
    const factKey = `planet.${planet.id}.fact1`;
    voice.speak(factKey);

    // Trigger signature animation
    this.triggerSignature(planet.id);

    // Camera glide to planet position
    const pos = this.planetWorldCoords.get(planet.id);
    if (pos) {
      camera.glideTo(pos.x - window.innerWidth / 2, pos.y - window.innerHeight / 2, 2.2);
    }

    this.buildUI();
  }

  triggerSignature(id) {
    const s = this.signatureStates.get(id);
    if (!s) return;
    s.active = true;
    s.timer = 2.5; // Active for 2.5s

    // Signature dust on Mars
    if (id === 'mars') {
      const pos = this.planetWorldCoords.get('mars');
      if (pos) {
        particles.emit(pos.x, pos.y, { color: '#E67E22', count: 12, speed: 60 });
      }
    }
  }

  handleTap(screenX, screenY) {
    const world = camera.screenToWorld(screenX, screenY, window.innerWidth, window.innerHeight);

    // Check tap on Sun
    const sunPos = this.planetWorldCoords.get('sun');
    if (sunPos && InputManager.hitTestCircle(world.x, world.y, sunPos.x, sunPos.y, sunPos.radius)) {
      const sunData = this.planets.find(p => p.id === 'sun');
      if (sunData) this.focusOnPlanet(sunData);
      return true;
    }

    // Check tap on any planet
    for (const [id, pos] of this.planetWorldCoords.entries()) {
      if (id === 'sun') continue;
      if (InputManager.hitTestCircle(world.x, world.y, pos.x, pos.y, pos.radius)) {
        const planet = this.planets.find(p => p.id === id);
        if (planet) {
          this.focusOnPlanet(planet);
          return true;
        }
      }
    }

    // Tapping empty space resets camera glide to full system view
    if (this.focusedPlanet) {
      this.focusedPlanet = null;
      camera.reset();
      voice.speak('meet.instruction');
      this.buildUI();
      return true;
    }

    return false;
  }

  update(dt) {
    this.time += dt;
    camera.update(dt);
    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
    particles.update(dt);

    // Update signature animation states
    for (const [id, s] of this.signatureStates.entries()) {
      if (s.active) {
        s.timer -= dt;
        if (s.timer <= 0) s.active = false;

        if (id === 'venus') s.spinAngle += dt * 4.0; // Reverse spin fast
        if (id === 'jupiter') s.swirlAngle += dt * 5.0; // Swirl storm
        if (id === 'saturn') s.tilt = -0.35 + Math.sin(this.time * 6) * 0.15; // Wobble ring
        if (id === 'uranus') s.rollAngle += dt * 3.0; // Roll on side
        if (id === 'neptune') s.windOffset += dt * 90; // High speed wind
        if (id === 'earth') s.moonAngle += dt * 4.5; // Moon circles Earth
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

    // Apply Camera Transform
    camera.apply(ctx, width, height);

    // Sun at center
    const sunRadius = minDim * 0.11;
    this.planetWorldCoords.set('sun', { x: cx, y: cy, radius: sunRadius });
    sunRenderer.render(ctx, cx, cy, sunRadius);

    // Orbit rings and planets
    const maxRadius = Math.max(width, height) * 0.44;
    const minRadius = sunRadius * 1.55;
    const orbitStep = (maxRadius - minRadius) / 8;
    const planetsToRender = this.planets.filter(p => p.id !== 'sun');

    for (let i = 0; i < planetsToRender.length; i++) {
      const p = planetsToRender[i];
      const orbitR = minRadius + i * orbitStep;

      // Draw subtle orbit rail
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const phase = (i * 1.25);
      const coords = calculateOrbitPosition(i + 1, this.time, phase, cx, cy, orbitR);
      const isFocused = (this.focusedPlanet && this.focusedPlanet.id === p.id);
      const baseR = Math.max(9, minDim * 0.026 * (p.radius_ratio || 1.0));
      const drawR = isFocused ? baseR * 1.5 : baseR;

      this.planetWorldCoords.set(p.id, { x: coords.x, y: coords.y, radius: drawR });

      const sigState = this.signatureStates.get(p.id) || {};
      planetRenderer.renderPlanet(ctx, p.id, coords.x, coords.y, drawR, sigState);

      // Earth's signature Moon
      if (p.id === 'earth' && (isFocused || sigState.active)) {
        const moonDist = drawR * 1.85;
        const mx = coords.x + Math.cos(sigState.moonAngle || 0) * moonDist;
        const my = coords.y + Math.sin(sigState.moonAngle || 0) * moonDist;
        moonRenderer.renderMoon(ctx, mx, my, drawR * 0.32);
      }
    }

    particles.render(ctx);

    camera.restore(ctx);

    // Orbi floating on top in screen space
    const orbiPose = this.focusedPlanet ? 'point' : 'idle';
    orbiRenderer.render(ctx, width * 0.88, height * 0.82, 58, orbiPose);
  }
}
