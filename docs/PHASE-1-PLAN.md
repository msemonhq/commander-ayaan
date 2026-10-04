# Phase 1 Plan: Foundation, Hub, Planet Playground, Planet Parade (V2)

## 1. Goal & Philosophy
Deliver a complete, beautiful, and tactile game that Ayaan (age 6) can immediately understand and enjoy without reading any text:
- **Do, don't read**: Wordless ghost hand, Orbi pantomime, shape silhouettes, light and physical feedback instead of text instructions or sentences.
- **Real Sun-driven lighting**: Every celestial body is dynamically lit from the Sun's position with soft terminators, atmosphere glow, and night-side Earth city lights.
- **Shared Motion System**: Every state change, transition, and touch interaction animates with anticipation, action, and settle. Input is never blocked during transitions.
- **Tactile Playground**: Every planet is an interactive toy demonstrating true astronomical concepts through play.
- **Planet Parade**: Spatial reasoning runway game placing planets by distance from the Sun with adaptive rungs, 3-step gentle hint ladder, and star constellation rewards.
- **Child Safety & Quality**: Completely offline, no dark patterns, >= 72dp touch targets, reduce-motion support, automated unit & Playwright e2e test suite, and Android APK pipeline.

## 2. Architecture & File Structure
```
www/
  css/            tokens.css  base.css  ui.css
  js/
    main.js
    core/         loop.js  tween.js  scenes.js  input.js  gestures.js  events.js  storage.js  i18n.js  audio.js  voice.js  haptics.js  rng.js
    sim/          orbits.js  gravity.js  camera.js
    render/       sun.js  planet.js  moon.js  orbi.js  stars.js  particles.js  sprites.js  lighting.js  hand.js  transition.js
    scenes/       boot.js  hub.js  playground.js  parade.js
    systems/      adaptive.js  hints.js  coach.js  rewards.js  session.js
    data/         planets.json  missions.json  strings.en.json  strings.bn.json
```

## 3. Order of Work
1. **Core Motion & Gesture Engine**:
   - `core/tween.js`: Tweens, springs, timelines, staggers, and fast-forward capabilities.
   - `core/gestures.js`: Pointer events converted to tap, drag with velocity/weight/inertia/snap, hold (<=1.5s), flick, with target bounds expansion (+40%) and 300ms double-tap throttle.
   - `css/tokens.css` & `docs/MOTION.md`: Define named easings, duration scale, and full motion inventory with reduce-motion fallbacks.
2. **Coach & Wordless Assistance**:
   - `systems/coach.js`: Idle ladder tracking (3s Orbi looks at target, 6s ghost hand demonstrates, 10s target breathes with glow). Expose coach target on `window.__game.getCoachTarget()`.
   - `render/hand.js`: Translucent ghost hand rendering tap, drag, hold, and flick gestures.
3. **Lighting & Procedural Celestial Rendering**:
   - `render/lighting.js`: Sun-directional shading, day/night terminator, rim glow, city lights on Earth night side.
   - `render/sun.js`, `render/planet.js`, `render/moon.js`, `render/orbi.js`, `render/stars.js`, `render/particles.js`.
4. **Scenes**:
   - `scenes/boot.js`: Wordless boot. Softly glowing Sun with pulsing ring, ghost hand tapping it. Tap unlocks audio, Sun rises behind planet, Orbi floats in (<=2s, skippable by touch).
   - `scenes/hub.js`: Living lit solar system, 8 orbiting planets on rails, Orbi floating. 2 big live preview station doors (Playground & Parade) with NO labels. Mute toggle. Interactive orbiting planets.
   - `scenes/playground.js`: Orbit view, glide camera to selected planet. Signature tactile toys for Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. No sentences. First completion recorded in storage.
   - `scenes/parade.js`: Longer-axis runway, Sun marker, distance-lit slots >= 72dp, tray with remaining bodies. Rungs 1-5 with adaptive progression and 3-step hint ladder. Constellation drawing star by star (5 rounds per mission).
5. **Quality & Verification**:
   - Unit tests covering adaptive, hints, orbits, storage, i18n, gestures, coach idle ladder, and motion engine.
   - Playwright e2e tests covering Boot, Hub, Playground toys, Parade rungs 1-5, coach test (completing round 1 following ONLY ghost hand), wordless check (hide all text flag, confirming zero sentences), rotation reflow, pause/resume, accessibility (>=72dp, >=7:1 contrast), and 4x CPU throttle frame-time check.
   - Multi-viewport screenshots across 5 viewports (390x844, 360x740, 412x915, 800x1280, 844x390).
   - Review log & rubric evaluation in `qa/review-1.md`.
   - Playtest guide in `docs/PLAYTEST-1.md`.

## 4. Risks & Mitigations
- **Ghost hand clarity**: Ayaan must know what gesture to do without reading. Hand must clearly mime the action (lift, move along path, release) with realistic fingertip pulse.
- **Planet Parade 8 slots on small screens**: On 360x740, 8 slots of 72dp exceeds screen height/width. Handled in R5 via two chapters (inner 4 then outer 4) or smooth horizontal scrolling runway with slots clamped >= 64dp.
- **Lighting performance**: Pre-render planet base textures to offscreen canvases; overlay dynamic terminator with simple compositing rather than heavy per-pixel math.
- **Input non-blocking during transitions**: Tapping during a scene transition smoothly fast-forwards the animation within <= 100ms and immediately dispatches the touch.
