/**
 * Planet Parade Scene (js/scenes/parade.js).
 * Spatial-reasoning runway ordering game with 5 adaptive rungs,
 * 3-step gentle hint ladder, and 3-tier feedback.
 */
import { sunRenderer } from '../render/sun.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { particles } from '../render/particles.js';
import { planetRenderer } from '../render/planet.js';
import { audio } from '../core/audio.js';
import { voice } from '../core/voice.js';
import { adaptive } from '../systems/adaptive.js';
import { hints } from '../systems/hints.js';
import { rewards } from '../systems/rewards.js';
import { session } from '../systems/session.js';
import { storage } from '../core/storage.js';
import { i18n } from '../core/i18n.js';
import { rng } from '../core/rng.js';

export class ParadeScene {
  constructor(planetsData = [], missionsData = {}) {
    this.planets = planetsData;
    this.missions = missionsData;
    this.currentRound = 1;
    this.totalRounds = 5;
    this.hintsInRound = 0;
    this.selectedTrayPlanet = null;
    this.placedPlanets = new Map(); // slotIndex -> planetId
    this.trayPlanets = [];
    this.slots = [];
    this.isRoundOver = false;
    this.activeRung = 1;
    this.chapter = 1; // for Rung 5
  }

  setPlanets(planetsData) {
    this.planets = planetsData;
  }

  setMissions(missionsData) {
    this.missions = missionsData;
  }

  enter() {
    this.currentRound = 1;
    this.activeRung = adaptive.getRung('parade');
    this.startRound();
  }

  exit() {
    hints.reset();
  }

  startRound() {
    this.hintsInRound = 0;
    hints.reset();
    this.selectedTrayPlanet = null;
    this.placedPlanets.clear();
    this.isRoundOver = false;

    this.setupRungData();
    this.buildUI();

    voice.speak(`parade.r${Math.min(5, this.activeRung)}_prompt`);
  }

  setupRungData() {
    const allPlanetIds = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    if (this.activeRung === 1) {
      // R1: Mercury, Venus, Earth (with dot cues)
      const targetIds = ['mercury', 'venus', 'earth'];
      this.slots = targetIds.map((id, idx) => ({ id, order: idx + 1, dots: idx + 1 }));
      this.trayPlanets = rng.shuffle(targetIds);
    } else if (this.activeRung === 2) {
      // R2: Mercury to Mars (4 planets, no dots)
      const targetIds = ['mercury', 'venus', 'earth', 'mars'];
      this.slots = targetIds.map((id, idx) => ({ id, order: idx + 1, dots: 0 }));
      this.trayPlanets = rng.shuffle(targetIds);
    } else if (this.activeRung === 3) {
      // R3: "Who lives here?" One empty slot between two placed neighbours
      // Pick a random gap from inner planets
      const gapIndex = rng.nextInt(1, 3); // index 1 (venus) or 2 (earth)
      const trio = ['mercury', 'venus', 'earth', 'mars'].slice(gapIndex - 1, gapIndex + 2);
      const missingId = trio[1];

      this.slots = trio.map((id, idx) => ({
        id,
        order: gapIndex + idx,
        dots: 0,
        prefilled: id !== missingId
      }));

      // Prefill neighbours
      this.slots.forEach((s, idx) => {
        if (s.prefilled) this.placedPlanets.set(idx, s.id);
      });

      // Tray has correct planet plus 2 random distractors
      const distractors = allPlanetIds.filter(id => id !== missingId);
      const pickedDistractors = rng.shuffle(distractors).slice(0, 2);
      this.trayPlanets = rng.shuffle([missingId, ...pickedDistractors]);
    } else if (this.activeRung === 4) {
      // R4: Mercury to Saturn (6 planets)
      const targetIds = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];
      this.slots = targetIds.map((id, idx) => ({ id, order: idx + 1, dots: 0 }));
      this.trayPlanets = rng.shuffle(targetIds);
    } else {
      // R5: All 8 planets (split into inner chapter 1 or outer chapter 2)
      if (this.chapter === 1) {
        const targetIds = ['mercury', 'venus', 'earth', 'mars'];
        this.slots = targetIds.map((id, idx) => ({ id, order: idx + 1, dots: 0 }));
        this.trayPlanets = rng.shuffle(targetIds);
      } else {
        // Outer four, with inner four visually marked or placed
        const targetIds = ['jupiter', 'saturn', 'uranus', 'neptune'];
        this.slots = targetIds.map((id, idx) => ({ id, order: idx + 5, dots: 0 }));
        this.trayPlanets = rng.shuffle(targetIds);
      }
    }
  }

  buildUI() {
    const overlay = this.sceneManager.uiOverlay;
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="top-bar">
        <div class="top-bar-left">
          <button id="parade-btn-home" class="btn-icon" aria-label="${i18n.t('app.home')}">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </button>
          <span class="scale-badge">${i18n.t('app.not_to_scale')}</span>
          <span class="scale-badge">Round ${this.currentRound}/${this.totalRounds}</span>
        </div>
        <div class="top-bar-right">
          <button id="parade-btn-mute" class="btn-icon" aria-label="${audio.isMuted ? i18n.t('app.unmute') : i18n.t('app.mute')}">
            <svg viewBox="0 0 24 24">
              ${audio.isMuted 
                ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>' 
                : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'}
            </svg>
          </button>
        </div>
      </div>

      <div class="parade-layout">
        <div class="parade-header">
          <div class="parade-title">${i18n.t('parade.title')}</div>
        </div>

        <!-- Horizontal Runway -->
        <div class="parade-runway-wrapper">
          <div class="parade-runway" id="parade-runway">
            <div class="runway-sun-marker">SUN</div>
            ${this.slots.map((slot, idx) => {
              const placedId = this.placedPlanets.get(idx);
              const isFilled = Boolean(placedId);
              return `
                <div class="runway-slot ${isFilled ? 'filled' : ''}" 
                     id="slot-${idx}" 
                     data-slot-index="${idx}"
                     aria-label="Orbit Slot ${slot.order}">
                  ${slot.dots > 0 ? `
                    <div class="slot-dot-cue">
                      ${Array.from({ length: slot.dots }).map(() => '<span class="slot-dot"></span>').join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tray at Bottom -->
        <div class="parade-tray-wrapper" id="parade-tray">
          ${this.trayPlanets.map((id) => {
            const isSelected = (this.selectedTrayPlanet === id);
            return `
              <div class="tray-planet-item ${isSelected ? 'selected' : ''}" 
                   id="tray-item-${id}" 
                   data-planet-id="${id}"
                   aria-label="${i18n.t(`planet.${id}.name`)}">
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div id="parade-dialogue-wrap" class="orbi-bubble-wrap" style="bottom: 120px;">
        <div class="orbi-bubble" id="parade-dialogue-bubble">
          <div class="orbi-avatar-badge">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#FFFFFF">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            </svg>
          </div>
          <div class="orbi-speech-content">
            <div id="parade-subtitle" class="orbi-subtitle">
              ${voice.currentText || i18n.t('parade.instruction')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Home & Mute
    document.getElementById('parade-btn-home').addEventListener('click', () => {
      audio.playPop();
      this.sceneManager.switch('hub');
    });

    document.getElementById('parade-btn-mute').addEventListener('click', () => {
      audio.toggleMute();
      this.buildUI();
    });

    // Bind Tray items (Tap to select)
    for (const id of this.trayPlanets) {
      const el = document.getElementById(`tray-item-${id}`);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleTrayTap(id);
        });
      }
    }

    // Bind Runway slots (Tap to place)
    this.slots.forEach((slot, idx) => {
      const el = document.getElementById(`slot-${idx}`);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleSlotTap(idx);
        });
      }
    });

    const bubbleEl = document.getElementById('parade-dialogue-bubble');
    if (bubbleEl) {
      bubbleEl.addEventListener('click', () => voice.skip());
    }
  }

  handleTrayTap(planetId) {
    if (this.isRoundOver) return;
    this.selectedTrayPlanet = planetId;
    audio.playPop();
    this.buildUI();
  }

  handleSlotTap(slotIndex) {
    if (this.isRoundOver || !this.selectedTrayPlanet) return;
    if (this.placedPlanets.has(slotIndex)) return; // Already placed

    const slot = this.slots[slotIndex];
    const candidateId = this.selectedTrayPlanet;

    // Check correctness: slot.id must match candidateId
    if (slot.id === candidateId) {
      // Correct! Tier 1 feedback
      const planetData = this.planets.find(p => p.id === candidateId);
      rewards.triggerMicro(planetData?.freq || planetData?.note);

      this.placedPlanets.set(slotIndex, candidateId);
      this.trayPlanets = this.trayPlanets.filter(id => id !== candidateId);
      this.selectedTrayPlanet = null;

      // Emit sparkle particles at slot
      const slotEl = document.getElementById(`slot-${slotIndex}`);
      if (slotEl) {
        const rect = slotEl.getBoundingClientRect();
        particles.emit(rect.left + rect.width / 2, rect.top + rect.height / 2, {
          color: planetData?.color || '#FFE082',
          count: 8
        });
      }

      this.buildUI();
      this.checkRoundCompletion();
    } else {
      // Miss! Gentle hint ladder
      this.hintsInRound += 1;
      const hintResult = hints.handleMiss({
        targetId: candidateId,
        correctSlotId: this.slots.findIndex(s => s.id === candidateId)
      });

      // Wobble animation on tray item
      const trayEl = document.getElementById(`tray-item-${candidateId}`);
      if (trayEl) {
        trayEl.classList.add('wobble-boop');
        setTimeout(() => trayEl.classList.remove('wobble-boop'), 400);
      }

      if (hintResult.glowTarget && hintResult.correctSlotId >= 0) {
        const targetSlotEl = document.getElementById(`slot-${hintResult.correctSlotId}`);
        if (targetSlotEl) {
          targetSlotEl.classList.add('glow-hint');
        }
      }

      if (hintResult.autoSolve) {
        // Miss 3: Orbi co-play auto-placement
        setTimeout(() => {
          this.placedPlanets.set(hintResult.correctSlotId, candidateId);
          this.trayPlanets = this.trayPlanets.filter(id => id !== candidateId);
          this.selectedTrayPlanet = null;
          rewards.triggerMicro();
          this.buildUI();
          this.checkRoundCompletion();
        }, 1200);
      }
    }
  }

  checkRoundCompletion() {
    const allPlaced = this.slots.every((_, idx) => this.placedPlanets.has(idx));
    if (!allPlaced) return;

    this.isRoundOver = true;
    session.recordRound(this.hintsInRound);

    // Record adaptive outcome
    const adaptiveResult = adaptive.recordRoundResult('parade', this.hintsInRound);
    this.activeRung = adaptiveResult.rung;

    // Tier 2 round celebration (<= 1.5s)
    const earnedStars = rewards.triggerRoundComplete(this.hintsInRound);

    setTimeout(() => {
      if (this.currentRound >= this.totalRounds) {
        this.finishMission();
      } else {
        this.currentRound += 1;
        if (this.activeRung === 5) {
          this.chapter = (this.chapter === 1) ? 2 : 1;
        }
        this.startRound();
      }
    }, 1500);
  }

  finishMission() {
    // Tier 3 milestone celebration
    rewards.triggerMilestone();
    this.showMissionModal();
  }

  showMissionModal() {
    const overlay = this.sceneManager.uiOverlay;
    if (!overlay) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="celebration-card">
        <div class="parade-title">${i18n.t('parade.mission_complete')}</div>
        <div class="celebration-stars">
          <svg class="star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg class="star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg class="star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <button id="btn-modal-hub" class="btn-primary">
          ${i18n.t('parade.finish_button')}
        </button>
      </div>
    `;

    overlay.appendChild(modal);

    document.getElementById('btn-modal-hub').addEventListener('click', () => {
      audio.playPop();
      this.sceneManager.switch('hub');
    });
  }

  update(dt) {
    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
    particles.update(dt);
  }

  render(ctx, width, height) {
    ctx.fillStyle = '#0A0D24';
    ctx.fillRect(0, 0, width, height);

    starfield.render(ctx);

    // Render placed planets in slots and tray planets on canvas
    this.renderSlotPlanets(ctx);
    this.renderTrayPlanets(ctx);

    particles.render(ctx);
  }

  renderSlotPlanets(ctx) {
    for (const [idx, planetId] of this.placedPlanets.entries()) {
      const el = document.getElementById(`slot-${idx}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const r = rect.width * 0.4;
        planetRenderer.renderPlanet(ctx, planetId, cx, cy, r, {});
      }
    }
  }

  renderTrayPlanets(ctx) {
    for (const id of this.trayPlanets) {
      const el = document.getElementById(`tray-item-${id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const r = rect.width * 0.4;
        planetRenderer.renderPlanet(ctx, id, cx, cy, r, {});
      }
    }
  }
}
