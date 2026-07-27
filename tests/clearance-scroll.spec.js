const { test, expect } = require('@playwright/test');

test.describe('clearance product rails', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.setItem('tt_splash_seen', '1');
    });
    await page.goto('http://127.0.0.1:5500/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Array.isArray(window.allProducts) && window.allProducts.length > 0);
    await page.evaluate(() => window.showPage('clearance'));
  });

  test('drags a product rail horizontally on mobile', async ({ page }) => {
    const rail = page.locator('#clearance-grid-299');
    await expect(rail.locator(':scope > .tt-product-card')).not.toHaveCount(0);
    await rail.scrollIntoViewIfNeeded();

    const before = await rail.evaluate(element => ({
      left: element.scrollLeft,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      overflowX: getComputedStyle(element).overflowX
    }));
    expect(before.scrollWidth).toBeGreaterThan(before.clientWidth);
    expect(before.overflowX).toBe('auto');

    const box = await rail.boundingBox();
    await page.mouse.move(box.x + box.width - 25, box.y + Math.min(120, box.height / 2));
    await page.mouse.down();
    await page.mouse.move(box.x + 35, box.y + Math.min(120, box.height / 2), { steps: 8 });
    await page.mouse.up();

    await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(100);
  });
});
