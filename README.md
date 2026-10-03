# Commander Ayaan 🚀
*A Gentle, Tactile Solar System Workshop for Early Explorers*

Commander Ayaan is an HTML5 Canvas game wrapped with Capacitor 8 for Android, built specifically for six-year-old curiosity. In this workshop, the solar system is a tactile toy box: Ayaan explores real planets, discovers how orbits work, orders celestial bodies on a spatial runway, and solves playful challenges alongside Orbi, his friendly robotic companion.

---

## 🌟 Phase 1 Features
- **Paper-cut Planetarium Visual Style**: Procedural Canvas 2D art for the Sun, Moon, Orbi, and all 8 planets with distinctive textures, silhouettes, and cloud bands.
- **Living Mission Control Hub**: Real-time orbiting planets on rails obeying monotone speed laws (closer laps faster), interactive taps emitting pentatonic notes and stardust.
- **Meet the Planets**: Free exploration mode with smooth camera glide, signature animations (Venus reverse spin, Earth's orbiting Moon, Mars dust puffs, Saturn's ring wobble), and NASA-verified facts (each 12 words or fewer).
- **Planet Parade**: Spatial-reasoning runway ordering game with 5 adaptive rungs, dot counting scaffolding, and a gentle 3-step hint ladder (soft boop wobble -> glowing slot -> Orbi co-play).
- **Pentatonic WebAudio Synth**: Harmonic bells, celestas, and marimba tones; capped master limiter; instant 1-tap mute.
- **Zero Ads, Zero Tracking, 100% Offline**: Private, safe, and respectful of early readers.

---

## 🚀 Quick Start (Local Web)

### Prerequisites
- Node.js 22 or higher (tested with Node 24)
- npm 10 or higher

### Running Locally
```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests
```bash
# Run unit test suite (adaptive engine, hint ladder, orbits math, i18n facts)
npm test

# Run Playwright end-to-end tests
npm run test:e2e
```

---

## 📱 How to Download and Install the Android APK

A fresh debug APK is automatically built and tested on every push via GitHub Actions.

1. Go to the project's GitHub Actions page:
   **[GitHub Actions Runs](https://github.com/msemonhq/commander-ayaan/actions)**
2. Click on the latest green run on the `main` branch.
3. Scroll down to the **Artifacts** section at the bottom of the summary page.
4. Download the artifact named:
   `ayaan-v0.1.0-<commit>-debug.apk`
5. Extract the `.zip` archive on your computer or phone to obtain the `.apk` file.
6. Transfer the `.apk` to your Android device (Android 7.0 / API 24 or newer).
7. Tap the file in your device file manager to install. When Android prompts that the APK is from an unknown source, enable **"Allow from this source"**.
8. Launch **Ayaan** and enjoy!

*Note: This is a debug build intended for testing and playtesting.*

---

## 🏛️ Project Architecture
```
Commander Ayaan/
├── AGENTS.md                  # Master Brief and standing rules
├── capacitor.config.json      # Capacitor 8 mobile configuration
├── .github/workflows/         # CI/CD pipeline (build-apk.yml)
├── android/                   # Generated native Android project
├── docs/                      # Scientific foundations, decisions, playtest guides
├── qa/                        # Screen review archives and playtest logs
├── tests/
│   ├── unit/                  # Adaptive, hints, orbits, and i18n unit tests
│   └── e2e/                   # Playwright multi-viewport integration tests
└── www/                       # Pure ES Module web application
    ├── css/                   # tokens.css, base.css, ui.css
    ├── js/
    │   ├── core/              # loop.js, scenes.js, input.js, events.js, storage.js, audio.js
    │   ├── sim/               # orbits.js, camera.js
    │   ├── render/            # sun.js, planet.js, moon.js, orbi.js, stars.js, particles.js
    │   ├── scenes/            # boot.js, hub.js, meet.js, parade.js
    │   └── systems/           # adaptive.js, hints.js, rewards.js, session.js
    └── index.html
```
