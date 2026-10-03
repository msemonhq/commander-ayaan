/**
 * Commander Ayaan - Main Entry Point (js/main.js).
 * Coordinates canvas initialization, scene manager, game loop,
 * background pause/resume, and non-production test hooks.
 */
import { GameLoop } from './core/loop.js';
import { SceneManager } from './core/scenes.js';
import { InputManager } from './core/input.js';
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

// Scenes
import { BootScene } from './scenes/boot.js';
import { HubScene } from './scenes/hub.js';
import { MeetScene } from './scenes/meet.js';
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
  const inputManager = new InputManager(canvas);

  const bootScene = new BootScene();
  const hubScene = new HubScene(planetsData);
  const meetScene = new MeetScene(planetsData);
  const paradeScene = new ParadeScene(planetsData, missionsData);

  sceneManager.register('boot', bootScene);
  sceneManager.register('hub', hubScene);
  sceneManager.register('meet', meetScene);
  sceneManager.register('parade', paradeScene);

  // Bind input handlers
  inputManager.onTap = (x, y) => sceneManager.handleTap(x, y);
  inputManager.onDrag = (x, y, dx, dy) => sceneManager.handleDrag(x, y, dx, dy);
  inputManager.onDragEnd = (x, y) => sceneManager.handleDragEnd(x, y);

  // Background pause & resume handling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.suspend();
    } else {
      audio.resume();
    }
  });

  // Game Loop
  const loop = new GameLoop(
    (dt) => {
      inputManager.updateRipples(dt);
      sceneManager.update(dt);
    },
    (alpha) => {
      ctx.save();
      sceneManager.render(ctx, width, height, alpha);
      inputManager.renderRipples(ctx);
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
    inputManager,
    audio,
    storage,
    adaptive,
    hints,
    rewards,
    i18n,
    planetsData,
    switchScene: (name, params) => sceneManager.switch(name, params),
    getCurrentScene: () => sceneManager.currentSceneName,
    getP95FrameTime: () => loop.getP95FrameTime()
  };

  console.log('Commander Ayaan initialized successfully.');
}

window.addEventListener('DOMContentLoaded', init);
