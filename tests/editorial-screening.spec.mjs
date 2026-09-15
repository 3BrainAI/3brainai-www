import { expect, test } from '@playwright/test';

async function prepare(page, width = 1280) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

test('homepage answers the skeptical-editor screening questions without claim collisions', async ({ page }) => {
  await prepare(page);
  await page.goto('/');

  const hero = page.locator('.r4-hero');
  await expect(hero).toContainText('For banks & institutional lenders');
  await expect(hero).toContainText('initial focus on DACH, Benelux and Central Europe');
  await expect(hero).toContainText('Public example · 2 pages · No sign-in.');
  await expect(hero).toContainText('Editorial evaluation: free and individually reviewed.');
  await expect(hero).not.toContainText(/Paid professional access|Real Evidence Pack|Authentic record/);

  await expect(page.locator('.r38-product-key dt')).toHaveText(['CRI', 'Evidence Pack', 'The Brief']);
  await expect(page.locator('.r38-product-key dd')).toHaveText([
    'The review-support product.',
    'The versioned review record.',
    'A private walkthrough of prepared situations.'
  ]);
});

test('CRI exposes a concise orientation layer and removes internal display codes', async ({ page }) => {
  await prepare(page);
  await page.goto('/cri/');

  await expect(page.locator('#at-a-glance .card')).toHaveCount(3);
  await expect(page.locator('#at-a-glance')).toContainText('Who CRI is for');
  await expect(page.locator('#at-a-glance')).toContainText('What CRI produces');
  await expect(page.locator('#at-a-glance')).toContainText('Where CRI stands');
  await expect(page.locator('#the-brief')).toContainText('Austria, Czechia and the Netherlands');
  await expect(page.locator('#the-brief')).toContainText('not customer deployments');
  await expect(page.locator('#the-brief')).toContainText('Editorial evaluation access to The Brief is free');
  await expect(page.locator('#image-provenance')).not.toContainText(/T38|N2|R2/);
});

test('Evidence Pack guide separates observation, scenario and next review action', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: value => { window.__copiedEvidenceLink = value; return Promise.resolve(); } }
    });
  });
  await prepare(page);
  await page.goto('/evidence-packs/');

  const guide = page.locator('#reading-guide');
  await expect(guide).toContainText('Everything observed is real and checkable.');
  await expect(guide).toContainText('Everything about the financing scenario is synthetic.');
  await expect(guide.locator('.card')).toHaveCount(3);
  await expect(guide.locator('.card h3')).toHaveText([
    'What the images show',
    'What remains open',
    'What follows'
  ]);

  await guide.getByRole('button', { name: 'Copy link to this finding' }).click();
  await expect(guide.locator('.r38-copy-status')).toHaveText('Link copied.');
  expect(await page.evaluate(() => window.__copiedEvidenceLink))
    .toBe('http://127.0.0.1:4174/evidence-packs/#public-finding');
});

test('released Fischamend record keeps its body and gains external context navigation', async ({ page }) => {
  await prepare(page, 390);
  await page.goto('/evidence-packs/fischamend/');

  const navigation = page.getByRole('navigation', { name: 'Evidence Pack context' });
  await expect(navigation.getByRole('link')).toHaveText(['Reading guide', 'What is CRI?', 'About', 'Contact']);
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://www.3brain.ai/assets/img/og_fischamend_evidence_pack.png'
  );
  await expect(page.locator('main')).toContainText('v0.1 PUBLIC-SAFE RELEASE');
  await expect(page.locator('main')).toContainText('ILLUSTRATIVE PROTOTYPE - PUBLIC-SAFE EXAMPLE - HUMAN REVIEW REQUIRED');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
