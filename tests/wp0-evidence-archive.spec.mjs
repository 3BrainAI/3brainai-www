import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const archiveCases = [
  {
    route: '/evidence-packs/lausitz/',
    slug: 'lausitz',
    title: 'Lausitz, Germany.',
    canonical: 'https://www.3brain.ai/evidence-packs/lausitz/',
    crossCaseHref: '/evidence-packs/german-north-sea/'
  },
  {
    route: '/evidence-packs/german-north-sea/',
    slug: 'german-north-sea',
    title: 'German North Sea.',
    canonical: 'https://www.3brain.ai/evidence-packs/german-north-sea/',
    crossCaseHref: '/evidence-packs/lausitz/'
  }
];

const responsiveWidths = [390, 768, 1024, 1280, 1440];
const analyticalSections = [
  'Synthetic review question',
  'Assessment summary',
  'Observed vs Declared',
  'Findings',
  'Uncertainty and non-inference',
  'Bounded conclusion',
  'Recommended next step'
];

async function preparePage(page, width, height = 900) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function openCase(page, route) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `${route} should return a successful response`).toBeTruthy();
  await page.evaluate(() => document.fonts?.ready);
}

for (const archiveCase of archiveCases) {
  test(`${archiveCase.slug} restores a bounded analytical Evidence Pack record`, async ({ page }) => {
    await preparePage(page, 1280, 1000);
    await openCase(page, archiveCase.route);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', archiveCase.canonical);
    await expect(page.locator('main h1')).toHaveText(archiveCase.title);
    await expect(page.locator('.archive-boundary-card')).toContainText('not a customer record');
    await expect(page.locator('.archive-boundary-card')).toContainText('Human review');
    await expect(page.locator('.evidence-pack-label')).toContainText('archive only');
    await expect(page.locator('.evidence-pack-state-value')).toContainText('WATCH');
    await expect(page.locator('.archive-watch-meaning')).toContainText('evidence sufficiency');
    await expect(page.locator('.archive-watch-meaning')).toContainText('not a negative project rating');

    await page.getByRole('link', { name: 'Open the historical record' }).click();
    await expect(page).toHaveURL(/#historical-record$/);
    expect(await page.locator('#historical-record').evaluate(section => (
      section.getBoundingClientRect().top
    ))).toBeGreaterThanOrEqual(74);

    const labels = await page.locator('.evidence-pack-content .evidence-section-label').allTextContents();
    expect(labels).toEqual(analyticalSections);

    await expect(page.locator('.evidence-meta-list dt', { hasText: 'Human review' })).toHaveCount(1);
    await expect(page.locator('.reason-code-list li')).toHaveCount(3);
    await expect(page.locator('.archive-case-switch')).toHaveAttribute('href', archiveCase.crossCaseHref);

    const images = page.locator('.evidence-input-figure img');
    await expect(images).toHaveCount(2);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(async () => image.evaluate(node => node.naturalWidth)).toBeGreaterThan(0);
      const ratio = await image.evaluate(node => {
        const box = node.getBoundingClientRect();
        return box.width / box.height;
      });
      expect(Math.abs(ratio - (16 / 9))).toBeLessThan(0.02);
    }

    const missingTargets = await page.locator('main a').evaluateAll(links => links
      .filter(link => !link.getAttribute('href'))
      .map(link => link.textContent?.trim()));
    expect(missingTargets).toEqual([]);
  });

  test(`${archiveCase.slug} remains readable and overflow-free across supported widths`, async ({ page }) => {
    for (const width of responsiveWidths) {
      await preparePage(page, width);
      await openCase(page, archiveCase.route);

      const audit = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const undersized = [...document.querySelectorAll('main *')]
          .filter(element => {
            const style = getComputedStyle(element);
            const ownText = [...element.childNodes]
              .filter(node => node.nodeType === Node.TEXT_NODE)
              .map(node => node.textContent.trim())
              .join('');
            return ownText && style.display !== 'none' && style.visibility !== 'hidden';
          })
          .map(element => ({
            text: element.textContent.trim().slice(0, 60),
            size: Number.parseFloat(getComputedStyle(element).fontSize)
          }))
          .filter(item => item.size < 12);
        return { overflow, undersized };
      });

      expect(audit.overflow, `${archiveCase.route} overflow at ${width}px`).toBeLessThanOrEqual(1);
      expect(audit.undersized, `${archiveCase.route} type floor at ${width}px`).toEqual([]);
    }
  });
}

test('creates deterministic WP0 archive review screenshots', async ({ page }) => {
  const outputDirectory = path.resolve('artifacts/wp0-evidence-archive');
  await mkdir(outputDirectory, { recursive: true });

  for (const archiveCase of archiveCases) {
    for (const width of [390, 1280]) {
      await preparePage(page, width, width === 390 ? 844 : 1000);
      await openCase(page, archiveCase.route);
      await page.screenshot({
        path: path.join(outputDirectory, `${archiveCase.slug}-${width}.png`),
        fullPage: true,
        animations: 'disabled'
      });
    }
  }
});
