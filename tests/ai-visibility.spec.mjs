import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

const execFileAsync = promisify(execFile);

const canonicalPages = [
  {
    route: '/',
    url: 'https://www.3brain.ai/',
    title: '3BrainAI CRI | Review-ready Evidence Packs for physical-asset risk',
    description: '3BrainAI CRI turns Earth Observation and project context into governed Evidence Packs for credit-risk, real-estate and project-finance review – with explicit uncertainty, provenance and mandatory human review.'
  },
  {
    route: '/mis/',
    url: 'https://www.3brain.ai/mis/',
    title: '3BrainAI Records | Catalog & Registry Record Layer',
    description: 'Governed records for consistent catalog, registry and institutional outputs.'
  },
  {
    route: '/cri/',
    url: 'https://www.3brain.ai/cri/',
    title: '3BrainAI CRI | Bank-readable evidence between project controls',
    description: 'Governed Evidence Packs for bank credit-risk, CRE, project-finance, collateral and portfolio review between formal control points.'
  },
  {
    route: '/use-cases/',
    url: 'https://www.3brain.ai/use-cases/',
    title: 'Use Cases | 3BrainAI',
    description: 'Model situations for CRI Evidence Packs, governed records, shadow-mode pilots and Evidence Readiness Assessment.'
  },
  {
    route: '/governance-layer/',
    url: 'https://www.3brain.ai/governance-layer/',
    title: 'Trusted Data Plane | 3BrainAI',
    description: 'A governed data plane for review-ready evidence, trusted records and safe action workflows.'
  },
  {
    route: '/about/',
    url: 'https://www.3brain.ai/about/',
    title: 'About | 3BrainAI',
    description: 'Founder-led 3BrainAI Nexus develops governed CRI Evidence Packs for accountable bank review and participates in ESA BIC Czech Republic.'
  },
  {
    route: '/validation/',
    url: 'https://www.3brain.ai/validation/',
    title: 'Shadow-mode validation | 3BrainAI CRI',
    description: 'A low-risk path for banks and institutional lenders to test CRI Evidence Packs alongside existing controls, without affecting live financial or risk decisions.'
  },
  {
    route: '/investors/',
    url: 'https://www.3brain.ai/investors/',
    title: 'Investors | 3BrainAI CRI',
    description: 'Investor overview of the CRI bank-first beachhead, governed Evidence Pack product, current validation stage and execution path.'
  },
  {
    route: '/contact/',
    url: 'https://www.3brain.ai/contact/',
    title: 'Contact | 3BrainAI CRI',
    description: 'Contact 3BrainAI for bank validation of CRI Evidence Packs or for a private investor conversation.'
  },
  {
    route: '/privacy/',
    url: 'https://www.3brain.ai/privacy/',
    title: 'Privacy | 3BrainAI',
    description: 'Privacy information for the 3BrainAI public website.'
  },
  {
    route: '/imprint/',
    url: 'https://www.3brain.ai/imprint/',
    title: 'Imprint | 3BrainAI',
    description: 'Legal and service information for the public 3BrainAI website.'
  },
  {
    route: '/security/',
    url: 'https://www.3brain.ai/security/',
    title: 'Security | 3BrainAI',
    description: 'Public security posture and contact guidance for the 3BrainAI website.'
  }
];

const expectedCrawlerAgents = [
  'OAI-SearchBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Bingbot',
  'Googlebot',
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  '*'
];

const indexNowKey = '4c359192cfa68f4af5c6a8dd38964897';

test('robots policy explicitly permits the approved crawler set', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/plain');

  const body = await response.text();
  for (const userAgent of expectedCrawlerAgents) {
    const escapedAgent = userAgent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(body).toMatch(new RegExp(`User-agent: ${escapedAgent}\\nAllow: /`));
  }
  expect(body).toContain('Sitemap: https://www.3brain.ai/sitemap.xml');
  expect(body).not.toMatch(/^Disallow:/m);
});

test('llms.txt is public-safe, bounded and internally resolvable', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/plain');

  const body = await response.text();
  expect(body).toContain('# 3BrainAI');
  expect(body).toContain('3BrainAI is the public brand');
  expect(body).toContain('3BrainAI Nexus s.r.o. develops 3BrainAI CRI');
  expect(body).toContain('3BrainAI CRI');
  expect(body).toContain('3BrainAI CRI is a European project for institutional markets');
  expect(body).toContain('Evidence Pack');
  expect(body).toContain('does not make autonomous credit decisions, replace bank policy or replace professional assessment');
  expect(body).toContain('Earth Observation is an input medium');
  expect(body).toContain('participating in the ESA Business Incubation Centre Czech Republic');
  expect(body).not.toMatch(/EY Praha|Google Cloud|25[,. ]?000|Česká spořitelna/i);

  const linkedUrls = [...body.matchAll(/\(https:\/\/www\.3brain\.ai\/(?:[^)#]*)?(?:#[^)]+)?\)/g)]
    .map(match => match[0].slice(1, -1));
  expect(linkedUrls.length).toBeGreaterThan(0);

  for (const url of linkedUrls) {
    const parsedUrl = new URL(url);
    const linkedResponse = await request.get(parsedUrl.pathname);
    expect.soft(linkedResponse.ok(), `${url} should resolve`).toBeTruthy();
  }
});

test('sitemap contains exactly the live canonical pages with truthful release dates', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBeTruthy();

  const body = await response.text();
  const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const lastModifiedDates = [...body.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);

  expect(locations).toEqual(canonicalPages.map(page => page.url));
  expect(lastModifiedDates).toHaveLength(canonicalPages.length);
  expect(new Set(lastModifiedDates)).toEqual(new Set(['2026-08-25']));

  for (const canonicalPage of canonicalPages) {
    const pageResponse = await request.get(canonicalPage.route);
    expect.soft(pageResponse.ok(), `${canonicalPage.route} should resolve`).toBeTruthy();
    expect.soft(await pageResponse.text(), `${canonicalPage.route} should declare its canonical URL`)
      .toContain(`<link rel="canonical" href="${canonicalPage.url}">`);
  }
});

for (const canonicalPage of canonicalPages) {
  test(`${canonicalPage.route} exposes complete page-specific forwarding metadata`, async ({ page }) => {
    const response = await page.goto(canonicalPage.route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    await expect(page).toHaveTitle(canonicalPage.title);
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
      'content',
      canonicalPage.description
    );
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', canonicalPage.url);
    await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content', canonicalPage.title);
    await expect(page.locator('head meta[property="og:description"]')).toHaveAttribute(
      'content',
      canonicalPage.description
    );
    await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', canonicalPage.url);
    await expect(page.locator('head meta[property="og:site_name"]')).toHaveAttribute('content', '3BrainAI');
    await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://www.3brain.ai/assets/img/og_3brainai.png'
    );
    await expect(page.locator('head meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('head meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('head meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      '3BrainAI – governed evidence workflows'
    );
    await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    );
    await expect(page.locator('head meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      canonicalPage.title
    );
    await expect(page.locator('head meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      canonicalPage.description
    );
    await expect(page.locator('head meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'https://www.3brain.ai/assets/img/og_3brainai.png'
    );
    await expect(page.locator('head link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
      'href',
      '/assets/img/favicon.svg'
    );
    await expect(page.locator('head link[rel="icon"][sizes="32x32"]')).toHaveAttribute(
      'href',
      '/assets/img/favicon-32.png'
    );
    await expect(page.locator('head link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      '/assets/img/apple-touch-icon.png'
    );
  });
}

test('JSON-LD separates the brand, Nexus, CRI and Evidence Pack sample', async ({ page }) => {
  const expectedGraphs = {
    '/': [
      'https://www.3brain.ai/#brand',
      'https://www.3brain.ai/#organization',
      'https://www.3brain.ai/#website',
      'https://www.3brain.ai/cri/#product',
      'https://www.3brain.ai/#evidence-pack-sample'
    ],
    '/cri/': [
      'https://www.3brain.ai/#brand',
      'https://www.3brain.ai/#organization',
      'https://www.3brain.ai/cri/#product',
      'https://www.3brain.ai/cri/#webpage'
    ],
    '/about/': [
      'https://www.3brain.ai/#brand',
      'https://www.3brain.ai/about/#founder',
      'https://www.3brain.ai/#organization',
      'https://www.3brain.ai/about/#webpage'
    ],
    '/imprint/': [
      'https://www.3brain.ai/#website-operator',
      'https://www.3brain.ai/#organization',
      'https://www.3brain.ai/#solutions',
      'https://www.3brain.ai/imprint/#webpage'
    ]
  };

  const parsedGraphs = {};
  for (const [route, expectedIds] of Object.entries(expectedGraphs)) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    const structuredData = page.locator('head script[type="application/ld+json"]');
    await expect(structuredData).toHaveCount(1);
    const graphDocument = JSON.parse(await structuredData.textContent());
    expect(graphDocument['@context']).toBe('https://schema.org');
    expect(graphDocument['@graph'].map(entity => entity['@id'])).toEqual(expectedIds);
    expect(JSON.stringify(graphDocument)).not.toMatch(/aggregateRating|offers|EY Praha|Google Cloud/);
    parsedGraphs[route] = graphDocument['@graph'];
  }

  const homepageOrganization = parsedGraphs['/'].find(
    entity => entity['@id'] === 'https://www.3brain.ai/#organization'
  );
  expect(homepageOrganization.name).toBe('3BrainAI Nexus s.r.o.');
  expect(homepageOrganization.identifier).toBe('29513049');
  expect(homepageOrganization.areaServed).toBe('Europe');
  expect(homepageOrganization.sameAs).toContain('https://www.linkedin.com/company/3brainai-nexus/');

  const homepageProduct = parsedGraphs['/'].find(
    entity => entity['@id'] === 'https://www.3brain.ai/cri/#product'
  );
  const criProduct = parsedGraphs['/cri/'].find(
    entity => entity['@id'] === 'https://www.3brain.ai/cri/#product'
  );
  expect(criProduct).toEqual(homepageProduct);
  expect(homepageProduct.brand['@id']).toBe('https://www.3brain.ai/#brand');
  expect(homepageProduct.areaServed).toBe('Europe');
  expect(homepageProduct.manufacturer['@id']).toBe('https://www.3brain.ai/#organization');

  const evidencePackSample = parsedGraphs['/'].find(
    entity => entity['@id'] === 'https://www.3brain.ai/#evidence-pack-sample'
  );
  expect(evidencePackSample.version).toBe('0.2-public-demo');
  expect(evidencePackSample.creator['@id']).toBe('https://www.3brain.ai/#organization');

  const imprintOrganizations = parsedGraphs['/imprint/'].filter(entity => entity['@type'] === 'Organization');
  expect(imprintOrganizations.map(entity => entity.identifier)).toEqual(['27865282', '29513049', '23628847']);
});

test('IndexNow key is publishable and submission payload is deterministic in dry-run mode', async ({ request }) => {
  const keyResponse = await request.get(`/${indexNowKey}.txt`);
  expect(keyResponse.ok()).toBeTruthy();
  expect((await keyResponse.text()).trim()).toBe(indexNowKey);

  const { stdout } = await execFileAsync(
    process.execPath,
    [
      'scripts/submit-indexnow.mjs',
      '--dry-run',
      'https://www.3brain.ai/#fragment-is-removed',
      '/cri/#fragment-is-removed'
    ],
    { cwd: process.cwd() }
  );
  const payload = JSON.parse(stdout);
  expect(payload).toEqual({
    host: 'www.3brain.ai',
    key: indexNowKey,
    keyLocation: `https://www.3brain.ai/${indexNowKey}.txt`,
    urlList: ['https://www.3brain.ai/', 'https://www.3brain.ai/cri/']
  });
});
