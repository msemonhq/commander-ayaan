# Architectural and Design Decisions Log

This log records decisions made during development. Format: one line per decision.

- 2026-10-03: Adopted Capacitor 8 (8.5.2) with Node 24 and Java 21 for modern Android platform compliance.
- 2026-10-03: Selected vanilla ES Modules and HTML5 Canvas 2D without bundlers to ensure clean architecture and instant offline debugging.
- 2026-10-03: Configured WebAudio pentatonic scale (C4, D4, E4, G4, A4, C5, D5, E5, G5) for celestial notes so every interaction sounds harmonically pleasing.
- 2026-10-03: Built 3-layer parallax starfield with upward drift to give a tactile zero-gravity sensation without motion sickness.
- 2026-10-03: Offscreen canvas caching used for all procedural planet textures to guarantee 60fps performance across mobile GPUs.
- 2026-10-03: Planet Parade Rung 5 implemented as dual inner/outer chapters with a scrolling runway to maintain >= 72dp touch targets on compact mobile viewports.
- 2026-10-03: Removed INTERNET permission from AndroidManifest.xml entirely to strictly guarantee zero network calls and child data safety offline.
- 2026-10-03: Bundled local OFL Nunito woff2 font in www/assets/fonts/ to eliminate external font dependencies and guarantee offline typography.
- 2026-10-03: Touch target hit areas padded by 40% beyond visible graphics, paired with a 300ms double-tap guard to protect early-reader input.
- 2026-10-04: Implemented wordless ghost hand (`hand.js`) and coach idle ladder (`coach.js`) to eliminate on-screen text instructions and teach through tactile demonstration.
- 2026-10-04: Designed Sun-directed lighting engine (`lighting.js`) providing soft day/night terminators, rim highlights, atmosphere glows, and Earth night-side city lights.
- 2026-10-04: Created shared motion system (`tween.js`, `tokens.css`, `transition.js`) with non-blocking screen transitions that fast-forward within <= 100ms upon touch.
- 2026-10-04: Replaced text door labels in Hub with live animated procedural canvas previews (spinning planet toy and hopping runway).
- 2026-10-04: Replaced Meet the Planets with Planet Playground (`playground.js`), turning all 8 planets and the Sun into signature physical toys with true astronomical demos.
- 2026-10-04: Parade `handleDragEnd` checks both pointer release position and visual coordinate distances within 1.5x slot radius to support weighted drag lag without miss-snaps.
- 2026-10-04: Press-and-hold gestures for Sun and Mars support sustained hold lifecycle with explicit `handleHoldEnd` release to maintain continuous tactile feedback.
- 2026-10-04: Parade Miss 3 auto-solve checks round/chapter completion to ensure progression when the final remaining slot is filled by Orbi co-play.
- 2026-10-04: Parade Rung 3 "Who lives here?" pre-fills neighbor slots and presents 3 distinct choices in the tray to exercise spatial reasoning.
