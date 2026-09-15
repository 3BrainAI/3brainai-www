import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const guides = [
  '/use-cases/construction-loan-drawdown-review/',
  '/use-cases/real-estate-collateral-review/',
  '/use-cases/satellite-evidence-limits/'
];
const routes = ['/use-cases/', ...guides];

test('bank review content and its internal paths work without JavaScript', async ({ browser, request, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    for (const source of ['/', '/cri/', '/evidence-packs/']) {
      const response = await request.get(source);
      const html = await response.text();
      expect(html.match(/<main\b[\s\S]*?<\/main>/)?.[0]).toContain('href="/use-cases/"');
    }
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response.ok()).toBeTruthy();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('main')).toContainText('controlled-case Proof of Concept');
      await expect(page.locator('main')).toContainText('Evidence Pack');
      await expect(page.locator('main')).toContainText('human review');
      await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
      const links = await page.locator('main a').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')));
      const localLinks = links.filter(href => href.startsWith('/') || href.startsWith('#'));
      for (const href of new Set(localLinks)) {
        const target = new URL(href, 'https://www.3brain.ai' + route);
        const targetResponse = await request.get(target.pathname);
        expect(targetResponse.ok(), `Broken link: ${route} -> ${href}`).toBeTruthy();
        if (target.hash) {
          expect(await targetResponse.text(), `Missing anchor: ${route} -> ${href}`)
            .toContain(`id="${decodeURIComponent(target.hash.slice(1))}"`);
        }
      }
      expect(localLinks).toContain('/validation/#readiness-form');
      expect(localLinks).toContain('/cri/');
      expect(localLinks).toContain('/evidence-packs/fischamend/');
      if (route === '/use-cases/') {
        for (const guide of guides) expect(localLinks).toContain(guide);
      } else {
        expect(localLinks).toContain('/use-cases/');
      }
    }
  } finally {
    await context.close();
  }
});

for (const width of [320, 768, 1366]) {
  test(`bank review guides remain readable with working anchors at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    for (const route of routes) {
      await page.goto(route);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
        contentSize: parseFloat(getComputedStyle(document.querySelector('.assurance-lead')).fontSize)
      }));
      expect(layout.overflow).toBeLessThanOrEqual(1);
      expect(layout.headingFont).not.toMatch(/Georgia|Times/);
      expect(layout.contentSize).toBeGreaterThanOrEqual(18);
      const links = page.getByRole('navigation', { name: 'On this page', exact: true }).getByRole('link');
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
      await page.goto(route);
      await mkdir('artifacts/r3-preview', { recursive: true });
      await page.screenshot({ path: `artifacts/r3-preview/bank-review-${route.split('/').filter(Boolean).at(-1)}-${width}.png`, fullPage: true });
    }
  });
}
