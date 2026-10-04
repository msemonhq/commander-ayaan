// scripts/generate_icons.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Helper to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate the HTML with Canvas drawing logic
function getIconHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #050711; font-family: sans-serif; color: white; display: flex; flex-direction: column; align-items: center; padding: 20px; }
    .grid { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
    .card { background: #161C44; padding: 16px; border-radius: 12px; text-align: center; }
    canvas { display: block; margin: 0 auto 10px; border: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <h1>Commander Ayaan Icon Suite</h1>
  <div class="grid" id="container"></div>

  <script>
    // Draw Background Layer (108dp base coordinate space)
    function drawBackground(ctx, w, h) {
      const s = w / 108;
      ctx.save();

      // Deep Indigo Celestial Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#070A1E');
      bgGrad.addColorStop(0.45, '#10163C');
      bgGrad.addColorStop(0.85, '#0E1334');
      bgGrad.addColorStop(1, '#080B20');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Celestial Mid-Space Nebula Glow
      const nebGrad = ctx.createRadialGradient(72 * s, 36 * s, 4 * s, 70 * s, 38 * s, 50 * s);
      nebGrad.addColorStop(0, 'rgba(40, 54, 126, 0.55)');
      nebGrad.addColorStop(0.5, 'rgba(24, 32, 82, 0.28)');
      nebGrad.addColorStop(1, 'rgba(24, 32, 82, 0)');
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(70 * s, 38 * s, 50 * s, 0, Math.PI * 2);
      ctx.fill();

      // Warm Solar Ambient Warmth Bleed (Lower-Left)
      const sunWarmth = ctx.createRadialGradient(38 * s, 65 * s, 10 * s, 38 * s, 65 * s, 46 * s);
      sunWarmth.addColorStop(0, 'rgba(255, 112, 67, 0.22)');
      sunWarmth.addColorStop(0.45, 'rgba(255, 179, 0, 0.12)');
      sunWarmth.addColorStop(1, 'rgba(255, 179, 0, 0)');
      ctx.fillStyle = sunWarmth;
      ctx.beginPath();
      ctx.arc(38 * s, 65 * s, 46 * s, 0, Math.PI * 2);
      ctx.fill();

      // Background Starlight Points (including outer bleed area)
      const bgStars = [
        [14, 18, 1.2, 0.6, '#D0D6F5'],
        [94, 16, 1.4, 0.85, '#FFFFFF'],
        [98, 76, 1.3, 0.75, '#FFD54F'],
        [15, 92, 1.2, 0.6, '#D0D6F5'],
        [88, 92, 1.3, 0.7, '#70D6FF'],
        [52, 12, 1.0, 0.5, '#FFFFFF'],
        [8, 52, 1.0, 0.5, '#D0D6F5'],
        [100, 44, 1.1, 0.55, '#FFD54F']
      ];
      for (const [bx, by, br, bop, bcol] of bgStars) {
        ctx.fillStyle = bcol;
        ctx.globalAlpha = bop;
        ctx.beginPath();
        ctx.arc(bx * s, by * s, br * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.restore();
    }

    // Helper: Draw 4-point Diamond Paper-Cut Star
    function drawDiamondStar(ctx, cx, cy, size, color, glowColor) {
      ctx.save();
      ctx.translate(cx, cy);

      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = size * 1.5;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
      ctx.closePath();
      ctx.fill();

      // Tiny bright center spark
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw Foreground Artwork Layer (108dp base coordinate space, centered in 72dp / 66dp safe area)
    function drawForeground(ctx, w, h) {
      const s = w / 108;
      ctx.save();

      // 1. Constellation Stars & Sparkles inside safe area
      drawDiamondStar(ctx, 49 * s, 23 * s, 3.8 * s, '#FFF9C4', 'rgba(255, 213, 79, 0.8)');
      drawDiamondStar(ctx, 79 * s, 60 * s, 3.2 * s, '#E1F5FE', 'rgba(112, 214, 255, 0.85)');
      drawDiamondStar(ctx, 24 * s, 54 * s, 2.8 * s, '#FFE082', 'rgba(255, 179, 0, 0.7)');
      drawDiamondStar(ctx, 76 * s, 26 * s, 2.5 * s, '#FFFFFF', 'rgba(255, 255, 255, 0.8)');

      // Small stardust dots
      const dust = [
        [35, 25, 1.0, 0.7, '#FFFFFF'],
        [60, 18, 1.1, 0.65, '#FFD54F'],
        [83, 38, 1.0, 0.6, '#70D6FF'],
        [44, 78, 1.2, 0.6, '#FFE082'],
        [63, 73, 1.1, 0.55, '#D0D6F5'],
        [72, 72, 0.9, 0.5, '#FFFFFF']
      ];
      for (const [dx, dy, dr, dop, dcol] of dust) {
        ctx.fillStyle = dcol;
        ctx.globalAlpha = dop;
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, dr * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 2. Orbital Arc - Sweeping gracefully around the Sun toward Earth and Orbi
      ctx.save();
      ctx.strokeStyle = 'rgba(208, 214, 245, 0.38)';
      ctx.lineWidth = 1.4 * s;
      ctx.setLineDash([4 * s, 4 * s]);
      ctx.beginPath();
      // Ellipse centered at (44, 54)
      ctx.ellipse(45 * s, 53 * s, 31 * s, 23 * s, -0.32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Orbiting Earth & Moon (upper-left of orbit)
      const ex = 27 * s;
      const ey = 35 * s;
      const er = 6.4 * s;

      // Earth atmosphere glow on sunlit side
      const earthAtmo = ctx.createRadialGradient(ex + 1.5 * s, ey + 3 * s, er * 0.8, ex, ey, er * 1.3);
      earthAtmo.addColorStop(0, 'rgba(112, 214, 255, 0.6)');
      earthAtmo.addColorStop(1, 'rgba(112, 214, 255, 0)');
      ctx.fillStyle = earthAtmo;
      ctx.beginPath();
      ctx.arc(ex, ey, er * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Earth base ocean sphere (lit towards Sun at 38, 65)
      // Vector towards sun: (38-27, 65-35) = (+11, +30)
      const earthGrad = ctx.createRadialGradient(ex + 2.0 * s, ey + 3.2 * s, er * 0.15, ex, ey, er);
      earthGrad.addColorStop(0, '#42A5F5');
      earthGrad.addColorStop(0.5, '#1E88E5');
      earthGrad.addColorStop(0.85, '#1565C0');
      earthGrad.addColorStop(1, '#0D47A1');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();

      // Earth continents (paper-cut patches)
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#43A047';
      // Continent 1
      ctx.beginPath();
      ctx.ellipse(ex + 1.2 * s, ey + 1.5 * s, 3.2 * s, 2.4 * s, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Continent 2
      ctx.beginPath();
      ctx.ellipse(ex - 2.2 * s, ey - 0.5 * s, 2.0 * s, 2.6 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Continent 3 (sunlit lower)
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.ellipse(ex + 0.8 * s, ey + 3.2 * s, 2.2 * s, 1.4 * s, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Swirling white clouds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.lineWidth = 1.2 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex - 0.5 * s, ey - 1.5 * s, 3.8 * s, 0.1, 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex + 0.5 * s, ey + 2.0 * s, 4.2 * s, 3.0, 4.3);
      ctx.stroke();

      // Day-night shadow overlay
      const nightGrad = ctx.createLinearGradient(ex - er, ey - er, ex + 2 * s, ey + 2 * s);
      nightGrad.addColorStop(0, 'rgba(5, 10, 30, 0.65)');
      nightGrad.addColorStop(0.65, 'rgba(5, 10, 30, 0)');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(ex - er, ey - er, er * 2, er * 2);
      ctx.restore();

      // Moon
      const mx = 20 * s;
      const my = 42 * s;
      const mr = 1.7 * s;
      const moonGrad = ctx.createRadialGradient(mx + 0.5 * s, my + 0.8 * s, 0.2 * s, mx, my, mr);
      moonGrad.addColorStop(0, '#ECEFF1');
      moonGrad.addColorStop(0.7, '#B0BEC5');
      moonGrad.addColorStop(1, '#607D8B');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();

      // 4. The Sun - Warm layered paper-cut planetarium disc & corona
      const sx = 38 * s;
      const sy = 65 * s;
      const sr = 14.5 * s;

      // Layer 1: Outer ambient solar bloom
      const sunBloom = ctx.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 2.2);
      sunBloom.addColorStop(0, 'rgba(255, 179, 0, 0.42)');
      sunBloom.addColorStop(0.45, 'rgba(255, 112, 67, 0.2)');
      sunBloom.addColorStop(1, 'rgba(255, 112, 67, 0)');
      ctx.fillStyle = sunBloom;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Concentric paper-cut corona ring 1
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 1.24, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 193, 7, 0.28)';
      ctx.fill();

      // Layer 3: Concentric paper-cut corona ring 2
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 1.10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 160, 0, 0.36)';
      ctx.fill();

      // Layer 4: Sun disc with warm radial gradient & paper-cut depth
      const sunGrad = ctx.createRadialGradient(sx - sr * 0.28, sy - sr * 0.28, sr * 0.1, sx, sy, sr);
      sunGrad.addColorStop(0, '#FFFDE7'); // Pure light warm core
      sunGrad.addColorStop(0.25, '#FFF59D');
      sunGrad.addColorStop(0.55, '#FFCA28'); // Radiant sun gold
      sunGrad.addColorStop(0.82, '#FFA000'); // Amber
      sunGrad.addColorStop(1, '#FF6F00');    // Deep warm orange edge
      ctx.save();
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = 'rgba(255, 160, 0, 0.65)';
      ctx.shadowBlur = sr * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Paper-cut inner rim highlight
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.1 * s;
      ctx.beginPath();
      ctx.arc(sx, sy, sr - 0.7 * s, Math.PI * 1.0, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();

      // 5. Orbi the Companion Robot - floating joyfully in upper right
      const ox = 66 * s;
      const oy = 43 * s;

      // Thruster propulsion glow
      const thrusterGrad = ctx.createRadialGradient(ox, oy + 12 * s, 1.5 * s, ox, oy + 15 * s, 8 * s);
      thrusterGrad.addColorStop(0, 'rgba(112, 214, 255, 0.9)');
      thrusterGrad.addColorStop(0.5, 'rgba(79, 195, 247, 0.45)');
      thrusterGrad.addColorStop(1, 'rgba(112, 214, 255, 0)');
      ctx.fillStyle = thrusterGrad;
      ctx.beginPath();
      ctx.arc(ox, oy + 14 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();

      // Antenna stem
      ctx.strokeStyle = '#D0D6F5';
      ctx.lineWidth = 1.8 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ox, oy - 11 * s);
      ctx.lineTo(ox, oy - 17.5 * s);
      ctx.stroke();

      // Antenna glowing tip beacon
      ctx.save();
      ctx.fillStyle = '#70D6FF';
      ctx.shadowColor = '#70D6FF';
      ctx.shadowBlur = 6 * s;
      ctx.beginPath();
      ctx.arc(ox, oy - 18 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Orbi Arms
      // Left arm (waving upwards)
      ctx.save();
      ctx.strokeStyle = '#D0D6F5';
      ctx.lineWidth = 1.8 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ox - 10 * s, oy + 1 * s);
      ctx.quadraticCurveTo(ox - 15 * s, oy - 4 * s, ox - 14 * s, oy - 8 * s);
      ctx.stroke();
      // Hand
      ctx.fillStyle = '#70D6FF';
      ctx.beginPath();
      ctx.arc(ox - 14 * s, oy - 8 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Right arm (resting cheerfully)
      ctx.beginPath();
      ctx.moveTo(ox + 10 * s, oy + 2 * s);
      ctx.quadraticCurveTo(ox + 14 * s, oy + 4 * s, ox + 13 * s, oy + 8 * s);
      ctx.stroke();
      ctx.fillStyle = '#70D6FF';
      ctx.beginPath();
      ctx.arc(ox + 13 * s, oy + 8 * s, 1.4 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Capsule body (paper-cut smooth white-silver dome)
      const bodyW = 21 * s;
      const bodyH = 22 * s;
      const bodyGrad = ctx.createLinearGradient(ox - 10 * s, oy - 11 * s, ox + 10 * s, oy + 11 * s);
      bodyGrad.addColorStop(0, '#FFFFFF');
      bodyGrad.addColorStop(0.55, '#E1E7FB');
      bodyGrad.addColorStop(1, '#B0BAE8');

      ctx.save();
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      // Round capsule: top radius 10.5, bottom radius 8
      ctx.roundRect(ox - bodyW / 2, oy - bodyH / 2, bodyW, bodyH, [10.5 * s, 10.5 * s, 8 * s, 8 * s]);
      ctx.fill();

      ctx.strokeStyle = '#959FCE';
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();

      // Paper-cut inner top highlight on capsule
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.0 * s;
      ctx.beginPath();
      ctx.arc(ox, oy - 2 * s, 8.5 * s, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Dark Glossy Visor Screen
      const visorW = 15.5 * s;
      const visorH = 10 * s;
      ctx.fillStyle = '#0B0E28';
      ctx.beginPath();
      ctx.roundRect(ox - visorW / 2, oy - 4.5 * s, visorW, visorH, 5 * s);
      ctx.fill();

      // Visor subtle glass sheen highlight across top
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 0.9 * s;
      ctx.beginPath();
      ctx.arc(ox, oy - 1 * s, 6.2 * s, Math.PI * 1.18, Math.PI * 1.82);
      ctx.stroke();

      // Glowing Cyan Digital Eyes (expressive, curious, friendly)
      const eyeL = ox - 3.5 * s;
      const eyeR = ox + 3.5 * s;
      const eyeY = oy + 0.5 * s;
      const eyeRx = 1.9 * s;
      const eyeRy = 2.4 * s;

      ctx.save();
      ctx.fillStyle = '#70D6FF';
      ctx.shadowColor = '#70D6FF';
      ctx.shadowBlur = 5 * s;

      // Left eye
      ctx.beginPath();
      ctx.ellipse(eyeL, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.ellipse(eyeR, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright eye sparkles
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(eyeL - 0.5 * s, eyeY - 0.7 * s, 0.7 * s, 0, Math.PI * 2);
      ctx.arc(eyeR - 0.5 * s, eyeY - 0.7 * s, 0.7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // Orbi restore

      ctx.restore(); // Foreground restore
    }

    // Render Full Composite Icon with clipping
    function drawFullIcon(ctx, w, h, clipType) {
      ctx.save();

      if (clipType === 'circle') {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (clipType === 'squircle') {
        const radius = w * 0.22;
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, radius);
        ctx.clip();
      } else if (clipType === 'teardrop') {
        const radius = w * 0.22;
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, [w / 2, w / 2, radius, w / 2]);
        ctx.clip();
      } // 'square' or 'none' = no clip (full bleed)

      drawBackground(ctx, w, h);
      drawForeground(ctx, w, h);

      // Subtle outer rim highlight for tactile paper-cut feel on masked icons
      if (clipType === 'circle') {
        ctx.strokeStyle = 'rgba(208, 214, 245, 0.22)';
        ctx.lineWidth = Math.max(1, w * 0.015);
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, (w / 2) - ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (clipType === 'squircle') {
        const radius = w * 0.22;
        ctx.strokeStyle = 'rgba(208, 214, 245, 0.22)';
        ctx.lineWidth = Math.max(1, w * 0.015);
        ctx.beginPath();
        ctx.roundRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth, radius);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Expose rendering functions to window for Playwright automation
    window.renderToCanvas = function(canvasId, width, height, mode, clipType) {
      let canvas = document.getElementById(canvasId);
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = '<h3>' + canvasId + ' (' + width + 'x' + height + ')</h3>';
        card.appendChild(canvas);
        document.getElementById('container').appendChild(card);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);

      if (mode === 'foreground') {
        drawForeground(ctx, width, height);
      } else if (mode === 'background') {
        drawBackground(ctx, width, height);
      } else {
        drawFullIcon(ctx, width, height, clipType || 'square');
      }
      return canvas.toDataURL('image/png');
    };
  </script>
</body>
</html>`;
}

async function main() {
  console.log('Starting custom Android launcher icon generation...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(getIconHtml());

  // Define icon targets
  const densities = [
    { name: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
    { name: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
    { name: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
    { name: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
    { name: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 }
  ];

  const resDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

  for (const d of densities) {
    const targetDir = path.join(resDir, d.name);
    ensureDir(targetDir);

    console.log(`Generating ${d.name}:`);

    // 1. ic_launcher.png (squircle legacy)
    const launcherDataUrl = await page.evaluate(({ id, size }) => {
      return window.renderToCanvas(id, size, size, 'composite', 'squircle');
    }, { id: `${d.name}-launcher`, size: d.launcherSize });
    const launcherBuf = Buffer.from(launcherDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), launcherBuf);
    console.log(`  - ic_launcher.png (${d.launcherSize}x${d.launcherSize})`);

    // 2. ic_launcher_round.png (circle legacy)
    const roundDataUrl = await page.evaluate(({ id, size }) => {
      return window.renderToCanvas(id, size, size, 'composite', 'circle');
    }, { id: `${d.name}-round`, size: d.launcherSize });
    const roundBuf = Buffer.from(roundDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundBuf);
    console.log(`  - ic_launcher_round.png (${d.launcherSize}x${d.launcherSize})`);

    // 3. ic_launcher_foreground.png (adaptive foreground)
    const fgDataUrl = await page.evaluate(({ id, size }) => {
      return window.renderToCanvas(id, size, size, 'foreground');
    }, { id: `${d.name}-fg`, size: d.foregroundSize });
    const fgBuf = Buffer.from(fgDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fgBuf);
    console.log(`  - ic_launcher_foreground.png (${d.foregroundSize}x${d.foregroundSize})`);
  }

  // Generate Web & Store Assets
  console.log('Generating web & store assets in www/assets/:');
  const webAssetsDir = path.join(ROOT, 'www', 'assets');
  ensureDir(webAssetsDir);

  // 1. 512x512 Master Store Icon (Square Full Bleed for Play Store)
  const storeDataUrl = await page.evaluate(() => {
    return window.renderToCanvas('store-icon-512', 512, 512, 'composite', 'square');
  });
  const storeBuf = Buffer.from(storeDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(path.join(webAssetsDir, 'icon.png'), storeBuf);
  console.log('  - icon.png (512x512, full bleed store asset)');

  // 2. 180x180 Apple Touch Icon (Square Full Bleed for iOS)
  const touchDataUrl = await page.evaluate(() => {
    return window.renderToCanvas('apple-touch-180', 180, 180, 'composite', 'square');
  });
  const touchBuf = Buffer.from(touchDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(path.join(webAssetsDir, 'apple-touch-icon.png'), touchBuf);
  console.log('  - apple-touch-icon.png (180x180, full bleed)');

  // 3. 32x32 Favicon PNG (Circle for crisp browser tab visibility)
  const favDataUrl = await page.evaluate(() => {
    return window.renderToCanvas('favicon-32', 32, 32, 'composite', 'circle');
  });
  const favBuf = Buffer.from(favDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(path.join(webAssetsDir, 'favicon-32x32.png'), favBuf);
  fs.writeFileSync(path.join(ROOT, 'www', 'favicon.ico'), favBuf);
  console.log('  - favicon-32x32.png (32x32) & www/favicon.ico');

  // 4. Generate Adaptive Icon Masked Simulation Previews for QA
  await page.evaluate(() => {
    window.renderToCanvas('adaptive-pixel-circle-preview', 192, 192, 'composite', 'circle');
    window.renderToCanvas('adaptive-samsung-squircle-preview', 192, 192, 'composite', 'squircle');
    window.renderToCanvas('adaptive-teardrop-preview', 192, 192, 'composite', 'teardrop');
  });

  // Save QA preview screenshot of the suite
  const qaDir = path.join(ROOT, 'qa', 'screens');
  ensureDir(qaDir);
  await page.screenshot({ path: path.join(qaDir, 'app_launcher_icon_preview.png'), fullPage: true });
  console.log(`Saved visual preview to qa/screens/app_launcher_icon_preview.png`);

  await browser.close();
  console.log('Icon PNG generation complete!');
}

main().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
