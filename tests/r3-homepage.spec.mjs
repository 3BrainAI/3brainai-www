import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const responsiveWidths = [320, 390, 768, 1280, 1440, 1920];
const evidencePackDesktopWidths = [768, 1280, 1440, 1920];
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

async function activateEvidencePackAnchor(page) {
  await page.locator('.r3-proof-link').click();
  await expect(page).toHaveURL(/#evidence-pack-sample$/);

  await expect.poll(() => page.evaluate(() => {
    const target = document.querySelector('#evidence-pack-sample');
    const stickyHeader = document.querySelector('.site-header');
    if (!target || !stickyHeader) return false;

    const targetTop = target.getBoundingClientRect().top;
    const headerBottom = stickyHeader.getBoundingClientRect().bottom;
    return targetTop >= headerBottom && targetTop <= headerBottom + 32;
  }), {
    message: 'Evidence Pack anchor should settle below the sticky header'
  }).toBeTruthy();

  await expect(page.locator('#evidence-pack-sample .evidence-pack-label')).toBeInViewport();
  await expect(page.locator('#evidence-pack-title')).toBeInViewport();
  await expect(page.locator('#evidence-pack-sample .evidence-pack-state')).toBeInViewport();
}

test('homepage preserves the approved review-safety invariants', async ({ page }) => {
  await openHomepage(page, 1280);

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Review-ready evidence');
  await expect(page.locator('#evidence-pack-sample')).toHaveCount(1);
  await expect(page.locator('#evidence-pack-sample .evidence-pack-state')).toContainText('WATCH');
  const eoInput = page.locator('.evidence-eo-input');
  await expect(eoInput).toHaveCount(1);
  await expect(eoInput.locator('.evidence-eo-image')).toHaveAttribute(
    'src',
    '/assets/img/cri/sentinel-lom-bilina.jpg'
  );
  await expect(eoInput.locator('.evidence-eo-image')).toHaveAttribute(
    'alt',
    /open-pit lignite mining area near Bílina/
  );
  await expect(eoInput.locator('figcaption')).toContainText('Open-pit lignite mining area');
  await expect(eoInput.locator('figcaption')).toContainText('2 Aug 2026');
  await expect(eoInput.locator('figcaption')).toContainText('not a validated CRI assessment');
  await expect(eoInput.locator('figcaption')).toContainText(
    'Contains modified Copernicus Sentinel data (2026).'
  );
  await expect(page.locator('.evidence-eo-input-placeholder')).toHaveCount(0);

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

test('Evidence Pack content surface remains independent of the provenance rail', async ({ page }) => {
  for (const width of evidencePackDesktopWidths) {
    await openHomepage(page, width);

    const geometry = await page.evaluate(() => {
      const content = document.querySelector('.evidence-pack-content');
      const lastSection = document.querySelector('.evidence-next-step');
      const rail = document.querySelector('.evidence-pack-metadata');
      const eoInput = document.querySelector('.evidence-eo-input');
      const demoNote = document.querySelector('.evidence-demo-note');
      const layout = document.querySelector('.evidence-pack-layout');

      if (!content || !lastSection || !rail || !eoInput || !demoNote || !layout) return null;

      const contentRect = content.getBoundingClientRect();
      const lastSectionRect = lastSection.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();

      return {
        contentTail: contentRect.bottom - lastSectionRect.bottom,
        railExtension: railRect.bottom - contentRect.bottom,
        contentBeforeRail: Boolean(
          content.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
        eoRemainsInRail: rail.contains(eoInput),
        noteRemainsInRail: rail.contains(demoNote),
        contentBackground: getComputedStyle(content).backgroundColor,
        layoutBackground: getComputedStyle(layout).backgroundColor
      };
    });

    expect(geometry, `Evidence Pack geometry is available at ${width}px`).not.toBeNull();
    expect(geometry.contentTail, `main surface ends with its last section at ${width}px`).toBeLessThanOrEqual(1.1);
    expect(geometry.railExtension, `provenance rail remains independently taller at ${width}px`).toBeGreaterThan(16);
    expect(geometry.contentBeforeRail).toBeTruthy();
    expect(geometry.eoRemainsInRail).toBeTruthy();
    expect(geometry.noteRemainsInRail).toBeTruthy();
    expect(geometry.contentBackground).toBe('rgb(255, 254, 251)');
    expect(geometry.layoutBackground).toBe('rgb(241, 242, 239)');
  }
});

test('Evidence Pack mobile stacking and DOM order remain unchanged', async ({ page }) => {
  for (const width of [320, 390]) {
    await openHomepage(page, width, 844);

    const geometry = await page.evaluate(() => {
      const content = document.querySelector('.evidence-pack-content');
      const rail = document.querySelector('.evidence-pack-metadata');
      if (!content || !rail) return null;

      const contentRect = content.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      return {
        contentBeforeRail: Boolean(
          content.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
        stackedWithoutOverlap: railRect.top >= contentRect.bottom - 1
      };
    });

    expect(geometry, `Evidence Pack mobile geometry is available at ${width}px`).not.toBeNull();
    expect(geometry.contentBeforeRail).toBeTruthy();
    expect(geometry.stackedWithoutOverlap).toBeTruthy();
  }
});

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

test('Evidence Pack anchor exposes its label, title and status at desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 1920, height: 1080 },
    { width: 390, height: 844 }
  ]) {
    await openHomepage(page, viewport.width, viewport.height);
    await activateEvidencePackAnchor(page);
  }
});

test('creates deterministic full-page and focused review screenshots', async ({ page }) => {
  test.setTimeout(120_000);
  const outputDirectory = path.resolve('artifacts/r3-preview');
  await mkdir(outputDirectory, { recursive: true });

  for (const viewport of [
    { width: 1280, height: 900, filename: 'r3-homepage-1280.png' },
    { width: 1440, height: 900, filename: 'r3-homepage-1440.png' },
    { width: 1920, height: 1080, filename: 'r3-homepage-1920.png' },
    { width: 390, height: 844, filename: 'r3-homepage-390.png' }
  ]) {
    await openHomepage(page, viewport.width, viewport.height);
    await page.screenshot({
      path: path.join(outputDirectory, viewport.filename),
      fullPage: true,
      animations: 'disabled'
    });
  }

  await openHomepage(page, 1280, 900);
  await page.screenshot({
    path: path.join(outputDirectory, 'r3-homepage-desktop-1280.png'),
    animations: 'disabled'
  });

  await openHomepage(page, 390, 844);
  await page.screenshot({
    path: path.join(outputDirectory, 'r3-homepage-mobile-390.png'),
    animations: 'disabled'
  });
  await page.locator('#evidence-pack-sample').screenshot({
    path: path.join(outputDirectory, 'r3-evidence-pack-mobile-390.png'),
    animations: 'disabled'
  });

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 }
  ]) {
    await openHomepage(page, viewport.width, viewport.height);
    await activateEvidencePackAnchor(page);
    await page.locator('#evidence-pack-sample').screenshot({
      path: path.join(outputDirectory, `r3-evidence-pack-closeup-${viewport.width}.png`),
      animations: 'disabled'
    });

    if (viewport.width === 1280) {
      await page.screenshot({
        path: path.join(outputDirectory, 'r3-evidence-pack-target-desktop-1280.png'),
        animations: 'disabled'
      });
    }
  }

  await openHomepage(page, 390, 844);
  await activateEvidencePackAnchor(page);
  await page.screenshot({
    path: path.join(outputDirectory, 'r3-evidence-pack-target-mobile-390.png'),
    animations: 'disabled'
  });
});
