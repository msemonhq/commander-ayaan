/**
 * Wordless Ghost Hand Renderer (js/render/hand.js).
 * A translucent, animated glove/hand that demonstrates gestures:
 * - tap: descends, taps with fingertip pulse ripple, lifts
 * - drag: grasps at 'from', glides smoothly to 'to', releases
 * - hold: presses and pulses with an energy ring for 1.2s
 * - flick: touches, swipes fast with trailing motion streak, releases
 * Drawn cleanly in procedural canvas vector path.
 */

export class GhostHandRenderer {
  constructor() {
    this.animTime = 0;
  }

  update(dt) {
    this.animTime += dt;
  }

  render(ctx, action) {
    if (!action) return;

    const gesture = action.gesture || 'tap';
    const from = action.from || action.target || { x: 100, y: 100 };
    const to = action.to || from;

    ctx.save();

    if (gesture === 'tap') {
      this.renderTap(ctx, from.x, from.y);
    } else if (gesture === 'drag') {
      this.renderDrag(ctx, from.x, from.y, to.x, to.y);
    } else if (gesture === 'hold') {
      this.renderHold(ctx, from.x, from.y);
    } else if (gesture === 'flick') {
      this.renderFlick(ctx, from.x, from.y, to.x, to.y);
    }

    ctx.restore();
  }

  drawHandShape(ctx, x, y, scale = 1.0, alpha = 0.85, isPressing = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // Soft drop shadow / glow
    ctx.shadowColor = 'rgba(112, 214, 255, 0.6)';
    ctx.shadowBlur = 14;

    // Hand body & pointing index finger
    ctx.beginPath();
    // Tip of pointing index finger at (0, 0)
    ctx.moveTo(0, 0);
    // Finger left edge
    ctx.lineTo(-8, 20);
    // Palm curve
    ctx.bezierCurveTo(-18, 28, -20, 48, -12, 58);
    // Wrist base
    ctx.bezierCurveTo(-4, 64, 16, 64, 24, 56);
    // Thumb / curled fingers right side
    ctx.bezierCurveTo(32, 46, 26, 28, 14, 22);
    // Finger right edge back to tip
    ctx.lineTo(6, 0);
    ctx.closePath();

    // Translucent soft celestial gradient
    const grad = ctx.createLinearGradient(0, 0, 10, 60);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.5, 'rgba(180, 225, 255, 0.85)');
    grad.addColorStop(1, 'rgba(112, 214, 255, 0.45)');

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Finger joint highlight
    ctx.beginPath();
    ctx.arc(0, 20, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    // If pressing, draw contact pulse ring at fingertip (0, 0)
    if (isPressing) {
      const ringR = 12 + ((this.animTime * 20) % 14);
      const ringAlpha = Math.max(0, 1 - ringR / 26);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 224, 130, ${ringAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  renderTap(ctx, x, y) {
    // 1.4s loop: approach, press, ripple, lift
    const loopDuration = 1.4;
    const t = (this.animTime % loopDuration) / loopDuration;

    let handY = y;
    let scale = 1.0;
    let alpha = 0.85;
    let isPressing = false;

    if (t < 0.25) {
      // Float in
      const p = t / 0.25;
      handY = y + 25 * (1 - p);
      alpha = p * 0.85;
    } else if (t < 0.6) {
      // Tap down
      handY = y;
      scale = 0.92;
      isPressing = true;
    } else if (t < 0.85) {
      // Lift off
      const p = (t - 0.6) / 0.25;
      handY = y + 15 * p;
      scale = 0.92 + 0.08 * p;
    } else {
      // Fade out
      const p = (t - 0.85) / 0.15;
      handY = y + 15;
      alpha = 0.85 * (1 - p);
    }

    this.drawHandShape(ctx, x, handY, scale, alpha, isPressing);
  }

  renderDrag(ctx, fromX, fromY, toX, toY) {
    // 2.0s loop: appear at from, grab, slide to to, release, fade
    const loopDuration = 2.0;
    const t = (this.animTime % loopDuration) / loopDuration;

    let curX = fromX;
    let curY = fromY;
    let scale = 1.0;
    let alpha = 0.85;
    let isPressing = false;

    // Draw dashed motion track guide
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([6, 8]);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = 'rgba(112, 214, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    if (t < 0.2) {
      // Fade in at 'from'
      curX = fromX;
      curY = fromY;
      alpha = (t / 0.2) * 0.85;
    } else if (t < 0.75) {
      // Glide to 'to'
      const p = (t - 0.2) / 0.55;
      // Smooth ease-in-out
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      curX = fromX + (toX - fromX) * ease;
      curY = fromY + (toY - fromY) * ease;
      scale = 0.94;
      isPressing = true;
    } else if (t < 0.9) {
      // Release at 'to'
      curX = toX;
      curY = toY;
      scale = 1.02;
    } else {
      // Fade out
      curX = toX;
      curY = toY;
      alpha = 0.85 * (1 - (t - 0.9) / 0.1);
    }

    this.drawHandShape(ctx, curX, curY, scale, alpha, isPressing);
  }

  renderHold(ctx, x, y) {
    // 1.8s loop: press and hold with expanding energy aura
    const loopDuration = 1.8;
    const t = (this.animTime % loopDuration) / loopDuration;

    let alpha = 0.85;
    let scale = 0.92;
    let isPressing = true;

    if (t < 0.15) {
      alpha = (t / 0.15) * 0.85;
    } else if (t > 0.85) {
      alpha = 0.85 * (1 - (t - 0.85) / 0.15);
      scale = 1.0;
      isPressing = false;
    }

    // Outer hold progress arc
    if (isPressing) {
      ctx.save();
      ctx.beginPath();
      const progressAngle = ((t - 0.15) / 0.7) * Math.PI * 2;
      ctx.arc(x, y, 32, -Math.PI / 2, -Math.PI / 2 + Math.min(Math.PI * 2, progressAngle));
      ctx.strokeStyle = 'rgba(255, 179, 0, 0.75)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    this.drawHandShape(ctx, x, y, scale, alpha, isPressing);
  }

  renderFlick(ctx, fromX, fromY, toX, toY) {
    // 1.2s loop: quick touch and fast swipe
    const loopDuration = 1.2;
    const t = (this.animTime % loopDuration) / loopDuration;

    let curX = fromX;
    let curY = fromY;
    let alpha = 0.85;
    let scale = 0.95;

    if (t < 0.2) {
      alpha = (t / 0.2) * 0.85;
    } else if (t < 0.5) {
      // Fast flick swipe (cubic ease-out)
      const p = (t - 0.2) / 0.3;
      const ease = 1 - Math.pow(1 - p, 3);
      curX = fromX + (toX - fromX) * ease;
      curY = fromY + (toY - fromY) * ease;
    } else {
      curX = toX;
      curY = toY;
      alpha = 0.85 * (1 - (t - 0.5) / 0.5);
    }

    this.drawHandShape(ctx, curX, curY, scale, alpha, t >= 0.2 && t <= 0.45);
  }
}

export const ghostHand = new GhostHandRenderer();
