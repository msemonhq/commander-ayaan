/**
 * 3-Layer Parallax Starfield (js/render/stars.js).
 * Drifts slowly upward to provide a gentle zero-gravity sensation.
 */
import { RNG, rng } from '../core/rng.js';

export class Starfield {
  constructor() {
    this.layers = [
      { count: 60, speed: 4, size: 1.2, minAlpha: 0.25, maxAlpha: 0.55, stars: [] },
      { count: 35, speed: 8, size: 2.0, minAlpha: 0.45, maxAlpha: 0.75, stars: [] },
      { count: 18, speed: 15, size: 2.8, minAlpha: 0.65, maxAlpha: 0.95, stars: [] }
    ];
    this.width = 800;
    this.height = 600;
    this.initialized = false;
  }

  init(width, height) {
    this.width = width;
    this.height = height;

    const starRng = new RNG(42819);

    for (const layer of this.layers) {
      layer.stars = [];
      for (let i = 0; i < layer.count; i++) {
        layer.stars.push({
          x: starRng.next() * width,
          y: starRng.next() * height,
          alpha: layer.minAlpha + starRng.next() * (layer.maxAlpha - layer.minAlpha),
          twinkleSpeed: 1.0 + starRng.next() * 2.0,
          twinklePhase: starRng.next() * Math.PI * 2,
          isGold: starRng.next() > 0.85
        });
      }
    }
    this.initialized = true;
  }

  resize(width, height) {
    if (!this.initialized || Math.abs(this.width - width) > 100 || Math.abs(this.height - height) > 100) {
      this.init(width, height);
    } else {
      this.width = width;
      this.height = height;
    }
  }

  update(dt, reduceMotion = false) {
    if (reduceMotion) return; // Honour OS / app reduce motion setting

    for (const layer of this.layers) {
      const dy = layer.speed * dt;
      for (const s of layer.stars) {
        s.y -= dy; // Drift upward
        if (s.y < 0) {
          s.y += this.height;
          s.x = (s.x + (rng.next() * 40 - 20) + this.width) % this.width;
        }
        s.twinklePhase += s.twinkleSpeed * dt;
      }
    }
  }

  render(ctx) {
    ctx.save();
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      for (const s of layer.stars) {
        const twinkle = Math.sin(s.twinklePhase) * 0.2;
        const alpha = Math.max(0.1, Math.min(1.0, s.alpha + twinkle));

        ctx.fillStyle = s.isGold ? `rgba(255, 224, 130, ${alpha})` : `rgba(220, 230, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, layer.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Near layer gets subtle 4-point twinkle sparkle
        if (l === 2 && alpha > 0.75) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(s.x - 4, s.y);
          ctx.lineTo(s.x + 4, s.y);
          ctx.moveTo(s.x, s.y - 4);
          ctx.lineTo(s.x, s.y + 4);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
}

export const starfield = new Starfield();
