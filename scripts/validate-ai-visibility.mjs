import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');

const canonicalPages = [
  ['index.html', 'https://www.3brain.ai/', '3BrainAI CRI | Review-ready Evidence Packs for physical-asset risk', '3BrainAI CRI turns Earth Observation and project context into governed Evidence Packs for credit-risk, real-estate and project-finance review — with explicit uncertainty, provenance and mandatory human review.'],
  ['mis/index.html', 'https://www.3brain.ai/mis/', '3BrainAI Records | Catalog &amp; Registry Record Layer', 'Governed records for consistent catalog, registry and institutional outputs.'],
  ['cri/index.html', 'https://www.3brain.ai/cri/', '3BrainAI CRI | Bank-readable evidence between project controls', 'Governed Evidence Packs for bank credit-risk, CRE, project-finance, collateral and portfolio review between formal control points.'],
  ['use-cases/index.html', 'https://www.3brain.ai/use-cases/', 'Use Cases | 3BrainAI', 'Model situations for CRI Evidence Packs, governed records, shadow-mode pilots and Evidence Readiness Assessment.'],
  ['governance-layer/index.html', 'https://www.3brain.ai/governance-layer/', 'Trusted Data Plane | 3BrainAI', 'A governed data plane for review-ready evidence, trusted records and safe action workflows.'],
  ['about/index.html', 'https://www.3brain.ai/about/', 'About | 3BrainAI', 'Founder-led 3BrainAI Nexus develops governed CRI Evidence Packs for accountable bank review and participates in ESA BIC Czech Republic.'],
  ['validation/index.html', 'https://www.3brain.ai/validation/', 'Shadow-mode validation | 3BrainAI CRI', 'A low-risk path for banks and institutional lenders to test CRI Evidence Packs alongside existing controls, without affecting live financial or risk decisions.'],
  ['investors/index.html', 'https://www.3brain.ai/investors/', 'Investors | 3BrainAI CRI', 'Investor overview of the CRI bank-first beachhead, governed Evidence Pack product, current validation stage and execution path.'],
  ['contact/index.html', 'https://www.3brain.ai/contact/', 'Contact | 3BrainAI CRI', 'Contact 3BrainAI for bank validation of CRI Evidence Packs or for a private investor conversation.'],
  ['privacy/index.html', 'https://www.3brain.ai/privacy/', 'Privacy | 3BrainAI', 'Privacy information for the 3BrainAI public website.'],
  ['imprint/index.html', 'https://www.3brain.ai/imprint/', 'Imprint | 3BrainAI', 'Legal and service information for the public 3BrainAI website.'],
  ['security/index.html', 'https://www.3brain.ai/security/', 'Security | 3BrainAI', 'Public security posture and contact guidance for the 3BrainAI website.']
];

const readRepositoryFile = relativePath => readFile(path.join(repositoryRoot, relativePath), 'utf8');
const countOccurrences = (value, fragment) => value.split(fragment).length - 1;

const structuredDataByFile = new Map();
for (const [file, canonicalUrl, title, description] of canonicalPages) {
  const html = await readRepositoryFile(file);
  const requiredFragments = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    '<meta property="og:site_name" content="3BrainAI">',
    '<meta property="og:image" content="https://www.3brain.ai/assets/img/og_3brainai.png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    '<meta name="twitter:image" content="https://www.3brain.ai/assets/img/og_3brainai.png">'
  ];

  for (const fragment of requiredFragments) {
    assert.ok(html.includes(fragment), `${file} is missing: ${fragment}`);
  }
  assert.equal(countOccurrences(html, 'property="og:title"'), 1, `${file} must have one og:title`);
  assert.equal(countOccurrences(html, 'name="twitter:title"'), 1, `${file} must have one twitter:title`);

  const structuredDataMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  if (structuredDataMatch) {
    structuredDataByFile.set(file, JSON.parse(structuredDataMatch[1]));
  }
}

const expectedGraphIds = new Map([
  ['index.html', [
    'https://www.3brain.ai/#brand',
    'https://www.3brain.ai/#organization',
    'https://www.3brain.ai/#website',
    'https://www.3brain.ai/cri/#product',
    'https://www.3brain.ai/#evidence-pack-sample'
  ]],
  ['cri/index.html', [
    'https://www.3brain.ai/#brand',
    'https://www.3brain.ai/#organization',
    'https://www.3brain.ai/cri/#product',
    'https://www.3brain.ai/cri/#webpage'
  ]],
  ['about/index.html', [
    'https://www.3brain.ai/#brand',
    'https://www.3brain.ai/about/#founder',
    'https://www.3brain.ai/#organization',
    'https://www.3brain.ai/about/#webpage'
  ]],
  ['imprint/index.html', [
    'https://www.3brain.ai/#website-operator',
    'https://www.3brain.ai/#organization',
    'https://www.3brain.ai/#solutions',
    'https://www.3brain.ai/imprint/#webpage'
  ]]
]);

assert.deepEqual([...structuredDataByFile.keys()], [...expectedGraphIds.keys()]);
for (const [file, expectedIds] of expectedGraphIds) {
  const document = structuredDataByFile.get(file);
  assert.equal(document['@context'], 'https://schema.org', `${file} must use the Schema.org context`);
  assert.deepEqual(document['@graph'].map(entity => entity['@id']), expectedIds, `${file} has unexpected entity IDs`);
  assert.doesNotMatch(JSON.stringify(document), /aggregateRating|offers|EY Praha|Google Cloud/);
}

const homepageGraph = structuredDataByFile.get('index.html')['@graph'];
const criGraph = structuredDataByFile.get('cri/index.html')['@graph'];
const homepageProduct = homepageGraph.find(entity => entity['@id'] === 'https://www.3brain.ai/cri/#product');
const criProduct = criGraph.find(entity => entity['@id'] === 'https://www.3brain.ai/cri/#product');
assert.deepEqual(criProduct, homepageProduct, 'Homepage and CRI must describe one stable Product entity');

const robots = await readRepositoryFile('robots.txt');
for (const userAgent of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'Bingbot', 'Googlebot', 'GPTBot', 'ClaudeBot', 'Google-Extended', '*']) {
  assert.ok(robots.includes(`User-agent: ${userAgent}\nAllow: /`), `robots.txt does not explicitly allow ${userAgent}`);
}
assert.ok(robots.includes('Sitemap: https://www.3brain.ai/sitemap.xml'));
assert.doesNotMatch(robots, /^Disallow:/m);

const sitemap = await readRepositoryFile('sitemap.xml');
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const sitemapDates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
assert.deepEqual(sitemapLocations, canonicalPages.map(([, canonicalUrl]) => canonicalUrl));
assert.deepEqual(new Set(sitemapDates), new Set(['2026-08-25']));
assert.equal(sitemapDates.length, canonicalPages.length);

const llmsText = await readRepositoryFile('llms.txt');
assert.ok(llmsText.startsWith('# 3BrainAI\n'));
assert.match(llmsText, /3BrainAI is the public brand/);
assert.match(llmsText, /3BrainAI Nexus s\.r\.o\. develops 3BrainAI CRI/);
assert.match(llmsText, /3BrainAI CRI/);
assert.match(llmsText, /does not make autonomous credit decisions, replace bank policy or replace professional assessment/);
assert.match(llmsText, /Earth Observation is an input medium/);
assert.match(llmsText, /participating in the ESA Business Incubation Centre Czech Republic/);
assert.doesNotMatch(llmsText, /EY Praha|Google Cloud|25[,. ]?000|Česká spořitelna/i);

const publicEnglishPages = [
  'index.html',
  'about/index.html',
  'contact/index.html',
  'cri/index.html',
  'governance-layer/index.html',
  'how-it-works/index.html',
  'imprint/index.html',
  'investors/index.html',
  'mis/index.html',
  'pilots/index.html',
  'privacy/index.html',
  'product/index.html',
  'security/index.html',
  'use-cases/index.html',
  'validation/index.html'
];

const primaryNavigation = [
  ['CRI', '/cri/'],
  ['Evidence Pack', '/#evidence-pack-sample'],
  ['Validation', '/validation/'],
  ['Investors', '/investors/'],
  ['About', '/about/'],
  ['Contact', '/contact/']
];

for (const file of publicEnglishPages) {
  const html = await readRepositoryFile(file);
  assert.doesNotMatch(html, /EY Praha|Google Cloud|OVHcloud|Česká spořitelna/i, `${file} contains a locked public claim`);
  assert.match(html, /3BrainAI Nexus s\.r\.o\. is participating in the ESA Business Incubation Centre Czech Republic\./, `${file} is missing the exact ESA participation statement`);
  assert.match(html, /href="https:\/\/www\.esa-bic\.cz\/"/, `${file} is missing the ESA BIC link`);

  const navigationMatch = html.match(/<nav class="nav" aria-label="Main navigation">([\s\S]*?)<\/nav>/);
  assert.ok(navigationMatch, `${file} is missing the primary navigation`);
  const navigationLinks = [...navigationMatch[1].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map(match => [match[2].trim(), match[1]]);
  const expectedNavigation = primaryNavigation.map(([label, href]) => [
    label,
    file === 'index.html' && label === 'Evidence Pack' ? '#evidence-pack-sample' : href
  ]);
  assert.deepEqual(navigationLinks, expectedNavigation, `${file} has unexpected primary navigation`);

  const footerMatch = html.match(/<footer class="footer">([\s\S]*?)<\/footer>/);
  assert.ok(footerMatch, `${file} is missing the footer`);
  assert.match(footerMatch[1], /href="\/governance-layer\/">Data Plane<\/a>/, `${file} footer is missing Data Plane`);
  assert.match(footerMatch[1], /href="\/mis\/">Records<\/a>/, `${file} footer is missing Records`);
}

const investorPage = await readRepositoryFile('investors/index.html');
assert.doesNotMatch(investorPage, /Indicative commercial scenarios|monthly recurring|annual recurring|€|\brevenue\b|\bburn\b|\brunway\b/i);

const eyCompletionClaim = /3BrainAI Solutions was one of 11 startups in the EY Startup Academy Frankfurt 2025 cohort and completed the programme\./;
const aboutPage = await readRepositoryFile('about/index.html');
for (const [file, html] of [
  ['investors/index.html', investorPage],
  ['about/index.html', aboutPage]
]) {
  assert.match(html, eyCompletionClaim, `${file} is missing the approved EY completion statement`);
  assert.doesNotMatch(
    html,
    /Christopher Schmitz|Peter Fricke|christopher\.schmitz@|peter\.fricke@/i,
    `${file} exposes private EY verification contacts`
  );
}

const validationPage = await readRepositoryFile('validation/index.html');
assert.doesNotMatch(validationPage, /public-sector|insurers|corporates|technology partners|OVHcloud/i);
assert.match(validationPage, /mailto:cri@3brain\.ai[^>]*>Discuss shadow-mode validation<\/a>/);

const contactPage = await readRepositoryFile('contact/index.html');
assert.match(contactPage, /mailto:cri@3brain\.ai/);
assert.match(contactPage, /mailto:investors@3brain\.ai/);

const homepage = await readRepositoryFile('index.html');
assert.match(homepage, /A WATCH status routes the evidence to human review; it does not trigger a credit decision\./);

const indexNowKey = '4c359192cfa68f4af5c6a8dd38964897';
assert.equal((await readRepositoryFile(`${indexNowKey}.txt`)).trim(), indexNowKey);
assert.match(await readRepositoryFile('scripts/submit-indexnow.mjs'), new RegExp(`const KEY = '${indexNowKey}'`));

const ogImage = await readFile(path.join(repositoryRoot, 'assets/img/og_3brainai.png'));
assert.equal(ogImage.readUInt32BE(16), 1200, 'Open Graph image width must be 1200');
assert.equal(ogImage.readUInt32BE(20), 630, 'Open Graph image height must be 630');

process.stdout.write(`AI visibility contract validated for ${canonicalPages.length} canonical pages.\n`);
