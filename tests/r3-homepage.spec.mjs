import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const responsiveWidths = [320, 390, 768, 1280, 1440, 1920];
const evidencePackDesktopWidths = [768, 1280, 1440, 1920];
const integrationSectionIds = [
  'evidence-gap',
  'evidence-pack-proof',
  'observed-vs-declared',
  'bank-review-scenario',
  'how-it-works',
  'validation-path',
  'governance-layer',
  'institutional-proof',
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

  await expect(page.locator('#evidence-pack-sample .evidence-case-selector')).toBeInViewport();
  await expect(page.locator('#panel-lausitz .evidence-pack-label')).toBeInViewport();
  await expect(page.locator('#lausitz-pack-title')).toBeInViewport();
  await expect(page.locator('#panel-lausitz .evidence-pack-state')).toBeInViewport();
}

test('homepage preserves the approved review-safety invariants', async ({ page }) => {
  await openHomepage(page, 1280);

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Review-ready evidence');
  await expect(page.locator('.r3-hero .kicker')).toHaveText('For banks and institutional lenders');
  await expect(page.locator('.r3-hero .lead')).toHaveText(
    '3BrainAI CRI turns Earth Observation and project context into governed Evidence Packs for credit-risk, real-estate and project-finance review — with explicit uncertainty, provenance and mandatory human review.'
  );
  await expect(page.locator('.r3-boundary-line')).toHaveText(
    'CRI supports accountable human review. It does not make autonomous credit decisions, replace bank policy or replace professional assessment.'
  );
  await expect(page.locator('.r3-buyer-strip > li')).toHaveText([
    'Credit risk & portfolio monitoring',
    'CRE & project finance',
    'Collateral & progress review'
  ]);
  await expect(page.locator('#evidence-pack-sample')).toHaveCount(1);
  await expect(page.getByRole('tablist', { name: 'Synthetic Evidence Pack cases' })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(2);
  await expect(page.locator('#tab-lausitz')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-north-sea')).toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('#panel-lausitz')).toBeVisible();
  await expect(page.locator('#panel-north-sea')).toBeHidden();
  await expect(page.locator('#panel-lausitz .evidence-pack-state')).toContainText('WATCH');
  await expect(page.locator('#panel-lausitz .evidence-pack-case-title')).toHaveText(
    'Post-mining transformation — Lausitz, Germany'
  );
  await expect(page.locator('.evidence-eo-input')).toHaveCount(0);
  await expect(page.locator('img[src="/assets/img/cri/sentinel-lom-bilina.jpg"]')).toHaveCount(0);

  const humanReview = page.locator('.evidence-pack-metadata dt', {
    hasText: /^Human review$/
  });
  await expect(humanReview).toHaveCount(2);
  await expect(humanReview.locator('xpath=..').locator('dd')).toHaveText(['Required', 'Required']);

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

  await expect(page.locator('#bank-review-scenario')).toContainText(
    'A WATCH status routes the evidence to human review; it does not trigger a credit decision.'
  );
  await expect(page.locator('#institutional-proof')).toContainText(
    '3BrainAI Nexus s.r.o. is participating in the ESA Business Incubation Centre Czech Republic.'
  );
  await expect(page.locator('#institutional-proof a')).toHaveAttribute('href', 'https://www.esa-bic.cz/');
  await expect(page.getByRole('link', { name: 'Request investor materials' })).toHaveAttribute(
    'href',
    /mailto:investors@3brain\.ai/
  );
});

test('Evidence Pack case selector is manual and keyboard accessible', async ({ page }) => {
  await openHomepage(page, 1280);

  const lausitzTab = page.locator('#tab-lausitz');
  const northSeaTab = page.locator('#tab-north-sea');
  const lausitzPanel = page.locator('#panel-lausitz');
  const northSeaPanel = page.locator('#panel-north-sea');

  await page.waitForTimeout(750);
  await expect(lausitzTab).toHaveAttribute('aria-selected', 'true');
  await expect(lausitzPanel).toBeVisible();
  await expect(northSeaPanel).toBeHidden();

  await northSeaTab.click();
  await expect(northSeaTab).toHaveAttribute('aria-selected', 'true');
  await expect(northSeaTab).toHaveAttribute('tabindex', '0');
  await expect(lausitzTab).toHaveAttribute('aria-selected', 'false');
  await expect(lausitzTab).toHaveAttribute('tabindex', '-1');
  await expect(northSeaPanel).toBeVisible();
  await expect(lausitzPanel).toBeHidden();

  await northSeaTab.focus();
  await northSeaTab.press('Home');
  await expect(lausitzTab).toBeFocused();
  await expect(lausitzTab).toHaveAttribute('aria-selected', 'true');
  await expect(lausitzPanel).toBeVisible();

  await lausitzTab.press('End');
  await expect(northSeaTab).toBeFocused();
  await expect(northSeaTab).toHaveAttribute('aria-selected', 'true');
  await expect(northSeaPanel).toBeVisible();

  await northSeaTab.press('ArrowRight');
  await expect(lausitzTab).toBeFocused();
  await expect(lausitzPanel).toBeVisible();
});

test('European Evidence Pack variants preserve approved sources and claim boundaries', async ({ page, request }) => {
  await openHomepage(page, 1280);

  const lausitz = page.locator('#panel-lausitz');
  await expect(lausitz).toContainText('DEMO-EU-LUS-01');
  await expect(lausitz).toContainText('VISIBLE_SURFACE_CHANGE');
  await expect(lausitz).toContainText('ENGINEERING_STATE_UNVERIFIED');
  await expect(lausitz).toContainText(
    'Engineering completion, water quality and geotechnical condition cannot be determined from imagery alone.'
  );
  await expect(lausitz.locator('.evidence-input-figure')).toHaveCount(2);
  await expect(lausitz.locator('.evidence-input-figure').first()).toContainText('T0 · Optical baseline');
  await expect(lausitz.locator('.evidence-input-figure').nth(1)).toContainText('T1 · Recent observation');
  await expect(lausitz.locator('.evidence-input-footer')).toContainText(
    'Contains modified Copernicus Sentinel data (2019, 2026).'
  );

  const northSea = page.locator('#panel-north-sea');
  await expect(northSea).toContainText('DEMO-EU-NSEA-01');
  await expect(northSea).toContainText('REPEAT_PASS_CONTEXT');
  await expect(northSea).toContainText('SUBSEA_SCOPE_UNVERIFIED');
  await expect(northSea).toContainText(
    'Sentinel-1 GRD VV contains backscatter, not interferometric phase, and cannot confirm subsea works, deformation or structural condition.'
  );
  await expect(northSea.locator('.evidence-input-figure')).toHaveCount(2);
  await expect(northSea.locator('.evidence-input-figure').first()).toContainText('T0 · Repeat-pass baseline');
  await expect(northSea.locator('.evidence-input-figure').nth(1)).toContainText('T1 · Repeat-pass observation');
  await expect(northSea.locator('.evidence-input-footer')).toContainText(
    'Contains modified Copernicus Sentinel data (2026).'
  );

  const sourcePaths = await page.locator('.evidence-input-figure source').evaluateAll(sources =>
    sources.map(source => source.getAttribute('srcset'))
  );
  const fallbackPaths = await page.locator('.evidence-input-figure img').evaluateAll(images =>
    images.map(image => image.getAttribute('src'))
  );

  expect(sourcePaths).toEqual([
    '/assets/img/cri/evidence/lausitz-t0-2019-16x9.webp',
    '/assets/img/cri/evidence/lausitz-t1-2026-16x9.webp',
    '/assets/img/cri/evidence/north-sea-t0-2026-06-07-16x9.webp',
    '/assets/img/cri/evidence/north-sea-t1-2026-06-19-16x9.webp'
  ]);
  expect(fallbackPaths).toEqual([
    '/assets/img/cri/evidence/lausitz-t0-2019-16x9.png',
    '/assets/img/cri/evidence/lausitz-t1-2026-16x9.png',
    '/assets/img/cri/evidence/north-sea-t0-2026-06-07-16x9.png',
    '/assets/img/cri/evidence/north-sea-t1-2026-06-19-16x9.png'
  ]);

  for (const assetPath of [...sourcePaths, ...fallbackPaths]) {
    const response = await request.get(assetPath);
    expect.soft(response.ok(), `${assetPath} returned ${response.status()}`).toBeTruthy();
  }
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

test('Evidence input excerpt spans the pack below the document body', async ({ page }) => {
  for (const width of evidencePackDesktopWidths) {
    await openHomepage(page, width);

    const geometry = await page.evaluate(() => {
      const pack = document.querySelector('#panel-lausitz .evidence-pack-sample');
      const layout = pack?.querySelector('.evidence-pack-layout');
      const rail = pack?.querySelector('.evidence-pack-metadata');
      const band = pack?.querySelector('.evidence-input-band');
      const figures = band ? [...band.querySelectorAll('.evidence-input-figure')] : [];

      if (!pack || !layout || !rail || !band || figures.length !== 2) return null;

      const packRect = pack.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      const bandRect = band.getBoundingClientRect();
      const firstFigureRect = figures[0].getBoundingClientRect();
      const secondFigureRect = figures[1].getBoundingClientRect();

      return {
        bandLeftInset: bandRect.left - packRect.left,
        bandRightInset: packRect.right - bandRect.right,
        bandAfterLayout: bandRect.top >= layoutRect.bottom - 1,
        bandFollowsLayoutInDom: Boolean(
          layout.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
        bandOutsideRail: !rail.contains(band),
        railEndsBeforeBand: railRect.bottom <= bandRect.top + 1,
        figuresSideBySide: secondFigureRect.left >= firstFigureRect.right - 1,
        t0BeforeT1: Boolean(
          figures[0].compareDocumentPosition(figures[1]) & Node.DOCUMENT_POSITION_FOLLOWING
        )
      };
    });

    expect(geometry, `Evidence Pack geometry is available at ${width}px`).not.toBeNull();
    expect(geometry.bandLeftInset, `band reaches the left pack edge at ${width}px`).toBeLessThanOrEqual(1.1);
    expect(geometry.bandRightInset, `band reaches the right pack edge at ${width}px`).toBeLessThanOrEqual(1.1);
    expect(geometry.bandAfterLayout).toBeTruthy();
    expect(geometry.bandFollowsLayoutInDom).toBeTruthy();
    expect(geometry.bandOutsideRail).toBeTruthy();
    expect(geometry.railEndsBeforeBand).toBeTruthy();
    expect(geometry.figuresSideBySide, `T0 and T1 remain paired at ${width}px`).toBeTruthy();
    expect(geometry.t0BeforeT1).toBeTruthy();
  }
});

test('both Evidence Pack variants stack body, metadata, T0 and T1 in mobile order', async ({ page }) => {
  for (const width of [320, 390]) {
    await openHomepage(page, width, 844);

    for (const caseName of ['lausitz', 'north-sea']) {
      await page.locator(`#tab-${caseName}`).click();
      await expect(page.locator(`#panel-${caseName}`)).toBeVisible();

      const geometry = await page.locator(`#panel-${caseName}`).evaluate(panel => {
        const content = panel.querySelector('.evidence-pack-content');
        const rail = panel.querySelector('.evidence-pack-metadata');
        const band = panel.querySelector('.evidence-input-band');
        const figures = [...panel.querySelectorAll('.evidence-input-figure')];
        if (!content || !rail || !band || figures.length !== 2) return null;

        const contentRect = content.getBoundingClientRect();
        const railRect = rail.getBoundingClientRect();
        const bandRect = band.getBoundingClientRect();
        const firstFigureRect = figures[0].getBoundingClientRect();
        const secondFigureRect = figures[1].getBoundingClientRect();

        return {
          contentBeforeRail: Boolean(
            content.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
          railBeforeBand: Boolean(
            rail.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
          t0BeforeT1: Boolean(
            figures[0].compareDocumentPosition(figures[1]) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
          bodyStacked: railRect.top >= contentRect.bottom - 1,
          bandStacked: bandRect.top >= railRect.bottom - 1,
          figuresStacked: secondFigureRect.top >= firstFigureRect.bottom - 1
        };
      });

      expect(geometry, `${caseName} mobile geometry is available at ${width}px`).not.toBeNull();
      expect(geometry.contentBeforeRail).toBeTruthy();
      expect(geometry.railBeforeBand).toBeTruthy();
      expect(geometry.t0BeforeT1).toBeTruthy();
      expect(geometry.bodyStacked).toBeTruthy();
      expect(geometry.bandStacked).toBeTruthy();
      expect(geometry.figuresStacked).toBeTruthy();
    }
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
