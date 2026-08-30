import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const canonicalNavigation = [
  { label: 'CRI', href: '/cri/' },
  { label: 'Evidence Pack', href: '/#evidence-pack-sample' },
  { label: 'Validation', href: '/validation/' },
  { label: 'Investors', href: '/investors/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' }
];

const primaryJourneyRoutes = [
  { route: '/', slug: 'home' },
  { route: '/cri/', slug: 'cri' },
  { route: '/validation/', slug: 'validation' },
  { route: '/investors/', slug: 'investors' },
  { route: '/about/', slug: 'about' },
  { route: '/contact/', slug: 'contact' }
];

const scopedRoutes = [
  { route: '/', file: 'index.html', active: null, evidenceHref: '#portfolio' },
  { route: '/about/', file: 'about/index.html', active: 'About' },
  { route: '/contact/', file: 'contact/index.html', active: 'Contact' },
  { route: '/cri/', file: 'cri/index.html', active: 'CRI', evidenceHref: '/#portfolio' },
  { route: '/governance-layer/', file: 'governance-layer/index.html', active: null },
  { route: '/how-it-works/', file: 'how-it-works/index.html', active: null },
  { route: '/imprint/', file: 'imprint/index.html', active: null },
  { route: '/investors/', file: 'investors/index.html', active: 'Investors', evidenceHref: '/#portfolio' },
  { route: '/mis/', file: 'mis/index.html', active: null },
  { route: '/pilots/', file: 'pilots/index.html', active: 'Validation' },
  { route: '/privacy/', file: 'privacy/index.html', active: null },
  { route: '/product/', file: 'product/index.html', active: null },
  { route: '/security/', file: 'security/index.html', active: null },
  { route: '/use-cases/', file: 'use-cases/index.html', active: null },
  { route: '/validation/', file: 'validation/index.html', active: 'Validation', evidenceHref: '/#portfolio' }
];

const representativeRoutes = [
  ...primaryJourneyRoutes.map(({ route }) => route),
  '/governance-layer/',
  '/mis/',
  '/use-cases/',
  '/security/'
];

const responsiveWidths = [320, 390, 768, 1280, 1920];

async function preparePage(page, width, height = 900) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function openRoute(page, route) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `${route} should return a successful response`).toBeTruthy();
  await page.evaluate(() => document.fonts?.ready);
}

for (const routeContract of scopedRoutes) {
  test(`${routeContract.file} uses the canonical navigation and active state`, async ({ page }) => {
    await preparePage(page, 1280);
    await openRoute(page, routeContract.route);

    const links = page.locator('.nav[aria-label="Main navigation"] > a');
    await expect(links).toHaveCount(canonicalNavigation.length);

    const actual = await links.evaluateAll(anchors => anchors.map(anchor => ({
      label: anchor.textContent?.trim(),
      href: anchor.getAttribute('href')
    })));
    const expected = canonicalNavigation.map(item => ({
      label: item.label,
      href: item.label === 'Evidence Pack' && routeContract.evidenceHref
        ? routeContract.evidenceHref
        : item.href
    }));
    expect(actual).toEqual(expected);

    const activeLinks = page.locator('.nav[aria-label="Main navigation"] > a.active');
    if (routeContract.active) {
      await expect(activeLinks).toHaveCount(1);
      await expect(activeLinks).toHaveText(routeContract.active);
    } else {
      await expect(activeLinks).toHaveCount(0);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.menu-toggle').click();
    await expect(page.locator('.nav[aria-label="Main navigation"]')).toHaveClass(/\bopen\b/);
    for (const link of await links.all()) {
      await expect(link).toBeVisible();
    }

    const footer = page.locator('.footer');
    await expect(footer.locator('.footer-navigation')).toHaveCount(2);
    await expect(footer.locator('.footer-europe')).toHaveText('European startup · Head office in Prague');
    await expect(footer.locator('.footer-market-focus')).toHaveText(
      'Focused on DACH, Benelux and Central European institutional markets.'
    );
    await expect(footer.locator('.footer-esa-statement')).toHaveText(
      '3BrainAI Nexus s.r.o. is participating in the ESA Business Incubation Centre Czech Republic.'
    );
    await expect(footer.locator('.footer-esa-link')).toHaveAttribute('href', 'https://www.esa-bic.cz/');
    await expect(footer.locator('.footer-esa-link img')).toHaveAttribute('src', '/assets/img/esa-bic-cz-white.png');
    await expect(footer.locator('.footer-navigation a', { hasText: 'Data Plane' })).toHaveAttribute(
      'href',
      '/governance-layer/'
    );
    await expect(footer.locator('.footer-navigation a', { hasText: 'Records' })).toHaveAttribute(
      'href',
      '/mis/'
    );
  });
}

test('every canonical navigation target resolves', async ({ page, request }) => {
  await preparePage(page, 1280);

  for (const { href, label } of canonicalNavigation) {
    if (href.includes('#')) continue;
    const response = await request.get(href);
    expect.soft(response.ok(), `${label} target ${href} returned ${response.status()}`).toBeTruthy();
  }

  await openRoute(page, '/#portfolio');
  await expect(page.locator('#portfolio')).toHaveCount(1);

  await openRoute(page, '/#evidence-pack-sample');
  await expect(page.locator('#evidence-pack-sample')).toHaveCount(1);
});

test('primary journeys use a coherent heading hierarchy', async ({ page }) => {
  await preparePage(page, 1280);

  for (const { route } of primaryJourneyRoutes) {
    await openRoute(page, route);
    const headingLevels = await page.locator('main h1, main h2, main h3, main h4, main h5, main h6')
      .evaluateAll(headings => headings.map(heading => Number(heading.tagName.slice(1))));
    const skippedLevels = headingLevels
      .slice(1)
      .filter((level, index) => level - headingLevels[index] > 1);

    expect(headingLevels.filter(level => level === 1), `${route} should have exactly one h1`)
      .toHaveLength(1);
    expect(skippedLevels, `${route} should not skip heading levels`).toEqual([]);
  }
});

for (const width of responsiveWidths) {
  test(`representative English routes have no horizontal overflow at ${width}px`, async ({ page }) => {
    await preparePage(page, width);

    for (const route of representativeRoutes) {
      await openRoute(page, route);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect.soft(overflow, `${route} overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  });
}

test('footer is compact on desktop and preserves two-column navigation on mobile', async ({ page }) => {
  await preparePage(page, 1280, 900);
  await openRoute(page, '/');

  const desktop = await page.locator('.footer').evaluate(footer => {
    const main = footer.querySelector('.footer-main');
    const columns = main ? [...main.children].map(child => child.getBoundingClientRect()) : [];
    return {
      height: footer.getBoundingClientRect().height,
      columnCount: columns.length,
      distinctColumnStarts: new Set(columns.map(rect => Math.round(rect.left))).size
    };
  });
  expect(desktop.height).toBeLessThan(380);
  expect(desktop.columnCount).toBe(4);
  expect(desktop.distinctColumnStarts).toBe(4);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.locator('.footer').evaluate(footer => {
    const primary = footer.querySelector('.footer-navigation--primary')?.getBoundingClientRect();
    const secondary = footer.querySelector('.footer-navigation--secondary')?.getBoundingClientRect();
    const contact = footer.querySelector('.footer-contact')?.getBoundingClientRect();
    if (!primary || !secondary || !contact) return null;
    return {
      navigationAligned: Math.abs(primary.top - secondary.top) <= 1,
      navigationSideBySide: secondary.left >= primary.right - 1,
      contactBelowNavigation: contact.top >= Math.max(primary.bottom, secondary.bottom) - 1
    };
  });
  expect(mobile).not.toBeNull();
  expect(mobile.navigationAligned).toBeTruthy();
  expect(mobile.navigationSideBySide).toBeTruthy();
  expect(mobile.contactBelowNavigation).toBeTruthy();
});

test('primary navigation links retain a visible keyboard focus indicator', async ({ page }) => {
  await preparePage(page, 1280);

  for (const route of ['/', '/about/']) {
    await openRoute(page, route);
    const firstLink = page.locator('.nav[aria-label="Main navigation"] > a').first();
    await firstLink.focus();

    const focusState = await firstLink.evaluate(link => {
      const style = getComputedStyle(link);
      return {
        focused: document.activeElement === link,
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth)
      };
    });

    expect(focusState.focused, `${route} navigation link should receive focus`).toBeTruthy();
    expect(focusState.outlineStyle, `${route} focus outline should be visible`).not.toBe('none');
    expect(focusState.outlineWidth, `${route} focus outline should have width`).toBeGreaterThan(0);
  }
});

test('creates deterministic fast-refresh screenshots for the six primary journeys', async ({ page }) => {
  test.setTimeout(120_000);
  const outputDirectory = path.resolve('artifacts/r3-preview');
  await mkdir(outputDirectory, { recursive: true });
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);

    for (const { route, slug } of primaryJourneyRoutes) {
      await openRoute(page, route);
      await page.screenshot({
        path: path.join(outputDirectory, `fast-refresh-${slug}-${viewport.width}.png`),
        fullPage: true,
        animations: 'disabled'
      });
    }
  }
});
