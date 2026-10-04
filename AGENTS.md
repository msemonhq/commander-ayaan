# AGENTS.md — Ayaan's Solar System Workshop (master brief)

Save this file in the repo root as AGENTS.md. Read all of it before every phase. If your tool looks for a different file name (GEMINI.md, CLAUDE.md), keep the content and tell the tool to read AGENTS.md first.

# 0. Who you are and how you must work

You are a senior game developer, a children's learning designer, a motion and lighting artist and a careful QA engineer in one person. You are building an Android app (an HTML5 canvas game wrapped with Capacitor) for one specific six-year-old. The target: a game he asks to play again, which teaches him how a solar system works as a system, through his hands and eyes.

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

Assume Ayaan is a beginning reader. He may recognise some words, but this game does not ask him to read. It is a game of doing and seeing: he learns by touching, dragging, flinging, building and watching what happens. There are no sentences on the screen during play. Everything he needs comes from movement, pictures, light, sound and Orbi's body language (the toolkit is in section 5.3).

He plays on an Android phone or tablet, in short bursts, often with a grown-up or sibling nearby.

The player is "Commander Ayaan" (the name is configurable in the Parent Corner). His companion is Orbi, an original, friendly floating robot who communicates mostly by pantomime. You may rename Orbi. Never use or imitate an existing character.

Pitch: Ayaan runs a small space workshop where a real solar system is his toy box. He plays with it using his hands, breaks it a little, fixes it, builds his own, and learns how its parts work together.

# 2. Design pillars

Every feature must serve at least one pillar. Cut what serves none.
1. Do, don't read. Learning happens by touching and watching. No sentences on screen. Instructions are shown, not written: a ghost hand, Orbi's pantomime, pictures, glows and sounds.
2. Touch it, it answers. Every object reacts within 100 ms with motion and sound, and feels physical: weight, inertia, a soft snap, a bounce. Everything that changes on screen is animated (section 6.1).
3. See the hidden. Invisible things (the pull, warmth, speed) can be switched on as simple visual layers.
4. Predict, try, see. The core learning loop: guess by choosing a picture, try it with your hands, watch the result play out in the world.
5. Gentle always. No lives, no timers, no red crosses, no buzzers, no "wrong". Mistakes are cheap, a little funny and informative.
6. Calm delight. Reward in proportion. Sessions end well. The game never begs for more.
7. True to the real thing. Stylised, never wrong.

# 3. Learning design

Be honest about what this is. The game exercises skills in a playful way. It must not promise or imply that it raises intelligence or "optimises" the brain; research on transfer from brain-training games is weak. Aim for genuine play, curiosity, accurate science and practice on the way. Put no such claims in the UI, the README or any store text.

Skills and where they live:
- Spatial reasoning: order planets by distance from the Sun, say what is between what, predict where a planet will be next on its orbit, copy a layout from a picture. Avoid mental rotation (too hard at 6). Modes: Planet Parade, Rocket Route, Orbit Lab, My Solar System.
- Working memory: remember a route of planets. Start at 2 items. The typical span at this age is roughly 3 to 4, so treat 4 as a stretch and 5 as a bonus. Mode: Rocket Route.
- Cognitive flexibility: sort the same planets by one rule, then switch to another rule, with a clear visual cue. Mode: Switch Station.
- Systems thinking, the heart of the app. The concept ladder, in order:
  1. Parts: the Sun, planets and moons belong together (Planet Playground).
  2. Patterns: orbits repeat; closer means quicker laps (Planet Playground, Rocket Route).
  3. Connections: an invisible pull holds the system together; X-ray mode shows it (Orbit Lab).
  4. Cause and effect: change one thing, watch what changes (Orbit Lab).
  5. Balance: sideways motion plus the pull makes an orbit; too slow falls in, too fast flies away (Orbit Lab).
  6. Diagnose and fix: find the broken part, change one thing at a time, check (Fix-the-System).
  7. Build a whole system and see if it works (My Solar System).

Grown-up scaffolding: a child learns most when an adult talks with him about what just happened. The Parent Corner offers one open question per session ("What do you think would happen if the Sun pulled less?"), and the app ends a session by asking Ayaan, with a gesture and a picture, to "show someone what you made".

# 4. Wellbeing and safety rules (non-negotiable)

- No ads, analytics, accounts or network calls. No data leaves the device. Try to remove the INTERNET permission from the Android manifest. If the app then fails to load, keep the permission, make zero network requests, and note why in docs/DECISIONS.md.
- No dark patterns: no streaks, daily-login rewards, loss, countdowns, "come back" nags or chance-based rewards (no loot boxes, no random drops). Rewards are earned deterministically.
- No flashing: nothing flashes more than 3 times per second, no full-screen flashes, no screen shake. Honour the OS reduce-motion setting and an in-app reduce-motion toggle.
- Sound: no sudden loud sounds, a capped master gain, and every sound can be muted in one tap from any screen.
- Pacing: a mission is 5 rounds (about 3 to 5 minutes). After 15 minutes of play (a parent can change this to 10, 20 or off) a calm "Orbi is sleepy" scene, told entirely in pictures, suggests stopping. By default the child can continue; a parent can switch on "firm" mode, which needs the parent gate to continue.
- The Parent Corner sits behind a gate: press and hold a corner icon for 3 seconds, then answer a simple arithmetic question. It is the only screen with sentences.
- Nothing relies on colour alone. Targets are large. Voice is rare and optional, and nothing is lost if it is turned off.

# 5. Experience design

5.1 Final app structure: Boot (tap to start) -> Hub -> seven modes: Planet Playground, Planet Parade, Rocket Route, Orbit Lab, Switch Station, Fix-the-System, My Solar System; plus the Space Passport (collection) and the Parent Corner. Build and show only what exists in the current phase. Never show locked or "coming soon" items.

5.2 Hub: a calm, living scene. The Sun sits at the centre with planets on slow orbits and Orbi floating. Each mode is a big round "station" orbiting the Sun, drawn as a small live preview of that game (for example, the Parade station shows tiny planets hopping into place). No labels. Two to seven stations, a Passport book in one corner, a mute button in another. Everything is tappable and playful. Launch to first possible interaction in under 3 seconds.

5.3 The wordless toolkit. Teach with these, in this order of preference:
- Ghost hand: a translucent animated hand shows the exact gesture (tap, drag from here to there, hold, sling) the first time a mechanic appears and whenever Ayaan stalls. It loops softly until he acts.
- Orbi's body language: Orbi's eyes look at the target, he points, nods, shrugs, tilts his head when puzzled, cheers, droops when sleepy.
- Silhouettes and shadows show where things go. Matching shapes glow when something fits.
- Results are physical, not announced: a fuel gauge fills, a ring of dots lights up, a planet warms from blue to red, a constellation draws itself star by star. Never a number or a sentence.
- Sound is a language: each planet has its own note; success, "almost" and "try again" each have one consistent sound motif.
- Rare voice: Orbi may say a very short thing (see 5.7), always optional.
Idle ladder when Ayaan stalls at a decision point: after 3 s Orbi looks at the target; after 6 s the ghost hand demonstrates; after 10 s the target breathes with a soft glow. The game never completes a step for him just because he is slow.

5.4 Feedback in three tiers. Reward scales with achievement; it is never at maximum on every touch.
- Tier 1, micro (every correct touch): 150 ms or less. A scale pop, at most 6 sparkles, one soft note, a light haptic tick if the device supports it. It never blocks input.
- Tier 2, round (a finished round): 1.5 s or less. A star joins his constellation, Orbi cheers, a short musical phrase.
- Tier 3, milestone (a finished mission, a new Passport sticker): 3 s or less. A sticker or patch animation and a gentle music swell, then everything settles into calm.
Celebrations never stack or overlap. After each one the screen is quiet and the next action is obvious.
Stars: 1 for finishing a round, 2 for finishing with at most one hint, 3 for finishing with no hint. Stars are never taken away. Stars are shown as lit stars in a constellation, never as a count.

5.5 Hint ladder when Ayaan misses (nobody ever says "wrong"):
- Miss 1: a soft "boop", the thing he touched wobbles or springs back, Orbi tilts his head, and the ghost hand shows the move once.
- Miss 2: the demonstration replays slower, and the correct target breathes with a soft glow.
- Miss 3: Orbi does this step with him (the ghost hand and Orbi move the piece into place together), then hands control back for the next step.

5.6 Adaptive difficulty: one module (js/systems/adaptive.js), unit tested. Each mode defines a ladder of rungs. Aim for success on about three rounds out of four. Move up one rung after 3 consecutive rounds with no hint. Move down one rung after 2 consecutive rounds that reached the third hint level. Changes are silent. A manual rung picker exists only in the Parent Corner.

5.7 Voice: rare, short and optional. Orbi may say at most 6 words at a few moments (a greeting, a "great job", a "let's try again", one spoken word for a new planet's name). Keep the total number of spoken lines under 30 per phase. Each line has a stable key. Playback order: audio file at assets/voice/<lang>/<key>.ogg if it exists (so a family member can record real voice lines), then text-to-speech, then silence. Nothing in the game depends on voice or on a subtitle; with voice off, play is identical. Evaluate the Capacitor text-to-speech plugin for the pinned Capacitor major, then the Web Speech API. Tapping or touching anything cuts a line short.

5.8 Touch vocabulary. Allowed: tap, drag, press-and-hold (1.5 s or less), and flick or sling. Not allowed: multi-touch, pinch, swipe-only navigation, hold longer than 1.5 s (except the parent gate).
- Everything grabbable has a grab area 40 percent larger than it looks.
- Dragged things have weight: they follow the finger with a slight ease, they tilt a little in the direction of travel, and on release they keep a little inertia and settle.
- Targets attract: when a dragged piece is within about 1.5 of its own radius from a correct slot, it eases toward it and snaps in with a soft click, a tiny squash and a haptic tick.
- Where a drag is just a way to place something (Parade, Switch Station, My Solar System), a tap on the piece and then a tap on the place does the same thing.
- Where the gesture is the point (spinning a planet, slinging a satellite, tilting a ring), the physics must be forgiving and every outcome must look interesting, never broken.

# 6. Art, motion and sound direction

The bar is "this is the most beautiful kids' space toy on his tablet". Visual richness is a feature, not decoration, because pictures carry the meaning.

Look: a "paper-cut planetarium" with real light. Layered shapes, soft inner gradients, subtle grain, rounded forms, deep indigo space (never pure black).

Lighting is the core visual idea. The Sun is the light source. Every planet is lit from the side that faces the Sun, with a soft day-night edge (terminator), a thin rim light and a faint atmosphere glow where it fits. As a planet orbits, its lit side turns with it. Saturn's ring casts a soft shadow on the planet. Moons are lit the same way. Earth's night side shows tiny city lights. Dimmer light with distance is part of the picture, and it is also a hint (closer is brighter). Build lighting as a reusable module (render/lighting.js) with pre-rendered planet bases and a cheap overlay, so it stays at 60 fps.

Depth and life: at least 3 parallax layers (stars, a faint nebula, distant dust) drifting slowly upward, a very gentle camera drift, soft particles for dust and sparkles, an occasional comet crossing the background (rare and calm), and idle breathing on everything touchable. Camera moves glide with ease-in-out; nothing teleports.

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
No faces on planets, because they are real places; Orbi is the character. Planets get personality from motion, light and sound.

Draw everything yourself in code (canvas or SVG, procedural bands and craters) or as hand-authored SVG. Do not download images. Do not embed NASA imagery. No copyrighted characters.

Orbi: expressive eyes and antenna, a small body that squashes and stretches. Poses at minimum: idle, point, nod, shrug, puzzled, cheer, sleepy, "look at target". All emotion is drawn, never written.

Icons: any icon must be understood by a six-year-old without words. Keep each to one simple idea, test it in playtests, and replace any he misreads.

Motion: the full motion system is in section 6.1. Target 60 fps.

Sound: soft bell, marimba and celesta-like tones from a pentatonic scale so any sequence sounds pleasant. Each planet has its own note. Generate sounds with WebAudio so there is no asset dependency, unless you have a better reason. UI sounds last 100 to 300 ms. An optional quiet ambient pad is ducked under voice. Music and effects volumes are independent.

Text: during play there is none. Allowed exceptions: the Parent Corner, and a small planet-name caption in the Planet Playground and the Passport (a parent can switch it off). Bundle one open-licence (OFL) rounded sans locally as woff2 (for example Nunito or Baloo 2) for those places, and plan a Bengali-capable font for later (for example Noto Sans Bengali or Hind Siliguri). Keep text 24 sp or larger.

6.1 Motion system
Animation is how a wordless game talks, so almost everything that changes on screen is animated. Build one shared motion system and use it everywhere; do not hand-roll animations inside scenes.

Rules:
- Nothing pops or teleports. If something appears, disappears, moves or changes state, it animates: an enter, an exit, a move or a state change.
- Motion explains. Animate in the direction of attention and cause: things leave toward where they go, arrive from where they came, and a result flies from the action to the place where it is recorded (a star flies from the planet he just placed to his constellation). Use shared-element continuity across screens: what he touched becomes the next screen.
- Every important movement has three beats: anticipation (a small wind-up), action, and settle (overshoot, then rest). Use squash and stretch lightly and consistently.
- Calm, not busy. At most one primary animation competes for attention at a time. Ambient motion is slow (cycles of 3 s or longer). More animation must never mean more stimulation: no flashing (section 4), bounded celebrations (section 5.4), nothing loops fast.
- Never block. Input is accepted during every transition. A touch during a transition fast-forwards it to its end state smoothly in 100 ms or less, and then the touch is handled.
- In sync with sound and touch: the visual peak lands within 40 ms of the sound onset and of the haptic tick.
- Every animation has a reduce-motion variant: travel and scaling become short cross-fades and soft glows, parallax and drift stop, particle bursts shrink to at most 2 sparkles. Lighting stays.

Timing scale: instant feedback 80 to 120 ms; micro-interactions 150 to 250 ms; standard 300 to 400 ms; screen transitions 500 to 700 ms (never over 800 ms); celebrations per section 5.4; ambient loops 3 to 12 s. Named easings, defined once in css/tokens.css and js/core/tween.js: out (arrivals), in (departures), in-out (camera and screens), spring (pops, snaps, springing back; one preset for small things, one for big ones) and wobble (a decaying shake for a miss: about 6 degrees, 2 cycles, 300 ms).

Engine: js/core/tween.js provides tweens, springs, timelines, stagger, cancel and fast-forward, driven by the fixed-step clock and the pause logic. js/render/transition.js runs scene transitions. docs/MOTION.md is the inventory: one line per animation with id, trigger, duration, easing and reduce-motion variant. The tests in section 11.4 read it.

Screen transitions (shared-element, 500 to 700 ms; the one exception is the Boot intro, which may run up to 2 s and is skippable by touch):
- Boot to Hub (an intro, up to 2 s): the Sun blooms, the camera pulls back as the planets fly out from the Sun into their orbits (staggered by 80 ms, inner planet first), stations drift in along their orbits, Orbi floats in on a curved path.
- Hub to a mode: the station he touched grows to fill the screen and its live preview becomes the first frame of the game; the other stations and planets slide away along their orbits and dim. Going back reverses it: the game shrinks into its station and the hub re-forms.
- Round to round: finished pieces exit in the direction they travelled (not just a fade); new pieces arrive staggered (40 to 80 ms apart) with a small overshoot.
- Mission end: the constellation completes with its lines drawing in, the picture comes alive for a moment, then lifts into the hub.
- Overlays (go-home confirmation, sleepy scene, parent gate): grow out of the button that opened them and fall back into it; the backdrop dims and softens.
- Camera moves: ease-in-out with a hint of overshoot; parallax layers move at different speeds so that depth is felt.
- Rotating the device or resizing: elements glide to their new positions within 400 ms; nothing jumps.
- Returning to the app: a short fade-in, and the simulation ramps back up over 300 ms.

Interaction animations (every one of these exists):
- Press: instantly scales to about 0.94 and brightens; release springs past 1.0 and settles.
- Idle invitation: touchable things breathe (1.00 to 1.03 over 3 to 4 s). After 6 s of nothing, the primary target does one small hop and glow, and then the coach ladder (section 5.3) continues.
- Grab: the piece lifts (larger, with a deeper soft shadow), tilts toward its direction of travel, and leaves a few faint echoes or at most 6 sparkles.
- Hover over a target while dragging: the target leans toward the piece and its rim brightens (the pull before the snap).
- Snap: squash, a ring ripple, a haptic tick, and neighbouring slots do a small ripple wave.
- Miss: the piece springs back along a curved path with a wobble. Never red, never a shake of the whole screen.
- Correct: pop, a sparkle ring, the planet's note, and a connecting line where relevant.
- Rewards: a star flies from where the success happened to its place in the constellation along a curve, lights up with a ring, and its line draws to the previous star.
- Gauges and meters fill with ease-out and a soft sheen that sweeps across once.
- Buttons and icons enter with a scale-in and a stagger; icon changes morph (the mute icon's sound waves collapse into a cross).
- Orbi is never still: a float bob, a blink every 3 to 6 s at random intervals, antenna sway, eyes that follow the touch within 150 ms, anticipation before pointing, a jump for cheers, a head tilt for puzzled, a yawn for sleepy. His antenna glows softly while any voice line plays.
- Worlds are alive: planets turn slowly, atmospheres shimmer, Saturn's ring glints, the Sun's corona breathes (6 s or slower), the lit side follows the orbit, dust drifts.

Performance: animate only transforms and opacity on DOM elements and draw everything else on the canvas; use no layout-triggering properties in animations; cap simultaneous tweens (about 150) and particles (section 9); pool objects; stop animating when the app is hidden. The heaviest transition must hold the frame-time budget at 4x CPU throttle.

# 7. UX and accessibility numbers

- Touch targets are at least 72 dp (never below 64 dp) with at least 12 dp between them. The hit area is the visible size plus 40 percent.
- Gestures follow section 5.8. Ignore a second tap on the same target within 300 ms. A touch on empty space is harmless and makes a tiny ripple.
- Portrait and landscape both work. Layouts reflow; they never letterbox awkwardly. Respect notches and safe areas.
- The Android back button opens a "Go home?" confirmation made of two big picture buttons (a house, and the current game).
- Contrast for any text against its background is at least 7:1.
- Pause the simulation and audio when the app goes to the background, and resume cleanly.
- Everything works offline, including the first launch.

# 8. Science rules

- Every fact is true and specific, and every fact is shown as something he can do or watch (a demo), not as a sentence. In data/planets.json each fact has: id, demo (the interaction or animation that shows it), source_url, verified, and optionally voice_key and a short caption. Verify each fact against NASA Science (science.nasa.gov) before setting verified to true. Never use numbers that change, such as moon counts.
- Where distances or sizes are compressed, show a small "not to scale" icon and never present them as true to scale. Orbit order and the relative speed order must always be faithful: closer means a shorter lap. Use a documented monotone mapping from real orbital periods to on-screen speeds, and write it in docs/SCIENCE.md.
- Metaphors in pictures and voice: gravity is "an invisible pull" that hugs things together, drawn as soft glowing arrows. Never rope, string or magnet. An orbit is "falling around": the planet keeps moving sideways while the Sun keeps pulling, so it goes around instead of crashing in. The Sun is a star. The Moon is not a planet. If Pluto appears, it is a dwarf planet.
- Seed facts already checked against NASA Science: the Sun is a star, and 1.3 million Earths would fit inside it; the Sun holds 99.8 percent of the solar system's mass; Venus spins backwards, and a Venus day (243 Earth days) is longer than its year (225 Earth days); Venus is the hottest planet because its thick air traps heat; Uranus spins tipped on its side and has faint rings.
- Seed facts you must still verify before using: Mercury is the smallest planet, the closest to the Sun, with a year of 88 Earth days. Earth is the only place we know with life and has one Moon. Mars looks red because of rusty dust, has the tallest volcano known (Olympus Mons) and two small moons. Jupiter is the biggest planet and has a giant storm called the Great Red Spot. Saturn has rings of ice and rock and is less dense than water. Neptune is the farthest planet, deep blue and very windy.

# 9. Technical architecture

Stack: HTML5, CSS and vanilla JavaScript as ES modules, with no framework and no bundler required. One canvas draws the world; DOM overlays hold the few buttons (better for accessibility and crisp UI). Capacitor wraps www/ as an Android app.

Capacitor version: use the current stable major. When this brief was written, the Capacitor docs listed Capacitor 8 (Node 22 or higher, Android Studio 2025.2.1 or newer, minimum Android API 24). Check https://capacitorjs.com/docs/getting-started/environment-setup and pin accordingly. Consider these plugins, each only after confirming it supports the pinned major: haptics (soft ticks), status bar / immersive mode, screen orientation (allow both), text-to-speech, preferences (storage), app (pause and resume), assets (icon and splash generation).

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
        core/         loop.js  tween.js  scenes.js  input.js  gestures.js  events.js  storage.js  i18n.js  audio.js  voice.js  haptics.js  rng.js
        sim/          orbits.js  gravity.js  camera.js
        render/       sun.js  planet.js  moon.js  orbi.js  stars.js  particles.js  sprites.js  lighting.js  hand.js  transition.js
        scenes/       boot.js  hub.js  playground.js  parade.js  route.js  lab.js  switch.js  fix.js  sandbox.js  passport.js  parent.js
        systems/      adaptive.js  hints.js  coach.js  rewards.js  session.js
        data/         planets.json  missions.json  strings.en.json  strings.bn.json
      assets/         fonts/  voice/
    tests/            unit/  e2e/
    qa/               screens/  review-*.md  playtest-*.md
    docs/             DESIGN.md  DECISIONS.md  MOTION.md  SCIENCE.md  BACKLOG.md  PHASE-*-PLAN.md  VOICE-LINES.md

Key design points:
- Scene manager. Each scene has enter(), exit(), update(dt) and render(ctx), and receives input from the central input and gestures modules. Scenes never reach into each other; they communicate through the event bus.
- gestures.js turns raw pointer events into tap, drag (with velocity), hold and flick, with the grab, snap and inertia rules from section 5.8. Every scene uses it; none reads pointer events directly.
- coach.js owns the idle ladder and the ghost hand. A scene registers its "next expected action" (a target, a gesture and a path), and coach.js does the rest. Expose the current coach target through window.__game so tests can follow the ghost hand.
- Fixed-timestep simulation (1/120 s with an accumulator), with rendering interpolated. Clamp dt after resume so nothing jumps.
- The main system's orbits run "on rails": angle = angle0 + 2*pi*t/period. Real physics is used only where the child interacts (Orbit Lab, Phase 3, and My Solar System's gravity knob): a test body in the Sun's field, integrated with a symplectic method (leapfrog or velocity Verlet).
- A seedable deterministic random number generator, used by anything random, so tests and puzzles are reproducible.
- Because there is almost no text, keep strings.<lang>.json small but complete, with stable keys, and no hard-coded text anywhere.
- Save data is versioned JSON stored through Capacitor Preferences or localStorage, with every access wrapped in try/catch. It holds the profile, settings, progress per mode (rung and stars), the Passport, saved creations and a small session log.
- Performance budgets: at least 55 fps on a mid-range 2019 Android phone with 3 GB RAM; cold start to interactive under 3 s; debug APK under 25 MB; particle cap 120; no per-frame allocations in hot loops; pre-render planet sprites and lighting bases to offscreen canvases at load for the current devicePixelRatio, capped at 2.
- Test hooks: expose window.__game (state, scene control, seed, coach target, "touch entity by id", a "hide all text" flag, and a way to advance the animation clock by a given number of milliseconds so tests are deterministic) in non-production builds only.

# 10. CI/CD (GitHub Actions)

.github/workflows/build-apk.yml must:
- Trigger on push, pull_request and manual dispatch, with a concurrency group so old runs cancel.
- Install with "npm ci" from the committed lockfile, and cache npm and Gradle.
- Run the unit tests and the Playwright end-to-end tests first, and fail the build if any fail.
- Run "npx cap sync android", then build the debug APK with "./gradlew assembleDebug".
- Upload the APK (named with the version and short commit) and the QA screenshots as artifacts.
Do not guess tool versions. Take Node from the Capacitor docs, and take the JDK from the Java version the generated android/ Gradle files require (check android/app/capacitor.build.gradle and the Gradle wrapper). Run "npx cap add android" once (it should not need the Android SDK) and commit android/, so builds are reproducible and you can set the icon and manifest. Later (Phase 6): an optional signed release build using repository secrets, attached to a GitHub Release on version tags.
A workflow that was never run counts as "unverified". Run it, or ask me to run it, and report the real result.

# 11. Quality protocol (every phase)

11.1 Loop: write a one-page plan (docs/PHASE-N-PLAN.md), build a vertical slice first (one scene end to end, rough is fine), widen it, then run the review loop.

11.2 Review loop, at least 3 passes per phase. Run the app in a real browser at 390x844, 360x740, 412x915, 800x1280 and 844x390 (landscape). Save screenshots to qa/screens/phase-N/. Because motion and light are the product, also capture short frame sequences (6 to 10 frames over about 1 second) of each key interaction and of every screen transition: a drag and snap, a planet spin, a celebration, hub to game and back. Critique them against the rubric below, fix, and repeat. Write what you saw and changed in qa/review-N.md. If a screenshot shows something ugly or confusing, that is a bug, even when every test is green.

11.3 Rubric, scored 1 to 5. Anything under 4 gets fixed.
1. The first 10 seconds: something beautiful moves and invites a touch.
2. Every touch has motion and sound within 100 ms and feels physical.
3. The next action is obvious without reading: the ghost hand, Orbi or a glow shows it.
4. A mistake feels safe, never bad.
5. One thing to do at a time; clear visual hierarchy.
6. Each planet is recognisable at a glance, and lit consistently from the Sun.
7. Motion quality: everything that changes on screen animates, with consistent easing, weight and inertia, no jitter, and no transition that blocks a touch.
8. Sound is pleasant and balanced, never harsh.
9. The science is correct, and anything not to scale is marked.
10. Edge cases: rotation, backgrounding, rapid and double touches, resizing, a slow CPU.

11.4 Automated tests.
- Unit: the adaptive engine, the hint and idle ladders, the gesture recogniser (tap, drag, hold, flick thresholds), snapping, orbit math, storage, and that every string key exists in every language.
- End to end (Playwright): play every rung, including misses and all three hint levels; rotate mid-round; pause and resume.
- Coach test: from a cold start, in every mode, do nothing and follow only the ghost hand's target (read from window.__game); round 1 must be completable this way. This proves a child can start without instructions.
- Wordless check: hide all text with the debug flag, screenshot every screen, and confirm the next action is still obvious. Check that no game screen shows a sentence.
- Motion checks: the tween engine (easing endpoints, springs settle, cancel and fast-forward are safe); every transition accepts a touch while running; no transition longer than 800 ms (the skippable Boot intro may take up to 2 s); every animation in docs/MOTION.md has a reduce-motion variant; and a flash-rate check on the frame sequences of every transition and celebration (no more than 3 brightness flashes per second, and no large-area flash).
- Accessibility checks computed from the DOM: target sizes and text contrast.
- Performance: a run with the CPU throttled 4x, reporting the real p95 frame time (target under 20 ms).
If Playwright cannot run in your environment, use whatever browser tool you have and say so.

11.5 Honest report at the end of every phase: what is built; what is verified and how; what is not verified and why; known issues; screenshots and frame sequences; risks for the next phase.

11.6 Definition of Done always includes: tests green, CI green with an APK artifact, rubric 4 or higher everywhere, docs updated (including docs/MOTION.md), report delivered.