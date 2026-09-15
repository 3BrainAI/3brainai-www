import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// The refreshed reading pages share layout with Assurance. Verify that long
// legal text and in-page navigation remain usable below the sticky header.
for (const width of [390, 768, 1366]) {
  test(`legal pages remain readable and anchors visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    for (const [path, title] of [['privacy', 'Privacy'], ['security', 'Security'], ['imprint', 'Imprint']]) {
      await page.goto(`/${path}/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
        paragraphSize: parseFloat(getComputedStyle(document.querySelector('main section p')).fontSize)
      }));
      expect(layout.overflow).toBeLessThanOrEqual(1);
      expect(layout.headingFont).not.toMatch(/Georgia|Times/);
      expect(layout.paragraphSize).toBeGreaterThanOrEqual(14);
      const navigation = page.getByRole('navigation', { name: 'On this page', exact: true });
      const links = navigation.getByRole('link');
      for (let i = 0; i < await links.count(); i++) {
        const link = links.nth(i);
        const hash = await link.getAttribute('href');
        await link.click();
        await expect.poll(async () => page.locator(hash).evaluate(el => {
          const top = el.getBoundingClientRect().top;
          const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
          return top >= headerBottom + 8 && top < innerHeight;
        })).toBe(true);
      }
      await expect(page.getByRole('navigation', { name: 'Related information' }).getByRole('link', { name: title, exact: true })).toHaveAttribute('aria-current', 'page');
      await page.goto(`/${path}/`);
      await mkdir('artifacts/r3-preview', { recursive: true });
      await page.screenshot({ path: `artifacts/r3-preview/${path}-${width}.png`, fullPage: true });
    }
  });
}
