import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..', '..');

function getPngDimensions(buf) {
  if (buf.length >= 24 && buf.toString('ascii', 12, 16) === 'IHDR') {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20)
    };
  }
  return null;
}

test('Android Launcher Mipmap Icon Densities & Dimensions', () => {
  const resDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

  const expectedDensities = [
    { dir: 'mipmap-mdpi', launcher: 48, fg: 108 },
    { dir: 'mipmap-hdpi', launcher: 72, fg: 162 },
    { dir: 'mipmap-xhdpi', launcher: 96, fg: 216 },
    { dir: 'mipmap-xxhdpi', launcher: 144, fg: 324 },
    { dir: 'mipmap-xxxhdpi', launcher: 192, fg: 432 }
  ];

  for (const exp of expectedDensities) {
    const dirPath = path.join(resDir, exp.dir);
    assert.ok(fs.existsSync(dirPath), `Directory ${exp.dir} must exist`);

    // 1. ic_launcher.png
    const launcherPath = path.join(dirPath, 'ic_launcher.png');
    assert.ok(fs.existsSync(launcherPath), `${exp.dir}/ic_launcher.png must exist`);
    const lBuf = fs.readFileSync(launcherPath);
    const lDim = getPngDimensions(lBuf);
    assert.ok(lDim, `${exp.dir}/ic_launcher.png must be a valid PNG`);
    assert.equal(lDim.width, exp.launcher, `${exp.dir}/ic_launcher.png width must be ${exp.launcher}`);
    assert.equal(lDim.height, exp.launcher, `${exp.dir}/ic_launcher.png height must be ${exp.launcher}`);

    // 2. ic_launcher_round.png
    const roundPath = path.join(dirPath, 'ic_launcher_round.png');
    assert.ok(fs.existsSync(roundPath), `${exp.dir}/ic_launcher_round.png must exist`);
    const rBuf = fs.readFileSync(roundPath);
    const rDim = getPngDimensions(rBuf);
    assert.ok(rDim, `${exp.dir}/ic_launcher_round.png must be a valid PNG`);
    assert.equal(rDim.width, exp.launcher, `${exp.dir}/ic_launcher_round.png width must be ${exp.launcher}`);
    assert.equal(rDim.height, exp.launcher, `${exp.dir}/ic_launcher_round.png height must be ${exp.launcher}`);

    // 3. ic_launcher_foreground.png
    const fgPath = path.join(dirPath, 'ic_launcher_foreground.png');
    assert.ok(fs.existsSync(fgPath), `${exp.dir}/ic_launcher_foreground.png must exist`);
    const fgBuf = fs.readFileSync(fgPath);
    const fgDim = getPngDimensions(fgBuf);
    assert.ok(fgDim, `${exp.dir}/ic_launcher_foreground.png must be a valid PNG`);
    assert.equal(fgDim.width, exp.fg, `${exp.dir}/ic_launcher_foreground.png width must be ${exp.fg}`);
    assert.equal(fgDim.height, exp.fg, `${exp.dir}/ic_launcher_foreground.png height must be ${exp.fg}`);
  }
});

test('Android Adaptive Icon XML Resources', () => {
  const resDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

  // 1. values/ic_launcher_background.xml
  const valBgPath = path.join(resDir, 'values', 'ic_launcher_background.xml');
  assert.ok(fs.existsSync(valBgPath), 'values/ic_launcher_background.xml must exist');
  const valBgContent = fs.readFileSync(valBgPath, 'utf8');
  assert.match(valBgContent, /#0A0D24/i, 'values background color must match celestial indigo #0A0D24');

  // 2. drawable/ic_launcher_background.xml
  const drawBgPath = path.join(resDir, 'drawable', 'ic_launcher_background.xml');
  assert.ok(fs.existsSync(drawBgPath), 'drawable/ic_launcher_background.xml must exist');
  const drawBgContent = fs.readFileSync(drawBgPath, 'utf8');
  assert.ok(drawBgContent.includes('<vector'), 'drawable background must be a VectorDrawable');
  assert.ok(drawBgContent.includes('android:viewportWidth="108"'), 'drawable background viewport must be 108dp');

  // 3. drawable-v24/ic_launcher_foreground.xml
  const drawFgPath = path.join(resDir, 'drawable-v24', 'ic_launcher_foreground.xml');
  assert.ok(fs.existsSync(drawFgPath), 'drawable-v24/ic_launcher_foreground.xml must exist');
  const drawFgContent = fs.readFileSync(drawFgPath, 'utf8');
  assert.ok(drawFgContent.includes('<vector'), 'drawable foreground must be a VectorDrawable');

  // 4. mipmap-anydpi-v26/ic_launcher.xml & ic_launcher_round.xml
  const adaptivePath = path.join(resDir, 'mipmap-anydpi-v26', 'ic_launcher.xml');
  assert.ok(fs.existsSync(adaptivePath), 'mipmap-anydpi-v26/ic_launcher.xml must exist');
  const adaptiveContent = fs.readFileSync(adaptivePath, 'utf8');
  assert.ok(adaptiveContent.includes('<adaptive-icon'), 'ic_launcher.xml must be an adaptive-icon');
  assert.ok(adaptiveContent.includes('@drawable/ic_launcher_background'), 'must reference drawable background');
  assert.ok(adaptiveContent.includes('@mipmap/ic_launcher_foreground'), 'must reference mipmap foreground');

  const roundAdaptivePath = path.join(resDir, 'mipmap-anydpi-v26', 'ic_launcher_round.xml');
  assert.ok(fs.existsSync(roundAdaptivePath), 'mipmap-anydpi-v26/ic_launcher_round.xml must exist');
  const roundAdaptiveContent = fs.readFileSync(roundAdaptivePath, 'utf8');
  assert.ok(roundAdaptiveContent.includes('<adaptive-icon'), 'ic_launcher_round.xml must be an adaptive-icon');
});

test('Web & Store Assets and Favicon Verification', () => {
  const wwwDir = path.join(ROOT, 'www');

  // 1. Store icon 512x512
  const storeIconPath = path.join(wwwDir, 'assets', 'icon.png');
  assert.ok(fs.existsSync(storeIconPath), 'www/assets/icon.png must exist');
  const storeDim = getPngDimensions(fs.readFileSync(storeIconPath));
  assert.equal(storeDim.width, 512);
  assert.equal(storeDim.height, 512);

  // 2. Apple touch icon 180x180
  const touchIconPath = path.join(wwwDir, 'assets', 'apple-touch-icon.png');
  assert.ok(fs.existsSync(touchIconPath), 'www/assets/apple-touch-icon.png must exist');
  const touchDim = getPngDimensions(fs.readFileSync(touchIconPath));
  assert.equal(touchDim.width, 180);
  assert.equal(touchDim.height, 180);

  // 3. Favicon 32x32
  const fav32Path = path.join(wwwDir, 'assets', 'favicon-32x32.png');
  assert.ok(fs.existsSync(fav32Path), 'www/assets/favicon-32x32.png must exist');
  const favDim = getPngDimensions(fs.readFileSync(fav32Path));
  assert.equal(favDim.width, 32);
  assert.equal(favDim.height, 32);

  // 4. Favicon SVG
  const favSvgPath = path.join(wwwDir, 'assets', 'favicon.svg');
  assert.ok(fs.existsSync(favSvgPath), 'www/assets/favicon.svg must exist');
  const favSvgContent = fs.readFileSync(favSvgPath, 'utf8');
  assert.ok(favSvgContent.includes('<svg'), 'favicon.svg must contain svg tag');
  assert.ok(favSvgContent.includes('Commander Ayaan') || favSvgContent.includes('#FFCA28'), 'favicon.svg must have Sun/Orbi theme colors');

  // 5. www/favicon.ico
  const icoPath = path.join(wwwDir, 'favicon.ico');
  assert.ok(fs.existsSync(icoPath), 'www/favicon.ico must exist');

  // 6. www/index.html links
  const indexPath = path.join(wwwDir, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  assert.ok(indexContent.includes('rel="icon"'), 'index.html must include rel="icon"');
  assert.ok(indexContent.includes('rel="apple-touch-icon"'), 'index.html must include apple-touch-icon');
});
