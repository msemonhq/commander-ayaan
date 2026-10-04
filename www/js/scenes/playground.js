/**
 * Planet Playground Scene (js/scenes/playground.js).
 * Every planet is a tactile toy with NO goals, NO scoring, and NO sentences.
 * Features:
 * - Orbit view of whole solar system
 * - Tapping a body glides camera to focus (600ms ease with overshoot)
 * - Signature tactile toys for Sun and all 8 planets
 * - Ghost hand demonstrates signature gesture on first visit
 * - Saves completed toy discoveries to storage
 * - Big picture Home button (house icon) and 'Not to scale' badge
 */
import { sunRenderer } from '../render/sun.js';
import { planetRenderer } from '../render/planet.js';
import { moonRenderer } from '../render/moon.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { particles } from '../render/particles.js';
import { lighting } from '../render/lighting.js';
import { ghostHand } from '../render/hand.js';
import { audio } from '../core/audio.js';
import { haptics } from '../core/haptics.js';
import { storage } from '../core/storage.js';
import { coach } from '../systems/coach.js';
import { transition } from '../render/transition.js';
import { calculateOrbitPosition } from '../sim/orbits.js';
import { Easings } from '../core/tween.js';
import { i18n } from '../core/i18n.js';

export class PlaygroundScene {
  constructor() {
    this.elapsed = 0;
    this.planetsData = [];
    this.focusedPlanet = null; // null = orbit overview, or planet object
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraZoom = 1.0;
    this.targetCameraX = 0;
    this.targetCameraY = 0;
    this.targetCameraZoom = 1.0;
    this.cameraGlideTimer = 0;

    // Toy states
    this.sunLightMultiplier = 1.0;
    this.isSunHeld = false;
    this.sunPouredEarths = []; // Array of tiny earths inside Sun

    this.mercuryFastLap = 0; // 0..1
    this.mercuryDotRingPhase = 0; // 0..4 dots lit

    this.venusSpinAngle = 0;
    this.venusSpinVelocity = 0;
    this.showVenusArrows = false;

    this.earthSpinAngle = 0;
    this.earthMoonAngle = 0;

    this.marsStormIntensity = 0; // 0..1
    this.isMarsHeld = false;

    this.jupiterSwirlAngle = 0;
    this.jupiter11Earths = []; // Array of 11 tiny earths across face

    this.saturnRingTilt = -0.35;
    this.saturnWobblePhase = 0;

    this.uranusTilted = false;
    this.uranusRollAngle = 0;

    this.neptuneWindOffset = 0;
    this.neptuneWindActive = false;

    this.width = 800;
    this.height = 600;
  }

  enter() {
    this.elapsed = 0;
    this.focusedPlanet = null;
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraZoom = 1.0;
    this.targetCameraX = 0;
    this.targetCameraY = 0;
    this.targetCameraZoom = 1.0;
    this.planetsData = this.sceneManager.game.planetsData;

    this.buildUI();

    // Wordless coach: suggest tapping Earth first
    const earth = this.planetsData.find(p => p.id === 'earth');
    if (earth) {
      coach.setExpectedAction({
        id: 'playground-pick-planet',
        target: { x: this.width * 0.5, y: this.height * 0.5, radius: 48, id: 'planet-earth' },
        gesture: 'tap',
        from: { x: this.width * 0.5, y: this.height * 0.5 },
        immediate: false
      });
    }
  }

  exit() {
    coach.clearExpectedAction();
  }

  buildUI() {
    const overlay = this.sceneManager.uiOverlay;
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="top-bar">
        <div class="top-bar-left">
          <button id="playground-btn-home" class="btn-icon" aria-label="Go Home">
            <svg viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
          <span class="scale-badge" id="badge-not-to-scale">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            ${i18n.t('playground.not_to_scale') || 'Not to scale'}
          </span>
        </div>
        <div class="top-bar-right">
          <button id="playground-btn-mute" class="btn-icon" aria-label="Mute Audio">
            <svg viewBox="0 0 24 24" id="playground-mute-svg">
              ${audio.isMuted
                ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
                : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'}
            </svg>
          </button>
        </div>
      </div>
      <div id="planet-name-caption-bar" style="position:absolute; bottom:24px; left:50%; transform:translateX(-50%); pointer-events:none; display:none;">
        <span id="planet-name-caption" style="background:rgba(16,21,56,0.85); border:2px solid rgba(149,159,206,0.4); border-radius:999px; padding:8px 24px; font-family:var(--font-display); font-size:1.4rem; font-weight:800; color:#FFFFFF; text-shadow:0 2px 8px rgba(0,0,0,0.6);"></span>
      </div>
    `;

    document.getElementById('playground-btn-home')?.addEventListener('click', () => {
      audio.playPop();
      this.focusedPlanet = null;
      transition.startTransition({
        type: 'mode-to-hub',
        duration: 550,
        onComplete: () => this.sceneManager.switch('hub')
      });
    });

    document.getElementById('playground-btn-mute')?.addEventListener('click', () => {
      audio.toggleMute();
      const svg = document.getElementById('playground-mute-svg');
      if (svg) {
        svg.innerHTML = audio.isMuted
          ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
          : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      }
    });
  }

  updateCaption(nameKey) {
    const captionBar = document.getElementById('planet-name-caption-bar');
    const captionText = document.getElementById('planet-name-caption');
    if (!captionBar || !captionText) return;

    if (nameKey) {
      captionText.textContent = i18n.t(nameKey);
      captionBar.style.display = 'block';
    } else {
      captionBar.style.display = 'none';
    }
  }

  focusPlanet(planet) {
    this.focusedPlanet = planet;
    const cx = this.width / 2;
    const cy = this.height / 2;

    if (planet) {
      audio.playPlanetNote(planet.note);
      haptics.tick();
      this.updateCaption(planet.name_key);
      storage.set('toys_completed.' + planet.id, true);

      // Register toy gesture for ghost hand
      this.setupToyCoach(planet, cx, cy);
    } else {
      this.updateCaption(null);
      coach.clearExpectedAction();
    }
  }

  setupToyCoach(planet, cx, cy) {
    let gesture = 'tap';
    let from = { x: cx, y: cy };
    let to = { x: cx, y: cy };

    if (planet.id === 'sun' || planet.id === 'mars') {
      gesture = 'hold';
    } else if (planet.id === 'mercury') {
      gesture = 'flick';
      to = { x: cx + 120, y: cy - 60 };
    } else if (planet.id === 'venus' || planet.id === 'earth' || planet.id === 'jupiter' || planet.id === 'saturn' || planet.id === 'neptune') {
      gesture = 'drag';
      from = { x: cx - 60, y: cy };
      to = { x: cx + 60, y: cy };
    }

    coach.setExpectedAction({
      id: 'toy-' + planet.id,
      target: { x: cx, y: cy, radius: 64, id: planet.id },
      gesture,
      from,
      to,
      immediate: true
    });
  }

  handleTap(x, y) {
    if (transition.isTransitioning) {
      transition.fastForward(80);
      return true;
    }

    const cx = this.width / 2;
    const cy = this.height / 2;

    if (!this.focusedPlanet) {
      // Check tap on any body in overview
      const baseR = Math.min(this.width, this.height) * 0.44;

      // Sun
      if (Math.hypot(x - cx, y - cy) <= (Math.min(this.width, this.height) * 0.12) * 1.4) {
        const sunObj = this.planetsData.find(p => p.id === 'sun');
        this.focusPlanet(sunObj);
        return true;
      }

      // 8 Planets
      const planetsOnly = this.planetsData.filter(p => p.id !== 'sun');
      for (let i = 0; i < planetsOnly.length; i++) {
        const p = planetsOnly[i];
        const orbitR = baseR * (0.32 + (i / 7) * 0.65);
        const pos = calculateOrbitPosition(i + 1, this.elapsed, (i * Math.PI) / 4, cx, cy, orbitR);
        const pr = Math.max(16, 26 * (p.radius_ratio || 1.0));
        if (Math.hypot(x - pos.x, y - pos.y) <= pr * 1.4) {
          this.focusPlanet(p);
          return true;
        }
      }
    } else {
      // Tap on currently focused planet toy
      const p = this.focusedPlanet;
      if (p.id === 'uranus') {
        // Tap rolls Uranus onto side
        this.uranusTilted = !this.uranusTilted;
        audio.playPop();
        haptics.tick();
        return true;
      } else if (p.id === 'jupiter') {
        // Tap lines up 11 Earths across Jupiter
        this.triggerJupiter11Earths();
        audio.playPop();
        haptics.tick();
        return true;
      }
    }

    return false;
  }

  handleHold(point) {
    if (!this.focusedPlanet) return;
    const p = this.focusedPlanet;

    if (p.id === 'sun') {
      this.isSunHeld = true;
      audio.playTone(392.0, 0.4, 'triangle');
      haptics.tick();
      // Pour stream of tiny Earths into Sun
      for (let i = 0; i < 12; i++) {
        this.sunPouredEarths.push({
          x: (Math.random() - 0.5) * 90,
          y: -160 - Math.random() * 80,
          targetY: (Math.random() - 0.5) * 70,
          alpha: 1.0,
          speed: 130 + Math.random() * 90
        });
      }
    } else if (p.id === 'mars') {
      this.isMarsHeld = true;
      audio.playTone(329.63, 0.3, 'sine');
      haptics.tick();
    }
  }

  handleHoldEnd(point) {
    if (this.isSunHeld) {
      this.isSunHeld = false;
    }
    if (this.isMarsHeld) {
      this.isMarsHeld = false;
    }
  }

  handleDrag(dragInfo) {
    if (!this.focusedPlanet) return;
    const p = this.focusedPlanet;

    if (p.id === 'venus') {
      // Drag spins backwards
      this.venusSpinVelocity = -dragInfo.vx * 0.003;
      this.venusSpinAngle += this.venusSpinVelocity;
      this.showVenusArrows = true;
    } else if (p.id === 'earth') {
      // Turn Earth & Moon
      this.earthSpinAngle += dragInfo.vx * 0.003;
      this.earthMoonAngle += (dragInfo.vx + (dragInfo.vy || 0)) * 0.003;
    } else if (p.id === 'jupiter') {
      // Swirl bands and spin spot
      this.jupiterSwirlAngle += dragInfo.vx * 0.005;
    } else if (p.id === 'saturn') {
      // Tilt ring
      this.saturnRingTilt = Math.max(-0.7, Math.min(0.1, -0.35 + dragInfo.vy * 0.003));
      this.saturnWobblePhase = 1.0;
      particles.emit(this.width / 2 + (Math.random() - 0.5) * 100, this.height / 2, { color: '#FFE082', count: 4 });
    } else if (p.id === 'neptune') {
      // Supersonic wind streaks race
      this.neptuneWindOffset += Math.abs(dragInfo.vx) * 0.05 + 15;
      this.neptuneWindActive = true;
    }
  }

  handleFlick(flickInfo) {
    if (!this.focusedPlanet) return;
    const p = this.focusedPlanet;

    if (p.id === 'mercury') {
      // Mercury fast lap animation
      this.mercuryFastLap = 1.0;
      this.mercuryDotRingPhase = 0;
      audio.playTone(523.25, 0.3, 'triangle');
      haptics.tick();
    }
  }

  triggerJupiter11Earths() {
    this.jupiter11Earths = [];
    for (let i = 0; i < 11; i++) {
      this.jupiter11Earths.push({
        slotIndex: i,
        curY: -160,
        targetX: -110 + i * 22,
        targetY: 0,
        progress: 0,
        delay: i * 0.07 // 70ms apart
      });
    }
  }

  findEntityAt(x, y, scale = 1.0) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    if (!this.focusedPlanet) {
      const baseR = Math.min(this.width, this.height) * 0.44;
      // Sun
      if (Math.hypot(x - cx, y - cy) <= (Math.min(this.width, this.height) * 0.12) * scale) {
        return this.planetsData.find(p => p.id === 'sun') || null;
      }
      // Planets
      const planetsOnly = this.planetsData.filter(p => p.id !== 'sun');
      for (let i = 0; i < planetsOnly.length; i++) {
        const p = planetsOnly[i];
        const orbitR = baseR * (0.32 + (i / 7) * 0.65);
        const pos = calculateOrbitPosition(i + 1, this.elapsed, (i * Math.PI) / 4, cx, cy, orbitR);
        const pr = Math.max(16, 26 * (p.radius_ratio || 1.0));
        if (Math.hypot(x - pos.x, y - pos.y) <= pr * scale) {
          return p;
        }
      }
    } else {
      const toyR = Math.min(this.width, this.height) * 0.22;
      if (Math.hypot(x - cx, y - cy) <= toyR * scale) {
        return this.focusedPlanet;
      }
    }
    return null;
  }

  update(dt) {
    this.elapsed += dt;
    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
    particles.update(dt);
    ghostHand.update(dt);

    // Sun hold light swell and pouring Earths stream
    if (this.isSunHeld) {
      this.sunLightMultiplier = Math.min(2.5, this.sunLightMultiplier + dt * 1.5);
      this.sunEarthSpawnTimer = (this.sunEarthSpawnTimer || 0) + dt;
      if (this.sunEarthSpawnTimer >= 0.08) {
        this.sunEarthSpawnTimer = 0;
        this.sunPouredEarths.push({
          x: (Math.random() - 0.5) * 90,
          y: -150 - Math.random() * 40,
          targetY: (Math.random() - 0.5) * 70,
          alpha: 1.0,
          speed: 140 + Math.random() * 100
        });
      }
    } else {
      this.sunLightMultiplier = Math.max(1.0, this.sunLightMultiplier - dt * 1.5);
    }

    // Always update falling Earths
    for (let i = this.sunPouredEarths.length - 1; i >= 0; i--) {
      const e = this.sunPouredEarths[i];
      e.y += dt * e.speed;
      if (e.y >= e.targetY) {
        e.y = e.targetY;
        e.alpha = Math.max(0, e.alpha - dt * 1.4);
        if (e.alpha <= 0) {
          this.sunPouredEarths.splice(i, 1);
        }
      }
    }

    // Mercury fast lap & 4-dot ring progression
    if (this.mercuryFastLap > 0) {
      this.mercuryFastLap = Math.max(0, this.mercuryFastLap - dt * 0.7);
      const lapProgress = 1 - this.mercuryFastLap;
      this.mercuryDotRingPhase = Math.min(4, Math.floor(lapProgress * 4.9));
    }

    // Venus spin inertia
    this.venusSpinAngle += this.venusSpinVelocity * dt;
    this.venusSpinVelocity *= 0.94;

    // Mars storm decay on release
    if (this.isMarsHeld) {
      this.marsStormIntensity = Math.min(1.0, this.marsStormIntensity + dt * 1.8);
    } else {
      this.marsStormIntensity = Math.max(0.0, this.marsStormIntensity - dt * 1.0);
    }

    // Jupiter 11 Earths drop
    for (const e of this.jupiter11Earths) {
      if (this.elapsed > e.delay) {
        e.progress = Math.min(1.0, e.progress + dt * 4.0);
        e.curY = -160 + (e.targetY - (-160)) * Easings.spring(e.progress);
      }
    }

    // Saturn ring wobble decay
    if (this.saturnWobblePhase > 0) {
      this.saturnWobblePhase -= dt * 1.5;
      this.saturnRingTilt += Easings.wobble(1 - this.saturnWobblePhase) * 0.08;
    }

    // Uranus tilt roll
    const targetRoll = this.uranusTilted ? Math.PI * 0.54 : 0;
    this.uranusRollAngle += (targetRoll - this.uranusRollAngle) * Math.min(1.0, dt * 6.0);

    // Neptune wind streak relax
    if (this.neptuneWindActive) {
      this.neptuneWindOffset += dt * 80;
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

    if (!this.focusedPlanet) {
      // 1. Orbit Overview View
      this.renderOverview(ctx, cx, cy);
    } else {
      // 2. Focused Planet Interactive Toy View
      this.renderFocusedToy(ctx, cx, cy);
    }

    // Coach ghost hand
    if (coach.state.showGhostHand && coach.getTarget()) {
      ghostHand.render(ctx, coach.getTarget());
    }

    particles.render(ctx);
  }

  renderOverview(ctx, cx, cy) {
    const baseR = Math.min(this.width, this.height) * 0.44;

    // Orbit rails
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const orbitR = baseR * (0.32 + (i / 7) * 0.65);
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(149, 159, 206, 0.12)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();

    // Center Sun
    const sunR = Math.min(this.width, this.height) * 0.11;
    sunRenderer.render(ctx, cx, cy, sunR);

    // Planets
    const planetsOnly = this.planetsData.filter(p => p.id !== 'sun');
    for (let i = 0; i < planetsOnly.length; i++) {
      const p = planetsOnly[i];
      const orbitR = baseR * (0.32 + (i / 7) * 0.65);
      const pos = calculateOrbitPosition(i + 1, this.elapsed, (i * Math.PI) / 4, cx, cy, orbitR);
      const pr = Math.max(14, 24 * (p.radius_ratio || 1.0));

      planetRenderer.renderPlanet(ctx, p.id, pos.x, pos.y, pr, {
        spinAngle: this.elapsed * 0.5,
        windOffset: this.elapsed * 30
      });
      lighting.applyLighting(ctx, p.id, pos.x, pos.y, pr, cx, cy);
    }

    // Companion Orbi
    orbiRenderer.render(ctx, cx + this.width * 0.22, cy - this.height * 0.16, 60, 'idle');
  }

  renderFocusedToy(ctx, cx, cy) {
    const p = this.focusedPlanet;
    const toyR = Math.min(this.width, this.height) * 0.22;

    if (p.id === 'sun') {
      // Background planets illuminated at distance (farther stay dimmer)
      const planetsOnly = this.planetsData.filter(pl => pl.id !== 'sun');
      const baseR = Math.min(this.width, this.height) * 0.44;
      for (let i = 0; i < planetsOnly.length; i++) {
        const pl = planetsOnly[i];
        const orbitR = baseR * (0.45 + (i / 7) * 0.52);
        const pos = calculateOrbitPosition(i + 1, this.elapsed * 0.2, (i * Math.PI) / 4, cx, cy, orbitR);
        const pr = Math.max(8, 14 * (pl.radius_ratio || 1.0));
        ctx.save();
        ctx.globalAlpha = Math.min(1.0, 0.45 + (this.sunLightMultiplier - 1.0) * 0.4 - (i / 8) * 0.3);
        planetRenderer.renderPlanet(ctx, pl.id, pos.x, pos.y, pr, {});
        lighting.applyLighting(ctx, pl.id, pos.x, pos.y, pr, cx, cy);
        ctx.restore();
      }

      // Sun Toy: Light intensity swells, tiny Earths stream in
      const swellR = toyR * (0.85 + 0.35 * this.sunLightMultiplier);
      sunRenderer.render(ctx, cx, cy, swellR);

      // Poured Earths filling the Sun's silhouette
      for (const e of this.sunPouredEarths) {
        if (e.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = e.alpha;
          planetRenderer.renderPlanet(ctx, 'earth', cx + e.x, cy + e.y, 5, {});
          ctx.restore();
        }
      }
    } else {
      // Planets Toy View
      // Sun stays lit in corner to provide directional lighting
      const sunCornerX = this.width * 0.12;
      const sunCornerY = this.height * 0.16;
      sunRenderer.render(ctx, sunCornerX, sunCornerY, 32);

      // Render Toy Planet
      ctx.save();
      if (p.id === 'mercury') {
        let mercuryX = cx;
        let mercuryY = cy;

        if (this.mercuryFastLap > 0) {
          const lapProgress = 1 - this.mercuryFastLap;
          const lapAngle = lapProgress * Math.PI * 4; // 2 laps
          const lapRx = toyR * 1.35;
          const lapRy = toyR * 0.85;
          mercuryX = cx + Math.cos(lapAngle) * lapRx;
          mercuryY = cy + Math.sin(lapAngle) * lapRy;

          // Motion smear trail
          ctx.save();
          for (let s = 1; s <= 4; s++) {
            const sAngle = lapAngle - s * 0.22;
            const sx = cx + Math.cos(sAngle) * lapRx;
            const sy = cy + Math.sin(sAngle) * lapRy;
            ctx.beginPath();
            ctx.arc(sx, sy, toyR * (0.85 - s * 0.15), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(158, 154, 148, ${0.35 - s * 0.08})`;
            ctx.fill();
          }
          ctx.restore();
        }

        planetRenderer.renderPlanet(ctx, 'mercury', mercuryX, mercuryY, toyR, {});
        lighting.applyLighting(ctx, 'mercury', mercuryX, mercuryY, toyR, sunCornerX, sunCornerY);

        // 4 dots ring beside Earth's orbit - lights up one by one!
        ctx.save();
        for (let d = 0; d < 4; d++) {
          const da = (d * Math.PI) / 2 - Math.PI / 2;
          const dx = cx + Math.cos(da) * (toyR * 1.55);
          const dy = cy + Math.sin(da) * (toyR * 1.55);
          const isLit = d < this.mercuryDotRingPhase;

          ctx.beginPath();
          ctx.arc(dx, dy, isLit ? 8 : 4.5, 0, Math.PI * 2);
          ctx.fillStyle = isLit ? '#FFE082' : 'rgba(255, 255, 255, 0.25)';
          if (isLit) {
            ctx.shadowColor = '#FFA000';
            ctx.shadowBlur = 10;
          }
          ctx.fill();
        }
        ctx.restore();
      } else if (p.id === 'venus') {
        planetRenderer.renderPlanet(ctx, 'venus', cx, cy, toyR, { spinAngle: this.venusSpinAngle });
        lighting.applyLighting(ctx, 'venus', cx, cy, toyR, sunCornerX, sunCornerY);

        if (this.showVenusArrows) {
          // Draw opposite spin comparison indicator: Earth (CCW prograde) vs Venus (CW retrograde)
          ctx.save();
          const compY = cy + toyR * 1.35;

          // Earth spin comparison
          ctx.save();
          ctx.translate(cx - 55, compY);
          planetRenderer.renderPlanet(ctx, 'earth', 0, 0, 14, {});
          ctx.strokeStyle = '#70D6FF';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 24, Math.PI * 0.2, Math.PI * 1.3);
          ctx.stroke();
          ctx.fillStyle = '#70D6FF';
          ctx.beginPath();
          ctx.moveTo(-16, -18);
          ctx.lineTo(-24, -13);
          ctx.lineTo(-17, -8);
          ctx.fill();
          ctx.restore();

          // Venus spin comparison
          ctx.save();
          ctx.translate(cx + 55, compY);
          planetRenderer.renderPlanet(ctx, 'venus', 0, 0, 14, {});
          ctx.strokeStyle = '#FFE082';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 24, -Math.PI * 0.3, Math.PI * 0.8);
          ctx.stroke();
          ctx.fillStyle = '#FFE082';
          ctx.beginPath();
          ctx.moveTo(16, 18);
          ctx.lineTo(24, 13);
          ctx.lineTo(17, 8);
          ctx.fill();
          ctx.restore();

          ctx.restore();
        }
      } else if (p.id === 'earth') {
        planetRenderer.renderPlanet(ctx, 'earth', cx, cy, toyR, { spinAngle: this.earthSpinAngle });
        lighting.applyLighting(ctx, 'earth', cx, cy, toyR, sunCornerX, sunCornerY);

        // Orbiting Moon
        const moonX = cx + Math.cos(this.earthMoonAngle) * (toyR * 1.6);
        const moonY = cy + Math.sin(this.earthMoonAngle) * (toyR * 1.6);
        moonRenderer.renderMoon(ctx, moonX, moonY, toyR * 0.24);
        lighting.applyLighting(ctx, 'moon', moonX, moonY, toyR * 0.24, sunCornerX, sunCornerY);
      } else if (p.id === 'mars') {
        planetRenderer.renderPlanet(ctx, 'mars', cx, cy, toyR, {});
        lighting.applyLighting(ctx, 'mars', cx, cy, toyR, sunCornerX, sunCornerY);

        // Dust storm billow overlay
        if (this.marsStormIntensity > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, toyR * 1.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(211, 84, 0, ${this.marsStormIntensity * 0.55})`;
          ctx.fill();
          ctx.restore();
        }
      } else if (p.id === 'jupiter') {
        planetRenderer.renderPlanet(ctx, 'jupiter', cx, cy, toyR, { swirlAngle: this.jupiterSwirlAngle });
        lighting.applyLighting(ctx, 'jupiter', cx, cy, toyR, sunCornerX, sunCornerY);

        // 11 tiny Earths lined up across face
        for (const e of this.jupiter11Earths) {
          if (e.progress > 0) {
            planetRenderer.renderPlanet(ctx, 'earth', cx + e.targetX, cy + e.curY, 6, {});
          }
        }
      } else if (p.id === 'saturn') {
        planetRenderer.renderPlanet(ctx, 'saturn', cx, cy, toyR, { tilt: this.saturnRingTilt });
        lighting.applyLighting(ctx, 'saturn', cx, cy, toyR, sunCornerX, sunCornerY);
      } else if (p.id === 'uranus') {
        planetRenderer.renderPlanet(ctx, 'uranus', cx, cy, toyR, { rollAngle: this.uranusRollAngle });
        lighting.applyLighting(ctx, 'uranus', cx, cy, toyR, sunCornerX, sunCornerY);
      } else if (p.id === 'neptune') {
        planetRenderer.renderPlanet(ctx, 'neptune', cx, cy, toyR, { windOffset: this.neptuneWindOffset });
        lighting.applyLighting(ctx, 'neptune', cx, cy, toyR, sunCornerX, sunCornerY);
      }
      ctx.restore();
    }

    // Companion Orbi observing
    orbiRenderer.render(ctx, this.width * 0.82, this.height * 0.72, 64, 'idle');
  }
}
