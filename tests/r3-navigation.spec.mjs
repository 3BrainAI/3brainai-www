import { expect, test } from '@playwright/test';

const canonicalNavigation = [
  { label: 'CRI', href: '/cri/' },
  { label: 'Evidence Pack', href: '/#evidence-pack-sample' },
  { label: 'Validation', href: '/validation/' },
  { label: 'Data Plane', href: '/governance-layer/' },
  { label: 'Records', href: '/mis/' },
  { label: 'Investors', href: '/investors/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' }
];

const scopedRoutes = [
  { route: '/', file: 'index.html', active: null, evidenceHref: '#evidence-pack-sample' },
  { route: '/about/', file: 'about/index.html', active: 'About' },
  { route: '/contact/', file: 'contact/index.html', active: 'Contact' },
  { route: '/cri/', file: 'cri/index.html', active: 'CRI' },
  { route: '/governance-layer/', file: 'governance-layer/index.html', active: 'Data Plane' },
  { route: '/how-it-works/', file: 'how-it-works/index.html', active: 'Data Plane' },
  { route: '/imprint/', file: 'imprint/index.html', active: null },
  { route: '/investors/', file: 'investors/index.html', active: 'Investors' },
  { route: '/mis/', file: 'mis/index.html', active: 'Records' },
  { route: '/pilots/', file: 'pilots/index.html', active: 'Validation' },
  { route: '/privacy/', file: 'privacy/index.html', active: null },
  { route: '/product/', file: 'product/index.html', active: 'Records' },
  { route: '/security/', file: 'security/index.html', active: null },
  { route: '/use-cases/', file: 'use-cases/index.html', active: null },
  { route: '/validation/', file: 'validation/index.html', active: 'Validation' }
];

const representativeRoutes = [
  '/',
  '/cri/',
  '/validation/',
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
  });
}

test('every canonical navigation target resolves', async ({ page, request }) => {
  await preparePage(page, 1280);

  for (const { href, label } of canonicalNavigation) {
    if (href.includes('#')) continue;
    const response = await request.get(href);
    expect.soft(response.ok(), `${label} target ${href} returned ${response.status()}`).toBeTruthy();
  }

  await openRoute(page, '/#evidence-pack-sample');
  await expect(page.locator('#evidence-pack-sample')).toHaveCount(1);
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
