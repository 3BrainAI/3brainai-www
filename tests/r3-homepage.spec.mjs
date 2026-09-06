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

test('homepage implements the founder-approved R4-D content contract', async ({ page }) => {
  await openHomepage(page, 1440);

  await expect(page.locator('body')).toHaveClass('r4-home');
  await expect(page.locator('link[href="/assets/css/hp-corrections.css?v=r4d-20260906"]')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveText('The physical world does not wait for your next review.');
  await expect(page.locator('.r4-hero .r4-kicker')).toHaveText('For banks & institutional lenders');
  await expect(page.locator('.r4-domain-rail')).toHaveText(
    'Construction finance · Real-estate collateral · Infrastructure'
  );
  await expect(page.locator('.r4-human-boundary')).toHaveText(
    'Evidence for the people who review, challenge and decide.'
  );

  await expect(page.getByRole('link', { name: 'View an Evidence Pack' })).toHaveAttribute(
    'href',
    '/evidence-packs/fischamend/'
  );
  await expect(page.locator('.r4-hero').getByRole('link', {
    name: 'Discuss an Evidence Readiness Check'
  })).toHaveAttribute('href', '/validation/#readiness-form');
  await expect(page.locator('.r4-evidence-anchor')).toContainText('DEMO-EU-AT-FIS-01 · v0.1');

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

test('four relationship signals have equal hierarchy and explicit roles', async ({ page }) => {
  await openHomepage(page, 1440);

  const cards = page.locator('.r4-relationship-card');
  await expect(cards).toHaveCount(4);
  await expect(cards.locator('h3')).toHaveText([
    'ESA BIC Czech Republic',
    'Google for Startups Cloud Program',
    'OVHcloud Startup Program',
    'EY Startup Academy Frankfurt 2025'
  ]);
  await expect(cards.locator('.r4-status-label')).toHaveText([
    'Current programme involvement',
    'Technology programme & infrastructure support',
    'Technology programme & infrastructure support',
    'Historical programme participation'
  ]);

  await expect(cards.nth(0)).toContainText(
    'Participation does not imply ESA endorsement, product validation or customer status.'
  );
  await expect(cards.nth(1)).toContainText('Does not validate CRI, its infrastructure or security.');
  await expect(cards.nth(2)).toContainText(
    'Does not imply security attestation, certification or customer validation.'
  );
  await expect(cards.nth(3)).toContainText(
    'Historical company context; not current CRI, product or customer validation.'
  );
  await expect(cards.locator('a')).toHaveCount(0);
  await expect(page.locator('.r4-relationships > .r4-wrap > .r4-text-link')).toHaveAttribute(
    'href',
    '/about/#institutional-milestones'
  );

  const geometry = await cards.evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { width: Math.round(box.width), height: Math.round(box.height) };
  }));
  expect(new Set(geometry.map(item => item.width)).size).toBe(1);
  expect(Math.max(...geometry.map(item => item.height)) - Math.min(...geometry.map(item => item.height)))
    .toBeLessThanOrEqual(1);
});

test('Evidence Lens preserves the authentic record boundary and primary document route', async ({ page }) => {
  await openHomepage(page, 1440);

  const lens = page.locator('.r4-evidence-lens');
  await expect(lens).toContainText('Authentic record · readable excerpt');
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
  await expect(page.locator('.r4-signpost a, .r4-signpost button')).toHaveCount(0);
});

test('R4-D desktop folio uses the full ledger height without a dead vertical gap', async ({ page }) => {
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
      interPageGap: secondBox.top - firstBox.bottom
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry.railHeight).toBeGreaterThanOrEqual(920);
  expect(geometry.firstOffset).toBeLessThanOrEqual(18);
  expect(geometry.secondOffset).toBeGreaterThan(350);
  expect(geometry.interPageGap).toBeLessThan(100);
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
  });
}

test('mobile composition exposes the proof and stays within the working long-page envelope', async ({ page }) => {
  await openHomepage(page, 390, 844);

  const heroProof = page.locator('.r4-evidence-anchor');
  await expect(heroProof).toBeVisible();
  const pageMetrics = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    viewport: window.innerHeight
  }));
  expect(pageMetrics.height / pageMetrics.viewport).toBeLessThanOrEqual(11.5);

  const relationshipGridColumns = await page.locator('.r4-relationship-grid').evaluate(element =>
    getComputedStyle(element).gridTemplateColumns.split(' ').length
  );
  expect(relationshipGridColumns).toBe(2);

  const openPack = page.getByRole('link', { name: 'Open full Evidence Pack' });
  const openPackBox = await openPack.evaluate(element => element.getBoundingClientRect());
  expect(openPackBox.height).toBeGreaterThanOrEqual(44);

  const founderImageWidth = await page.locator('.r4-founder-portrait')
    .evaluate(element => element.getBoundingClientRect().width);
  expect(founderImageWidth).toBeGreaterThanOrEqual(96);
  expect(founderImageWidth).toBeLessThanOrEqual(112);
});
