/**
 * 3-Layer Parallax Starfield & Deep Space Background (js/render/stars.js).
 * Includes:
 * - Faint ethereal nebula layers
 * - Distant dust particles
 * - 3 parallax star layers drifting slowly upward
 * - Calm zero-gravity feeling, respects reduce-motion
 */
import { RNG, rng } from '../core/rng.js';

export class Starfield {
  constructor() {
    this.layers = [
      { count: 65, speed: 3.5, size: 1.1, minAlpha: 0.2, maxAlpha: 0.5, stars: [] },
      { count: 35, speed: 7.5, size: 1.9, minAlpha: 0.4, maxAlpha: 0.7, stars: [] },
      { count: 18, speed: 14.0, size: 2.6, minAlpha: 0.6, maxAlpha: 0.95, stars: [] }
    ];
    this.dust = [];
    this.width = 800;
    this.height = 600;
    this.initialized = false;
    this.nebulaOffset = 0;
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
          twinkleSpeed: 0.8 + starRng.next() * 1.5,
          twinklePhase: starRng.next() * Math.PI * 2,
          isGold: starRng.next() > 0.85
        });
      }
    }

    // Distant cosmic dust
    this.dust = [];
    for (let i = 0; i < 25; i++) {
      this.dust.push({
        x: starRng.next() * width,
        y: starRng.next() * height,
        radius: 12 + starRng.next() * 24,
        alpha: 0.03 + starRng.next() * 0.05,
        speed: 1.5 + starRng.next() * 2.5
      });
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
    if (reduceMotion) return;

    this.nebulaOffset += dt * 1.2;

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

    for (const d of this.dust) {
      d.y -= d.speed * dt;
      if (d.y < -d.radius) {
        d.y = this.height + d.radius;
        d.x = rng.next() * this.width;
      }
    }
  }

  render(ctx) {
    if (!this.initialized) return;

    ctx.save();

    // 1. Faint cosmic nebula cloud
    const nebulaGrad = ctx.createRadialGradient(
      this.width * 0.35,
      (this.height * 0.45 - (this.nebulaOffset % this.height) + this.height) % this.height,
      50,
      this.width * 0.35,
      this.height * 0.45,
      this.width * 0.7
    );
    nebulaGrad.addColorStop(0, 'rgba(43, 58, 168, 0.12)');
    nebulaGrad.addColorStop(0.5, 'rgba(24, 32, 82, 0.06)');
    nebulaGrad.addColorStop(1, 'rgba(10, 13, 36, 0)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Distant cosmic dust
    for (const d of this.dust) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(112, 214, 255, ${d.alpha})`;
      ctx.fill();
    }

    // 3. Parallax star layers
    for (const layer of this.layers) {
      for (const s of layer.stars) {
        const twinkle = Math.sin(s.twinklePhase) * 0.25;
        const curAlpha = Math.max(0.1, Math.min(1.0, s.alpha + twinkle));

        ctx.beginPath();
        ctx.arc(s.x, s.y, layer.size, 0, Math.PI * 2);
        ctx.fillStyle = s.isGold ? `rgba(255, 224, 130, ${curAlpha})` : `rgba(255, 255, 255, ${curAlpha})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

export const starfield = new Starfield();
