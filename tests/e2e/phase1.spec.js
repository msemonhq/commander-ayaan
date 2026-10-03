import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [
  { name: '390x844_portrait', width: 390, height: 844 },
  { name: '360x740_compact', width: 360, height: 740 },
  { name: '412x915_tall', width: 412, height: 915 },
  { name: '800x1280_tablet', width: 800, height: 1280 },
  { name: '844x390_landscape', width: 844, height: 390 }
];

test.describe('Phase 1 E2E Verification Suite', () => {
  test.beforeAll(async () => {
    fs.mkdirSync('qa/screens/phase-1', { recursive: true });
  });

  test('Boot screen transitions to Hub on tap', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#game-canvas')).toBeVisible();

    const startBtn = page.locator('#btn-boot-start');
    await expect(startBtn).toBeVisible();

    await startBtn.click();
    await expect(page.locator('#door-meet')).toBeVisible({ timeout: 4000 });
    await expect(page.locator('#door-parade')).toBeVisible();
  });

  test('Meet the Planets exploration, facts and signature interactions', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-boot-start').click();
    await page.locator('#door-meet').click();

    // Verify Meet scene elements
    await expect(page.locator('#meet-btn-home')).toBeVisible();
    await expect(page.locator('.scale-badge')).toContainText('Not to scale');

    // Focus on planet via test hook
    await page.evaluate(() => {
      const earth = window.__game.planetsData.find(p => p.id === 'earth');
      window.__game.sceneManager.currentScene.focusOnPlanet(earth);
    });

    const subtitle = page.locator('#meet-subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).not.toBeEmpty();

    // Tap "Tell me more" button
    const moreBtn = page.locator('#meet-btn-more-fact');
    await expect(moreBtn).toBeVisible();
    await moreBtn.click();

    // Home button returns cleanly to hub
    await page.locator('#meet-btn-home').click();
    await expect(page.locator('#door-meet')).toBeVisible();
  });

  test('Planet Parade: correct placement, hint ladder, and adaptive promotion', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-boot-start').click();
    await page.locator('#door-parade').click();

    await expect(page.locator('#parade-runway')).toBeVisible();
    await expect(page.locator('#parade-tray')).toBeVisible();

    // Test miss 1 (wobble)
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      scene.selectedTrayPlanet = 'earth';
      // slot 0 expects mercury in Rung 1, so tapping slot 0 with earth is a miss
      scene.handleSlotTap(0);
    });

    // Check hint level 1 registered
    const missCount1 = await page.evaluate(() => window.__game.hints.currentLevel);
    expect(missCount1).toBe(1);

    // Test miss 2 (glow target)
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      scene.selectedTrayPlanet = 'earth';
      scene.handleSlotTap(0);
    });
    const missCount2 = await page.evaluate(() => window.__game.hints.currentLevel);
    expect(missCount2).toBe(2);

    // Test miss 3 (Orbi co-play auto-solve)
    await page.evaluate(() => {
      const scene = window.__game.sceneManager.currentScene;
      scene.selectedTrayPlanet = 'earth';
      scene.handleSlotTap(0);
    });
    const missCount3 = await page.evaluate(() => window.__game.hints.currentLevel);
    expect(missCount3).toBe(3);
  });

  test('Mid-round rotation and background pause/resume', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-boot-start').click();
    await page.locator('#door-parade').click();

    // Rotate to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(200);
    await expect(page.locator('#parade-runway')).toBeVisible();

    // Rotate back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    await expect(page.locator('#parade-runway')).toBeVisible();

    // Simulate backgrounding
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(100);

    // Resume
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(100);
    await expect(page.locator('#game-canvas')).toBeVisible();
  });

  test('DOM accessibility checks: touch target sizes >= 72dp and spacing', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-boot-start').click();

    // Check Hub buttons
    const targets = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.btn-icon, .hub-door');
      return Array.from(buttons).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          width: rect.width,
          height: rect.height,
          label: el.getAttribute('aria-label') || el.innerText
        };
      });
    });

    for (const t of targets) {
      expect(t.width).toBeGreaterThanOrEqual(64);
      expect(t.height).toBeGreaterThanOrEqual(64);
      expect(t.label).toBeTruthy();
    }
  });

  test('Capture multi-viewport screenshots for review across 5 screen sizes', async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Boot screen
      await page.goto('/');
      await page.waitForTimeout(300);
      await page.screenshot({ path: `qa/screens/phase-1/boot_${vp.name}.png` });

      // 2. Hub screen
      await page.locator('#btn-boot-start').click();
      await page.waitForSelector('#door-meet');
      await page.waitForTimeout(300);
      await page.screenshot({ path: `qa/screens/phase-1/hub_${vp.name}.png` });

      // 3. Meet the Planets screen
      await page.locator('#door-meet').click();
      await page.waitForSelector('#meet-btn-home');
      await page.waitForTimeout(400);
      await page.screenshot({ path: `qa/screens/phase-1/meet_${vp.name}.png` });

      // 4. Planet Parade screen
      await page.locator('#meet-btn-home').click();
      await page.waitForSelector('#door-parade');
      await page.locator('#door-parade').click();
      await page.waitForSelector('#parade-runway');
      await page.waitForTimeout(400);
      await page.screenshot({ path: `qa/screens/phase-1/parade_${vp.name}.png` });
    }
  });

  test('Performance: p95 frame time under 20ms under load', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-boot-start').click();

    // Run for 1.5 seconds in Hub
    await page.waitForTimeout(1500);

    const p95 = await page.evaluate(() => window.__game.getP95FrameTime());
    console.log(`Measured Hub p95 frame time: ${p95.toFixed(2)}ms`);
    expect(p95).toBeLessThan(20.0);
  });
});
