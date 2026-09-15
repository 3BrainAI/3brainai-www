import { expect, test } from '@playwright/test';

const responsiveWidths = [320, 390, 768, 1024, 1440, 1920];
const sectionIds = [
  'overview',
  'relationships',
  'workflow',
  'review-record',
  'governed-boundary',
  'founder-context',
  'next-step'
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

async function checkHeroFraming(page, width) {
  const geometry = await page.evaluate(() => {
    const note = document.querySelector('.v3-brief-note');
    const strip = document.querySelector('.r38-term-strip').getBoundingClientRect();
    const folioAction = document.querySelector('.r4-review-action').getBoundingClientRect();
    return {
      noteLines: note.getBoundingClientRect().height / parseFloat(getComputedStyle(note).lineHeight),
      stripCentre: (strip.top + strip.bottom) / 2,
      termCentres: [...document.querySelectorAll('.r38-product-key > div')].map(item => {
        const box = item.getBoundingClientRect();
        return (box.top + box.bottom) / 2;
      }),
      buttonOffsets: [...document.querySelectorAll('.v3-home-journey .r4-button')]
        .map(button => button.getBoundingClientRect().bottom - folioAction.bottom)
    };
  });
  expect(geometry.noteLines).toBeCloseTo(2, 1);
  if (width > 760) {
    for (const centre of geometry.termCentres) {
      expect(Math.abs(centre - geometry.stripCentre)).toBeLessThanOrEqual(1);
    }
  }
  if (width >= 981) {
    for (const offset of geometry.buttonOffsets) expect(Math.abs(offset)).toBeLessThanOrEqual(1);
  }
}

test('homepage implements the founder-approved R4-E content contract', async ({ page }) => {
  await openHomepage(page, 1440);

  await expect(page.locator('body')).toHaveClass('r4-home');
  await expect(page.locator('link[href="/assets/css/hp-corrections.css?v=r37-programme-strip"]')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveText('The physical world does not wait for your next review.');
  await expect(page.locator('.r4-hero .r4-kicker')).toHaveText('For banks & institutional lenders');
  await expect(page.locator('.r4-domain-rail')).toHaveText(
    'Construction finance · Real-estate collateral · Infrastructure'
  );
  await expect(page.locator('.r4-hero .r4-lead')).toContainText(
    '3BrainAI’s Construction Risk Intelligence (CRI)'
  );
  await expect(page.locator('.r4-hero .r4-kicker')).toHaveCSS('font-size', '22px');
  await expect(page.locator('.r4-domain-rail')).toHaveCSS('font-size', '17px');
  await expect(page.locator('.r4-human-boundary')).toHaveText(
    'Evidence for the people who review, challenge and decide.'
  );
  await expect(page.locator('.r4-hero .r4-lead')).toContainText(
    'Initial focus: DACH, Benelux and Central Europe'
  );

  await expect(page.getByRole('link', { name: 'View an Evidence Pack' })).toHaveAttribute(
    'href',
    '/evidence-packs/fischamend/'
  );
  await expect(page.locator('.r4-hero').getByRole('link', {
    name: 'Explore The Brief'
  })).toHaveAttribute('href', '/cri/#the-brief');
  await expect(page.locator('.r4-hero')).toContainText('Public example · 2 pages · No sign-in.');
  await expect(page.locator('.r4-hero')).toContainText('Free editorial evaluation.');
  await expect(page.locator('.r4-evidence-anchor')).toHaveText(
    'Public example · real Copernicus data · synthetic scenario'
  );
  await expect(page.locator('.r38-product-key dt')).toHaveText(['CRI', 'Evidence Pack', 'The Brief']);

  const folioLinks = page.locator('a.r4-folio-sheet');
  await expect(folioLinks).toHaveCount(2);
  for (const link of await folioLinks.all()) {
    await expect(link).toHaveAttribute('href', '/evidence-packs/fischamend/');
  }

  const reviewInterval = page.locator('ol.r4-review-interval');
  await expect(reviewInterval).toHaveAttribute('aria-label', 'Review interval');
  await expect(reviewInterval.getByRole('listitem')).toHaveText([
    'Formal review',
    'Evidence Pack',
    'Next review'
  ]);
  await expect(reviewInterval.getByRole('link')).toHaveCount(0);
  const reviewAction = page.getByRole('link', { name: 'Explore the review cycle' });
  await expect(reviewAction).toHaveAttribute('href', '#workflow');
  await expect(page.locator('.r4-review-cycle').getByRole('link')).toHaveCount(1);
  await expect(page.locator('.r4-review-cycle')).toHaveCSS('pointer-events', 'none');
  await expect(reviewAction).toHaveCSS('pointer-events', 'auto');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await reviewInterval.locator('.r4-review-label').evaluateAll(labels => labels.map(label => ({
      background: getComputedStyle(label).backgroundColor,
      color: getComputedStyle(label).color
    })))).toEqual(Array(3).fill({
      background: 'rgba(230, 245, 246, 0.96)',
      color: 'rgb(7, 81, 107)'
    }));
  }
  await reviewAction.click();
  await expect(page).toHaveURL(/#workflow$/);

  const orderedSections = await page.evaluate(ids => {
    const sections = ids.map(id => document.getElementById(id));
    return {
      missing: ids.filter((id, index) => !sections[index]),
      ordered: sections.every((section, index) => {
        if (!section) return false;
        if (index === sections.length - 1) return true;
        return Boolean(section.compareDocumentPosition(sections[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING);
      })
    };
  }, sectionIds);
  expect(orderedSections).toEqual({ missing: [], ordered: true });

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

test('four current programmes and the historical EY context remain explicitly separated', async ({ page }) => {
  await openHomepage(page, 1440);

  const cards = page.locator('.r4-relationship-card');
  await expect(cards).toHaveCount(4);
  expect(await cards.locator('img').evaluateAll(images => images.map(img => img.alt))).toEqual([
    'ESA Business Incubation Centre Czech Republic',
    'OVHcloud Startup Program',
    'Google for Startups Cloud Program',
    'NVIDIA Inception Program'
  ]);
  await expect(cards.locator('.r4-relationship-body')).toHaveCount(0);
  for (const logo of await cards.locator('img').all()) {
    await expect(logo).toHaveCSS('filter', 'grayscale(1) saturate(0) contrast(0.78)');
  }

  await expect(cards.locator('a')).toHaveCount(0);
  const history = page.locator('.r4-relationship-history');
  await expect(history.locator('img')).toHaveCSS('filter', 'none');
  await expect(history).toContainText('Historical programme');
  await expect(history).toContainText('EY Startup Academy Frankfurt 2025');
  await expect(history).toContainText('Completed by 3BrainAI Solutions · company history');
  await expect(history.locator('.r4-relationship-history-link')).toHaveAttribute(
    'href',
    '/about/#institutional-milestones'
  );
  await expect(page.locator('.r4-relationship-qualifier')).toHaveCount(0);

  const geometry = await cards.evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { width: Math.round(box.width), height: Math.round(box.height) };
  }));
  expect(Math.max(...geometry.map(item => item.height))).toBeLessThanOrEqual(80);
  expect(await page.locator('#relationships').evaluate(el => el.getBoundingClientRect().height)).toBeLessThanOrEqual(340);
  expect(new Set(geometry.map(item => item.width)).size).toBe(1);
  expect(Math.max(...geometry.map(item => item.height)) - Math.min(...geometry.map(item => item.height)))
    .toBeLessThanOrEqual(1);
});

test('Evidence Lens makes the real-data and synthetic-scenario boundary explicit', async ({ page }) => {
  await openHomepage(page, 1440);

  const lens = page.locator('.r4-evidence-lens');
  await expect(lens).toContainText('Real Copernicus data · synthetic scenario');
  await expect(lens).toContainText('DEMO-EU-AT-FIS-01 · v0.1 public-safe release');
  await expect(lens).toContainText('Human review required');
  await expect(lens).toContainText('WATCH – Evidence sufficiency');
  await expect(lens).toContainText('High – large roofed footprint change only');
  await expect(lens).toContainText('Declared – synthetic');
  await expect(lens).toContainText('Observed – dated public evidence');
  await expect(lens).toContainText('20 Aug 2023 → 19 Aug 2025');
  await expect(lens).toContainText('Uncertainty and non-inference');
  await expect(lens).toContainText('WATCH refers to evidence sufficiency');
  await expect(lens).toContainText('it is not a negative project rating');
  await expect(lens).toContainText('Modified Copernicus Sentinel data 2023 and 2025');
  await expect(lens).toContainText('Did large roofed structures become visible');
  await expect(lens).toContainText('The released pack retains the full synthetic review question');

  const fullPack = lens.getByRole('link', { name: 'Open full Evidence Pack' });
  await expect(fullPack).toHaveAttribute('href', '/evidence-packs/fischamend/');
  const fullPackHeight = await fullPack.evaluate(element => element.getBoundingClientRect().height);
  expect(fullPackHeight).toBeGreaterThanOrEqual(44);

  const declaredBeforeObserved = await page.evaluate(() => {
    const declared = document.querySelector('.r4-declared');
    const observed = document.querySelector('.r4-observed');
    return Boolean(declared && observed &&
      (declared.compareDocumentPosition(observed) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(declaredBeforeObserved).toBeTruthy();

  const details = page.locator('.r4-qualifications');
  await expect(details).not.toHaveAttribute('open', '');
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await expect(details).toContainText('No actual project drawdown request');

  await expect(page.locator('.r4-signpost')).toHaveCount(2);
  const archiveLinks = page.locator('.r4-signpost-action a');
  await expect(archiveLinks).toHaveCount(2);
  expect(await archiveLinks.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual([
    '/evidence-packs/lausitz/',
    '/evidence-packs/german-north-sea/'
  ]);
  for (const link of await archiveLinks.all()) {
    await expect(link).toBeVisible();
    expect(await link.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
});

test('R4-E desktop folio aligns both full pages without a dead vertical gap', async ({ page }) => {
  await openHomepage(page, 1440, 1000);

  const geometry = await page.evaluate(() => {
    const rail = document.querySelector('.r4-record-folio');
    const first = rail?.querySelector('figure:first-child');
    const second = rail?.querySelector('figure:nth-child(2)');
    if (!rail || !first || !second) return null;
    const railBox = rail.getBoundingClientRect();
    const firstBox = first.getBoundingClientRect();
    const secondBox = second.getBoundingClientRect();
    return {
      railHeight: railBox.height,
      firstOffset: firstBox.top - railBox.top,
      secondOffset: secondBox.top - railBox.top,
      firstLeft: firstBox.left - railBox.left,
      secondLeft: secondBox.left - railBox.left,
      firstWidth: firstBox.width,
      secondWidth: secondBox.width,
      interPageGap: secondBox.top - firstBox.bottom,
      bottomReserve: railBox.bottom - secondBox.bottom
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry.railHeight).toBeGreaterThanOrEqual(920);
  expect(geometry.firstOffset).toBeLessThanOrEqual(18);
  expect(geometry.secondOffset).toBeGreaterThan(350);
  expect(Math.abs(geometry.firstLeft - geometry.secondLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.firstWidth - geometry.secondWidth)).toBeLessThanOrEqual(1);
  expect(geometry.interPageGap).toBeGreaterThanOrEqual(20);
  expect(geometry.interPageGap).toBeLessThanOrEqual(32);
  expect(geometry.bottomReserve).toBeLessThanOrEqual(100);
});

test('homepage images preserve their intended aspect ratios on desktop', async ({ page }) => {
  await openHomepage(page, 1280);

  const aspectRatios = await page.evaluate(() => {
    const measure = selector => {
      const image = document.querySelector(selector);
      if (!image) return null;
      const box = image.getBoundingClientRect();
      const declaredWidth = Number(image.getAttribute('width'));
      const declaredHeight = Number(image.getAttribute('height'));
      return {
        rendered: box.width / box.height,
        intended: declaredWidth / declaredHeight
      };
    };

    return {
      evidencePack: measure('.r4-record-folio figure:first-child img'),
      historicalObservation: measure('.r4-signpost:first-child img'),
      founderPortrait: measure('.r4-founder-portrait')
    };
  });

  for (const [name, ratio] of Object.entries(aspectRatios)) {
    expect(ratio, `${name} should be present`).not.toBeNull();
    expect(
      Math.abs(ratio.rendered - ratio.intended),
      `${name} should preserve its declared aspect ratio`
    ).toBeLessThan(0.02);
  }
});

test('homepage keeps governance and founder boundaries compact and explicit', async ({ page }) => {
  await openHomepage(page, 1280);

  const boundary = page.locator('#governed-boundary');
  await expect(boundary).toContainText('Inputs do not become conclusions by ingestion.');
  await expect(boundary).toContainText('Not a satellite-data platform');
  await expect(boundary).toContainText('Not automated credit decisioning');
  await expect(boundary).toContainText('Not an autonomous decision engine');
  await expect(boundary).toContainText('Not continuous monitoring');
  await expect(boundary.getByRole('link', { name: 'Explore the target governance layer' }))
    .toHaveAttribute('href', '/governance-layer/');
  await expect(boundary.getByRole('link', { name: /security/i })).toHaveCount(0);

  const founder = page.locator('#founder-context');
  await expect(founder.locator('.r4-founder-portrait')).toHaveAttribute(
    'src',
    '/assets/foto/prikryl-portret-4x5-navy.jpg'
  );
  await expect(founder).toContainText('Built from both sides of accountability.');
  await expect(founder).toContainText('Historical experience context, not CRI deployments or product outputs.');
  await expect(founder.getByRole('link', { name: 'Read the founder and company context' }))
    .toHaveAttribute('href', '/about/');

  const mainSecurityLinks = page.locator('main a[href="/security/"]');
  await expect(mainSecurityLinks).toHaveCount(0);
});

for (const width of responsiveWidths) {
  test(`homepage has no horizontal overflow and keeps a 12px type floor at ${width}px`, async ({ page }) => {
    await openHomepage(page, width);

    const audit = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const visibleTextElements = [...document.querySelectorAll('main *')].filter(element => {
        const style = getComputedStyle(element);
        const text = [...element.childNodes]
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .join('');
        return text && style.display !== 'none' && style.visibility !== 'hidden';
      });
      const undersized = visibleTextElements
        .map(element => ({
          tag: element.tagName,
          className: element.className,
          text: element.textContent.trim().slice(0, 50),
          size: Number.parseFloat(getComputedStyle(element).fontSize)
        }))
        .filter(item => item.size < 12);
      return { overflow, undersized };
    });

    expect(audit.overflow).toBeLessThanOrEqual(1);
    expect(audit.undersized).toEqual([]);
    await checkHeroFraming(page, width);
    if (width >= 981) {
      await page.setViewportSize({ width, height: 700 });
      await checkHeroFraming(page, width);
    }
  });
}

test('mobile composition bounds the approved Brief journey and retains the existing page envelope', async ({ page }, testInfo) => {
  await openHomepage(page, 390, 844);

  const heroProof = page.locator('.r4-evidence-anchor');
  await expect(heroProof).toBeVisible();
  const journey = page.locator('.v3-home-journey');
  await expect(journey.locator('.v3-home-step')).toHaveCount(2);
  for (const explanation of await journey.locator('.v3-home-step-label, .v3-home-note').all()) {
    await expect(explanation).toBeVisible();
  }
  const pageMetrics = await journey.evaluate(element => ({
    height: document.documentElement.scrollHeight,
    viewport: window.innerHeight,
    journeyHeight: element.getBoundingClientRect().height,
    explanationGeometry: [...element.querySelectorAll('.v3-home-step-label, .v3-home-note')].map(item => ({
      height: item.getBoundingClientRect().height,
      lineHeight: getComputedStyle(item).lineHeight
    }))
  }));
  // The R4-E budget included only two 48px buttons and a 12px gap (108px).
  // R3.2 explicitly adds two labels, explanatory text and a 54px Brief button.
  // CI measured the approved block at 316px at 390px with the test's fallback
  // fonts. Bound it at 320px, including the actual explanatory-text wrapping.
  // Keep the original 13.1-screen budget for the rest of the page instead of
  // raising it globally or hiding the explanatory text to satisfy the old test.
  const legacyActionRowHeight = 2 * 48 + 12;
  const normalizedHeight = pageMetrics.height - pageMetrics.journeyHeight + legacyActionRowHeight;
  await testInfo.attach('homepage-mobile-composition.json', {
    body: JSON.stringify({ ...pageMetrics, legacyActionRowHeight, normalizedHeight }, null, 2),
    contentType: 'application/json'
  });
  console.info('R3.2 mobile composition:', JSON.stringify({ ...pageMetrics, normalizedHeight }));
  expect(pageMetrics.journeyHeight).toBeLessThanOrEqual(320);
  expect(normalizedHeight / pageMetrics.viewport).toBeLessThanOrEqual(13.1);

  const relationshipGridColumns = await page.locator('.r4-relationship-grid').evaluate(element =>
    getComputedStyle(element).gridTemplateColumns.split(' ').length
  );
  expect(relationshipGridColumns).toBe(2);
  await expect(page.locator('#relationships-title')).toHaveCSS('font-size', '24px');

  const openPack = page.getByRole('link', { name: 'Open full Evidence Pack' });
  const openPackBox = await openPack.evaluate(element => element.getBoundingClientRect());
  expect(openPackBox.height).toBeGreaterThanOrEqual(44);

  const founderImageWidth = await page.locator('.r4-founder-portrait')
    .evaluate(element => element.getBoundingClientRect().width);
  expect(founderImageWidth).toBeGreaterThanOrEqual(96);
  expect(founderImageWidth).toBeLessThanOrEqual(112);
});

for (const width of [1280, 1024, 768, 390]) {
  test(`R4-E historical evidence remains visually usable at ${width}px`, async ({ page }) => {
    await openHomepage(page, width);

    const imageGeometry = await page.locator('.r4-signpost-images img').evaluateAll(images =>
      images.map(image => {
        const box = image.getBoundingClientRect();
        return {
          width: box.width,
          ratio: box.width / box.height
        };
      })
    );

    expect(imageGeometry).toHaveLength(4);
    for (const geometry of imageGeometry) {
      expect(geometry.width).toBeGreaterThanOrEqual(150);
      expect(Math.abs(geometry.ratio - (16 / 9))).toBeLessThan(0.02);
    }
  });
}

test('homepage lazy images load when scrolled into view', async ({ page }) => {
  await openHomepage(page, 1280);

  const portrait = page.locator('.r4-founder-portrait');
  await portrait.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => portrait.evaluate(image => image.naturalWidth))
    .toBeGreaterThan(0);

  const signpostImages = page.locator('.r4-signpost-images img');
  await expect(signpostImages).toHaveCount(4);
  for (const image of await signpostImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => image.evaluate(node => node.naturalWidth))
      .toBeGreaterThan(0);
  }
});
