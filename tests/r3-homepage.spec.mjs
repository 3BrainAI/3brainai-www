import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const responsiveWidths = [320, 390, 768, 1280, 1920];
const integrationSectionIds = [
  'evidence-gap',
  'evidence-pack-proof',
  'observed-vs-declared',
  'how-it-works',
  'validation-path',
  'governance-layer',
  'founder-proof',
  'final-cta'
];

async function openHomepage(page, width, height = 900) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await page.evaluate(() => document.fonts?.ready);
}

test('homepage preserves the approved review-safety invariants', async ({ page }) => {
  await openHomepage(page, 1280);

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Review-ready evidence');
  await expect(page.locator('#evidence-pack-sample')).toHaveCount(1);
  await expect(page.locator('#evidence-pack-sample .evidence-pack-state')).toContainText('WATCH');
  await expect(page.locator('.evidence-eo-input-placeholder')).toHaveCount(1);

  const humanReview = page.locator('.evidence-pack-metadata dt', {
    hasText: /^Human review$/
  });
  await expect(humanReview).toHaveCount(1);
  await expect(humanReview.locator('xpath=..').locator('dd')).toHaveText('Required');

  const duplicateIds = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);

  const missingAnchors = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map(anchor => anchor.hash.slice(1))
      .filter(id => id && !document.getElementById(id))
  );
  expect(missingAnchors).toEqual([]);
});

test('CRI-first integration sections remain in the approved order when present', async ({ page }) => {
  await openHomepage(page, 1280);

  const integrationIsPresent = await page.locator('#evidence-gap').count();
  test.skip(integrationIsPresent === 0, 'Homepage integration is tested after PR #5 is applied.');

  const result = await page.evaluate(ids => {
    const sections = ids.map(id => document.getElementById(id));
    return {
      missing: ids.filter((id, index) => !sections[index]),
      ordered: sections.every((section, index) => {
        if (!section || index === sections.length - 1) return Boolean(section);
        const next = sections[index + 1];
        return Boolean(next && (section.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING));
      })
    };
  }, integrationSectionIds);

  expect(result.missing).toEqual([]);
  expect(result.ordered).toBeTruthy();
});

for (const width of responsiveWidths) {
  test(`homepage has no horizontal overflow at ${width}px`, async ({ page }) => {
    await openHomepage(page, width);

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('homepage local navigation targets resolve', async ({ page, request }) => {
  await openHomepage(page, 1280);

  const paths = await page.locator('a[href^="/"]').evaluateAll(anchors =>
    [...new Set(anchors.map(anchor => new URL(anchor.href).pathname))]
  );

  for (const pathname of paths) {
    const response = await request.get(pathname);
    expect.soft(response.ok(), `${pathname} returned ${response.status()}`).toBeTruthy();
  }
});

test('creates deterministic desktop and mobile review screenshots', async ({ page }) => {
  test.setTimeout(60_000);
  const outputDirectory = path.resolve('artifacts/r3-preview');
  await mkdir(outputDirectory, { recursive: true });

  for (const viewport of [
    { width: 1280, height: 900, filename: 'r3-homepage-1280.png' },
    { width: 390, height: 844, filename: 'r3-homepage-390.png' }
  ]) {
    await openHomepage(page, viewport.width, viewport.height);
    await page.screenshot({
      path: path.join(outputDirectory, viewport.filename),
      fullPage: true,
      animations: 'disabled'
    });
  }
});
