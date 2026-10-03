# Phase 1 Plan: Foundation, Hub, Meet the Planets, Planet Parade

## 1. Goal & Objectives
Deliver a complete, beautiful, and playable foundation for Commander Ayaan:
- Reliable engine core (60fps fixed-timestep loop, scene manager, resilient audio synthesis, adaptive difficulty, 3-step hint ladder, offline storage, robust i18n).
- Paper-cut planetarium visual style rendered procedurally via Canvas 2D (Sun, 8 planets, Moon, Orbi robot, 3-layer parallax starfield).
- Vertical slice first: Boot screen -> Mission Control Hub -> Meet the Planets (free exploration with signature mechanics and verified facts).
- Widened feature: Planet Parade (spatial-reasoning runway ordering game with 5 adaptive rungs).
- CI/CD & Android readiness: Capacitor 8 Android project, GitHub Actions APK pipeline, automated test suites (unit + Playwright e2e), and multi-viewport responsive checks.

## 2. Order of Work
1. **Repository & Tooling Setup**:
   - `package.json` with scripts: `dev`, `test`, `test:e2e`, `build`.
   - Install Capacitor 8 dependencies (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/screen-orientation`, `@capacitor/preferences`).
   - Initialize Capacitor config (`capacitor.config.json` or `.ts`) and add Android platform (`npx cap add android`).
   - Set app name "Ayaan" and configure Android manifest permissions / orientation.
   - Set up GitHub Actions CI workflow `.github/workflows/build-apk.yml`.
2. **Data & Verification Layer**:
   - `www/js/data/planets.json`: All 8 planets + Sun + Moon with order, colors, physical traits, signature interaction configs, and facts verified against NASA Science.
   - `www/js/data/strings.en.json`: All UI text, instructions, and Orbi lines key-coded with <= 12 words per line.
   - `docs/SCIENCE.md` documenting orbital period approximations, scale compression, and fact verifications.
3. **Core Engine Architecture**:
   - `loop.js`: Fixed-timestep accumulator (1/120s sim, interpolated rendering, dt clamping on tab blur/resume).
   - `scenes.js`: Scene manager lifecycle (`enter`, `exit`, `update`, `render`, `handlePointer`).
   - `input.js`: Unified pointer/touch handling, >= 72dp target area padding, 300ms double-tap throttle, tap-then-tap support.
   - `events.js`: Decoupled publish/subscribe event bus.
   - `storage.js`: LocalStorage / Preferences wrapper with error trapping and versioning.
   - `i18n.js`: Clean token interpolation and string resolution.
   - `audio.js`: Pentatonic WebAudio synthesizer (soft marimba/celesta tones, distinct planet notes, master limiter, 1-tap mute).
   - `voice.js`: Speech playback abstraction (audio file -> Web Speech API / TTS -> subtitle-only fallback).
   - `rng.js`: Seedable deterministic PRNG (Mulberry32 / LCG) for reproducible rounds.
   - `systems/adaptive.js`: Ladder progression (3 consecutive hint-free wins to promote; 2 consecutive max-hint rounds to demote).
   - `systems/hints.js`: 3-step hint ladder (boop/replay -> slow/glow -> Orbi co-play).
4. **Procedural Rendering System ("Paper-cut Planetarium")**:
   - `stars.js`: 3 parallax layers drifting upward, zero-gravity feel, pre-seeded positions.
   - `sun.js`: Warm yellow-orange disc with multi-layer breathing corona and solar prominences.
   - `planet.js`: Procedural rendering with distinct silhouette, texture, and palette for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.
   - `moon.js`: Earth's Moon with crater stippling.
   - `orbi.js`: Expressive companion robot (idle float, cheer, point, think, sleepy).
   - `particles.js`: Capped sparkle and stardust particle pool (max 120).
   - `camera.js`: Smooth spring glide and zoom transitions.
5. **Vertical Slice Implementation**:
   - `scenes/boot.js`: Rising sun, floating Orbi, tap-to-start (unlocks WebAudio context), <= 2s intro.
   - `scenes/hub.js`: Living Mission Control with orbiting planets, floating Orbi, 2 big round doors (Meet the Planets, Planet Parade), 1-tap mute.
   - `scenes/meet.js`: Free exploration, orbit view, camera glide to tapped planet, signature mini-interaction, verified facts and "?" question button.
6. **Planet Parade Implementation**:
   - `scenes/parade.js`: Runway ordering game. 5 adaptive rungs:
     - R1: Mercury, Venus, Earth (with dot cues).
     - R2: Mercury to Mars (4 planets, no dots).
     - R3: "Who lives here?" (slot between neighbors, choose from tray of 3).
     - R4: Mercury to Saturn (6 planets).
     - R5: All 8 planets (two chapters: inner 4, outer 4, scrolling runway).
   - 3-tier feedback: micro tap (<=150ms), round completion (<=1.5s), mission completion (<=3s).
7. **Verification & Testing**:
   - Unit tests (`tests/unit/`): adaptive ladder, hint ladder, orbit calculations, storage safety, i18n key completeness.
   - Playwright E2E tests (`tests/e2e/`): full playthrough across rungs, hint triggering, rotation, pause/resume, DOM accessibility (touch targets >= 72dp, contrast >= 7:1).
   - Multi-viewport screenshot captures (`qa/screens/phase-1/`): 390x844, 360x740, 412x915, 800x1280, 844x390.
   - Review log & rubric evaluation in `qa/review-1.md`.
   - Playtest guide in `docs/PLAYTEST-1.md`.
   - Decisions logged in `docs/DECISIONS.md`.

## 3. Risks & Mitigations
- **Touch target density on small screens (especially Planet Parade Rung 5)**:
  - *Risk*: Fitting 8 planet slots plus tray items on a 360x740 screen while keeping touch targets >= 72dp and spacing >= 12dp.
  - *Mitigation*: Divide Rung 5 into inner/outer chapters and provide a horizontally scrollable runway with clear visual pagination, ensuring every target remains >= 72dp.
- **Audio Context Auto-play Policy**:
  - *Risk*: WebAudio context suspended until user interaction.
  - *Mitigation*: Boot screen "Tap to start" explicitly unlocks and resumes the WebAudio context.
- **Offscreen Canvas Performance on Android WebViews**:
  - *Risk*: Re-rendering procedural planet textures every frame can drop framerate below 60fps.
  - *Mitigation*: Cache procedural planet textures to offscreen canvases at current `devicePixelRatio` (capped at 2.0) and blit cached canvases during render loop.
- **Android Gradle / CI Build Differences**:
  - *Risk*: Android build failure on CI due to Java/Gradle version mismatches.
  - *Mitigation*: Pin Node 22+ and JDK 21 (required by Capacitor 8 / Gradle 8.11+), test gradlew wrapper and verify workflow syntax.

## 4. Testing Strategy
- **Unit Tests**: Run with Node test runner or Vitest for `adaptive.test.js`, `hints.test.js`, `orbits.test.js`, `i18n.test.js`.
- **E2E Browser Tests**: Playwright test suite verifying interaction flows, accessibility hitboxes, color contrast, and orientation reflow.
- **Visual Regression / Review**: Systematic review of screenshots captured at 5 target viewports against the 10-point rubric.
