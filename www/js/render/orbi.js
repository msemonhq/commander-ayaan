/**
 * Procedural Orbi Companion Robot (js/render/orbi.js).
 * Original friendly floating robot with expressive digital eyes.
 * Poses: idle, point, cheer, think, sleepy.
 */

export class OrbiRenderer {
  constructor() {
    this.floatPhase = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
  }

  update(dt, reduceMotion = false) {
    if (!reduceMotion) {
      this.floatPhase += dt * 2.2; // Float bob period ~2.8s
    }
    this.blinkTimer += dt;
    if (this.blinkTimer > 3.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.7) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }
  }

  render(ctx, x, y, size = 64, pose = 'idle', reduceMotion = false) {
    ctx.save();
    const bob = reduceMotion ? 0 : Math.sin(this.floatPhase) * 6;
    ctx.translate(x, y + bob);

    const s = size / 64; // Scale factor

    // Thruster glow underneath
    const thrusterGrad = ctx.createRadialGradient(0, 24 * s, 2 * s, 0, 28 * s, 14 * s);
    thrusterGrad.addColorStop(0, 'rgba(112, 214, 255, 0.8)');
    thrusterGrad.addColorStop(1, 'rgba(112, 214, 255, 0)');
    ctx.fillStyle = thrusterGrad;
    ctx.beginPath();
    ctx.arc(0, 26 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();

    // Antenna
    ctx.strokeStyle = '#D0D6F5';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(0, -22 * s);
    ctx.lineTo(0, -32 * s);
    ctx.stroke();

    // Antenna glowing tip
    ctx.fillStyle = '#70D6FF';
    ctx.shadowColor = '#70D6FF';
    ctx.shadowBlur = 8 * s;
    ctx.beginPath();
    ctx.arc(0, -33 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Robot capsule body (smooth white/silver dome)
    const bodyGrad = ctx.createLinearGradient(-20 * s, -20 * s, 20 * s, 20 * s);
    bodyGrad.addColorStop(0, '#FFFFFF');
    bodyGrad.addColorStop(0.7, '#DDE4FA');
    bodyGrad.addColorStop(1, '#B0BAE8');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-22 * s, -22 * s, 44 * s, 44 * s, [22 * s, 22 * s, 16 * s, 16 * s]);
    ctx.fill();
    ctx.strokeStyle = '#959FCE';
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    // Dark glossy visor screen
    ctx.fillStyle = '#0D1130';
    ctx.beginPath();
    ctx.roundRect(-16 * s, -14 * s, 32 * s, 20 * s, 10 * s);
    ctx.fill();

    // Glowing cyan digital eyes
    ctx.fillStyle = '#70D6FF';
    ctx.shadowColor = '#70D6FF';
    ctx.shadowBlur = 6 * s;

    if (this.isBlinking && pose !== 'sleepy') {
      // Blinking slit
      ctx.fillRect(-11 * s, -5 * s, 8 * s, 2 * s);
      ctx.fillRect(3 * s, -5 * s, 8 * s, 2 * s);
    } else {
      this.drawEyes(ctx, pose, s);
    }

    ctx.shadowBlur = 0;

    // Small robotic arms based on pose
    this.drawArms(ctx, pose, s);

    ctx.restore();
  }

  drawEyes(ctx, pose, s) {
    if (pose === 'cheer') {
      // Happy arcs (^ ^)
      ctx.lineWidth = 2.5 * s;
      ctx.strokeStyle = '#70D6FF';
      ctx.beginPath();
      ctx.arc(-7 * s, -3 * s, 4 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(7 * s, -3 * s, 4 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (pose === 'sleepy') {
      // Resting downward curves
      ctx.lineWidth = 2 * s;
      ctx.strokeStyle = '#70D6FF';
      ctx.beginPath();
      ctx.arc(-7 * s, -5 * s, 4 * s, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(7 * s, -5 * s, 4 * s, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (pose === 'think') {
      // Looking up and to side
      ctx.beginPath();
      ctx.ellipse(-6 * s, -7 * s, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8 * s, -7 * s, 3.5 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pose === 'point') {
      // Focused eyes looking towards side
      ctx.beginPath();
      ctx.ellipse(-5 * s, -4 * s, 4 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8 * s, -4 * s, 4 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Idle friendly round eyes
      ctx.beginPath();
      ctx.ellipse(-7 * s, -4 * s, 3.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7 * s, -4 * s, 3.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawArms(ctx, pose, s) {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5 * s;
    ctx.lineCap = 'round';

    if (pose === 'cheer') {
      // Both arms raised high!
      ctx.beginPath();
      ctx.moveTo(-22 * s, 2 * s);
      ctx.lineTo(-30 * s, -14 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22 * s, 2 * s);
      ctx.lineTo(30 * s, -14 * s);
      ctx.stroke();
    } else if (pose === 'point') {
      // Right arm pointing forward
      ctx.beginPath();
      ctx.moveTo(-22 * s, 4 * s);
      ctx.lineTo(-26 * s, 10 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22 * s, 4 * s);
      ctx.lineTo(34 * s, -2 * s);
      ctx.stroke();
    } else {
      // Idle relaxed arms at side
      ctx.beginPath();
      ctx.moveTo(-22 * s, 4 * s);
      ctx.lineTo(-26 * s, 12 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22 * s, 4 * s);
      ctx.lineTo(26 * s, 12 * s);
      ctx.stroke();
    }
  }
}

export const orbiRenderer = new OrbiRenderer();
