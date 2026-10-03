# Science Foundations & Orbital Reference

## 1. Scientific Metaphors & Principles
- **The Sun is a Star**: The center of our solar system, containing 99.8% of its mass.
- **Gravity is an "Invisible Pull"**: Gravity hugs objects together. We avoid misleading metaphors like "string", "rubber band", or "magnets".
- **An Orbit is "Falling Around"**: As an object moves sideways while gravity pulls inward, it curves around rather than crashing down.
- **The Moon is Not a Planet**: Earth's natural satellite.
- **Not to Scale Disclaimer**: Displayed prominently on system-wide views because real celestial distances and size ratios (e.g., Sun vs Earth) would render planets invisible specks on a 6-inch phone screen.

## 2. Orbital Periods and On-Screen Speeds
Real planetary periods range from 88 days (Mercury) to 165 years (Neptune). If rendered strictly to real time, outer planets would appear stationary to a child.
We apply a strictly **monotone mapping** from real semi-major axis $a$ and orbital period $T$ to on-screen angular speed $\omega$:

$$\omega(r) = \frac{\omega_0}{r^{0.55}}$$

where $r$ is the normalized visual orbit lane index ($1$ to $8$).
Properties of this mapping:
- **Strictly monotone**: Mercury is fastest, Neptune is slowest. Every inner planet laps outer planets.
- **Dynamic visibility**: Every planet's motion is perceivable within 5 seconds of watching without dizzying speeds.

| Body | Real Period | Visual Radius (norm) | Visual Period (sec) | Relative Speed Order |
| :--- | :--- | :--- | :--- | :--- |
| **Mercury** | 88 Earth days | 0.22 | 8.0 s | 1 (Fastest) |
| **Venus** | 225 Earth days | 0.32 | 12.0 s | 2 |
| **Earth** | 365.25 Earth days | 0.44 | 16.0 s | 3 |
| **Mars** | 687 Earth days | 0.56 | 21.0 s | 4 |
| **Jupiter** | 11.86 Earth years | 0.70 | 28.0 s | 5 |
| **Saturn** | 29.45 Earth years | 0.84 | 36.0 s | 6 |
| **Uranus** | 84.0 Earth years | 0.98 | 46.0 s | 7 |
| **Neptune** | 164.8 Earth years | 1.12 | 58.0 s | 8 (Slowest) |

## 3. NASA Science Verified Facts
Every fact in `data/planets.json` is verified against [NASA Science](https://science.nasa.gov):

1. **Sun**:
   - Fact 1: "The Sun is a star. Over one million Earths could fit inside!" (Verified: [NASA Sun Facts](https://science.nasa.gov/sun/facts/))
   - Fact 2: "The Sun holds almost all the mass in our solar system!" (Verified: 99.86% of total mass).
2. **Mercury**:
   - Fact 1: "Mercury is the smallest planet and closest to the Sun!" (Verified: [NASA Mercury Overview](https://science.nasa.gov/mercury/facts/))
   - Fact 2: "A year on Mercury is only eighty-eight Earth days!" (Verified: 87.97 days orbit).
3. **Venus**:
   - Fact 1: "Venus spins backwards compared to most other planets!" (Verified: Retrograde rotation).
   - Fact 2: "Venus is the hottest planet because thick air traps heat!" (Verified: ~465°C / 900°F surface temp).
4. **Earth**:
   - Fact 1: "Earth is our home and the only known place with life!" (Verified).
   - Fact 2: "Earth has one Moon that travels around it every month!" (Verified: 27.3 days orbit).
5. **Mars**:
   - Fact 1: "Mars looks red because of rusty iron dust on its ground!" (Verified: Iron oxide).
   - Fact 2: "Mars has the biggest volcano in the whole solar system!" (Verified: Olympus Mons, 21.9 km high).
6. **Jupiter**:
   - Fact 1: "Jupiter is the biggest planet of all!" (Verified: 11x Earth diameter, >2x mass of all other planets combined).
   - Fact 2: "Jupiter has a giant red storm that has raged for centuries!" (Verified: Great Red Spot).
7. **Saturn**:
   - Fact 1: "Saturn has huge, bright rings made of ice and rock!" (Verified).
   - Fact 2: "Saturn is so light it could float in water!" (Verified: Mean density 0.687 g/cm³).
8. **Uranus**:
   - Fact 1: "Uranus rolls on its side as it circles the Sun!" (Verified: 97.77° axial tilt).
   - Fact 2: "Uranus is a giant ice ball with faint rings!" (Verified: Ice giant).
9. **Neptune**:
   - Fact 1: "Neptune is the farthest planet from the Sun!" (Verified: ~30 AU).
   - Fact 2: "Neptune is deep blue and has the fastest winds!" (Verified: Supersonic winds up to 2,000 km/h).
