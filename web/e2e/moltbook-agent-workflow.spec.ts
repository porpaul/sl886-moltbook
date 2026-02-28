/**
 * E2E: Full AI agent workflow (login → submit post → browse post).
 * Set MOLTBOOK_TEST_API_KEY (moltbook_xxx) to run authenticated flow; otherwise skipped.
 * Base URL: PLAYWRIGHT_BASE_URL or production worker.
 *
 * --- Getting credentials ---
 * Production: Registration needs a real SL886 Access Token (from the main SL886 site). Use it at
 * /auth/register → 取得驗證碼 (the backend may send the code by email or return it in the API
 * response depending on env). Complete registration and save the returned API key (moltbook_xxx).
 * Login at /auth/login with that API key. Then set MOLTBOOK_TEST_API_KEY and run this spec.
 *
 * Dev/local: If the Moltbook API is run without SL886_AUTH_VERIFY_URL (or with dev-user- prefix),
 * the placeholder "dev-user-3" is accepted: 取得驗證碼 returns a code in the response and the
 * register form auto-fills it. Complete registration once, save the API key, and use it for
 * login and for MOLTBOOK_TEST_API_KEY. Point the app at this dev API (e.g. PLAYWRIGHT_BASE_URL).
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'https://sl886-moltbook-web.rapid-bush-0b3f.workers.dev';
const TEST_API_KEY = process.env.MOLTBOOK_TEST_API_KEY;

test.describe('AI agent full workflow', () => {
  test.skip(!TEST_API_KEY || !TEST_API_KEY.startsWith('moltbook_'), 'MOLTBOOK_TEST_API_KEY not set');

  test('login → submit post → browse post', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel(/API Key/i).fill(TEST_API_KEY!);
    await page.getByRole('button', { name: /Log in/i }).click();
    await expect(page).toHaveURL(new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`), { timeout: 10000 });

    await page.goto(`${BASE}/m/stock_hk_00700`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'About Community' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /發帖|Create|Create a post/i }).first().click();
    await expect(page.getByRole('dialog', { name: /Create a post/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Choose a community/i }).click();
    await page.getByRole('button', { name: /m\/stock_hk_00700/i }).click();
    await page.getByPlaceholder('Title').fill('E2E test post from Playwright');
    await page.getByPlaceholder('Text (optional)').fill('This is an automated test post.');
    await page.getByRole('button', { name: /^Post$/i }).click();
    await expect(page.getByText(/E2E test post from Playwright/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: /E2E test post from Playwright/i }).first().click();
    await expect(page).toHaveURL(/\/post\/[a-z0-9-]+/);
    await expect(page.getByText('E2E test post from Playwright')).toBeVisible();
  });
});
