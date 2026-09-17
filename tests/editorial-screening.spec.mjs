import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';

async function prepare(page, width = 1280) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

test('homepage answers the skeptical-editor screening questions without claim collisions', async ({ page }) => {
  await prepare(page);
  await page.goto('/');

  const hero = page.locator('.r4-hero');
  await expect(hero).toContainText('For banks & institutional lenders');
  await expect(hero).toContainText('Initial focus: DACH, Benelux and Central Europe');
  await expect(hero).toContainText('Public example · 2 pages · No sign-in.');
  await expect(hero).toContainText('Free access by invitation.');
  await expect(hero).not.toContainText(/Paid professional access|Real Evidence Pack|Authentic record/);

  await expect(page.locator('.r38-product-key dt')).toHaveText(['CRI', 'Evidence Pack', 'The Brief']);
  await expect(page.locator('.r38-product-key dd')).toHaveText([
    'The review-support product.',
    'The versioned review record.',
    'A private walkthrough of prepared situations.'
  ]);
  await expect(page.locator('.r38-term-strip')).toHaveCSS('border-top-width', '1px');
  await expect(page.locator('.r38-product-key')).toHaveCSS('border-top-width', '0px');
});

test('CRI exposes a concise orientation layer and removes internal display codes', async ({ page }) => {
  await prepare(page);
  await page.goto('/cri/');

  await expect(page.locator('#at-a-glance .card')).toHaveCount(3);
  await expect(page.locator('#at-a-glance')).toContainText('Who CRI is for');
  await expect(page.locator('#at-a-glance')).toContainText('What CRI produces');
  await expect(page.locator('#at-a-glance')).toContainText('Where CRI stands');
  await expect(page.locator('#the-brief')).toContainText('Austria, Czechia and the Netherlands');
  await expect(page.locator('#the-brief')).toContainText('not customer deployments');
  await expect(page.locator('#the-brief')).toContainText('Access to The Brief is free for all invited visitors.');
  await expect(page.locator('#image-provenance')).not.toContainText(/T38|N2|R2/);
});

test('Evidence Pack guide separates observation, scenario and next review action', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: value => { window.__copiedEvidenceLink = value; return Promise.resolve(); } }
    });
  });
  await prepare(page);
  await page.goto('/evidence-packs/');

  const guide = page.locator('#reading-guide');
  await expect(guide).toContainText('Everything observed is real and checkable.');
  await expect(guide).toContainText('The financing review scenario is hypothetical.');
  await expect(guide.locator('.card')).toHaveCount(3);
  await expect(guide.locator('.card h3')).toHaveText([
    'What the images show',
    'What remains open',
    'What follows'
  ]);

  await guide.getByRole('button', { name: 'Copy link to this finding' }).click();
  await expect(guide.locator('.r38-copy-status')).toHaveText('Link copied.');
  expect(await page.evaluate(() => window.__copiedEvidenceLink))
    .toBe('http://127.0.0.1:4174/evidence-packs/#public-finding');
});

for (const javaScriptEnabled of [true, false]) {
  test(`Fischamend has one static context route with JavaScript ${javaScriptEnabled ? 'on' : 'off'}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled, baseURL: test.info().project.use.baseURL });
    const page = await context.newPage();
    try {
      await prepare(page, 390);
      await page.goto('/evidence-packs/fischamend/');
      const navigation = page.getByRole('navigation', { name: 'Evidence Pack context', exact: true });
      await expect(navigation).toHaveCount(1);
      await expect(navigation.getByRole('link')).toHaveText(['CRI', 'Evidence Pack', 'For banks', 'About', 'Contact']);
      await expect(page.locator('.ep-web-header')).toBeVisible();
      await expect(page.locator('.ep-web-footer')).toBeVisible();
      await expect(page.locator('main .ep-web-header, main .ep-web-footer')).toHaveCount(0);
      await expect(page.locator('.ep-web-brand-line')).toHaveText('Evidence for the people who review, challenge and decide.');
      await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
        'content', 'https://www.3brain.ai/assets/img/og_fischamend_evidence_pack_v0_2.png'
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);

      // Use the actual footer links to check both continuation anchors.
      for (const [name, pathname, hash] of [
        ['How to read an Evidence Pack', '/evidence-packs/', '#reading-guide'],
        ['Enter The Brief or request a code', '/brief/', '']
      ]) {
        await page.goto('/evidence-packs/fischamend/');
        await page.locator('.ep-web-footer').getByRole('link', { name, exact: true }).click();
        expect(new URL(page.url()).pathname).toBe(pathname);
        expect(new URL(page.url()).hash).toBe(hash);
        await expect(page.locator(hash || '#have-code')).toBeAttached();
        const y = await page.locator(hash).evaluate(el => el.getBoundingClientRect().top);
        expect(y).toBeGreaterThanOrEqual(-1);
        expect(y).toBeLessThan(900);
      }
    } finally {
      await context.close();
    }
  });
}

test('terminology revision preserves the archived record and prints as two A4 pages', async ({ page }, info) => {
  const { validateTerminology } = await import('../scripts/validate-terminology.mjs');
  validateTerminology();
  await prepare(page, 1440);
  await page.emulateMedia({ media: 'print' });
  await mkdir('artifacts/r3-preview', { recursive: true });
  await page.goto('/evidence-packs/fischamend/');
  await expect(page.locator('.ep-web-header')).toBeHidden();
  await expect(page.locator('.ep-web-footer')).toBeHidden();
  await expect(page.locator('main')).toContainText('Hypothetical drawdown review scenario');
  await expect(page.locator('main')).not.toContainText(/synthetic/i);
  const geometry = await page.locator('.page').evaluateAll(pages => pages.map(p => ({
    contentBottom: p.querySelector('.page-content').getBoundingClientRect().bottom,
    footerTop: p.querySelector('.document-footer').getBoundingClientRect().top,
    pageBottom: p.getBoundingClientRect().bottom
  })));
  for (const bounds of geometry) expect(bounds.contentBottom).toBeLessThan(bounds.footerTop);
  const pdf = await page.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true,
    path: 'artifacts/r3-preview/fischamend-v0_2.pdf' });
  expect((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length).toBe(2);
  await page.locator('main').screenshot({ path: 'artifacts/r3-preview/fischamend-v0_2-print.png' });
  await info.attach('print-verification.json', { body: JSON.stringify({ pages: 2, geometry }), contentType: 'application/json' });
});

test('P0 layouts preserve readable entry points at narrow and wide widths', async ({ page }) => {
  await mkdir('artifacts/r3-preview', { recursive: true });
  for (const width of [320, 390, 1440, 1920]) {
    await prepare(page, width);
    await page.goto('/');
    await page.locator('.r4-folio-sheet img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await page.screenshot({ path: `artifacts/r3-preview/p0-home-${width}.png` });
    await page.locator('.r4-record-head').screenshot({ path: `artifacts/r3-preview/p0-example-intro-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    if (width >= 1440) {
      const note = await page.locator('.v3-brief-note').evaluate(el => ({ height: el.getBoundingClientRect().height, line: parseFloat(getComputedStyle(el).lineHeight) }));
      expect(Math.abs(note.height - 2 * note.line)).toBeLessThanOrEqual(1);
    }
    await page.goto('/evidence-packs/fischamend/');
    await page.locator('.ep-web-header').screenshot({ path: `artifacts/r3-preview/p0-pack-header-${width}.png` });
    await page.locator('.ep-web-footer').screenshot({ path: `artifacts/r3-preview/p0-pack-footer-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  // Explicit 200% text enlargement of the new web context, without altering
  // the released record. Capture sizes first to avoid compounding inheritance.
  await prepare(page, 390);
  await page.reload();
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll('.ep-web-header, .ep-web-header *, .ep-web-footer, .ep-web-footer *')].map(el => ({ el, size: parseFloat(getComputedStyle(el).fontSize) }));
    for (const { el, size } of sizes) el.style.fontSize = `${size * 2}px`;
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.locator('.ep-web-header').screenshot({ path: 'artifacts/r3-preview/p0-pack-header-text-200.png' });
  await page.locator('.ep-web-footer').screenshot({ path: 'artifacts/r3-preview/p0-pack-footer-text-200.png' });
  const bannerBottom = await page.locator('.review-banner').evaluate(el => el.getBoundingClientRect().bottom);
  const footerTop = await page.locator('.ep-web-footer').evaluate(el => el.getBoundingClientRect().top);
  expect(bannerBottom).toBeLessThanOrEqual(footerTop + 1);
  const firstLink = page.locator('.ep-web-brand');
  await firstLink.press('Tab');
  await expect(page.locator('.ep-web-nav a').first()).toBeFocused();
  await expect(page.locator('.ep-web-nav a').first()).toHaveCSS('outline-style', 'solid');
});
