/**
 * Orbit Mechanics on Rails (js/sim/orbits.js).
 * Faithful monotone mapping: closer planets orbit faster.
 * angle = angle0 + 2*pi*t/period
 */

export const ORBIT_PERIODS = {
  // Periods in visual seconds for on-screen orbits
  mercury: 10.0,
  venus: 14.5,
  earth: 19.0,
  mars: 25.0,
  jupiter: 34.0,
  saturn: 44.0,
  uranus: 56.0,
  neptune: 70.0
};

export const ORBIT_LANE_INDICES = {
  mercury: 1,
  venus: 2,
  earth: 3,
  mars: 4,
  jupiter: 5,
  saturn: 6,
  uranus: 7,
  neptune: 8
};

/**
 * Computes angular speed (radians/sec) strictly monotone decreasing with lane index.
 */
export function getAngularSpeed(laneIndex) {
  // Period = base * (laneIndex)^0.75
  const basePeriod = 7.0;
  const period = basePeriod * Math.pow(laneIndex, 0.75);
  return (2 * Math.PI) / period;
}

/**
 * Calculates current planet coordinates on rails.
 * @param {number} laneIndex - 1 to 8
 * @param {number} t - time in seconds
 * @param {number} initialPhase - phase angle in radians
 * @param {number} cx - center X (Sun X)
 * @param {number} cy - center Y (Sun Y)
 * @param {number} orbitRadius - radius in pixels
 */
export function calculateOrbitPosition(laneIndex, t, initialPhase, cx, cy, orbitRadius) {
  const omega = getAngularSpeed(laneIndex);
  const angle = initialPhase + omega * t;
  return {
    x: cx + Math.cos(angle) * orbitRadius,
    y: cy + Math.sin(angle) * orbitRadius,
    angle
  };
}
