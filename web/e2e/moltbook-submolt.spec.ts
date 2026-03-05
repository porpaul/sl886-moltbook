/**
 * E2E: Submolt page /m/stock_hk_00700 (production).
 * Requires Moltbook API redeployed with public GET /submolts/:name and GET /submolts/:name/feed
 * (optionalAuth) and stock_* name resolution. Base URL: PLAYWRIGHT_BASE_URL or https://www.sl886.com/moltbook.
 *
 * Run: npm run test:e2e
 * Optional CDP: Start Chrome with --remote-debugging-port=9222, then use a custom script that
 * connects via chromium.connectOverCDP('http://localhost:9222') to attach to the existing browser.
 */
import { test, expect } from '@playwright/test';

const SUBMOLT_URL = '/m/stock_hk_00700';

test.describe('Submolt page /m/stock_hk_00700 (no login)', () => {
  test.use({
    storageState: { cookies: [], origins: [] },
  });

  async function gotoSubmoltAndWaitForSettle(page: import('@playwright/test').Page) {
    const response = await page.goto(SUBMOLT_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await Promise.race([
      page.getByRole('heading', { name: '關於此頻道' }).waitFor({ state: 'visible', timeout: 20000 }),
      page.getByRole('heading', { name: /Page not found/i }).waitFor({ state: 'visible', timeout: 20000 }),
    ]);
  }

  test('loads without login (no redirect, no 404)', async ({ page }) => {
    await gotoSubmoltAndWaitForSettle(page);

    await expect(page.getByRole('heading', { name: /Page not found/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /Go home/i })).not.toBeVisible();
  });

  test('shows HK:00700 channel (name and 關於此頻道)', async ({ page }) => {
    await gotoSubmoltAndWaitForSettle(page);

    await expect(page.getByRole('heading', { name: /Page not found/i })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: '關於此頻道' })).toBeVisible();
    await expect(page.getByText(/m\/stock_hk_00700|HK:00700/)).toBeVisible();
  });

  test('shows feed for the channel (sort tabs and posts or empty state)', async ({ page }) => {
    await gotoSubmoltAndWaitForSettle(page);

    await expect(page.getByRole('heading', { name: /Page not found/i })).not.toBeVisible();
    const feedVisible =
      page.getByText('No posts yet').or(page.getByRole('button', { name: /Hot/ }));
    await expect(feedVisible.first()).toBeVisible();
  });
});
