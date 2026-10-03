/**
 * Procedural Planet Renderer (js/render/planet.js).
 * Distinct identities recognisable by silhouette and pattern, not color alone:
 * - Mercury: small, grey-brown, crater stippling.
 * - Venus: cream-yellow with swirling cloud bands.
 * - Earth: blue oceans, green continents, white cloud swirls.
 * - Mars: rusty orange-red with white polar cap.
 * - Jupiter: biggest, cream and orange bands, Great Red Spot storm.
 * - Saturn: gold-cream, prominent tilted elliptical rings.
 * - Uranus: pale cyan, tipped on side (98 deg), thin rings.
 * - Neptune: deep blue with pale supersonic wind streaks.
 */

export class PlanetRenderer {
  /**
   * Renders a planet by ID onto the 2D context.
   */
  renderPlanet(ctx, id, x, y, radius, animState = {}) {
    ctx.save();
    ctx.translate(x, y);

    switch (id) {
      case 'mercury':
        this.renderMercury(ctx, radius, animState);
        break;
      case 'venus':
        this.renderVenus(ctx, radius, animState);
        break;
      case 'earth':
        this.renderEarth(ctx, radius, animState);
        break;
      case 'mars':
        this.renderMars(ctx, radius, animState);
        break;
      case 'jupiter':
        this.renderJupiter(ctx, radius, animState);
        break;
      case 'saturn':
        this.renderSaturn(ctx, radius, animState);
        break;
      case 'uranus':
        this.renderUranus(ctx, radius, animState);
        break;
      case 'neptune':
        this.renderNeptune(ctx, radius, animState);
        break;
      default:
        this.renderGeneric(ctx, radius, '#888888');
    }

    ctx.restore();
  }

  // Base circular sphere with soft shadow/light gradient
  drawBaseSphere(ctx, radius, colorLight, colorDark) {
    const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, colorLight);
    grad.addColorStop(1, colorDark);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Clip to planet sphere boundary
  clipSphere(ctx, radius) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
  }

  // 1. Mercury: small, grey-brown, cratered
  renderMercury(ctx, radius, state) {
    this.drawBaseSphere(ctx, radius, '#B0AAA2', '#5E5852');

    ctx.save();
    this.clipSphere(ctx, radius);

    // Procedural craters
    const craters = [
      { x: -radius * 0.3, y: -radius * 0.2, r: radius * 0.22 },
      { x: radius * 0.25, y: -radius * 0.35, r: radius * 0.16 },
      { x: radius * 0.1, y: radius * 0.3, r: radius * 0.26 },
      { x: -radius * 0.4, y: radius * 0.35, r: radius * 0.14 },
      { x: radius * 0.45, y: radius * 0.15, r: radius * 0.12 }
    ];

    for (const c of craters) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(64, 58, 52, 0.45)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(210, 204, 196, 0.3)';
      ctx.lineWidth = Math.max(1, radius * 0.04);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Venus: cream-yellow with swirling cloud bands (spins backwards)
  renderVenus(ctx, radius, state) {
    this.drawBaseSphere(ctx, radius, '#FFF3C4', '#D4A338');

    ctx.save();
    this.clipSphere(ctx, radius);

    const spinAngle = state.spinAngle || 0;
    ctx.rotate(-spinAngle); // Backwards spin

    ctx.fillStyle = 'rgba(224, 169, 58, 0.35)';
    for (let y = -radius * 0.8; y <= radius * 0.8; y += radius * 0.35) {
      ctx.beginPath();
      ctx.ellipse(0, y, radius * 1.1, radius * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirling storm bands
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = radius * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // 3. Earth: blue with green continents & white swirl clouds
  renderEarth(ctx, radius, state) {
    this.drawBaseSphere(ctx, radius, '#5CADFF', '#1E497A');

    ctx.save();
    this.clipSphere(ctx, radius);

    // Green landmasses (stylised paper-cut shapes)
    ctx.fillStyle = '#48C774';
    // Continent 1
    ctx.beginPath();
    ctx.ellipse(-radius * 0.3, -radius * 0.2, radius * 0.35, radius * 0.45, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Continent 2
    ctx.beginPath();
    ctx.ellipse(radius * 0.3, radius * 0.25, radius * 0.4, radius * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // White cloud swirls
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = radius * 0.12;
    ctx.beginPath();
    ctx.arc(-radius * 0.1, -radius * 0.1, radius * 0.5, 0.3, Math.PI * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(radius * 0.15, radius * 0.2, radius * 0.6, Math.PI * 1.1, Math.PI * 1.7);
    ctx.stroke();

    ctx.restore();
  }

  // 4. Mars: rusty orange-red with white polar cap
  renderMars(ctx, radius, state) {
    this.drawBaseSphere(ctx, radius, '#FF7A45', '#9C2E0C');

    ctx.save();
    this.clipSphere(ctx, radius);

    // Dark Martian basalt patches
    ctx.fillStyle = 'rgba(117, 30, 4, 0.4)';
    ctx.beginPath();
    ctx.ellipse(radius * 0.1, radius * 0.1, radius * 0.5, radius * 0.25, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // White ice polar cap at top
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.85, radius * 0.4, radius * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 5. Jupiter: biggest, cream and orange bands, Great Red Spot
  renderJupiter(ctx, radius, state) {
    this.drawBaseSphere(ctx, radius, '#FFE8D6', '#B07D48');

    ctx.save();
    this.clipSphere(ctx, radius);

    // Cloud bands
    const bandColors = [
      'rgba(186, 115, 59, 0.6)',
      'rgba(240, 214, 180, 0.5)',
      'rgba(168, 92, 38, 0.65)',
      'rgba(245, 222, 192, 0.5)',
      'rgba(186, 115, 59, 0.6)'
    ];

    let bandY = -radius * 0.7;
    for (const color of bandColors) {
      ctx.fillStyle = color;
      ctx.fillRect(-radius, bandY, radius * 2, radius * 0.28);
      bandY += radius * 0.32;
    }

    // Great Red Spot storm
    const spotAngle = state.swirlAngle || 0;
    ctx.save();
    ctx.translate(radius * 0.32, radius * 0.24);
    ctx.rotate(spotAngle);
    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.24, radius * 0.15, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = radius * 0.03;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // 6. Saturn: gold-cream, prominent tilted elliptical rings
  renderSaturn(ctx, radius, state) {
    const ringTilt = (state.tilt || -0.35);

    // Draw back part of rings behind planet
    ctx.save();
    ctx.rotate(ringTilt);
    this.drawSaturnRings(ctx, radius, true);
    ctx.restore();

    // Planet body
    this.drawBaseSphere(ctx, radius, '#FFF1C5', '#BD9B42');
    ctx.save();
    this.clipSphere(ctx, radius);

    // Subtle bands
    ctx.fillStyle = 'rgba(189, 155, 66, 0.35)';
    ctx.fillRect(-radius, -radius * 0.2, radius * 2, radius * 0.18);
    ctx.fillRect(-radius, radius * 0.15, radius * 2, radius * 0.15);
    ctx.restore();

    // Draw front part of rings in front of planet
    ctx.save();
    ctx.rotate(ringTilt);
    this.drawSaturnRings(ctx, radius, false);
    ctx.restore();
  }

  drawSaturnRings(ctx, radius, backOnly) {
    const rOuter = radius * 2.2;
    const rInner = radius * 1.35;
    const ryRatio = 0.32;

    ctx.save();
    ctx.beginPath();
    if (backOnly) {
      ctx.rect(-rOuter * 1.2, -rOuter * ryRatio * 1.2, rOuter * 2.4, rOuter * ryRatio * 1.2);
    } else {
      ctx.rect(-rOuter * 1.2, 0, rOuter * 2.4, rOuter * ryRatio * 1.2);
    }
    ctx.clip();

    // Outer Ring
    ctx.beginPath();
    ctx.ellipse(0, 0, rOuter, rOuter * ryRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(238, 206, 137, 0.75)';
    ctx.fill();

    // Cassini Division
    ctx.beginPath();
    ctx.ellipse(0, 0, rOuter * 0.84, rOuter * 0.84 * ryRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 13, 36, 0.4)';
    ctx.fill();

    // Inner Ring
    ctx.beginPath();
    ctx.ellipse(0, 0, rOuter * 0.78, rOuter * 0.78 * ryRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(247, 224, 172, 0.85)';
    ctx.fill();

    // Clear inner hole
    ctx.beginPath();
    ctx.ellipse(0, 0, rInner, rInner * ryRatio, 0, 0, Math.PI * 2);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();

    ctx.restore();
  }

  // 7. Uranus: pale cyan, tipped on side, thin ring
  renderUranus(ctx, radius, state) {
    ctx.save();
    // Tipped on side ~98 deg
    const rollAngle = state.rollAngle || (Math.PI * 0.54);
    ctx.rotate(rollAngle);

    // Thin vertical ring (back half)
    ctx.save();
    ctx.beginPath();
    ctx.rect(-radius * 2, -radius * 2, radius * 2, radius * 4);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.6, radius * 0.15, Math.PI / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(195, 245, 255, 0.4)';
    ctx.lineWidth = radius * 0.08;
    ctx.stroke();
    ctx.restore();

    this.drawBaseSphere(ctx, radius, '#D0F6FF', '#4EA8BF');

    // Thin vertical ring (front half)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, -radius * 2, radius * 2, radius * 4);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.6, radius * 0.15, Math.PI / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(195, 245, 255, 0.55)';
    ctx.lineWidth = radius * 0.08;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // 8. Neptune: deep blue with pale supersonic wind streaks
  renderNeptune(ctx, radius, state) {
    this.drawBaseSphere(ctx, radius, '#5078E6', '#142566');

    ctx.save();
    this.clipSphere(ctx, radius);

    // Wind streaks
    const windOffset = (state.windOffset || 0) % (radius * 2);
    ctx.strokeStyle = 'rgba(180, 215, 255, 0.5)';
    ctx.lineWidth = radius * 0.06;

    const streakY = [-radius * 0.4, -radius * 0.05, radius * 0.35];
    for (let i = 0; i < streakY.length; i++) {
      const y = streakY[i];
      ctx.beginPath();
      ctx.moveTo(-radius + ((windOffset + i * 15) % (radius * 2)), y);
      ctx.lineTo(radius * 0.6 + ((windOffset + i * 15) % (radius * 2)), y);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderGeneric(ctx, radius, color) {
    this.drawBaseSphere(ctx, radius, '#DDDDDD', color);
  }
}

export const planetRenderer = new PlanetRenderer();
