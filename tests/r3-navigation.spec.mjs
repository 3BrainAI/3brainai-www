import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const refreshedRoutes = new Set(['/cri/','/validation/','/investors/','/contact/','/evidence-packs/', '/brief/']);
const canonicalNavigation = [
  { label: 'CRI', href: '/cri/' },
  { label: 'Evidence Pack', href: '/#evidence-pack-sample' },
  { label: 'The Brief', href: '/brief/' },
  { label: 'For banks', href: '/validation/' },
  { label: 'Investors', href: '/investors/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' }
];

const primaryJourneyRoutes = [
  { route: '/', slug: 'home' },
  { route: '/brief/', slug: 'brief' },
  { route: '/evidence-packs/', slug: 'evidence-pack' },
  { route: '/cri/', slug: 'cri' },
  { route: '/validation/', slug: 'validation' },
  { route: '/investors/', slug: 'investors' },
  { route: '/about/', slug: 'about' },
  { route: '/contact/', slug: 'contact' }
];

const scopedRoutes = [
  { route: '/brief/', file: 'brief/index.html', active: 'The Brief' },
  { route: '/evidence-packs/', file: 'evidence-packs/index.html', active: 'Evidence Pack' },
  { route: '/', file: 'index.html', active: null, evidenceHref: '#portfolio' },
  { route: '/about/', file: 'about/index.html', active: 'About' },
  { route: '/contact/', file: 'contact/index.html', active: 'Contact' },
  { route: '/cri/', file: 'cri/index.html', active: 'CRI', evidenceHref: '/#portfolio' },
  { route: '/evidence-packs/german-north-sea/', file: 'evidence-packs/german-north-sea/index.html', active: null },
  { route: '/evidence-packs/lausitz/', file: 'evidence-packs/lausitz/index.html', active: null },
  { route: '/governance-layer/', file: 'governance-layer/index.html', active: null },
  { route: '/how-it-works/', file: 'how-it-works/index.html', active: null },
  { route: '/imprint/', file: 'imprint/index.html', active: null },
  { route: '/investors/', file: 'investors/index.html', active: 'Investors', evidenceHref: '/#portfolio' },
  { route: '/mis/', file: 'mis/index.html', active: null },
  { route: '/pilots/', file: 'pilots/index.html', active: 'For banks' },
  { route: '/privacy/', file: 'privacy/index.html', active: null },
  { route: '/product/', file: 'product/index.html', active: null },
  { route: '/security/', file: 'security/index.html', active: null },
  { route: '/use-cases/', file: 'use-cases/index.html', active: null },
  { route: '/validation/', file: 'validation/index.html', active: 'For banks', evidenceHref: '/#portfolio' }
];

const representativeRoutes = [
  ...primaryJourneyRoutes.map(({ route }) => route),
  '/governance-layer/',
  '/evidence-packs/german-north-sea/',
  '/evidence-packs/lausitz/',
  '/mis/',
  '/use-cases/',
  '/security/'
];

const responsiveWidths = [390, 768, 1024, 1440, 1920];

async function preparePage(page, width, height = 900) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function openRoute(page, route) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  if (response) {
    expect(response.ok(), `${route} should return a successful response`).toBeTruthy();
  } else {
    const currentUrl = new URL(page.url());
    expect(
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
      `${route} should complete as a same-document navigation`
    ).toBe(route);
  }
  await page.evaluate(() => document.fonts?.ready);
}

async function settleLazyImages(page) {
  await page.evaluate(async () => {
    const images = [...document.querySelectorAll('img[loading="lazy"]')];
    for (const image of images) image.loading = 'eager';
    await Promise.all(images.map(image =>
      image.complete
        ? Promise.resolve()
        : new Promise(resolve => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
    ));
  });
}

for (const routeContract of scopedRoutes) {
  test(`${routeContract.file} uses the canonical navigation and active state`, async ({ page }) => {
    await preparePage(page, 1280);
    await openRoute(page, routeContract.route);

    const links = page.locator('.nav[aria-label="Main navigation"] > a');
    const routeNavigation = canonicalNavigation.filter(item => item.label !== 'The Brief' || !['/evidence-packs/lausitz/', '/evidence-packs/german-north-sea/'].includes(routeContract.route));
    await expect(links).toHaveCount(routeNavigation.length);

    const actual = await links.evaluateAll(anchors => anchors.map(anchor => ({
      label: anchor.textContent?.trim(),
      href: anchor.getAttribute('href')
    })));
    const expected = routeNavigation.map(item => ({
      label: item.label,
      href: item.label === 'Evidence Pack' && refreshedRoutes.has(routeContract.route) ? '/evidence-packs/' : item.label === 'Evidence Pack' && routeContract.evidenceHref
        ? routeContract.evidenceHref
        : item.href
    }));
    expect(actual).toEqual(expected);

    const activeLinks = page.locator('.nav[aria-label="Main navigation"] > a:is(.active, [aria-current="page"])');
    if (routeContract.active) {
      await expect(activeLinks).toHaveCount(1);
      await expect(activeLinks).toHaveText(routeContract.active);
    } else {
      await expect(activeLinks).toHaveCount(0);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.menu-toggle, .menu-button').click();
    await expect(page.locator('.nav[aria-label="Main navigation"]')).toHaveClass(/\bopen\b/);
    for (const link of await links.all()) {
      await expect(link).toBeVisible();
    }

    const footer = page.locator('.footer');
    await expect(footer.locator('.footer-navigation')).toHaveCount(2);
    await expect(footer.locator('.footer-brand-column > p').first()).toHaveText(
      'Governed evidence for a changing physical world.'
    );
    await expect(footer.locator('.footer-europe')).toHaveText('European startup · Head office in Prague');
    await expect(footer.locator('.footer-europe')).toHaveCSS('font-size', '15px');
    await expect(footer.locator('.footer-market-focus')).toHaveText(
      'Focused on DACH, Benelux and Central European institutional markets.'
    );
    await expect(footer.locator('.footer-esa-statement')).toHaveText(
      '3BrainAI Nexus s.r.o. is participating in the ESA Business Incubation Centre Czech Republic.'
    );
    await expect(footer.locator('.footer-esa-note')).toHaveCount(0);
    await expect(footer.locator('.footer-contact-link')).toHaveAttribute('href', '/contact/');
    await expect(footer.locator('.footer-contact-link')).toContainText('Contact 3BrainAI');
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

test('institutional proof visuals, records direction and review language remain explicit', async ({ page }) => {
  await preparePage(page, 1440, 1000);
  await openRoute(page, '/investors/');

  await expect(page.locator('.v31-fan-front img')).toHaveAttribute('src', '/assets/cri-web-r31/hh1-aerial-original.jpg');
  await expect(page.locator('.hero')).not.toContainText('Dusan Prikryl');
  await expect(page.locator('.v32-credits')).toContainText('Beeldmateriaal Nederland / PDOK');
  await expect(page.getByRole('link', {name:'View programme context'})).toHaveAttribute('href','/about/#institutional-milestones');

  await openRoute(page, '/about/');
  const aboutEyVisual = page.locator('.about-programme-history-artwork');
  const aboutEyImage = aboutEyVisual.locator('img');
  await expect(aboutEyVisual).toBeVisible();
  await expect(aboutEyImage).toHaveCSS('object-position', '50% 76%');
  await expect(aboutEyImage).toHaveCSS('filter', 'none');
  for (const logo of await page.locator('.about-programme-logo img').all()) {
    await expect(logo).toHaveCSS('filter', 'none');
    await expect(logo).toHaveCSS('opacity', '1');
  }
  await expect(aboutEyImage).toHaveCSS('opacity', '1');
  expect(await aboutEyImage.evaluate(image => image.naturalWidth)).toBe(1228);
  expect(await aboutEyImage.evaluate(image => image.naturalHeight)).toBe(1536);

  await openRoute(page, '/mis/');
  await expect(page.locator('.domain-hero .kicker')).toHaveText('Target records layer');
  await expect(page.locator('.domain-hero .lead')).toContainText('A target reusable record layer designed to turn');
  const recordsHeroBackground = await page.locator('.theme-mis .hero.domain-hero').evaluate(
    element => getComputedStyle(element).backgroundImage
  );
  expect(recordsHeroBackground).toContain('rgb(7, 27, 51)');

  await openRoute(page, '/imprint/');
  await expect(page.locator('#imprint-boundary')).toHaveText('Accountable-review boundary');
  await expect(page.locator('[aria-labelledby="imprint-boundary"]')).not.toContainText('decision-support');
});

test('primary journeys retain their page and section headings and founder boundaries', async ({page}) => {
  await preparePage(page,1280);
  for(const {route} of primaryJourneyRoutes) {
    await openRoute(page,route);
    await expect(page.locator('main h1')).toHaveCount(1);
    expect(await page.locator('main h2').count()).toBeGreaterThan(0);
  }
  await openRoute(page,'/about/');
  await expect(page.locator('.about-founder-photo')).toHaveCount(0);
  await expect(page.locator('.v31-experience')).toBeVisible();
  await expect(page.locator('.about-founder-name')).toHaveText('Dusan Prikryl');
  await expect(page.locator('#institutional-milestones .about-programme-logo')).toHaveCount(4);
  await expect(page.locator('.about-programme-qualifier')).toHaveText('These are programme, infrastructure and mentoring relationships, not customer references or certifications.');
  await expect(page.locator('.about-page > .hero .btn').first()).toHaveCSS('border-radius','0px');
  await expect(page.locator('.about-page > .hero h1')).toHaveCSS('font-family',/Inter/);
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

      if(route === '/about/') {
        await expect(page.locator('.about-founder-photo')).toHaveCount(0);
        if(width<=640) await expect(page.locator('.v31-experience')).toBeHidden();
        else await expect(page.locator('.v31-experience')).toBeVisible();
      }
    }
  });
}

test('footer is compact and preserves its information hierarchy across breakpoints', async ({ page }) => {
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

  await page.setViewportSize({ width: 768, height: 900 });
  const tablet = await page.locator('.footer').evaluate(footer => {
    const brand = footer.querySelector('.footer-brand-column')?.getBoundingClientRect();
    const primary = footer.querySelector('.footer-navigation--primary')?.getBoundingClientRect();
    const secondary = footer.querySelector('.footer-navigation--secondary')?.getBoundingClientRect();
    const contact = footer.querySelector('.footer-contact')?.getBoundingClientRect();
    if (!brand || !primary || !secondary || !contact) return null;
    return {
      brandAboveColumns: Math.max(primary.top, secondary.top, contact.top) >= brand.bottom - 1,
      columnsAligned: Math.max(primary.top, secondary.top, contact.top) - Math.min(primary.top, secondary.top, contact.top) <= 1,
      columnsSideBySide: secondary.left >= primary.right - 1 && contact.left >= secondary.right - 1
    };
  });
  expect(tablet).not.toBeNull();
  expect(tablet.brandAboveColumns).toBeTruthy();
  expect(tablet.columnsAligned).toBeTruthy();
  expect(tablet.columnsSideBySide).toBeTruthy();

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
  test.setTimeout(180_000);
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
      await settleLazyImages(page);
      await page.screenshot({
        path: path.join(outputDirectory, `fast-refresh-${slug}-${viewport.width}.png`),
        fullPage: true,
        animations: 'disabled'
      });
    }
  }

  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 1024, height: 900 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(viewport);
    for (const { route, slug } of [
      { route: '/', slug: 'home' },
  { route: '/brief/', slug: 'brief' },
  { route: '/evidence-packs/', slug: 'evidence-pack' },
      { route: '/about/', slug: 'about' }
    ]) {
      await openRoute(page, route);
      await settleLazyImages(page);
      await page.screenshot({
        path: path.join(outputDirectory, `fast-refresh-${slug}-${viewport.width}.png`),
        fullPage: true,
        animations: 'disabled'
      });
    }
  }
});
