/**
 * Commander Ayaan - Main Entry Point (js/main.js).
 * Coordinates canvas initialization, scene manager, game loop,
 * gestures recognizer, shared motion engine, coach assistance,
 * and test hooks for automated verification.
 */
import { GameLoop } from './core/loop.js';
import { SceneManager } from './core/scenes.js';
import { GestureRecognizer } from './core/gestures.js';
import { tweenEngine } from './core/tween.js';
import { transition } from './render/transition.js';
import { coach } from './systems/coach.js';
import { audio } from './core/audio.js';
import { i18n } from './core/i18n.js';
import { storage } from './core/storage.js';
import { events } from './core/events.js';
import { starfield } from './render/stars.js';
import { spriteCache } from './render/sprites.js';
import { adaptive } from './systems/adaptive.js';
import { hints } from './systems/hints.js';
import { rewards } from './systems/rewards.js';
import { session } from './systems/session.js';

// Scenes for Phase 1
import { BootScene } from './scenes/boot.js';
import { HubScene } from './scenes/hub.js';
import { PlaygroundScene } from './scenes/playground.js';
import { ParadeScene } from './scenes/parade.js';

async function init() {
  const canvas = document.getElementById('game-canvas');
  const uiOverlay = document.getElementById('ui-overlay');
  const ctx = canvas.getContext('2d');

  // Load static data
  let planetsData = [];
  let missionsData = {};
  try {
    const pRes = await fetch('js/data/planets.json');
    planetsData = await pRes.json();
    const mRes = await fetch('js/data/missions.json');
    missionsData = await mRes.json();
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }

  // Initialize i18n
  await i18n.init('en');

  // Sprite caching
  spriteCache.init(planetsData.filter(p => p.id !== 'sun').map(p => p.id));

  // Canvas resize handler
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2.0);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    starfield.resize(width, height);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 150));
  resize();

  // Instantiate systems
  const sceneManager = new SceneManager(uiOverlay);
  const gestures = new GestureRecognizer(canvas);

  sceneManager.game = { planetsData, missionsData };

  const bootScene = new BootScene();
  const hubScene = new HubScene();
  const playgroundScene = new PlaygroundScene();
  const paradeScene = new ParadeScene();

  sceneManager.register('boot', bootScene);
  sceneManager.register('hub', hubScene);
  sceneManager.register('playground', playgroundScene);
  sceneManager.register('parade', paradeScene);

  // Wire up gestures to current scene
  gestures.setHandlers({
    onTap: (point) => sceneManager.handleTap(point.x, point.y),
    onHold: (point) => sceneManager.handleHold(point),
    onDragStart: (dragInfo) => sceneManager.handleDragStart(dragInfo),
    onDragMove: (dragInfo) => sceneManager.handleDragMove(dragInfo),
    onDragEnd: (dragInfo) => sceneManager.handleDragEnd(dragInfo),
    onFlick: (flickInfo) => sceneManager.handleFlick(flickInfo)
  });

  // Background pause & resume handling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.suspend();
    } else {
      audio.resume();
    }
  });

  // Check OS reduce-motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  tweenEngine.setReduceMotion(mediaQuery.matches);
  transition.setReduceMotion(mediaQuery.matches);
  mediaQuery.addEventListener('change', (e) => {
    tweenEngine.setReduceMotion(e.matches);
    transition.setReduceMotion(e.matches);
  });

  // Android Back Button Confirmation Modal ("Go home?" with two picture buttons)
  function showConfirmHomeDialog() {
    if (document.querySelector('.confirm-home-overlay')) return;
    if (sceneManager.currentSceneName === 'boot' || sceneManager.currentSceneName === 'hub') return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay confirm-home-overlay';
    modal.innerHTML = `
      <div class="confirm-home-dialog">
        <div class="confirm-home-actions">
          <button id="btn-back-yes" class="btn-picture-action btn-picture-yes" aria-label="Home">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
          <button id="btn-back-no" class="btn-picture-action btn-picture-no" aria-label="Resume">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    uiOverlay.appendChild(modal);

    document.getElementById('btn-back-yes')?.addEventListener('click', () => {
      audio.playPop();
      modal.remove();
      sceneManager.switch('hub');
    });

    document.getElementById('btn-back-no')?.addEventListener('click', () => {
      audio.playPop();
      modal.remove();
    });
  }

  // Hook up back button
  window.addEventListener('popstate', () => showConfirmHomeDialog());
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') showConfirmHomeDialog();
  });

  // Game Loop
  const loop = new GameLoop(
    (dt) => {
      gestures.updateRipples(dt);
      tweenEngine.update(dt * 1000);
      coach.update(dt);
      sceneManager.update(dt);
    },
    (alpha) => {
      ctx.save();
      sceneManager.render(ctx, width, height, alpha);
      gestures.renderRipples(ctx);
      ctx.restore();
    }
  );

  // Start at Boot scene
  sceneManager.switch('boot');
  session.start();
  loop.start();

  // Test Hooks (window.__game for Playwright & QA verification)
  window.__game = {
    sceneManager,
    loop,
    gestures,
    audio,
    storage,
    adaptive,
    hints,
    rewards,
    i18n,
    coach,
    planetsData,
    tweenEngine,
    transition,
    getCoachTarget: () => coach.getTarget(),
    touchCoachTarget: () => {
      const target = coach.getTarget();
      if (!target) return false;
      if (target.gesture === 'drag' && target.from && target.to) {
        sceneManager.handleTap(target.from.x, target.from.y);
        sceneManager.handleTap(target.to.x, target.to.y);
      } else {
        sceneManager.handleTap(target.x, target.y);
      }
      return true;
    },
    touchEntity: (id) => {
      // Find entity in current scene and simulate tap
      const cur = sceneManager.currentScene;
      if (!cur) return false;
      if (cur.slots) {
        const slot = cur.slots.find(s => s.planetId === id || s.id === id);
        if (slot) return cur.handleTap(slot.x, slot.y);
      }
      if (cur.tray) {
        const item = cur.tray.find(t => t.id === id);
        if (item) return cur.handleTap(item.x, item.y);
      }
      if (cur.stations) {
        const st = cur.stations.find(s => s.id === id || s.targetScene === id);
        if (st) return cur.handleTap(st.x, st.y);
      }
      return false;
    },
    hideAllText: (hidden) => {
      if (hidden) {
        document.body.classList.add('wordless-mode');
        document.querySelectorAll('span, p, h1, h2, h3, button span').forEach(el => {
          el.style.visibility = 'hidden';
        });
      } else {
        document.body.classList.remove('wordless-mode');
        document.querySelectorAll('span, p, h1, h2, h3, button span').forEach(el => {
          el.style.visibility = '';
        });
      }
    },
    advanceClock: (ms) => {
      const dt = ms / 1000;
      loop.update(dt);
    },
    switchScene: (name, params) => sceneManager.switch(name, params),
    getCurrentScene: () => sceneManager.currentSceneName,
    getP95FrameTime: () => loop.getP95FrameTime(),
    showConfirmHomeDialog
  };

  console.log('Commander Ayaan V2 initialized successfully.');
}

window.addEventListener('DOMContentLoaded', init);
