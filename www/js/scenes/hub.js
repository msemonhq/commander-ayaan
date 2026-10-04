/**
 * Living Mission Control Hub Scene (js/scenes/hub.js).
 * Strictly wordless:
 * - Center glowing Sun with 8 planets on slow orbits on rails
 * - Dynamic Sun-directional lighting on all bodies
 * - Orbi companion floating peacefully
 * - 2 big round live-preview station doors orbiting the Sun:
 *    1. Playground station: planet being spun by miniature ghost hand (NO label)
 *    2. Parade station: tiny planets hopping into a row (NO label)
 * - Corner mute toggle (>= 72dp)
 * - Every planet is tappable: scale spring pop, note, sparkles, ripple
 * - Shared-element transition to mode (550ms, non-blocking)
 */
import { sunRenderer } from '../render/sun.js';
import { planetRenderer } from '../render/planet.js';
import { orbiRenderer } from '../render/orbi.js';
import { starfield } from '../render/stars.js';
import { particles } from '../render/particles.js';
import { lighting } from '../render/lighting.js';
import { ghostHand } from '../render/hand.js';
import { audio } from '../core/audio.js';
import { haptics } from '../core/haptics.js';
import { calculateOrbitPosition } from '../sim/orbits.js';
import { coach } from '../systems/coach.js';
import { transition } from '../render/transition.js';
import { Easings } from '../core/tween.js';

export class HubScene {
  constructor() {
    this.elapsed = 0;
    this.previewPhase = 0;
    this.planetsData = [];
    this.planetSprings = {}; // { [id]: { scale: 1, rippleR: 0, rippleA: 0 } }
    this.stations = [];
    this.width = 800;
    this.height = 600;
  }

  enter() {
    this.elapsed = 0;
    this.previewPhase = 0;
    this.planetsData = this.sceneManager.game.planetsData.filter(p => p.id !== 'sun');

    for (const p of this.planetsData) {
      this.planetSprings[p.id] = { scale: 1.0, rippleR: 0, rippleA: 0 };
    }

    this.buildUI();
    this.updateStationLayout();

    // Set coach expected action on the Playground station
    if (this.stations.length > 0) {
      const targetStation = this.stations[0];
      coach.setExpectedAction({
        id: 'hub-playground',
        target: { x: targetStation.x, y: targetStation.y, radius: targetStation.radius, id: 'station-playground' },
        gesture: 'tap',
        from: { x: targetStation.x, y: targetStation.y },
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
        <div class="top-bar-left"></div>
        <div class="top-bar-right">
          <button id="hub-btn-mute" class="btn-icon" aria-label="Mute Audio">
            <svg viewBox="0 0 24 24" id="mute-svg-icon">
              ${this.getMuteIconSvg()}
            </svg>
          </button>
        </div>
      </div>
    `;

    const muteBtn = document.getElementById('hub-btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        audio.toggleMute();
        const svg = document.getElementById('mute-svg-icon');
        if (svg) svg.innerHTML = this.getMuteIconSvg();
      });
    }
  }

  getMuteIconSvg() {
    return audio.isMuted
      ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
      : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  }

  updateStationLayout() {
    const isLandscape = this.width > this.height;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const doorRadius = Math.max(48, Math.min(76, isLandscape ? this.height * 0.16 : this.width * 0.16));

    if (isLandscape) {
      this.stations = [
        { id: 'playground', targetScene: 'playground', x: cx - this.width * 0.28, y: cy, radius: doorRadius },
        { id: 'parade', targetScene: 'parade', x: cx + this.width * 0.28, y: cy, radius: doorRadius }
      ];
    } else {
      this.stations = [
        { id: 'playground', targetScene: 'playground', x: cx, y: cy - this.height * 0.22, radius: doorRadius },
        { id: 'parade', targetScene: 'parade', x: cx, y: cy + this.height * 0.22, radius: doorRadius }
      ];
    }
  }

  handleTap(x, y) {
    if (transition.isTransitioning) {
      transition.fastForward(80);
      return true;
    }

    // 1. Check Station hits (hit bounds expanded by 40%)
    for (const st of this.stations) {
      const hitRadius = st.radius * 1.4;
      if (Math.hypot(x - st.x, y - st.y) <= hitRadius) {
        audio.playPop();
        haptics.tick();
        transition.startTransition({
          type: 'hub-to-mode',
          duration: 550,
          sharedElement: {
            fromX: st.x,
            fromY: st.y,
            fromR: st.radius
          },
          onComplete: () => {
            this.sceneManager.switch(st.targetScene);
          }
        });
        return true;
      }
    }

    // 2. Check Orbiting Background Planets
    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.44;

    for (let i = 0; i < this.planetsData.length; i++) {
      const p = this.planetsData[i];
      const orbitR = baseRadius * (0.32 + (i / 7) * 0.65);
      const pos = calculateOrbitPosition(i + 1, this.elapsed, (i * Math.PI) / 4, cx, cy, orbitR);
      const planetRadius = Math.max(16, 26 * (p.radius_ratio || 1.0));
      const hitRadius = planetRadius * 1.4;

      if (Math.hypot(x - pos.x, y - pos.y) <= hitRadius) {
        // Micro-interaction Tier 1
        audio.playPlanetNote(p.note);
        haptics.tick();
        particles.emit(pos.x, pos.y, { color: p.color, count: 6 });

        // Trigger spring squash & pop
        const spring = this.planetSprings[p.id];
        if (spring) {
          spring.scale = 1.35;
          spring.rippleR = planetRadius;
          spring.rippleA = 0.8;
        }
        return true;
      }
    }

    return false;
  }

  update(dt) {
    this.elapsed += dt;
    this.previewPhase += dt;

    sunRenderer.update(dt);
    orbiRenderer.update(dt);
    starfield.update(dt);
    particles.update(dt);
    ghostHand.update(dt);

    // Update planet spring recovery
    for (const id of Object.keys(this.planetSprings)) {
      const s = this.planetSprings[id];
      s.scale += (1.0 - s.scale) * Math.min(1.0, dt * 10);
      if (s.rippleA > 0) {
        s.rippleR += dt * 50;
        s.rippleA -= dt * 1.8;
      }
    }

    // Orbi looks toward station or touch
    if (this.stations.length > 0) {
      const target = this.stations[0];
      const cx = this.width / 2;
      const cy = this.height / 2;
      orbiRenderer.setGazeTarget(target.x, target.y, cx + this.width * 0.15, cy - this.height * 0.12);
    }
  }

  render(ctx, width, height) {
    this.width = width;
    this.height = height;
    this.updateStationLayout();

    // Deep cosmic space
    ctx.fillStyle = '#0A0D24';
    ctx.fillRect(0, 0, width, height);

    starfield.resize(width, height);
    starfield.render(ctx);

    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.44;

    // 1. Draw Rails Orbit Rings
    ctx.save();
    for (let i = 0; i < this.planetsData.length; i++) {
      const orbitR = baseRadius * (0.32 + (i / 7) * 0.65);
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(149, 159, 206, 0.12)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();

    // 2. Center Sun
    const sunR = Math.min(width, height) * 0.11;
    sunRenderer.render(ctx, cx, cy, sunR);

    // 3. Orbiting Planets on rails with Sun-directed lighting
    for (let i = 0; i < this.planetsData.length; i++) {
      const p = this.planetsData[i];
      const orbitR = baseRadius * (0.32 + (i / 7) * 0.65);
      const pos = calculateOrbitPosition(i + 1, this.elapsed, (i * Math.PI) / 4, cx, cy, orbitR);
      const baseR = Math.max(14, 24 * (p.radius_ratio || 1.0));
      const spring = this.planetSprings[p.id] || { scale: 1.0, rippleR: 0, rippleA: 0 };
      const curR = baseR * spring.scale;

      // Draw planet
      planetRenderer.renderPlanet(ctx, p.id, pos.x, pos.y, curR, {
        spinAngle: this.elapsed * 0.5,
        windOffset: this.elapsed * 30
      });

      // Apply dynamic lighting from the Sun
      lighting.applyLighting(ctx, p.id, pos.x, pos.y, curR, cx, cy);

      // Planet ripple ring when tapped
      if (spring.rippleA > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, spring.rippleR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 224, 130, ${spring.rippleA})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Companion Orbi floating in inner orbit
    const orbiX = cx + width * 0.18;
    const orbiY = cy - height * 0.14;
    const coachState = coach.state;
    const orbiPose = coachState.orbiLooking ? 'look-at-target' : 'idle';
    orbiRenderer.render(ctx, orbiX, orbiY, 62, orbiPose);

    // 5. Particles
    particles.render(ctx);

    // 6. Two Live-Preview Station Doors (NO text labels!)
    for (const st of this.stations) {
      this.renderStation(ctx, st);
    }

    // 7. Coach Ghost Hand invitation if idle ladder reached
    if (coachState.showGhostHand && coach.getTarget()) {
      ghostHand.render(ctx, coach.getTarget());
    }
  }

  renderStation(ctx, st) {
    ctx.save();

    // Idle breathing (scale 1.0 to 1.03)
    const breathe = Math.sin(this.previewPhase * 1.8 + (st.id === 'parade' ? Math.PI : 0)) * 0.025;
    const r = st.radius * (1.0 + breathe);

    // Outer glow / halo
    const halo = ctx.createRadialGradient(st.x, st.y, r * 0.7, st.x, st.y, r * 1.35);
    halo.addColorStop(0, 'rgba(112, 214, 255, 0.35)');
    halo.addColorStop(1, 'rgba(112, 214, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(st.x, st.y, r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Station door portal background
    const bgGrad = ctx.createRadialGradient(st.x - r * 0.3, st.y - r * 0.3, r * 0.1, st.x, st.y, r);
    bgGrad.addColorStop(0, '#242E6B');
    bgGrad.addColorStop(1, '#0F143A');

    ctx.beginPath();
    ctx.arc(st.x, st.y, r, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Golden / cyan border ring
    ctx.strokeStyle = '#70D6FF';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Clip inner content to circular station boundary
    ctx.save();
    ctx.beginPath();
    ctx.arc(st.x, st.y, r - 3, 0, Math.PI * 2);
    ctx.clip();

    // LIVE PREVIEWS:
    if (st.id === 'playground') {
      // Live Preview: A spinning Earth with a tiny translucent hand spinning it
      const previewPlanetR = r * 0.46;
      planetRenderer.renderPlanet(ctx, 'earth', st.x, st.y, previewPlanetR, {
        spinAngle: this.previewPhase * 1.5
      });
      lighting.applyLighting(ctx, 'earth', st.x, st.y, previewPlanetR, st.x - r, st.y);

      // Tiny hand gesture spinning it
      const handAngle = this.previewPhase * 2.0;
      const hx = st.x + Math.cos(handAngle) * (previewPlanetR * 0.85);
      const hy = st.y + Math.sin(handAngle) * (previewPlanetR * 0.4);
      ghostHand.drawHandShape(ctx, hx, hy, 0.48, 0.85, true);
    } else if (st.id === 'parade') {
      // Live Preview: Tiny planets hopping into a row runway
      const slotSpacing = r * 0.48;
      const startX = st.x - slotSpacing;
      const hopIds = ['mercury', 'venus', 'earth'];

      for (let i = 0; i < 3; i++) {
        const px = startX + i * slotSpacing;
        const hop = Math.abs(Math.sin(this.previewPhase * 3.5 + i * 0.8)) * 12;
        const py = st.y + r * 0.1 - hop;
        const pR = 11 + i * 2.5;

        // Faint slot beneath
        ctx.beginPath();
        ctx.arc(px, st.y + r * 0.14, pR + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        planetRenderer.renderPlanet(ctx, hopIds[i], px, py, pR, {});
      }
    }

    ctx.restore();
    ctx.restore();
  }
}
