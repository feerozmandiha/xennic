import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/fa/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('health endpoint responds', async ({ request }) => {
    const resp = await request.get('/api/v1/health');
    expect(resp.ok()).toBeTruthy();
  });
});
