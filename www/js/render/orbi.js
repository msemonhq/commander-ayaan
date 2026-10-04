/**
 * Procedural Orbi Companion Robot (js/render/orbi.js).
 * Original friendly floating robot with expressive digital eyes.
 * Poses: idle, point, nod, shrug, puzzled, cheer, sleepy, look-at-target.
 * Follows target position within 150ms for natural curiosity.
 */

export class OrbiRenderer {
  constructor() {
    this.floatPhase = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.targetGazeX = 0;
    this.targetGazeY = 0;
    this.currentGazeX = 0;
    this.currentGazeY = 0;
    this.nodPhase = 0;
  }

  setGazeTarget(tx, ty, orbiX, orbiY) {
    const dx = tx - orbiX;
    const dy = ty - orbiY;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(1, Math.hypot(dx, dy) / 200);
    this.targetGazeX = Math.cos(angle) * 4 * dist;
    this.targetGazeY = Math.sin(angle) * 3 * dist;
  }

  update(dt, reduceMotion = false) {
    if (!reduceMotion) {
      this.floatPhase += dt * 2.2; // Float bob period ~2.8s
    }
    this.nodPhase += dt * 6.0;

    // Smooth gaze tracking (150ms lag)
    this.currentGazeX += (this.targetGazeX - this.currentGazeX) * Math.min(1.0, dt * 8);
    this.currentGazeY += (this.targetGazeY - this.currentGazeY) * Math.min(1.0, dt * 8);

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
    let bob = reduceMotion ? 0 : Math.sin(this.floatPhase) * 6;
    let tilt = 0;

    if (pose === 'nod') {
      bob += Math.sin(this.nodPhase) * 4;
    } else if (pose === 'puzzled') {
      tilt = 0.18; // Head tilt when puzzled
    } else if (pose === 'shrug') {
      bob -= 3;
    }

    ctx.translate(x, y + bob);
    ctx.rotate(tilt);

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
    ctx.lineTo(pose === 'puzzled' ? 6 * s : 0, -32 * s);
    ctx.stroke();

    // Antenna glowing tip
    ctx.fillStyle = '#70D6FF';
    ctx.shadowColor = '#70D6FF';
    ctx.shadowBlur = 8 * s;
    ctx.beginPath();
    ctx.arc(pose === 'puzzled' ? 6 * s : 0, -33 * s, 4.5 * s, 0, Math.PI * 2);
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
    } else if (pose === 'puzzled') {
      // One eye wide, one eye squinted (o . )
      ctx.beginPath();
      ctx.ellipse(-7 * s, -4 * s, 4.5 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7 * s, -4 * s, 2.5 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pose === 'look-at-target') {
      // Eyes shift toward target
      const gx = this.currentGazeX * s;
      const gy = this.currentGazeY * s;
      ctx.beginPath();
      ctx.ellipse((-7 * s) + gx, (-4 * s) + gy, 3.8 * s, 4.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse((7 * s) + gx, (-4 * s) + gy, 3.8 * s, 4.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pose === 'point') {
      // Focused eyes looking towards point direction
      ctx.beginPath();
      ctx.ellipse(-4 * s, -4 * s, 4 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(9 * s, -4 * s, 4 * s, 4 * s, 0, 0, Math.PI * 2);
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
      ctx.lineTo(36 * s, -4 * s);
      ctx.stroke();
    } else if (pose === 'shrug') {
      // Both arms bent up and outwards
      ctx.beginPath();
      ctx.moveTo(-22 * s, 4 * s);
      ctx.lineTo(-32 * s, -2 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22 * s, 4 * s);
      ctx.lineTo(32 * s, -2 * s);
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
