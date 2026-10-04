# PHASE 1: Foundation, Hub, Planet Playground, Planet Parade

Read AGENTS.md completely first. Do PHASE 1 only, then stop.

Goal: a complete, beautiful app that Ayaan can already enjoy with no instructions: a living, lit solar system, a playground where every planet is a toy, and one game about putting the planets in order. This phase also builds the engine, gestures, coaching, lighting, audio, tests and CI that every later phase depends on, so build them properly.

Start by writing docs/PHASE-1-PLAN.md (one page: order of work, risks, how you will test each part). Then build a vertical slice (Boot -> Hub -> one planet toy) before widening.

## A. Repo, tooling and CI
- The layout from AGENTS.md section 9. npm scripts: dev (static server), test (unit), test:e2e (Playwright), build (sync to Android).
- Generate the Capacitor Android project once, commit it, set the app name "Ayaan" and a temporary icon. Pin versions as AGENTS.md section 9 says.
- CI as in AGENTS.md section 10: green run, APK artifact. README with plain steps to download the APK from GitHub Actions and install it on an Android phone (allowing installs from this source), noting it is a debug build.

## B. Engine core
- Fixed-timestep loop, scene manager, event bus, versioned save data, i18n with English strings in strings.en.json (kept small), seedable RNG.
- gestures.js: tap, drag with velocity, hold (1.5 s or less) and flick, with the grab area, weight, inertia and snapping rules from AGENTS.md section 5.8. Unit-test the thresholds.
- coach.js and render/hand.js: the idle ladder and the ghost hand from AGENTS.md section 5.3, driven by a "next expected action" that each scene registers. Expose the coach target on window.__game.
- Audio: WebAudio synthesis, one note per planet from a pentatonic scale, a capped master gain, one-tap mute that is always visible, pause on background. Haptic ticks through the haptics plugin where supported.
- Voice: build the playback chain (audio file, then text-to-speech, then silence) behind one interface, but ship this phase with no spoken lines. Voice comes in Phase 2.
- Particles (cap 120), a smooth camera (glide and zoom), reduce-motion handling, test hooks (window.__game).
- The motion system from AGENTS.md section 6.1: js/core/tween.js, js/render/transition.js, the named easings in css/tokens.css and docs/MOTION.md (see the Motion section below). Build it before the scenes and unit-test it.
- js/systems/adaptive.js and js/systems/hints.js exactly as AGENTS.md sections 5.5 and 5.6 describe, with unit tests.

## C. Art system and lighting
- render/lighting.js: the Sun lights every body from the side that faces it, with a soft terminator, rim light and atmosphere glow where it fits, updating as bodies orbit. Pre-render bases, cheap overlay per frame.
- Procedural renderers for the Sun, all 8 planets, the Moon, Orbi (poses: idle, point, nod, shrug, puzzled, cheer, sleepy, look-at-target) and a layered starfield with nebula and dust, drifting slowly upward.
- Follow the planet identities in AGENTS.md section 6. Each planet must be recognisable in silhouette and pattern, not just colour. Earth's night side shows tiny city lights.

## D. Boot screen
- No words. A softly glowing Sun with a pulsing ring, and the ghost hand tapping it. Touch starts the game and unlocks audio. The Sun rises behind a planet while Orbi floats in. 2 seconds or less of animation, skippable by a touch.

## E. Hub
- The background is a living, lit solar system: all 8 planets on rails, slowly orbiting, with Orbi floating nearby.
- Two stations orbit the Sun, each a big round live preview with no label: the Playground (a planet being spun by a tiny hand) and the Parade (tiny planets hopping into a row). A mute button. Nothing else.
- Every planet in the background can be touched: its note plays and a small sparkle appears.

## F. Planet Playground (every planet is a toy; no goals, no scoring)
An orbit view of the whole system. Touch a planet: the camera glides to it, it grows, and its note plays. Each body has a signature toy interaction that shows one true fact without any sentence. A small name caption appears (switchable off later in the Parent Corner). The ghost hand shows the gesture the first time.
- Sun: press and hold to turn up the light; every body's lit side brightens and the farther planets stay dimmer. A stream of tiny Earths pours into the Sun's silhouette and fills it up (it shows that more than a million Earths would fit).
- Mercury: flick it and it zooms around a fast lap. A ring of dots beside Earth's orbit lights up: Mercury completes about 4 laps while Earth completes 1 (Mercury's year is 88 Earth days, Earth's is about 365).
- Venus: drag across it to spin it. It always spins the opposite way to the drag, and a small arrow pair beside Earth's spin shows they go opposite ways.
- Earth: drag around it to turn it. The lit side faces the Sun and city lights appear as night arrives. Drag the Moon around it.
- Mars: press and hold to stir up a dust storm that tints the whole planet and settles when released.
- Jupiter: drag across the bands and they swirl; the storm spot spins. Touch it once and 11 tiny Earths line up across its face to show how big it is.
- Saturn: drag the ring and it tilts and wobbles; ice chunks sparkle. (If the fact "less dense than water" verifies, add a bathtub toy: drag Saturn onto a pool and it floats. Skip it if you cannot verify.)
- Uranus: touch it and it rolls onto its side, tilted ring now vertical, and keeps spinning that way as it travels.
- Neptune: sweep a finger across it and pale wind streaks race around it.
- Record the first completion of each toy in the save data (the Passport itself comes in Phase 2).
- A big home button (a house icon). Show the "not to scale" icon on this view.

## G. Planet Parade (spatial reasoning, all by dragging)
Concept: Orbi needs help putting the planets back in their homes, in order from the Sun. Nothing is written on screen.

Layout: a runway, not rings. The Sun glows at one end of the screen's longer axis. The slots follow in order, evenly spaced, each at least 72 dp, each lit a little less than the one before (closer is brighter, which is also a hint). A tray holds the planets still to place. Show the "not to scale" icon.

Interaction: drag a planet from the tray to a slot. It has weight; near the right slot it eases in and snaps with a soft click, a squash and a haptic tick. Tapping a planet and then a slot also works. Early rungs show a faint silhouette of the right size in each slot (a shape-matching scaffold); later rungs hide it. The ghost hand shows the first drag.

Rungs (the adaptive engine picks the rung; start at R1):
- R1: Mercury, Venus, Earth. Place all three, with silhouettes.
- R2: Mercury to Mars (4 planets). Place all four, with silhouettes.
- R3: "Who lives here?" One empty slot sits between two placed neighbours. Choose from a tray of 3 planets. No silhouettes.
- R4: Mercury to Saturn (6 planets). Place all.
- R5: all 8 planets. The screen is too small for 8 slots plus a tray at 72 dp, so solve this in your plan. A suggested approach: two chapters (the four inner planets, then the four outer planets, with the inner four already placed), then a final round with all 8 and a scrolling or wrapping runway. Never go below 64 dp.

A wrong placement follows the hint ladder in AGENTS.md section 5.5: the planet springs back to the tray with a soft "boop", Orbi tilts his head, and the ghost hand shows the move. A mission is 5 rounds. Each finished round draws one more star of a constellation across the top; five stars finish a picture (a rocket, a comet, a ringed planet). A mission always finishes.

Feedback follows the three tiers in AGENTS.md section 5.4. After a mission, show the finished constellation and a calm return to the hub.

## Motion (build the shared motion system first, then use it everywhere)
Implement AGENTS.md section 6.1 in full before building any scene: js/core/tween.js (tweens, springs, timelines, stagger, cancel, fast-forward), js/render/transition.js, the named easings in css/tokens.css, and docs/MOTION.md. Then give every scene below these animations. Each gets an id in docs/MOTION.md with trigger, duration, easing and reduce-motion variant.
- Boot to Hub (about 1.8 s, skippable by touch): the Sun blooms from a point, the camera pulls back, the planets fly out from the Sun into their orbits (inner planet first, 80 ms apart, each overshooting its lane slightly and settling), the two stations drift in along their orbits, Orbi floats in on a curved path and does one blink.
- Hub to a mode (about 550 ms): the touched station grows to fill the screen and its live preview becomes the first frame of the game, while the other stations and planets slide away along their orbits and dim. Going home reverses it. A touch mid-transition fast-forwards it in 100 ms or less.
- Hub planets: a touch makes the planet squash, spring up, ring-ripple and sparkle with its note, then settle. They also lean slightly toward your finger before you release.
- Playground: the camera glides to the touched planet with a small overshoot (about 600 ms) while the others fade back and the Sun stays lit. Leaving glides out again. Each toy has anticipation and follow-through: Sun (the light swells slowly while held, the tiny Earths pour in with a little bounce as they land and fade into the glow); Mercury (a small wind-up, then a fast lap with a motion smear, a settle, and the ring dots lighting one by one); Venus (it spins opposite to the drag, slowing with friction; the arrow pair eases in); Earth (inertia on the turn, city lights fading in as night arrives, the Moon trailing a faint arc); Mars (dust billows up and tints the planet, then settles slowly on release); Jupiter (bands stretch and swirl with the finger and relax back; 11 tiny Earths drop in and line up across the face, one every 70 ms); Saturn (the ring tilts with a wobble that decays, ice chunks glint); Uranus (a lean, a roll with overshoot onto its side, the ring swinging vertical); Neptune (wind streaks race out from the finger and curve round the planet).
- Parade: pieces in the tray bob gently and tilt to face the finger; the picked-up planet lifts with a deeper shadow and tilts toward its direction of travel; slots lean toward a hovering planet and brighten (the pull before the snap); snap = squash + ring ripple + haptic, with a small ripple wave through neighbouring slots; a miss springs back along a curved path with the wobble easing. Between rounds, finished planets hop away in the direction they travelled while the next ones arrive staggered. Each round's star flies along a curve to the constellation, lights with a ring, and its line draws in; at mission end the picture comes alive for a moment, then lifts away into the hub.
- Chrome: the mute icon's sound waves collapse into a cross when muted; the home button and mute enter with a staggered scale-in; rotating the device glides every element to its new place within 400 ms.

## H. Settings
- A mute button on every screen. Reduce motion follows the OS setting. Nothing else yet.

## I. Quality and tests
Follow AGENTS.md section 11 in full: at least 3 review passes with screenshots and frame sequences in qa/screens/phase-1/, notes in qa/review-1.md, unit tests, Playwright tests that play every rung (including misses and all three hint levels), the coach test (round 1 of every mode completed by following only the ghost hand), the wordless check, the motion checks from section 11.4, a rotation test, a pause and resume test, DOM-based target-size and contrast checks, and a 4x CPU-throttled frame-time check.

## Definition of Done
- docs/MOTION.md lists every animation added in this phase, each with a reduce-motion variant. The motion checks from AGENTS.md section 11.4 pass for every new transition, and the flash-rate check passes on frame sequences of every new transition and celebration.
- Every deliverable above works on the five screen sizes in AGENTS.md section 11.2.
- Rubric scores are 4 or higher everywhere, with the scores written in qa/review-1.md.
- CI is green and publishes a debug APK. Say clearly whether you also installed or ran the APK yourself.
- docs/DECISIONS.md, docs/SCIENCE.md and the README are up to date. data/planets.json facts are marked verified true or false, each with its demo.
- A short docs/PLAYTEST-1.md for me: what to watch for while Ayaan plays (especially whether he starts without help and which icons he misreads), plus the 5 things you are least sure about.
- The honest report from AGENTS.md section 11.5. Then stop and wait for me.