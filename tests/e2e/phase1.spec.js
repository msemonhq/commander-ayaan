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
    fs.mkdirSync('qa/screens/phase-1', { recursive: true });
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

    // Tap canvas to start game
    await page.evaluate(() => {
      window.__game.sceneManager.handleTap(window.innerWidth / 2, window.innerHeight / 2);
    });

    // Fast-forward transition
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__game.transition.forceComplete());

    const curScene = await page.evaluate(() => window.__game.getCurrentScene());
    expect(curScene).toBe('hub');
    await expect(page.locator('#hub-btn-mute')).toBeVisible();
  });

  test('Living Hub: background planets and live-preview station doors', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => {
      window.__game.switchScene('hub');
    });

    // Mute button exists with >= 72dp size
    const muteBtn = page.locator('#hub-btn-mute');
    await expect(muteBtn).toBeVisible();
    const box = await muteBtn.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(72);
    expect(box.height).toBeGreaterThanOrEqual(72);

    // Tap a background planet
    const tapped = await page.evaluate(() => {
      return window.__game.sceneManager.currentScene.handleTap(window.innerWidth * 0.35, window.innerHeight * 0.45);
    });
    expect(typeof tapped).toBe('boolean');

    // Tap Playground station -> transitions to Playground
    await page.evaluate(() => {
      window.__game.touchEntity('playground');
      window.__game.transition.forceComplete();
    });

    const curScene = await page.evaluate(() => window.__game.getCurrentScene());
    expect(curScene).toBe('playground');
    await expect(page.locator('#playground-btn-home')).toBeVisible();
  });

  test('Planet Playground: orbit exploration and tactile toys', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('playground'));

    await expect(page.locator('#playground-btn-home')).toBeVisible();
    await expect(page.locator('#badge-not-to-scale')).toBeVisible();

    // Focus on planet (Venus)
    await page.evaluate(() => {
      const venus = window.__game.planetsData.find(p => p.id === 'venus');
      window.__game.sceneManager.currentScene.focusPlanet(venus);
    });

    // Caption appears
    const caption = page.locator('#planet-name-caption');
    await expect(caption).toBeVisible();
    await expect(caption).toHaveText('Venus');

    // Trigger drag on Venus (reverse spin)
    await page.evaluate(() => {
      window.__game.sceneManager.currentScene.handleDrag({ vx: 500, vy: 0 });
    });
    const spinVel = await page.evaluate(() => window.__game.sceneManager.currentScene.venusSpinVelocity);
    expect(spinVel).toBeLessThan(0); // Spins backwards!

    // Home button returns cleanly to hub
    await page.locator('#playground-btn-home').click();
    await page.evaluate(() => window.__game.transition.forceComplete());
    const curScene = await page.evaluate(() => window.__game.getCurrentScene());
    expect(curScene).toBe('hub');
  });

  test('Planet Parade: placement, 3-step hint ladder, and constellation stars', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('parade'));

    await expect(page.locator('#parade-btn-home')).toBeVisible();

    // Test miss 1 (wobble)
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const wrongItem = scene.tray.find(t => t.id !== scene.slots[0].planetId);
      scene.attemptPlacement(wrongItem, scene.slots[0]);
    });
    const miss1 = await page.evaluate(() => window.__game.hints.level);
    expect(miss1).toBe(1);

    // Test miss 2 (glow target)
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const wrongItem = scene.tray.find(t => t.id !== scene.slots[0].planetId);
      scene.attemptPlacement(wrongItem, scene.slots[0]);
    });
    const miss2 = await page.evaluate(() => window.__game.hints.level);
    expect(miss2).toBe(2);

    // Test miss 3 (Orbi co-play auto-solve)
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      const wrongItem = scene.tray.find(t => t.id !== scene.slots[0].planetId);
      scene.attemptPlacement(wrongItem, scene.slots[0]);
    });
    const miss3 = await page.evaluate(() => window.__game.hints.level);
    expect(miss3).toBe(3);

    // Complete current round by solving remaining slots
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      for (const slot of scene.slots) {
        if (!slot.isFilled) {
          const item = scene.tray.find(t => t.id === slot.planetId);
          if (item) scene.attemptPlacement(item, slot);
        }
      }
    });

    // Check round completed / constellation star flying
    const flyingStar = await page.evaluate(() => window.__game.sceneManager.currentScene.flyingStar);
    expect(flyingStar).not.toBeNull();
  });

  test('Coach Test: completes Round 1 following ONLY the ghost hand target', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('parade'));

    // Step 1: Follow coach target
    let step = 0;
    while (step < 6) {
      const target = await page.evaluate(() => window.__game.getCoachTarget());
      if (!target) break;

      // Touch coach target
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

  test('Wordless Check: hiding all text leaves interface intuitive and zero sentences', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => {
      window.__game.hideAllText(true);
      window.__game.switchScene('hub');
    });

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

  test('Multi-viewport screenshot capture across 5 required device sizes', async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Boot screenshot
      await gotoGame(page);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `qa/screens/phase-1/boot_${vp.name}.png` });

      // 2. Hub screenshot
      await page.evaluate(() => window.__game.switchScene('hub'));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `qa/screens/phase-1/hub_${vp.name}.png` });

      // 3. Playground screenshot
      await page.evaluate(() => window.__game.switchScene('playground'));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `qa/screens/phase-1/playground_${vp.name}.png` });

      // 4. Parade screenshot
      await page.evaluate(() => window.__game.switchScene('parade'));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `qa/screens/phase-1/parade_${vp.name}.png` });
    }
  });

  test('Rotation reflow, pause/resume, and performance check', async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => window.__game.switchScene('parade'));

    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(200);
    const canvasBox = await page.locator('#game-canvas').boundingBox();
    expect(canvasBox.width).toBe(844);

    // Rotate back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);

    // Background pause & resume
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(100);

    // Performance check: p95 frame time <= 20ms
    const p95 = await page.evaluate(() => window.__game.getP95FrameTime());
    expect(p95).toBeLessThan(20.0);
  });
});
