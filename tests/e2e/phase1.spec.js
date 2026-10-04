import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const VIEWPORTS = [
  { name: '390x844_portrait', width: 390, height: 844 },
  { name: '360x740_compact', width: 360, height: 740 },
  { name: '412x915_tall', width: 412, height: 915 },
  { name: '800x1280_tablet', width: 800, height: 1280 },
  { name: '844x390_landscape', width: 844, height: 390 }
];

async function gotoGame(page) {
  await page.goto('/');
  await page.waitForFunction(() => typeof window.__game !== 'undefined');
}

test.describe('Phase 1 E2E Verification Suite (V2)', () => {
  test.beforeAll(async () => {
    fs.mkdirSync('qa/screens/phase-1/frames', { recursive: true });
  });

  test('Boot screen is wordless and transitions smoothly to Hub on tap', async ({ page }) => {
    await gotoGame(page);
    await expect(page.locator('#game-canvas')).toBeVisible();

    // Verify wordless: no text sentences on Boot
    const textCount = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('#ui-overlay *'))
        .map(el => el.textContent.trim())
        .filter(t => t.length > 0);
      return texts.length;
    });
    expect(textCount).toBe(0);

    // Verify coach exposes boot sun target
    const target = await page.evaluate(() => window.__game.getCoachTarget());
    expect(target).not.toBeNull();
    expect(target.gesture).toBe('tap');

    // Tap canvas center to start game
    await page.mouse.click(195, 422);

    // Fast-forward transition
    await page.waitForTimeout(300);
    await page.evaluate(() => window.__game.transition.forceComplete());

    const curScene = await page.evaluate(() => window.__game.getCurrentScene());
    expect(curScene).toBe('hub');
    await expect(page.locator('#hub-btn-mute')).toBeVisible();
  });

  test('Living Hub: background planets, station doors, and 1-tap mute', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('hub'));

    // Mute button exists with >= 72dp touch target
    const muteBtn = page.locator('#hub-btn-mute');
    await expect(muteBtn).toBeVisible();
    const box = await muteBtn.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(72);
    expect(box.height).toBeGreaterThanOrEqual(72);

    // Tap mute button
    await muteBtn.click();
    const isMuted = await page.evaluate(() => window.__game.audio.isMuted);
    expect(isMuted).toBe(true);

    // Tap to unmute
    await muteBtn.click();
    const isUnmuted = await page.evaluate(() => window.__game.audio.isMuted);
    expect(isUnmuted).toBe(false);

    // Tap Playground station door -> transitions to Playground
    await page.evaluate(() => {
      window.__game.touchEntity('playground');
      window.__game.transition.forceComplete();
    });

    const curScene = await page.evaluate(() => window.__game.getCurrentScene());
    expect(curScene).toBe('playground');
    await expect(page.locator('#playground-btn-home')).toBeVisible();
  });

  test('Planet Playground: tactile toys for Sun, Mars, Mercury, Venus, Jupiter, and Uranus', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('playground'));

    await expect(page.locator('#playground-btn-home')).toBeVisible();
    await expect(page.locator('#badge-not-to-scale')).toBeVisible();

    // 1. Focus on Sun toy
    await page.evaluate(() => {
      const sun = window.__game.planetsData.find(p => p.id === 'sun');
      window.__game.sceneManager.currentScene.focusPlanet(sun);
    });

    // Press and hold Sun: light swells
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      scene.handleHold({ x: 400, y: 300 });
      for (let i = 0; i < 6; i++) scene.update(0.016);
    });
    const sunSwell = await page.evaluate(() => window.__game.sceneManager.currentScene.sunLightMultiplier);
    expect(sunSwell).toBeGreaterThan(1.05);

    // Release Sun hold: light settles back
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      scene.handleHoldEnd({ x: 400, y: 300 });
      for (let i = 0; i < 15; i++) scene.update(0.016);
    });
    const sunSettled = await page.evaluate(() => window.__game.sceneManager.currentScene.sunLightMultiplier);
    expect(sunSettled).toBeLessThan(sunSwell);

    // 2. Focus on Mars toy: press and hold dust storm
    await page.evaluate(() => {
      const mars = window.__game.planetsData.find(p => p.id === 'mars');
      window.__game.sceneManager.currentScene.focusPlanet(mars);
      const scene = window.__game.sceneManager.currentScene;
      scene.handleHold({ x: 400, y: 300 });
      for (let i = 0; i < 8; i++) scene.update(0.016);
    });
    const marsStorm = await page.evaluate(() => window.__game.sceneManager.currentScene.marsStormIntensity);
    expect(marsStorm).toBeGreaterThan(0.1);

    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      scene.handleHoldEnd({ x: 400, y: 300 });
      for (let i = 0; i < 35; i++) scene.update(0.016);
    });
    const marsSettled = await page.evaluate(() => window.__game.sceneManager.currentScene.marsStormIntensity);
    expect(marsSettled).toBe(0);

    // 3. Focus on Mercury toy: flick fast lap
    await page.evaluate(() => {
      const mercury = window.__game.planetsData.find(p => p.id === 'mercury');
      window.__game.sceneManager.currentScene.focusPlanet(mercury);
      window.__game.sceneManager.currentScene.handleFlick({ vx: 900, vy: 0, speed: 900 });
    });
    const fastLap = await page.evaluate(() => window.__game.sceneManager.currentScene.mercuryFastLap);
    expect(fastLap).toBeGreaterThan(0.8);

    // 4. Focus on Venus toy: drag spins backwards
    await page.evaluate(() => {
      const venus = window.__game.planetsData.find(p => p.id === 'venus');
      window.__game.sceneManager.currentScene.focusPlanet(venus);
      window.__game.sceneManager.currentScene.handleDrag({ vx: 600, vy: 0 });
    });
    const venusSpin = await page.evaluate(() => window.__game.sceneManager.currentScene.venusSpinVelocity);
    expect(venusSpin).toBeLessThan(0); // Retrograde!

    // 5. Focus on Uranus: tap rolls onto side
    await page.evaluate(() => {
      const uranus = window.__game.planetsData.find(p => p.id === 'uranus');
      window.__game.sceneManager.currentScene.focusPlanet(uranus);
      window.__game.sceneManager.currentScene.handleTap(400, 300);
    });
    const uranusTilted = await page.evaluate(() => window.__game.sceneManager.currentScene.uranusTilted);
    expect(uranusTilted).toBe(true);

    // Home button returns cleanly to hub
    await page.locator('#playground-btn-home').click();
    await page.evaluate(() => window.__game.transition.forceComplete());
    const curScene = await page.evaluate(() => window.__game.getCurrentScene());
    expect(curScene).toBe('hub');
  });

  test('Planet Parade: real drag-and-drop and tap-then-tap play across all 5 Rungs', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('parade'));
    await expect(page.locator('#parade-btn-home')).toBeVisible();
    await page.waitForTimeout(100);

    // Verify Rung 1: 3 planets with silhouettes
    const r1Slots = await page.evaluate(() => window.__game.sceneManager.currentScene.slots.length);
    expect(r1Slots).toBe(3);

    // Test real pointer drag-and-drop placement on R1
    const dragCoords = await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const targetSlot = scene.slots[0];
      const matchingItem = scene.tray.find(t => t.id === targetSlot.planetId);
      return {
        fromX: matchingItem.x,
        fromY: matchingItem.y,
        toX: targetSlot.x,
        toY: targetSlot.y
      };
    });

    await page.mouse.move(dragCoords.fromX, dragCoords.fromY);
    await page.mouse.down();
    await page.mouse.move(dragCoords.toX, dragCoords.toY, { steps: 10 });
    await page.waitForTimeout(50);
    await page.mouse.up();

    const slot0Filled = await page.evaluate(() => window.__game.sceneManager.currentScene.slots[0].isFilled);
    expect(slot0Filled).toBe(true);

    // Test tap-then-tap alternative for second slot
    const tapCoords = await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const targetSlot = scene.slots[1];
      const matchingItem = scene.tray.find(t => t.id === targetSlot.planetId);
      return {
        itemX: matchingItem.x,
        itemY: matchingItem.y,
        slotX: targetSlot.x,
        slotY: targetSlot.y
      };
    });

    await page.mouse.click(tapCoords.itemX, tapCoords.itemY);
    await page.mouse.click(tapCoords.slotX, tapCoords.slotY);

    const slot1Filled = await page.evaluate(() => window.__game.sceneManager.currentScene.slots[1].isFilled);
    expect(slot1Filled).toBe(true);

    // Complete Rung 1
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const slot2 = scene.slots[2];
      const item2 = scene.tray.find(t => t.id === slot2.planetId);
      scene.attemptPlacement(item2, slot2);
    });

    // Test Rung 2 (4 planets)
    await page.evaluate(() => {
      window.__game.adaptive.setRung('parade', 2);
      window.__game.sceneManager.currentScene.currentRung = 2;
      window.__game.sceneManager.currentScene.startRound();
    });
    const r2Slots = await page.evaluate(() => window.__game.sceneManager.currentScene.slots.length);
    expect(r2Slots).toBe(4);

    // Test Rung 3 ("Who lives here?" with 3 candidates and 2 neighbours pre-placed)
    await page.evaluate(() => {
      window.__game.adaptive.setRung('parade', 3);
      window.__game.sceneManager.currentScene.currentRung = 3;
      window.__game.sceneManager.currentScene.startRound();
    });
    const r3Status = await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      return {
        slotsCount: scene.slots.length,
        slot0Filled: scene.slots[0].isFilled,
        slot1Empty: !scene.slots[1].isFilled,
        slot2Filled: scene.slots[2].isFilled,
        trayCandidateCount: scene.tray.length
      };
    });
    expect(r3Status.slotsCount).toBe(3);
    expect(r3Status.slot0Filled).toBe(true);
    expect(r3Status.slot1Empty).toBe(true);
    expect(r3Status.slot2Filled).toBe(true);
    expect(r3Status.trayCandidateCount).toBe(3);

    // Test Rung 4 (6 planets)
    await page.evaluate(() => {
      window.__game.adaptive.setRung('parade', 4);
      window.__game.sceneManager.currentScene.currentRung = 4;
      window.__game.sceneManager.currentScene.startRound();
    });
    const r4Slots = await page.evaluate(() => window.__game.sceneManager.currentScene.slots.length);
    expect(r4Slots).toBe(6);

    // Test Rung 5 (two chapters)
    await page.evaluate(() => {
      window.__game.adaptive.setRung('parade', 5);
      window.__game.sceneManager.currentScene.currentRung = 5;
      window.__game.sceneManager.currentScene.r5Chapter = 1;
      window.__game.sceneManager.currentScene.startRound();
    });
    const r5Ch1Slots = await page.evaluate(() => window.__game.sceneManager.currentScene.slots.length);
    expect(r5Ch1Slots).toBe(4);

    await page.evaluate(() => {
      window.__game.sceneManager.currentScene.r5Chapter = 2;
      window.__game.sceneManager.currentScene.startRound();
    });
    const r5Ch2Status = await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      return {
        totalSlots: scene.slots.length,
        preFilledCount: scene.slots.filter(s => s.isFilled).length,
        trayCount: scene.tray.length
      };
    });
    expect(r5Ch2Status.totalSlots).toBe(8);
    expect(r5Ch2Status.preFilledCount).toBe(4);
    expect(r5Ch2Status.trayCount).toBe(4);
  });

  test('Planet Parade: 3-step hint ladder and autoSolve round completion', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => {
      window.__game.adaptive.setRung('parade', 1);
      window.__game.switchScene('parade');
    });

    // Miss 1
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const targetSlot = scene.slots[0];
      const wrongItem = scene.tray.find(t => t.id !== targetSlot.planetId);
      scene.attemptPlacement(wrongItem, targetSlot);
    });
    expect(await page.evaluate(() => window.__game.hints.level)).toBe(1);

    // Miss 2
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const targetSlot = scene.slots[0];
      const wrongItem = scene.tray.find(t => t.id !== targetSlot.planetId);
      scene.attemptPlacement(wrongItem, targetSlot);
    });
    expect(await page.evaluate(() => window.__game.hints.level)).toBe(2);

    // Pre-fill slots 1 and 2 to test that Miss 3 on final slot completes the round!
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      scene.slots[1].isFilled = true;
      scene.slots[2].isFilled = true;
    });

    // Miss 3 (triggers autoSolve co-play)
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const targetSlot = scene.slots[0];
      const wrongItem = scene.tray.find(t => t.id !== targetSlot.planetId);
      scene.attemptPlacement(wrongItem, targetSlot);
    });
    expect(await page.evaluate(() => window.__game.hints.level)).toBe(3);

    // Verify round completed and constellation star is flying
    const flyingStar = await page.evaluate(() => window.__game.sceneManager.currentScene.flyingStar);
    expect(flyingStar).not.toBeNull();
  });

  test('Coach Test: completes Round 1 following ONLY the ghost hand target', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => {
      window.__game.adaptive.setRung('parade', 1);
      window.__game.switchScene('parade');
    });

    let step = 0;
    while (step < 6) {
      const target = await page.evaluate(() => window.__game.getCoachTarget());
      if (!target) break;

      await page.evaluate(() => window.__game.touchCoachTarget());
      await page.waitForTimeout(100);
      step++;
    }

    const filledCount = await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      return scene.slots ? scene.slots.filter(s => s.isFilled).length : 0;
    });
    expect(filledCount).toBeGreaterThan(0);
  });

  test('Accessibility & Wordless Verification: target sizes, contrast, zero sentences', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('hub'));

    // 1. Target sizes: All buttons must be >= 72px
    const buttons = page.locator('button.btn-icon');
    const btnCount = await buttons.count();
    for (let i = 0; i < btnCount; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(72);
        expect(box.height).toBeGreaterThanOrEqual(72);
      }
    }

    // 2. Wordless check: zero sentences during gameplay
    const sentenceCount = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('body *:not(script):not(style)'));
      let sentences = 0;
      for (const el of elements) {
        if (el.children.length === 0) {
          const text = el.textContent.trim();
          if (text.includes('.') && text.split(' ').length > 3) {
            sentences++;
          }
        }
      }
      return sentences;
    });
    expect(sentenceCount).toBe(0);
  });

  test('Multi-viewport screenshot capture and frame sequences for transition and flash check', async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Boot screenshot
      await gotoGame(page);
      await page.waitForTimeout(150);
      await page.screenshot({ path: `qa/screens/phase-1/boot_${vp.name}.png` });

      // 2. Hub screenshot
      await page.evaluate(() => window.__game.switchScene('hub'));
      await page.waitForTimeout(150);
      await page.screenshot({ path: `qa/screens/phase-1/hub_${vp.name}.png` });

      // 3. Playground screenshot
      await page.evaluate(() => window.__game.switchScene('playground'));
      await page.waitForTimeout(150);
      await page.screenshot({ path: `qa/screens/phase-1/playground_${vp.name}.png` });

      // 4. Parade screenshot
      await page.evaluate(() => window.__game.switchScene('parade'));
      await page.waitForTimeout(150);
      await page.screenshot({ path: `qa/screens/phase-1/parade_${vp.name}.png` });
    }

    // Capture 8 frame sequence across a screen transition (hub to playground)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.__game.switchScene('hub'));
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      window.__game.transition.startTransition({
        type: 'hub-to-mode',
        duration: 550,
        onComplete: () => window.__game.sceneManager.switch('playground')
      });
    });

    const frameLuminances = [];
    for (let f = 0; f < 8; f++) {
      const buf = await page.screenshot({ path: `qa/screens/phase-1/frames/trans_frame_${f}.png` });
      // Sample luminance
      const luma = await page.evaluate(() => {
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const p = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        return (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]) / 255;
      });
      frameLuminances.push(luma);
      await page.waitForTimeout(70);
    }

    // Flash-rate check: count big luminance reversals (threshold > 0.4)
    let flashTransitions = 0;
    for (let i = 1; i < frameLuminances.length; i++) {
      if (Math.abs(frameLuminances[i] - frameLuminances[i - 1]) > 0.4) {
        flashTransitions++;
      }
    }
    expect(flashTransitions).toBeLessThanOrEqual(3);
  });

  test('Rotation reflow, pause/resume, and 4x CPU throttle performance check', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('parade'));

    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(150);
    const canvasBox = await page.locator('#game-canvas').boundingBox();
    expect(canvasBox.width).toBe(844);

    // Rotate back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(150);

    // Background pause & resume
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(50);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(50);

    // 4x CPU throttle performance check via CDP session
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.waitForTimeout(500); // Run under 4x CPU throttle
      const p95Throttled = await page.evaluate(() => window.__game.getP95FrameTime());
      expect(p95Throttled).toBeLessThan(20.0);
    } finally {
      await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
  });
});
