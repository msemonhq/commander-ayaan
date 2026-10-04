# Motion Inventory (docs/MOTION.md)

This inventory defines the shared motion system for Commander Ayaan, strictly adhering to AGENTS.md section 6.1.
All animations are driven through `js/core/tween.js`, `js/render/transition.js`, or CSS tokens in `css/tokens.css`.
Every animation has a calm, respectful `reduce-motion` fallback.

## 1. Timing Budget Rules
- **Instant feedback**: 80ms – 120ms
- **Micro-interactions**: 150ms – 250ms
- **Standard interaction**: 300ms – 400ms
- **Screen transitions**: 500ms – 700ms (Boot intro skippable <= 1800ms)
- **Round / Milestone celebrations**: <= 1500ms / <= 3000ms
- **Ambient idle loops**: 3s – 12s
- **Input non-blocking**: Touching during any screen transition fast-forwards it within <= 100ms.

---

## 2. Animation Inventory

| Animation ID | Trigger / Action | Duration | Easing | Reduce-Motion Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `boot_intro` | Tap Sun to boot | 1600ms | `out` | Instant fade into Hub (100ms) |
| `hub_planets_orbit` | Continuous background | 10s – 70s | `linear` | Slow rails drift, no parallax |
| `hub_planet_tap_pop` | Tap planet in Hub | 300ms | `spring` | Soft scale 1.05 and glow (100ms) |
| `hub_station_breathe` | Ambient idle on station doors | 3500ms | `inOut` | Stationary, constant soft glow |
| `transition_hub_to_playground` | Tap Playground station | 550ms | `inOut` | Crossfade (100ms), no zoom |
| `transition_hub_to_parade` | Tap Parade station | 550ms | `inOut` | Crossfade (100ms), no zoom |
| `transition_mode_to_hub` | Tap Home icon | 550ms | `inOut` | Crossfade (100ms), no zoom |
| `playground_camera_glide` | Tap planet in overview | 600ms | `inOut` | Fast fade to focused planet (100ms) |
| `toy_sun_light_swell` | Press-and-hold Sun | 800ms | `out` | Instant brightness plateau |
| `toy_mercury_fast_lap` | Flick Mercury | 800ms | `out` | Highlight dot ring directly |
| `toy_venus_reverse_spin` | Drag across Venus | 600ms | `out` | Rotates to opposite face without spin |
| `toy_earth_turn_night` | Drag around Earth | 500ms | `out` | City lights fade in softly |
| `toy_mars_dust_storm` | Press-and-hold Mars | 700ms | `out` | Planet tints red with no particle blur |
| `toy_jupiter_11_earths` | Tap Jupiter | 770ms | `spring` | 11 Earths appear lined up instantly |
| `toy_saturn_ring_tilt` | Drag Saturn ring | 500ms | `wobble` | Tilted ring with no oscillation |
| `toy_uranus_roll_side` | Tap Uranus | 600ms | `springBig` | Immediate 98-degree axial tilt switch |
| `toy_neptune_wind_streak` | Sweep across Neptune | 400ms | `out` | Steady wind streak lines without pulse |
| `parade_tray_lift` | Grab / select tray planet | 150ms | `spring` | Golden border ring, no lift shadow |
| `parade_snap` | Drop near matching slot | 150ms | `spring` | Instant slot fill, 2 sparkles |
| `parade_miss_wobble` | Drop in incorrect slot | 300ms | `wobble` | Smooth glide back to tray, no wobble |
| `parade_flying_star` | Round completed | 600ms | `inOut` | Star directly illuminates in constellation |
| `parade_constellation_line` | Star earned | 400ms | `out` | Line immediately drawn |
| `coach_ghost_hand_tap` | 6s inactivity on tap task | 1400ms loop | `inOut` | Stationary translucent hand with gentle pulse |
| `coach_ghost_hand_drag` | 6s inactivity on drag task | 2000ms loop | `inOut` | Dashed track with stationary hand pointer |
| `overlay_confirm_home` | Android Back pressed | 300ms | `spring` | Simple opacity fade (100ms) |
