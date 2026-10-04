/**
 * Lighting-Led Rendering Module (js/render/lighting.js).
 * The Sun is the light source of the system.
 * Renders:
 * - Day/night terminator oriented toward the Sun
 * - Soft day-night transition edge
 * - Thin rim light on the sunward limb
 * - Faint atmosphere glow
 * - Earth night-side tiny warm city lights
 * - Saturn ring shadow
 * - Inverse-distance brightness nuance
 */

export class LightingEngine {
  constructor() {
    // Atmosphere rim colors by planet
    this.atmosphereColors = {
      venus: 'rgba(255, 235, 170, 0.45)',
      earth: 'rgba(112, 214, 255, 0.55)',
      mars: 'rgba(255, 138, 101, 0.35)',
      jupiter: 'rgba(255, 204, 128, 0.3)',
      uranus: 'rgba(128, 222, 234, 0.5)',
      neptune: 'rgba(68, 138, 255, 0.55)'
    };
  }

  /**
   * Applies realistic sun-directional lighting over a planet body.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {string} planetId 
   * @param {number} x Planet center X
   * @param {number} y Planet center Y
   * @param {number} radius Planet radius
   * @param {number} sunX Sun center X
   * @param {number} sunY Sun center Y
   * @param {object} options Extra flags (e.g. showNightLights, tilt)
   */
  applyLighting(ctx, planetId, x, y, radius, sunX, sunY, options = {}) {
    if (planetId === 'sun') return; // The Sun is the light source

    const dx = sunX - x;
    const dy = sunY - y;
    const dist = Math.hypot(dx, dy) || 1;
    // Angle pointing directly towards the Sun
    const sunAngle = Math.atan2(dy, dx);
    const shadowAngle = sunAngle + Math.PI;

    ctx.save();

    // Clip to the circular planet body
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    // 1. Directional Day/Night Shading Gradient
    // We position a linear gradient from the Sun-facing edge to the anti-Sun edge
    const gradStartX = x + Math.cos(sunAngle) * radius * 0.8;
    const gradStartY = y + Math.sin(sunAngle) * radius * 0.8;
    const gradEndX = x + Math.cos(shadowAngle) * radius;
    const gradEndY = y + Math.sin(shadowAngle) * radius;

    const shadeGrad = ctx.createLinearGradient(gradStartX, gradStartY, gradEndX, gradEndY);
    shadeGrad.addColorStop(0, 'rgba(255, 240, 200, 0.15)'); // Soft solar highlight
    shadeGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.0)');       // Daytime true color
    shadeGrad.addColorStop(0.55, 'rgba(10, 13, 36, 0.45)');  // Soft terminator
    shadeGrad.addColorStop(1, 'rgba(5, 7, 22, 0.88)');      // Deep night shadow

    ctx.fillStyle = shadeGrad;
    ctx.fill();

    // 2. Earth Night-Side City Lights
    if (planetId === 'earth') {
      this.renderCityLights(ctx, x, y, radius, shadowAngle);
    }

    // 3. Saturn Ring Shadow on Body
    if (planetId === 'saturn') {
      this.renderRingShadow(ctx, x, y, radius, sunAngle);
    }

    ctx.restore();

    // 4. Sunward Rim Light & Atmosphere Glow (outside clip)
    ctx.save();
    this.renderAtmosphereGlow(ctx, planetId, x, y, radius, sunAngle);
    ctx.restore();
  }

  renderCityLights(ctx, cx, cy, r, shadowAngle) {
    // Night center is roughly at cx + cos(shadowAngle)*r*0.5
    const nightCenterX = cx + Math.cos(shadowAngle) * (r * 0.45);
    const nightCenterY = cy + Math.sin(shadowAngle) * (r * 0.45);

    // Stippled warm golden dots
    const cityOffsets = [
      { dx: -0.15, dy: -0.1, s: 1.2, a: 0.85 },
      { dx: -0.05, dy: 0.12, s: 1.5, a: 0.9 },
      { dx: 0.1, dy: -0.08, s: 1.0, a: 0.75 },
      { dx: 0.18, dy: 0.05, s: 1.3, a: 0.8 },
      { dx: -0.22, dy: 0.04, s: 1.1, a: 0.7 },
      { dx: 0.02, dy: -0.18, s: 1.4, a: 0.85 },
      { dx: 0.08, dy: 0.18, s: 1.2, a: 0.75 }
    ];

    ctx.save();
    for (const pt of cityOffsets) {
      const px = nightCenterX + pt.dx * r;
      const py = nightCenterY + pt.dy * r;
      if (Math.hypot(px - cx, py - cy) < r * 0.9) {
        ctx.beginPath();
        ctx.arc(px, py, pt.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 213, 79, ${pt.a})`;
        ctx.shadowColor = 'rgba(255, 179, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderRingShadow(ctx, cx, cy, r, sunAngle) {
    // Soft horizontal/angled band across the globe representing shadow cast by rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.25); // Ring tilt angle
    ctx.beginPath();
    ctx.rect(-r * 0.9, -r * 0.12, r * 1.8, r * 0.24);
    ctx.fillStyle = 'rgba(10, 13, 36, 0.65)';
    ctx.fill();
    ctx.restore();
  }

  renderAtmosphereGlow(ctx, planetId, cx, cy, r, sunAngle) {
    const atmoColor = this.atmosphereColors[planetId];
    if (!atmoColor) return;

    // Thin sunward rim arc
    ctx.beginPath();
    // Arc spanning +/- 70 degrees from sunward angle
    ctx.arc(cx, cy, r + 0.8, sunAngle - Math.PI * 0.38, sunAngle + Math.PI * 0.38);
    ctx.strokeStyle = atmoColor;
    ctx.lineWidth = Math.max(1.8, r * 0.08);
    ctx.shadowColor = atmoColor;
    ctx.shadowBlur = 8;
    ctx.stroke();
  }
}

export const lighting = new LightingEngine();
