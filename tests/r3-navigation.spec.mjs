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

test('institutional proof visuals, records direction and review language remain explicit', async ({ page }) => {
  await preparePage(page, 1440, 1000);
  await openRoute(page, '/investors/');

  const productBoundary = page.locator('.card--content-centered');
  const eyVisual = page.locator('.institutional-card-visual--ey');
  const eyImage = eyVisual.locator('img');

  await expect(productBoundary).toHaveCSS('justify-content', 'center');
  await expect(eyVisual).toBeVisible();
  await expect(eyImage).toHaveCSS('object-position', '50% 78%');
  await expect(eyImage).toHaveCSS('filter', 'none');
  expect(await eyImage.evaluate(image => image.naturalWidth)).toBe(1228);
  expect(await eyImage.evaluate(image => image.naturalHeight)).toBe(1536);
  await expect(page.getByRole('link', { name: 'Download the forwardable 2-page PDF' })).toHaveAttribute(
    'href',
    '/evidence-packs/fischamend/3BrainAI_CRI_Fischamend_Evidence_Pack_v0_1.pdf'
  );
  await expect(page.locator('#investor-materials')).toContainText('financing plan and use of funds');

  await openRoute(page, '/about/');
  const aboutEyVisual = page.locator('.institutional-card-visual--ey');
  const aboutEyImage = aboutEyVisual.locator('img');
  await expect(aboutEyVisual).toBeVisible();
  await expect(aboutEyImage).toHaveCSS('object-position', '50% 78%');
  await expect(aboutEyImage).toHaveCSS('filter', 'none');
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

    if (route === '/cri/') {
      const marker = page.locator('.maturity-marker--on-dark');
      await expect(marker).toHaveCount(1);
      await expect(marker.locator('.maturity-label')).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(marker.locator('.maturity-detail')).not.toHaveCSS('color', 'rgb(74, 88, 98)');
    }

    if (route === '/about/') {
      const founderCopy = page.locator('.about-founder-copy');
      const founderImage = page.locator('.about-founder-photo img');
      await expect(page.locator('link[href="/assets/css/about-founder.css?v=f8700cdd"]')).toHaveCount(1);
      await expect(founderCopy.locator('.about-founder-name')).toHaveText('Dušan Přikryl');
      await expect(founderCopy.locator('.about-founder-role')).toHaveText('Founder & CEO');
      await expect(founderCopy.locator('.about-founder-tags')).toHaveText(
        'Owner-side CAPEX leadership · Tier-1 technology integration · German-speaking market experience'
      );
      expect(await founderCopy.locator(':scope > p').allTextContents()).toEqual([
        'Founder',
        'Founder & CEO',
        'Owner-side CAPEX leadership · Tier-1 technology integration · German-speaking market experience',
        'Dušan Přikryl is a shareholder-mandated crisis and CAPEX transformation leader with direct owner-side responsibility for complex industrial and energy investments. From 2003 to 2009, under mandates linked to Expandia, Schouw & Co./Fibertex and J&T/EPH, he restructured project delivery around a small accountable owner-side core and directly coordinated Tier-1 European technology suppliers, including Siemens, GEA, Geberit and Hörmann.',
        "His professional connection to German-speaking markets is long-standing: practical experience in Germany helped shape his delivery model and he works professionally in German. 3BrainAI's DACH engagement includes 3BrainAI Solutions' completion of the EY Startup Academy Frankfurt 2025 programme.",
        'He later added a second professional layer across digital product development, data operations, analytics and AI. CRI brings these layers together: first-hand responsibility for complex physical assets and the product discipline required to turn fragmented inputs into governed, review-ready evidence for institutional decision support.',
        'LinkedIn profile'
      ]);
      await expect(founderImage).toHaveAttribute('src', '/assets/foto/prikryl-portret-4x5-navy.jpg');
      await expect(founderImage).toHaveAttribute('width', '426');
      await expect(founderImage).toHaveAttribute('height', '533');
      await expect(founderImage).toHaveAttribute(
        'alt',
        'Portrait of Dušan Přikryl, Founder and CEO of 3BrainAI'
      );
      const imageState = await founderImage.evaluate(image => ({
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      }));
      expect(imageState).toEqual({ complete: true, naturalWidth: 426, naturalHeight: 533 });
      const roleStyle = await founderCopy.locator('.about-founder-role').evaluate(role => {
        const style = getComputedStyle(role);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          textTransform: style.textTransform
        };
      });
      expect(roleStyle.fontFamily).toContain('ui-monospace');
      expect(roleStyle.fontSize).toBe('11.5px');
      expect(roleStyle.textTransform).toBe('uppercase');
      await expect(founderCopy.locator('.founder-profile-link')).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/dusanprikryl/'
      );
      await expect(founderCopy.locator('.founder-profile-link')).toHaveAttribute('rel', 'noopener noreferrer');
    }
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

      if (route === '/about/') {
        const geometry = await page.locator('.about-founder-grid').evaluate(grid => {
          const photo = grid.querySelector('.about-founder-photo')?.getBoundingClientRect();
          const copy = grid.querySelector('.about-founder-copy')?.getBoundingClientRect();
          const role = grid.querySelector('.about-founder-role');
          if (!photo || !copy || !role) return null;
          return {
            photo: { top: photo.top, right: photo.right, bottom: photo.bottom, width: photo.width },
            copy: { top: copy.top, left: copy.left, width: copy.width },
            copyOverflow: grid.querySelector('.about-founder-copy').scrollWidth - grid.querySelector('.about-founder-copy').clientWidth,
            roleFontSize: getComputedStyle(role).fontSize
          };
        });

        expect(geometry, `About Founder geometry should resolve at ${width}px`).not.toBeNull();
        expect(geometry.copyOverflow, `About Founder copy should not clip at ${width}px`).toBeLessThanOrEqual(1);
        expect(geometry.roleFontSize).toBe('11.5px');
        if (width <= 860) {
          expect(geometry.photo.width, `Founder portrait max width at ${width}px`).toBeLessThanOrEqual(280.5);
          expect(geometry.copy.top, `Founder copy should stack below the portrait at ${width}px`)
            .toBeGreaterThanOrEqual(geometry.photo.bottom - 1);
        } else {
          expect(Math.abs(geometry.photo.top - geometry.copy.top), `Founder columns should align at ${width}px`)
            .toBeLessThanOrEqual(1);
          expect(geometry.photo.width, `Founder portrait desktop width at ${width}px`).toBeLessThanOrEqual(300.5);
          expect(geometry.copy.left, `Founder copy should follow the portrait at ${width}px`)
            .toBeGreaterThanOrEqual(geometry.photo.right + 47);
        }
      }
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
    await openRoute(page, '/about/');
    await page.screenshot({
      path: path.join(outputDirectory, `fast-refresh-about-${viewport.width}.png`),
      fullPage: true,
      animations: 'disabled'
    });
  }
});
