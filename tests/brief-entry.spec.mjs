import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

for (const width of [320, 390, 768, 1440]) {
  test(`Brief entry distinguishes existing invitations and free requests at ${width}px`, async ({ page }) => {
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/brief/');
    await expect(page.getByRole('heading', { name: 'I have an access code.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'I’d like access.' })).toBeVisible();
    await expect(page.locator('main')).toContainText('Access to The Brief is always free.');
    await expect(page.locator('#brief-sign-in')).toHaveAttribute('href', 'https://brief.3brain.ai/login');
    // Codes are entered only on the application host, never collected by the static site.
    await expect(page.locator('input, form, iframe')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await mkdir('artifacts/r3-preview', { recursive: true });
    await page.screenshot({ path: `artifacts/r3-preview/brief-entry-${width}.png`, fullPage: true });
    await page.getByRole('link', { name: 'Request free access' }).click();
    await expect(page).toHaveURL(/\/validation\/#brief-request$/);
    await expect(page.locator('.brief-existing-code')).toContainText('Already have an invitation code?');
    await page.locator('.brief-existing-code').getByRole('link', { name: 'Enter The Brief' }).click();
    await expect(page).toHaveURL(/\/brief\/$/);
  });
}

test('Brief entry and both routes remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
  const page = await context.newPage();
  try {
    await page.goto('/brief/');
    await expect(page.locator('#brief-sign-in')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Request free access' })).toBeVisible();
    await page.getByRole('link', { name: 'Request free access' }).click();
    await expect(page).toHaveURL(/\/validation\/#brief-request$/);
  } finally {
    await context.close();
  }
});
