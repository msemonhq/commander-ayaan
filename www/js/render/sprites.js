/**
 * Sprite Cache & Offscreen Pre-rendering (js/render/sprites.js).
 * Caches procedural planets at current devicePixelRatio (capped at 2.0).
 */
import { planetRenderer } from './planet.js';

export class SpriteCache {
  constructor() {
    this.cache = new Map();
    this.dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.0) : 1;
    this.baseSize = 96; // Base texture diameter
  }

  init(planetList = []) {
    this.cache.clear();
    const planetIds = planetList.length > 0 ? planetList : [
      'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'
    ];

    for (const id of planetIds) {
      this.cachePlanet(id);
    }
  }

  cachePlanet(id) {
    const canvas = document.createElement('canvas');
    // Account for Saturn's wide rings (width needs 2.5x radius)
    const factor = (id === 'saturn') ? 2.6 : 1.3;
    const w = Math.ceil(this.baseSize * factor * this.dpr);
    const h = Math.ceil(this.baseSize * factor * this.dpr);

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.scale(this.dpr, this.dpr);

    const radius = this.baseSize * 0.42;
    const cx = (w / this.dpr) / 2;
    const cy = (h / this.dpr) / 2;

    planetRenderer.renderPlanet(ctx, id, cx, cy, radius, {});

    this.cache.set(id, {
      canvas,
      width: w / this.dpr,
      height: h / this.dpr,
      radius
    });
  }

  drawCachedPlanet(ctx, id, x, y, drawRadius, animState = {}) {
    // If planet has active animation (like spinning or dust), render directly
    if (animState.active) {
      planetRenderer.renderPlanet(ctx, id, x, y, drawRadius, animState);
      return;
    }

    const cached = this.cache.get(id);
    if (!cached) {
      planetRenderer.renderPlanet(ctx, id, x, y, drawRadius, animState);
      return;
    }

    const scale = drawRadius / cached.radius;
    const dw = cached.width * scale;
    const dh = cached.height * scale;

    ctx.drawImage(cached.canvas, x - dw / 2, y - dh / 2, dw, dh);
  }
}

export const spriteCache = new SpriteCache();
