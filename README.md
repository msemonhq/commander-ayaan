# Commander Ayaan 🚀
*A Gentle, Wordless Solar System Workshop for Early Explorers (V2)*

Commander Ayaan is an HTML5 Canvas game wrapped with Capacitor 8 for Android, built specifically for a six-year-old's hands and eyes. In this workshop, the solar system is a tactile toy box: Ayaan explores real planets, spins them with a finger, orders celestial bodies on a spatial runway, and solves playful challenges alongside Orbi, his friendly robot companion.

There are no sentences on screen during play. A translucent ghost hand shows gestures, lighting from the Sun carries scientific meaning, and results are physical.

---

## 🌟 Phase 1 Features
- **Wordless Ghost Hand & Coach**: Translucent animated glove demonstrating gestures (tap, drag, hold, flick) on first encounter or after 6s idle.
- **Lighting-Led Rendering**: Every body is dynamically illuminated by the Sun with soft day/night terminators, rim highlights, atmosphere glows, and tiny night-side Earth city lights.
- **Shared Motion System**: Every state change, transition, and touch animates with anticipation, action, and settle. Non-blocking: touches during transitions fast-forward smoothly in <= 100ms.
- **Living Hub**: Sun at center, all 8 planets orbiting on rails, and 2 live-preview circular stations (Playground and Parade) with zero text labels.
- **Planet Playground**: Tactile toys demonstrating true science:
  - **Sun**: Hold to brighten; stream of tiny Earths pours in (>1.3M fill).
  - **Mercury**: Flick for fast lap; 4-dot ring lights up (4 laps vs Earth's 1).
  - **Venus**: Drag across to spin backwards opposite to finger; reverse arrow pair.
  - **Earth**: Turn with inertia; night city lights illuminate; drag orbiting Moon.
  - **Mars**: Hold to stir up billowing rust dust storm.
  - **Jupiter**: Swirl cloud bands and Red Spot; tap to line up 11 Earths across face.
  - **Saturn**: Drag ring to tilt with decaying wobble and ice sparkles.
  - **Uranus**: Tap to roll on side with vertical spinning ring.
  - **Neptune**: Sweep across for supersonic wind streaks.
- **Planet Parade**: Spatial reasoning runway game placing planets by distance from Sun:
  - 5 adaptive rungs (R1: 3 planets, R2: 4 planets, R3: "who lives here?", R4: 6 planets, R5: 8 planets in two chapters).
  - 3-step gentle hint ladder (wobble boop -> slower demo with breathing slot -> Orbi co-play).
  - 5-star constellation drawing star by star across top.
- **Touch & Accessibility Standards**: Touch targets strictly >= 72dp (min 64dp + 40% hit expansion), text contrast >= 7:1, 300ms double-tap protection, reduce-motion support.
- **Zero Ads, Zero Tracking, 100% Offline**: Private, safe, and child-protective.

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
# Run unit test suite (adaptive engine, hint ladder, orbits math, storage, gestures, coach)
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
