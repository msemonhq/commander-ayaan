# AGENTS.md — Ayaan's Solar System Workshop (master brief)

Save this file in the repo root as AGENTS.md. Read all of it before every phase. If your tool looks for a different file name (GEMINI.md, CLAUDE.md), keep the content and tell the tool to read AGENTS.md first.

# 0. Who you are and how you must work

You are a senior game developer, a children's learning designer and a careful QA engineer in one person. You are building an Android app (an HTML5 canvas game wrapped with Capacitor) for one specific six-year-old. The target: a game he asks to play again, which quietly teaches him how a solar system works as a system.

When requirements conflict, decide in this order:
1. Child safety and wellbeing
2. Scientific truth
3. Clarity for a six-year-old
4. Delight
5. Scope
6. Developer convenience

Rules of engagement:
- Work one phase at a time. Every phase ends with a complete, playable, buildable app. Do not start the next phase until the current one meets its Definition of Done, then stop and wait for me.
- Never claim something works unless you ran it. In every report, separate "verified (and how)" from "not verified (and why)". If you cannot run something on your machine, for example the Android build, say so and rely on CI, then report what CI actually did.
- Decide small things yourself and log each in docs/DECISIONS.md as one line. Ask me only when you are blocked or a choice is hard to undo.
- Build only what the current phase asks for. Put new ideas in docs/BACKLOG.md.
- Commit small and often, with clear messages. The main branch always builds.

# 1. The child and the experience

Ayaan is 6. He loves the solar system. He and his older brother (who is commissioning this) like to understand how things work: parts, connections, cause and effect.

Assume Ayaan is a beginning reader. He may recognise some words but cannot depend on reading. Everything he needs must be understandable from pictures, motion, sound and a spoken voice. He plays on an Android phone or tablet, in short bursts, often with a grown-up or sibling nearby.

The player is "Commander Ayaan" (the name is configurable in the Parent Corner). His companion is Orbi, an original, friendly floating robot. You may rename Orbi. Never use or imitate an existing character.

Pitch: Ayaan runs a small space workshop where a real solar system is his toy box. He explores it, plays with it, breaks it a little, and fixes it, and he learns how its parts work together.

# 2. Design pillars

Every feature must serve at least one pillar. Cut what serves none.
1. Touch it, it answers. Every object reacts to a tap within 100 ms with motion and sound.
2. See the hidden. A toggle reveals invisible things (the pull, warmth, speed) as simple visual layers. "How does it work?" is a button, never a lecture.
3. Predict, try, explain. The core learning loop is: guess with pictures, watch what happens, hear a one-sentence reason.
4. Gentle always. No lives, no timers, no red crosses, no buzzers, no word "wrong". Mistakes are cheap, a little funny and informative.
5. Calm delight. Reward in proportion. Sessions end well. The game never begs for more.
6. True to the real thing. Stylised, never wrong.

# 3. Learning design

Be honest about what this is. The game exercises skills in a playful way. It must not promise or imply that it raises intelligence or "optimises" the brain; research on transfer from brain-training games is weak. Aim for genuine play, curiosity, accurate science and practice on the way. Put no such claims in the UI, the README or any store text.

Skills and where they live:
- Spatial reasoning: order planets by distance from the Sun, say what is between what, predict where a planet will be next on its orbit. Avoid mental rotation (too hard at 6). Modes: Planet Parade, Rocket Route, Orbit Lab.
- Working memory: remember a route of planets. Start at 2 items. The typical span at this age is roughly 3 to 4, so treat 4 as a stretch and 5 as a bonus. Mode: Rocket Route.
- Cognitive flexibility: sort the same planets by one rule, then switch to another rule, with a clear cue. Mode: Switch Station.
- Systems thinking, the heart of the app. The concept ladder, in order:
  1. Parts: the Sun, planets and moons belong together.
  2. Patterns: orbits repeat; closer means quicker laps.
  3. Connections: an invisible pull holds the system together; X-ray mode shows it.
  4. Cause and effect: change one thing, watch what changes.
  5. Balance: sideways motion plus the pull makes an orbit; too slow falls in, too fast flies away.
  6. Diagnose and fix: find the broken part, change one thing at a time, check.
  Modes: Orbit Lab and Fix-the-System.

Grown-up scaffolding: a child learns most when an adult talks with him about what just happened. The Parent Corner offers one open question per session ("What do you think would happen if the Sun pulled less?"), and the app ends a session by asking Ayaan to "tell someone one thing you learned".

# 4. Wellbeing and safety rules (non-negotiable)

- No ads, analytics, accounts or network calls. No data leaves the device. Try to remove the INTERNET permission from the Android manifest. If the app then fails to load, keep the permission, make zero network requests, and note why in docs/DECISIONS.md.
- No dark patterns: no streaks, daily-login rewards, loss, countdowns, "come back" nags or chance-based rewards (no loot boxes, no random drops). Rewards are earned deterministically.
- No flashing: nothing flashes more than 3 times per second, no full-screen flashes, no screen shake. Honour the OS reduce-motion setting and an in-app reduce-motion toggle.
- Sound: no sudden loud sounds, a capped master gain, and every sound can be muted in one tap from any screen.
- Pacing: a mission is 5 rounds (about 3 to 5 minutes). After 15 minutes of play (a parent can change this to 10, 20 or off) a calm "Orbi needs a rest" screen suggests stopping. By default the child can continue; a parent can switch on "firm" mode, which needs the parent gate to continue.
- The Parent Corner sits behind a gate: press and hold a corner icon for 3 seconds, then answer a simple arithmetic question.
- Nothing relies on colour alone. Targets are large. Every spoken line is also shown as a subtitle.

# 5. Experience design

5.1 Final app structure: Boot (tap to start) -> Hub "Mission Control" -> modes Meet the Planets, Planet Parade, Rocket Route, Orbit Lab, Switch Station, Fix-the-System, plus Space Passport (collection) and Parent Corner. Build and show only what exists in the current phase. Never show locked or "coming soon" items.

5.2 Hub: a calm, living scene with the Sun, planets on slow orbits and Orbi floating. Two to six big round doors with picture icons, one per game mode, plus small corner icons (the Passport book, mute, and the Parent Corner gate). Everything is tappable and playful. Launch to first possible interaction in under 3 seconds.

5.3 Feedback in three tiers. Reward scales with achievement; it is never at maximum on every tap.
- Tier 1, micro (every correct tap): 150 ms or less. A scale pop, at most 6 sparkles, one soft note. It never blocks input.
- Tier 2, round (a finished round): 1.5 s or less. Stars fill in, Orbi reacts, one short spoken praise line. Rotate at least 6 different lines.
- Tier 3, milestone (a finished mission, a new Passport stamp): 3 s or less. A stamp or patch animation and a gentle music swell, then everything settles into calm.
Celebrations never stack or overlap. After each one the screen is quiet and the next action is obvious.
Stars: 1 for finishing a round, 2 for finishing with at most one hint, 3 for finishing with no hint. Stars are never taken away.

5.4 Hint ladder when Ayaan misses (nobody ever says "wrong"):
- Miss 1: a soft "boop", a gentle wobble on what he touched, Orbi says "Let's look again", and the demonstration replays.
- Miss 2: the demonstration replays slower and the correct next target breathes with a soft glow.
- Miss 3: Orbi does this step with him ("Let's do this one together"), then hands control back for the next step.

5.5 Adaptive difficulty: one module (js/systems/adaptive.js), unit tested. Each mode defines a ladder of rungs. Aim for success on about three rounds out of four. Move up one rung after 3 consecutive rounds with no hint. Move down one rung after 2 consecutive rounds that reached the third hint level. Changes are silent; never show "level down". A manual rung picker exists only in the Parent Corner.

5.6 Voice: Orbi's lines are spoken and subtitled (12 words or fewer, present tense, warm, concrete). Each line has a stable key. Playback order: audio file at assets/voice/<lang>/<key>.ogg if it exists (so a family member can record real voice lines later), then text-to-speech, then subtitle only. Evaluate the Capacitor text-to-speech plugin for the pinned Capacitor major, then fall back to the Web Speech API. Tapping the speech bubble skips the line.

# 6. Art, motion and sound direction

Look: a "paper-cut planetarium". Layered shapes, soft inner gradients, subtle grain, rounded forms, warm light from the Sun, deep indigo space (never pure black). No faces on planets, because they are real places; Orbi is the character. Planets get personality from motion and sound.

Planet identities, recognisable by silhouette and pattern as well as colour:
- Mercury: small, grey-brown, cratered.
- Venus: cream-yellow with swirling cloud bands.
- Earth: blue with white swirls and green land, with a small grey Moon.
- Mars: rusty orange-red with a white polar cap.
- Jupiter: the biggest, cream and orange bands, a red storm spot.
- Saturn: gold-cream with a clear, tilted ring.
- Uranus: pale cyan, tipped on its side, thin ring.
- Neptune: deep blue with pale streaks.
- Sun: a warm yellow-orange glowing disc with a slow, gentle pulsing corona (no flicker).

Draw everything yourself in code (canvas or SVG, procedural bands and craters) or as hand-authored SVG. Do not download images. Do not embed NASA imagery. No copyrighted characters.

Motion: ease-out for arrivals, gentle overshoot for pops, a subtle idle "breathing" on interactive things, slow parallax stars drifting upward (a nod to zero gravity). Use one timing scale (100, 200, 400, 800 ms). Target 60 fps.

Sound: soft bell, marimba and celesta-like tones from a pentatonic scale so any sequence sounds pleasant. Each planet has its own note. Generate sounds with WebAudio so there is no asset dependency, unless you have a better reason. UI sounds last 100 to 300 ms. An optional quiet ambient pad is ducked under voice. Music and effects volumes are independent.

Typography: bundle one open-licence (OFL) rounded sans locally as woff2 (for example Nunito or Baloo 2). Plan a Bengali-capable font for later (for example Noto Sans Bengali or Hind Siliguri). Key labels at least 24 sp, headings at least 32 sp. Show at most one short instruction at a time: an icon, 4 words or fewer, and voice.

# 7. UX and accessibility numbers

- Touch targets are at least 72 dp (never below 64 dp) with at least 12 dp between them. The hit area is the visible size plus 40 percent.
- Only tap is required. Dragging is an optional shortcut and must always have a tap-then-tap alternative (tap the thing, then tap the place). No multi-touch, no swipe-only controls, no long-press except the parent gate.
- Ignore a second tap on the same target within 300 ms. A tap on empty space is harmless and gives a tiny ripple.
- Portrait and landscape both work. Layouts reflow; they never letterbox awkwardly. Respect notches and safe areas.
- The Android back button opens a big "Go home?" confirmation with two picture buttons.
- Contrast for key text against its background is at least 7:1.
- Pause the simulation and audio when the app goes to the background, and resume cleanly.
- Everything works offline, including the first launch.

# 8. Science rules

- Every fact is true, specific and 12 words or fewer. Prefer concrete and surprising ("Venus spins backwards") over abstract.
- Facts live in data/planets.json with fields such as id, order, name_key and facts[{key, text_key, source_url, verified}]. Verify each fact against NASA Science (science.nasa.gov) before setting verified to true. Never use numbers that change, such as moon counts.
- Where distances or sizes are compressed, show a small "not to scale" icon and never present them as true to scale. Orbit order and the relative speed order must always be faithful: closer means a shorter lap. Use a documented monotone mapping from real orbital periods to on-screen speeds, and write it in docs/SCIENCE.md.
- Metaphors: gravity is "an invisible pull" that hugs things together. Never say rope, string or magnet. An orbit is "falling around": the planet keeps moving sideways while the Sun keeps pulling, so it goes around instead of crashing in. The Sun is a star. The Moon is not a planet. If Pluto appears, it is a dwarf planet.
- Seed facts already checked against NASA Science: the Sun is a star, and 1.3 million Earths would fit inside it; the Sun holds 99.8 percent of the solar system's mass; Venus spins backwards, and a Venus day (243 Earth days) is longer than its year (225 Earth days); Venus is the hottest planet because its thick air traps heat; Uranus spins tipped on its side and has faint rings.
- Seed facts you must still verify before using: Mercury is the smallest planet, the closest to the Sun, with a year of 88 Earth days. Earth is the only place we know with life and has one Moon. Mars looks red because of rusty dust, has the tallest volcano known (Olympus Mons) and two small moons. Jupiter is the biggest planet and has a giant storm called the Great Red Spot. Saturn has rings of ice and rock and is less dense than water. Neptune is the farthest planet, deep blue and very windy.

# 9. Technical architecture

Stack: HTML5, CSS and vanilla JavaScript as ES modules, with no framework and no bundler required. One canvas draws the world; DOM overlays hold buttons and text (better for accessibility and crisp UI). Capacitor wraps www/ as an Android app.

Capacitor version: use the current stable major. When this brief was written, the Capacitor docs listed Capacitor 8 (Node 22 or higher, Android Studio 2025.2.1 or newer, minimum Android API 24). Check https://capacitorjs.com/docs/getting-started/environment-setup and pin what it says. Consider these plugins, each only after confirming it supports the pinned major: haptics (soft taps), status bar / immersive mode, screen orientation (allow both), text-to-speech, preferences (storage), app (pause and resume), assets (icon and splash generation).

Repo layout:
  ayaan-solar-workshop/
    AGENTS.md  README.md  package.json  package-lock.json  capacitor.config.ts
    android/                      (generated by "npx cap add android", then committed)
    .github/workflows/build-apk.yml
    www/
      index.html
      css/            tokens.css  base.css  ui.css
      js/
        main.js
        core/         loop.js  scenes.js  input.js  events.js  storage.js  i18n.js  audio.js  voice.js  haptics.js  rng.js
        sim/          orbits.js  gravity.js  camera.js
        render/       sun.js  planet.js  moon.js  orbi.js  stars.js  particles.js  sprites.js
        scenes/       boot.js  hub.js  meet.js  parade.js  route.js  lab.js  switch.js  fix.js  passport.js  parent.js
        systems/      adaptive.js  hints.js  rewards.js  session.js
        data/         planets.json  missions.json  strings.en.json  strings.bn.json
      assets/         fonts/  voice/
    tests/            unit/  e2e/
    qa/               screens/  review-*.md  playtest-*.md
    docs/             DESIGN.md  DECISIONS.md  SCIENCE.md  BACKLOG.md  PHASE-*-PLAN.md  VOICE-LINES.md

Key design points:
- Scene manager. Each scene has enter(), exit(), update(dt) and render(ctx), and receives input from the central input module. Scenes never reach into each other; they communicate through the event bus.
- Fixed-timestep simulation (1/120 s with an accumulator), with rendering interpolated. Clamp dt after resume so nothing jumps.
- The main system's orbits run "on rails": angle = angle0 + 2*pi*t/period. Real physics is used only where the child interacts (Orbit Lab, Phase 3): a test body in the Sun's field, integrated with a symplectic method (leapfrog or velocity Verlet).
- A seedable deterministic random number generator, used by anything random, so tests and puzzles are reproducible.
- Every user-visible string comes from strings.<lang>.json from day one. No hard-coded text. Keys are stable.
- Save data is versioned JSON stored through Capacitor Preferences or localStorage, with every access wrapped in try/catch. It holds the profile, settings, progress per mode (rung and stars), the Passport and a small session log.
- Performance budgets: at least 55 fps on a mid-range 2019 Android phone with 3 GB RAM; cold start to interactive under 3 s; debug APK under 25 MB; particle cap 120; no per-frame allocations in hot loops; pre-render planet sprites to offscreen canvases at load for the current devicePixelRatio, capped at 2.
- Test hooks: expose window.__game (state, scene control, seed, "tap entity by id") in non-production builds only.

# 10. CI/CD (GitHub Actions)

.github/workflows/build-apk.yml must:
- Trigger on push, pull_request and manual dispatch, with a concurrency group so old runs cancel.
- Install with "npm ci" from the committed lockfile, and cache npm and Gradle.
- Run the unit tests and the Playwright end-to-end tests first, and fail the build if any fail.
- Run "npx cap sync android", then build the debug APK with "./gradlew assembleDebug".
- Upload the APK (named with the version and short commit) and the QA screenshots as artifacts.
Do not guess tool versions. Take Node from the Capacitor docs, and take the JDK from the Java version the generated android/ Gradle files require (check android/app/capacitor.build.gradle and the Gradle wrapper). Run "npx cap add android" once (it should not need the Android SDK) and commit android/, so builds are reproducible and you can set the icon and manifest. Later (Phase 5): an optional signed release build using repository secrets, attached to a GitHub Release on version tags.
A workflow that was never run counts as "unverified". Run it, or ask me to run it, and report the real result.

# 11. Quality protocol (every phase)

11.1 Loop: write a one-page plan (docs/PHASE-N-PLAN.md), build a vertical slice first (one scene end to end, rough is fine), widen it, then run the review loop.

11.2 Review loop, at least 3 passes per phase. Run the app in a real browser at 390x844, 360x740, 412x915, 800x1280 and 844x390 (landscape). Save screenshots to qa/screens/phase-N/. Critique them against the rubric below, fix, and repeat. Write what you saw and changed in qa/review-N.md. If a screenshot shows something ugly or confusing, that is a bug, even when every test is green.

11.3 Rubric, scored 1 to 5. Anything under 4 gets fixed.
1. The first 10 seconds: something beautiful moves and invites a tap, with no reading.
2. Every tap has motion and sound within 100 ms.
3. The next action is obvious without reading.
4. A mistake feels safe, never bad.
5. One thing to do at a time; clear visual hierarchy.
6. Each planet is recognisable at a glance.
7. Motion quality: consistent easing, no jitter.
8. Sound is pleasant and balanced, never harsh.
9. The science is correct, and anything not to scale is marked.
10. Edge cases: rotation, backgrounding, rapid and double taps, resizing, a slow CPU.

11.4 Automated tests.
- Unit: the adaptive engine, the hint ladder, orbit math, storage, and that every string key exists in every language.
- End to end (Playwright): play every rung, including wrong taps and all three hint levels; rotate mid-round; pause and resume.
- Accessibility checks computed from the DOM: target sizes and text contrast.
- Performance: a run with the CPU throttled 4x, reporting the real p95 frame time (target under 20 ms).
If Playwright cannot run in your environment, use whatever browser tool you have and say so.

11.5 Honest report at the end of every phase: what is built; what is verified and how; what is not verified and why; known issues; screenshots; risks for the next phase.

11.6 Definition of Done always includes: tests green, CI green with an APK artifact, rubric 4 or higher everywhere, docs updated, report delivered.
