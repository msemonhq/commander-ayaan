/**
 * Planet Parade Scene (js/scenes/parade.js).
 * Spatial reasoning runway ordering game:
 * - Wordless: no sentences, no text instructions
 * - Runway along longer axis, Sun at one end, distance-lit slots >= 72dp
 * - Drag with weight, inertia, snap, or tap-then-tap alternative
 * - 5 Adaptive rungs (R1: 3 planets, R2: 4 planets, R3: "who lives here?", R4: 6 planets, R5: 8 planets in two chapters)
 * - 3-Step hint ladder (Miss 1: wobble boop + head tilt + demo; Miss 2: slower demo + glowing slot; Miss 3: co-play)
 * - 5-Star constellation progress across top (star flies on curve, connects with line)
 * - 3-Tier rewards (micro tap, round star & cheer, mission constellation completion)
 */
import { sunRenderer } from '../render/sun.js';
import { planetRenderer } from '../render/planet.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { particles } from '../render/particles.js';
import { ghostHand } from '../render/hand.js';
import { audio } from '../core/audio.js';
import { haptics } from '../core/haptics.js';
import { adaptive } from '../systems/adaptive.js';
import { hints } from '../systems/hints.js';
import { coach } from '../systems/coach.js';
import { transition } from '../render/transition.js';
import { Easings } from '../core/tween.js';
import { i18n } from '../core/i18n.js';

export class ParadeScene {
  constructor() {
    this.elapsed = 0;
    this.round = 1;
    this.maxRounds = 5;
    this.currentRung = 1;

    // Runway slots & Tray
    this.slots = []; // Array of { id, order, x, y, radius, planetId, isFilled, silhouette }
    this.tray = [];  // Array of { id, order, x, y, radius, color, isSelected, isPlaced, wobble: 0 }

    // Constellation: 5 points for a friendly rocket
    this.constellationPoints = [
      { x: 0.30, y: 0.05 },
      { x: 0.40, y: 0.04 },
      { x: 0.50, y: 0.03 }, // Rocket nose
      { x: 0.60, y: 0.04 },
      { x: 0.70, y: 0.05 }
    ];
    this.flyingStar = null; // { fromX, fromY, toX, toY, progress: 0 }

    // Drag state
    this.draggedItem = null;
    this.selectedTrayItem = null;

    // Chapter for R5
    this.r5Chapter = 1;

    // Mission celebration state
    this.isMissionComplete = false;
    this.celebrationTimer = 0;

    this.width = 800;
    this.height = 600;
  }

  enter() {
    this.elapsed = 0;
    this.round = 1;
    this.currentRung = adaptive.getRung('parade');
    this.isMissionComplete = false;
    this.celebrationTimer = 0;
    this.flyingStar = null;

    this.buildUI();
    this.startRound();
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
          <button id="parade-btn-home" class="btn-icon" aria-label="Go Home">
            <svg viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
          <span class="scale-badge">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            ${i18n.t('playground.not_to_scale') || 'Not to scale'}
          </span>
        </div>
        <div class="top-bar-right">
          <button id="parade-btn-mute" class="btn-icon" aria-label="Mute Audio">
            <svg viewBox="0 0 24 24" id="parade-mute-svg">
              ${audio.isMuted
                ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
                : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'}
            </svg>
          </button>
        </div>
      </div>
    `;

    document.getElementById('parade-btn-home')?.addEventListener('click', () => {
      audio.playPop();
      transition.startTransition({
        type: 'mode-to-hub',
        duration: 550,
        onComplete: () => this.sceneManager.switch('hub')
      });
    });

    document.getElementById('parade-btn-mute')?.addEventListener('click', () => {
      audio.toggleMute();
      const svg = document.getElementById('parade-mute-svg');
      if (svg) {
        svg.innerHTML = audio.isMuted
          ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
          : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      }
    });
  }

  startRound() {
    hints.reset();
    this.draggedItem = null;
    this.selectedTrayItem = null;

    const allPlanets = this.sceneManager.game.planetsData.filter(p => p.id !== 'sun');
    let targetPlanets = [];
    let showSilhouettes = true;

    if (this.currentRung === 1) {
      // R1: Mercury, Venus, Earth (with silhouettes)
      targetPlanets = allPlanets.slice(0, 3);
      showSilhouettes = true;
    } else if (this.currentRung === 2) {
      // R2: Mercury to Mars (4 planets, with silhouettes)
      targetPlanets = allPlanets.slice(0, 4);
      showSilhouettes = true;
    } else if (this.currentRung === 3) {
      // R3: "Who lives here?" slot between two placed neighbours (e.g. Earth between Venus & Mars)
      targetPlanets = allPlanets.slice(1, 4); // Venus, Earth, Mars
      showSilhouettes = false;
    } else if (this.currentRung === 4) {
      // R4: Mercury to Saturn (6 planets, no silhouettes)
      targetPlanets = allPlanets.slice(0, 6);
      showSilhouettes = false;
    } else {
      // R5: all 8 planets in two chapters
      targetPlanets = this.r5Chapter === 1 ? allPlanets.slice(0, 4) : allPlanets.slice(4, 8);
      showSilhouettes = false;
    }

    this.setupRunwayAndTray(targetPlanets, showSilhouettes);
    this.updateCoachTarget();
  }

  setupRunwayAndTray(planets, showSilhouettes) {
    const isLandscape = this.width > this.height;
    const numSlots = planets.length;

    // Slot size: >= 72dp (min diameter 72px)
    const slotRadius = Math.max(36, Math.min(46, (isLandscape ? this.width : this.height) / (numSlots + 3) / 2));

    this.slots = [];
    this.tray = [];

    if (isLandscape) {
      // Horizontal Runway along width
      const startX = this.width * 0.22;
      const endX = this.width * 0.88;
      const stepX = (endX - startX) / Math.max(1, numSlots - 1);
      const runwayY = this.height * 0.44;

      for (let i = 0; i < numSlots; i++) {
        const p = planets[i];
        this.slots.push({
          id: 'slot-' + p.id,
          order: p.order,
          planetId: p.id,
          x: startX + i * stepX,
          y: runwayY,
          radius: slotRadius,
          isFilled: false,
          silhouette: showSilhouettes,
          distanceBrightness: 1.0 - (i / numSlots) * 0.35 // Closer is brighter!
        });
      }

      // Shuffled Tray along bottom
      const shuffled = [...planets].sort(() => Math.random() - 0.5);
      const trayStartX = this.width * 0.25;
      const trayStepX = (this.width * 0.5) / Math.max(1, numSlots - 1);
      const trayY = this.height * 0.78;

      for (let i = 0; i < numSlots; i++) {
        const p = shuffled[i];
        this.tray.push({
          id: p.id,
          order: p.order,
          name_key: p.name_key,
          note: p.note,
          color: p.color,
          radius: slotRadius * 0.85,
          homeX: trayStartX + i * trayStepX,
          homeY: trayY,
          x: trayStartX + i * trayStepX,
          y: trayY,
          isPlaced: false,
          isSelected: false,
          wobble: 0
        });
      }
    } else {
      // Portrait Runway along vertical height
      const startY = this.height * 0.22;
      const endY = this.height * 0.62;
      const stepY = (endY - startY) / Math.max(1, numSlots - 1);
      const runwayX = this.width * 0.42;

      for (let i = 0; i < numSlots; i++) {
        const p = planets[i];
        this.slots.push({
          id: 'slot-' + p.id,
          order: p.order,
          planetId: p.id,
          x: runwayX,
          y: startY + i * stepY,
          radius: slotRadius,
          isFilled: false,
          silhouette: showSilhouettes,
          distanceBrightness: 1.0 - (i / numSlots) * 0.35
        });
      }

      // Shuffled Tray at bottom
      const shuffled = [...planets].sort(() => Math.random() - 0.5);
      const trayStartX = this.width * 0.2;
      const trayStepX = (this.width * 0.6) / Math.max(1, numSlots - 1);
      const trayY = this.height * 0.82;

      for (let i = 0; i < numSlots; i++) {
        const p = shuffled[i];
        this.tray.push({
          id: p.id,
          order: p.order,
          name_key: p.name_key,
          note: p.note,
          color: p.color,
          radius: slotRadius * 0.85,
          homeX: trayStartX + i * trayStepX,
          homeY: trayY,
          x: trayStartX + i * trayStepX,
          y: trayY,
          isPlaced: false,
          isSelected: false,
          wobble: 0
        });
      }
    }

    // Special case for Rung 3: "Who lives here?" Pre-fill 1st and 3rd slots
    if (this.currentRung === 3 && this.slots.length === 3) {
      this.slots[0].isFilled = true;
      this.slots[2].isFilled = true;
      const placed1 = this.tray.find(t => t.id === this.slots[0].planetId);
      const placed2 = this.tray.find(t => t.id === this.slots[2].planetId);
      if (placed1) placed1.isPlaced = true;
      if (placed2) placed2.isPlaced = true;
    }
  }

  updateCoachTarget() {
    // Find next unplaced slot in order
    const nextSlot = this.slots.find(s => !s.isFilled);
    if (!nextSlot) return;

    const matchingTrayItem = this.tray.find(t => t.id === nextSlot.planetId && !t.isPlaced);
    if (!matchingTrayItem) return;

    coach.setExpectedAction({
      id: 'parade-drag-' + matchingTrayItem.id,
      target: { x: nextSlot.x, y: nextSlot.y, radius: nextSlot.radius, id: nextSlot.id },
      gesture: 'drag',
      from: { x: matchingTrayItem.x, y: matchingTrayItem.y },
      to: { x: nextSlot.x, y: nextSlot.y },
      immediate: this.round === 1 && this.slots.filter(s => s.isFilled).length === 0
    });
  }

  handleTap(x, y) {
    if (this.isMissionComplete) return false;

    // Check tap on Tray Items (40% hit expansion)
    for (const item of this.tray) {
      if (item.isPlaced) continue;
      if (Math.hypot(x - item.x, y - item.y) <= item.radius * 1.4) {
        audio.playPlanetNote(item.note);
        haptics.tick();
        if (this.selectedTrayItem === item) {
          // Deselect
          item.isSelected = false;
          this.selectedTrayItem = null;
        } else {
          if (this.selectedTrayItem) this.selectedTrayItem.isSelected = false;
          item.isSelected = true;
          this.selectedTrayItem = item;
        }
        return true;
      }
    }

    // Check tap on Runway Slots
    if (this.selectedTrayItem) {
      for (const slot of this.slots) {
        if (slot.isFilled) continue;
        if (Math.hypot(x - slot.x, y - slot.y) <= slot.radius * 1.4) {
          this.attemptPlacement(this.selectedTrayItem, slot);
          return true;
        }
      }
    }

    return false;
  }

  handleDragStart(dragInfo) {
    if (this.isMissionComplete) return;

    for (const item of this.tray) {
      if (item.isPlaced) continue;
      if (Math.hypot(dragInfo.startX - item.x, dragInfo.startY - item.y) <= item.radius * 1.4) {
        this.draggedItem = item;
        item.isSelected = true;
        this.selectedTrayItem = item;
        haptics.tick();
        return;
      }
    }
  }

  handleDragMove(dragInfo) {
    if (!this.draggedItem) return;
    this.draggedItem.x = dragInfo.visualX;
    this.draggedItem.y = dragInfo.visualY;
  }

  handleDragEnd(dragInfo) {
    if (!this.draggedItem) return;

    const item = this.draggedItem;
    this.draggedItem = null;

    // Check if near any slot (within 1.5 radius)
    let bestSlot = null;
    let minDist = Infinity;

    for (const slot of this.slots) {
      if (slot.isFilled) continue;
      const d = Math.hypot(item.x - slot.x, item.y - slot.y);
      if (d < slot.radius * 1.5 && d < minDist) {
        minDist = d;
        bestSlot = slot;
      }
    }

    if (bestSlot) {
      this.attemptPlacement(item, bestSlot);
    } else {
      // Release back to tray
      item.x = item.homeX;
      item.y = item.homeY;
    }
  }

  attemptPlacement(item, slot) {
    if (item.id === slot.planetId) {
      // Correct!
      slot.isFilled = true;
      item.isPlaced = true;
      item.isSelected = false;
      item.x = slot.x;
      item.y = slot.y;
      this.selectedTrayItem = null;

      // Tier 1 feedback: note, snap pop, haptic, 6 sparkles
      audio.playPlanetNote(item.note);
      audio.playPop();
      haptics.tick();
      particles.emit(slot.x, slot.y, { color: item.color, count: 6 });

      // Check if all slots in current chapter are filled
      const allFilled = this.slots.every(s => s.isFilled);
      if (allFilled) {
        if (this.currentRung === 5 && this.r5Chapter === 1) {
          // Advance to Chapter 2
          this.r5Chapter = 2;
          setTimeout(() => this.startRound(), 600);
        } else {
          // Round complete!
          this.handleRoundComplete();
        }
      } else {
        this.updateCoachTarget();
      }
    } else {
      // Missed placement!
      const hintResult = hints.recordMiss(slot.planetId);
      audio.playBoop();
      haptics.tick();

      // Item springs back with wobble
      item.wobble = 1.0;
      item.x = item.homeX;
      item.y = item.homeY;

      if (hintResult.autoSolve) {
        // Miss 3: Orbi co-play!
        const correctSlot = this.slots.find(s => s.planetId === item.id);
        if (correctSlot) {
          correctSlot.isFilled = true;
          item.isPlaced = true;
          item.x = correctSlot.x;
          item.y = correctSlot.y;
          audio.playPlanetNote(item.note);
          particles.emit(correctSlot.x, correctSlot.y, { color: item.color, count: 6 });
          this.updateCoachTarget();
        }
      }
    }
  }

  handleRoundComplete() {
    const hintLevel = hints.level;
    adaptive.recordRoundResult('parade', hintLevel);

    // Tier 2 feedback: star flies to constellation, Orbi cheers
    audio.playRoundCheer();

    const starIdx = this.round - 1;
    const pt = this.constellationPoints[starIdx] || { x: 0.5, y: 0.05 };
    const targetX = this.width * pt.x;
    const targetY = this.height * pt.y;

    this.flyingStar = {
      fromX: this.width / 2,
      fromY: this.height / 2,
      toX: targetX,
      toY: targetY,
      progress: 0
    };

    if (this.round >= this.maxRounds) {
      // Mission Complete! Tier 3 milestone!
      this.isMissionComplete = true;
      this.celebrationTimer = 0;
      audio.playMilestone();
    } else {
      this.round++;
      this.currentRung = adaptive.getRung('parade');
      setTimeout(() => this.startRound(), 1200);
    }
  }

  update(dt) {
    this.elapsed += dt;
    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
    particles.update(dt);
    ghostHand.update(dt);

    // Update tray item wobble decay
    for (const item of this.tray) {
      if (item.wobble > 0) {
        item.wobble -= dt * 2.5;
      }
    }

    // Flying star animation
    if (this.flyingStar) {
      this.flyingStar.progress = Math.min(1.0, this.flyingStar.progress + dt * 1.5);
      if (this.flyingStar.progress >= 1.0) {
        particles.emit(this.flyingStar.toX, this.flyingStar.toY, { color: '#FFE082', count: 6 });
        this.flyingStar = null;
      }
    }

    // Mission celebration countdown to calm return
    if (this.isMissionComplete) {
      this.celebrationTimer += dt;
      if (this.celebrationTimer >= 3.2) {
        this.sceneManager.switch('hub');
      }
    }
  }

  render(ctx, width, height) {
    this.width = width;
    this.height = height;

    // Deep space
    ctx.fillStyle = '#0A0D24';
    ctx.fillRect(0, 0, width, height);

    starfield.resize(width, height);
    starfield.render(ctx);

    const isLandscape = width > height;

    // 1. Constellation progress bar across top
    this.renderConstellation(ctx);

    // 2. Sun Runway Marker at one end
    const sunMarkerR = Math.max(38, Math.min(54, slotRadius => slotRadius * 1.1));
    const sunX = isLandscape ? width * 0.11 : width * 0.42;
    const sunY = isLandscape ? height * 0.44 : height * 0.12;
    sunRenderer.render(ctx, sunX, sunY, sunMarkerR);

    // 3. Runway Slots
    this.renderRunway(ctx, sunX, sunY);

    // 4. Tray of items
    this.renderTray(ctx);

    // 5. Flying star
    if (this.flyingStar) {
      const p = Easings.inOut(this.flyingStar.progress);
      const sx = this.flyingStar.fromX + (this.flyingStar.toX - this.flyingStar.fromX) * p;
      const sy = this.flyingStar.fromY + (this.flyingStar.toY - this.flyingStar.fromY) * p - Math.sin(p * Math.PI) * 50;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE082';
      ctx.shadowColor = '#FFA000';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }

    // 6. Companion Orbi
    const orbiPose = hints.level >= 1 ? 'puzzled' : (this.isMissionComplete ? 'cheer' : 'idle');
    orbiRenderer.render(ctx, width * (isLandscape ? 0.90 : 0.82), height * (isLandscape ? 0.26 : 0.14), 58, orbiPose);

    // 7. Coach Ghost Hand
    if (coach.state.showGhostHand && coach.getTarget()) {
      ghostHand.render(ctx, coach.getTarget());
    }

    particles.render(ctx);

    // 8. Completed Mission Constellation Glow
    if (this.isMissionComplete) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 224, 130, 0.12)';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  renderConstellation(ctx) {
    ctx.save();
    const completedCount = this.round - (this.isMissionComplete ? 0 : 1);

    // Connecting lines between earned stars
    ctx.beginPath();
    for (let i = 0; i < this.constellationPoints.length; i++) {
      const pt = this.constellationPoints[i];
      const px = this.width * pt.x;
      const py = this.height * pt.y;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(112, 214, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw star nodes
    for (let i = 0; i < this.constellationPoints.length; i++) {
      const pt = this.constellationPoints[i];
      const px = this.width * pt.x;
      const py = this.height * pt.y;
      const isLit = i < completedCount;

      ctx.beginPath();
      ctx.arc(px, py, isLit ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? '#FFE082' : 'rgba(255, 255, 255, 0.35)';
      if (isLit) {
        ctx.shadowColor = '#FFA000';
        ctx.shadowBlur = 8;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  renderRunway(ctx, sunX, sunY) {
    ctx.save();

    for (const slot of this.slots) {
      // Glow hint if miss 2
      const isGlowing = hints.glowTarget && hints.correctTargetId === slot.planetId;

      ctx.save();
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, slot.radius, 0, Math.PI * 2);

      // Distance brightness nuance (closer to Sun is brighter)
      const brightness = slot.distanceBrightness || 0.8;
      ctx.strokeStyle = isGlowing
        ? '#70D6FF'
        : `rgba(255, 255, 255, ${0.35 * brightness})`;
      ctx.lineWidth = isGlowing ? 4 : 2.5;

      if (isGlowing) {
        ctx.shadowColor = '#70D6FF';
        ctx.shadowBlur = 16;
      }
      ctx.stroke();
      ctx.restore();

      if (slot.isFilled) {
        // Planet placed inside slot
        planetRenderer.renderPlanet(ctx, slot.planetId, slot.x, slot.y, slot.radius * 0.85, {});
      } else if (slot.silhouette) {
        // Faint shape-matching scaffold silhouette
        ctx.save();
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, slot.radius * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  renderTray(ctx) {
    ctx.save();

    for (const item of this.tray) {
      if (item.isPlaced) continue;

      const wobbleOffset = item.wobble > 0 ? Easings.wobble(1 - item.wobble) * 14 : 0;
      const x = item.x + wobbleOffset;
      const y = item.y;

      // Soft lift & shadow if selected or dragged
      if (item.isSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y + 8, item.radius * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();
        ctx.restore();
      }

      // Render Planet
      planetRenderer.renderPlanet(ctx, item.id, x, y, item.radius, {});

      // Selection halo
      if (item.isSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, item.radius * 1.25, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFE082';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFA000';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }
}
