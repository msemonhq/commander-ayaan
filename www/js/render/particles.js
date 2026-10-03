/**
 * Capped Particle System (js/render/particles.js).
 * Strict budget cap: 120 active particles max to protect mobile battery/framerate.
 */
const MAX_PARTICLES = 120;

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, options = {}) {
    const count = Math.min(options.count || 6, 12);
    const color = options.color || '#FFE082';
    const speed = options.speed || 80;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) {
        this.particles.shift(); // Evict oldest to preserve 120 cap
      }

      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const v = speed * (0.6 + Math.random() * 0.8);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        radius: (options.radius || 3) * (0.8 + Math.random() * 0.4),
        alpha: 1.0,
        decay: options.decay || 1.8,
        color
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    if (this.particles.length === 0) return;
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}

export const particles = new ParticleSystem();
