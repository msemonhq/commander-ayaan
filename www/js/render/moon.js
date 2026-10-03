/**
 * Procedural Moon Renderer (js/render/moon.js).
 * Small grey cratered natural satellite.
 */

export class MoonRenderer {
  renderMoon(ctx, x, y, radius) {
    ctx.save();
    ctx.translate(x, y);

    // Soft gradient base
    const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, '#E0E0E0');
    grad.addColorStop(1, '#8C8C8C');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Craters
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();

    const craters = [
      { x: -radius * 0.25, y: -radius * 0.2, r: radius * 0.25 },
      { x: radius * 0.2, y: radius * 0.25, r: radius * 0.3 },
      { x: radius * 0.3, y: -radius * 0.25, r: radius * 0.15 }
    ];

    for (const c of craters) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(70, 70, 70, 0.45)';
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }
}

export const moonRenderer = new MoonRenderer();
