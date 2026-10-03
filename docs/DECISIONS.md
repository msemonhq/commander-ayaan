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
