/**
 * Procedural Sun Renderer (js/render/sun.js).
 * Paper-cut planetarium styling: warm glowing disc with slow, gentle pulsing corona.
 * No flicker, calm and warm.
 */

export class SunRenderer {
  constructor() {
    this.pulsePhase = 0;
  }

  update(dt) {
    this.pulsePhase += dt * 0.8; // Gentle breathing period ~7.8s
  }

  render(ctx, x, y, radius) {
    ctx.save();

    const breathe = Math.sin(this.pulsePhase) * (radius * 0.06);
    const effRadius = radius + breathe;

    // Layer 1: Outer ambient solar glow
    const outerGlow = ctx.createRadialGradient(x, y, effRadius * 0.8, x, y, effRadius * 2.2);
    outerGlow.addColorStop(0, 'rgba(255, 179, 0, 0.38)');
    outerGlow.addColorStop(0.5, 'rgba(255, 112, 67, 0.18)');
    outerGlow.addColorStop(1, 'rgba(255, 112, 67, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, effRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: Concentric paper-cut corona ring
    ctx.beginPath();
    ctx.arc(x, y, effRadius * 1.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 193, 7, 0.28)';
    ctx.fill();

    // Layer 3: Sun disc with warm radial gradient
    const sunGrad = ctx.createRadialGradient(x - effRadius * 0.25, y - effRadius * 0.25, effRadius * 0.1, x, y, effRadius);
    sunGrad.addColorStop(0, '#FFF9C4'); // Light warm core
    sunGrad.addColorStop(0.5, '#FFD54F');
    sunGrad.addColorStop(0.85, '#FFA000');
    sunGrad.addColorStop(1, '#FF6F00'); // Deep amber edge

    ctx.beginPath();
    ctx.arc(x, y, effRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.shadowColor = 'rgba(255, 160, 0, 0.6)';
    ctx.shadowBlur = effRadius * 0.4;
    ctx.fill();

    ctx.restore();
  }
}

export const sunRenderer = new SunRenderer();
