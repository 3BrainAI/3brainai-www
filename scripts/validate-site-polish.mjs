import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repositoryRoot = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'playwright-report', 'artifacts']);
const copyExtensions = new Set(['.css', '.html', '.js', '.mjs', '.json', '.txt', '.xml']);
const forbiddenCopyPattern = new RegExp('\\u2014|&' + 'mdash;');
const standaloneArtifactPages = new Set([
  'evidence-packs/fischamend/index.html'
]);

async function collectFiles(directory, target = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(absolutePath, target);
    } else {
      target.push(absolutePath);
    }
  }
  return target;
}

const files = await collectFiles(repositoryRoot);
const htmlFiles = files.filter(file => path.extname(file) === '.html');
assert.equal(htmlFiles.length, 34, 'All 34 public HTML entry points must remain covered');

const requiredIconLinks = [
  '<link rel="icon" type="image/svg+xml" href="/assets/img/favicon-mark-v2.svg">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-mark-v2-32.png">',
  '<link rel="shortcut icon" href="/assets/img/favicon-mark-v2.ico">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon-mark-v2.png">',
  '<link rel="manifest" href="/assets/manifest.json">'
];

const releaseAssetVersion = 'f87d840f';
const m2AssetVersion = '2cc56e54';
const m2StylesheetPages = new Set([
  'index.html',
  'cri/index.html',
  'validation/index.html',
  'investors/index.html'
]);
const requiredScriptSource = `/assets/js/main.js?v=${releaseAssetVersion}`;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relativePath = path.relative(repositoryRoot, file);
  if (standaloneArtifactPages.has(relativePath)) continue;
  const expectedStylesheetVersion = m2StylesheetPages.has(relativePath)
    ? m2AssetVersion
    : releaseAssetVersion;
  const requiredStylesheetLink = `<link rel="stylesheet" href="/assets/css/style.css?v=${expectedStylesheetVersion}">`;
  assert.ok(
    html.includes(requiredStylesheetLink),
    `${relativePath} must use the versioned release stylesheet`
  );
  assert.doesNotMatch(
    html,
    /href="\/assets\/css\/style\.css"/,
    `${relativePath} contains an unversioned stylesheet reference`
  );
  for (const link of requiredIconLinks) {
    assert.ok(html.includes(link), `${relativePath} is missing ${link}`);
  }

  if (html.includes('/assets/js/main.js')) {
    assert.ok(
      html.includes(requiredScriptSource),
      `${relativePath} must use the versioned release script`
    );
    assert.doesNotMatch(
      html,
      /src="\/assets\/js\/main\.js"/,
      `${relativePath} contains an unversioned script reference`
    );
  }
}

const fischamendArtifactHashes = new Map([
  ['evidence-packs/fischamend/index.html', '8abb3fd128f6c3ef245b9d12844004cb66a1d6822e7598f4783bcea33fa16f84'],
  ['evidence-packs/fischamend/3BrainAI_CRI_Fischamend_Evidence_Pack_v0_1.pdf', '9965d58e31d4039d72d9b0fc808ded13a449b4c3172e650a3e9123b19c80dcdf'],
  ['evidence-packs/fischamend/assets/fischamend_t0_T0_2023-08-20_visual.png', 'a0dafc4173b0a1800d43c738a97dccbbf555fe261929c5e5d019536bab41cb8f'],
  ['evidence-packs/fischamend/assets/fischamend_t1_T1_2025-08-19_visual.png', 'b938f6be662e6ecc996634b854dd28ebfd7607ff37030d0aa0fe878cf5eca6fa'],
  ['assets/img/cri/evidence/fischamend-t0-2023-08-20.png', 'a0dafc4173b0a1800d43c738a97dccbbf555fe261929c5e5d019536bab41cb8f'],
  ['assets/img/cri/evidence/fischamend-t1-2025-08-19.png', 'b938f6be662e6ecc996634b854dd28ebfd7607ff37030d0aa0fe878cf5eca6fa']
]);

for (const [relativePath, expectedHash] of fischamendArtifactHashes) {
  const value = await readFile(path.join(repositoryRoot, relativePath));
  const actualHash = createHash('sha256').update(value).digest('hex');
  assert.equal(actualHash, expectedHash, `${relativePath} must retain its founder-locked bytes`);
}

const fischamendArtifactHtml = await readFile(
  path.join(repositoryRoot, 'evidence-packs/fischamend/index.html'),
  'utf8'
);
assert.match(fischamendArtifactHtml, /<style>[\s\S]*<\/style>/, 'Fischamend artefact must retain its local presentation');
assert.match(fischamendArtifactHtml, /src="assets\/fischamend_t0_T0_2023-08-20_visual\.png"/);
assert.match(fischamendArtifactHtml, /src="assets\/fischamend_t1_T1_2025-08-19_visual\.png"/);
assert.doesNotMatch(fischamendArtifactHtml, /data:/i, 'Fischamend artefact must use portable local assets');
assert.doesNotMatch(
  fischamendArtifactHtml,
  /<(?:img|script)\b[^>]*\bsrc="https?:\/\//i,
  'Fischamend artefact must not load an external runtime image or script'
);
assert.doesNotMatch(
  fischamendArtifactHtml,
  /<link\b[^>]*\bhref="https?:\/\//i,
  'Fischamend artefact must not load an external runtime stylesheet'
);

for (const file of files.filter(file => copyExtensions.has(path.extname(file)))) {
  const value = await readFile(file, 'utf8');
  const relativePath = path.relative(repositoryRoot, file);
  assert.doesNotMatch(value, forbiddenCopyPattern, `${relativePath} contains an em dash`);
}

const canonicalEnglishPages = [
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

for (const relativePath of canonicalEnglishPages) {
  const html = await readFile(path.join(repositoryRoot, relativePath), 'utf8');
  const footer = html.match(/<footer class="footer">([\s\S]*?)<\/footer>/)?.[1] ?? '';
  assert.match(footer, /class="footer-main"/, `${relativePath} footer is missing the compact main grid`);
  assert.match(footer, /class="footer-navigation footer-navigation--primary"/);
  assert.match(footer, /class="footer-navigation footer-navigation--secondary"/);
  assert.match(footer, /European startup · Head office in Prague/);
  assert.match(footer, /Focused on DACH, Benelux and Central European institutional markets\./);
  assert.match(footer, /class="footer-esa-proof"/);
}

const expectedPngDimensions = new Map([
  ['assets/img/favicon.png', [64, 64]],
  ['assets/img/favicon-mark-v2-32.png', [32, 32]],
  ['assets/img/apple-touch-icon-mark-v2.png', [180, 180]],
  ['assets/img/icon-192.png', [192, 192]],
  ['assets/img/icon-512.png', [512, 512]]
]);

for (const [relativePath, [expectedWidth, expectedHeight]] of expectedPngDimensions) {
  const image = await readFile(path.join(repositoryRoot, relativePath));
  assert.equal(image.toString('ascii', 1, 4), 'PNG', `${relativePath} must be a PNG`);
  assert.equal(image.readUInt32BE(16), expectedWidth, `${relativePath} has an unexpected width`);
  assert.equal(image.readUInt32BE(20), expectedHeight, `${relativePath} has an unexpected height`);
}

const faviconSvg = await readFile(path.join(repositoryRoot, 'assets/img/favicon-mark-v2.svg'), 'utf8');
assert.doesNotMatch(faviconSvg, /<rect\b/, 'Favicon must keep a transparent background');
assert.match(faviconSvg, /fill="#1b1f2a"/);
assert.equal((faviconSvg.match(/<path /g) ?? []).length, 6, 'Favicon must use the six-part 3BrainAI mark');

const homepageHtml = await readFile(path.join(repositoryRoot, 'index.html'), 'utf8');
assert.equal(
  (homepageHtml.match(/Illustrative prototype · public-safe example/g) ?? []).length,
  3,
  'Fischamend and both earlier Evidence Pack cases must use the approved prototype label'
);
assert.equal(
  (homepageHtml.match(/evidence-pack-state evidence-pack-state--featured/g) ?? []).length,
  2,
  'Both case headers must expose the featured status treatment'
);
assert.match(
  homepageHtml,
  /<h1 id="r3-hero-title">Turn dated project evidence into a reviewable decision-support record\.<\/h1>/
);
assert.match(
  homepageHtml,
  /href="#portfolio">View the Austrian Evidence Pack<\/a>/
);
assert.match(homepageHtml, /href="\/validation\/#readiness-form">Discuss an Evidence Readiness Check<\/a>/);
assert.match(homepageHtml, /href="\/evidence-packs\/fischamend\/">View the Austrian Evidence Pack<\/a>/);
assert.match(homepageHtml, /WATCH &#8212;<\/span>\s*<span>EVIDENCE SUFFICIENCY<\/span>/);
assert.match(homepageHtml, /id="portfolio"/);
assert.match(homepageHtml, /id="evidence-pack-sample"/);
assert.match(homepageHtml, /D4 infrastructure example/);
assert.match(homepageHtml, /does not inherit the Fischamend validation result/);
assert.match(homepageHtml, /id="lausitz-evidence-input"[^>]*tabindex="-1"/);
assert.match(homepageHtml, /id="north-sea-evidence-input"[^>]*tabindex="-1"/);
assert.equal((homepageHtml.match(/<link rel="preload" as="image"/g) ?? []).length, 2);
assert.equal((homepageHtml.match(/loading="eager"/g) ?? []).length, 2);
assert.equal((homepageHtml.match(/fetchpriority="high"/g) ?? []).length, 2);
assert.equal((homepageHtml.match(/loading="lazy"/g) ?? []).length, 4);
assert.equal((homepageHtml.match(/class="evidence-date-chip"/g) ?? []).length, 4);
assert.match(homepageHtml, /class="review-timeline"/);
assert.match(homepageHtml, /class="r3-flow"/);

const reviewPackageFiles = [
  'index.html',
  'cri/index.html',
  'validation/index.html',
  'investors/index.html',
  'governance-layer/index.html'
];
const reviewPackageHtml = (await Promise.all(
  reviewPackageFiles.map(relativePath => readFile(path.join(repositoryRoot, relativePath), 'utf8'))
)).join('\n');
const publicClaimSurface = `${(await Promise.all(
  canonicalEnglishPages.map(relativePath => readFile(path.join(repositoryRoot, relativePath), 'utf8'))
)).join('\n')}\n${await readFile(path.join(repositoryRoot, 'llms.txt'), 'utf8')}`;

assert.doesNotMatch(
  publicClaimSurface,
  /Shadow-Mode Case|Possible Paid Pilot|Portfolio Workflow|Evidence Readiness Assessment|shadow-mode pilot/i,
  'Review package contains retired commercial-stage vocabulary'
);
assert.doesNotMatch(
  publicClaimSurface,
  /early October 2026|one month of intensive sprint|PoC Demonstrator|selected Austrian investors/i,
  'Review package contains Internal Delivery Appendix wording'
);
assert.doesNotMatch(
  publicClaimSurface,
  /AI Act compliant|compliance-ready|regulator-ready|not high-risk|outside the AI Act/i,
  'Review package contains a prohibited regulatory claim'
);
assert.equal(
  (reviewPackageHtml.match(/How does CRI relate to the EU AI Act and banking governance\?/g) ?? []).length,
  1,
  'The approved package must contain exactly one explicit AI Act Q&A item'
);

const criHtml = await readFile(path.join(repositoryRoot, 'cri/index.html'), 'utf8');
assert.match(
  criHtml,
  /The Evidence Pack format is designed to keep source, observation date, version, uncertainty and review state visible alongside the evidence/
);
assert.equal((criHtml.match(/parallel-rail parallel-rail--/g) ?? []).length, 1);
assert.equal((criHtml.match(/class="product-chain"/g) ?? []).length, 1);
assert.equal((criHtml.match(/class="m2-mechanism-index"/g) ?? []).length, 4);
assert.match(criHtml, /01 · Declared[\s\S]*02 · Observed[\s\S]*03 · Governed[\s\S]*04 · Output/);
assert.match(criHtml, /Human-review state/);

const validationHtml = await readFile(path.join(repositoryRoot, 'validation/index.html'), 'utf8');
assert.equal((validationHtml.match(/class="m2-stage /g) ?? []).length, 5);
assert.equal((validationHtml.match(/class="m2-engagement-state"/g) ?? []).length, 4);
assert.equal((validationHtml.match(/class="stage-rail"/g) ?? []).length, 0);
assert.match(validationHtml, /Idea and problem definition[\s\S]*Product concept and illustrative prototypes[\s\S]*Proof of Concept[\s\S]*Paid Pilot[\s\S]*Commercial Deployment/);
assert.match(validationHtml, /Institution-specific engagement &#8212; a separate axis/);
assert.equal((validationHtml.match(/class="evaluation-item"/g) ?? []).length, 4);
assert.equal((validationHtml.match(/<details>/g) ?? []).length, 6);
assert.equal((validationHtml.match(/data-contact-form/g) ?? []).length, 1);
assert.equal((validationHtml.match(/data-field-label=/g) ?? []).length, 4);

const investorsHtml = await readFile(path.join(repositoryRoot, 'investors/index.html'), 'utf8');
assert.match(investorsHtml, /<h1>Public discipline, private diligence depth\.<\/h1>/);
assert.equal((investorsHtml.match(/class="m2-investor-gate /g) ?? []).length, 3);
assert.match(investorsHtml, /mailto:investors@3brain\.ai\?subject=Request%3A%203BrainAI%20investor%20materials/);
assert.match(investorsHtml, /class="commercial-equation"/);
assert.equal((investorsHtml.match(/data-contact-form/g) ?? []).length, 1);
assert.equal((investorsHtml.match(/data-field-label=/g) ?? []).length, 4);

const governanceHtml = await readFile(path.join(repositoryRoot, 'governance-layer/index.html'), 'utf8');
assert.match(governanceHtml, /class="governance-pipeline"/);
assert.equal((governanceHtml.match(/class="maturity-band maturity-band--/g) ?? []).length, 3);

const stylesheet = await readFile(path.join(repositoryRoot, 'assets/css/style.css'), 'utf8');
assert.match(stylesheet, /\.evidence-pack-header h2\s*{[^}]*font-size:\s*33\.35px;[^}]*font-weight:\s*400;/s);
assert.match(stylesheet, /\.evidence-pack-product\s*{[^}]*font-weight:\s*600;/s);
assert.match(stylesheet, /#panel-lausitz \.evidence-input-figure img\s*{[^}]*brightness\(1\.14\)/s);
assert.match(stylesheet, /#panel-north-sea \.evidence-input-figure img\s*{[^}]*brightness\(1\.25\)/s);
assert.match(stylesheet, /\.evidence-input-band:target\s*{/);
assert.match(stylesheet, /\.m2-history\s*{/);
assert.match(stylesheet, /\.m2-engagement\s*{/);
assert.match(stylesheet, /\.m2-fischamend-hero\s*,/);

const mainScript = await readFile(path.join(repositoryRoot, 'assets/js/main.js'), 'utf8');
assert.match(mainScript, /dataset\.evidencePackDestination/);
assert.match(mainScript, /activePanel\?\.querySelector\('\.evidence-input-band'\)/);
assert.match(mainScript, /focusTarget\.focus\(\{ preventScroll: true \}\)/);

process.stdout.write(`Site polish contract validated for ${htmlFiles.length} HTML entry points.\n`);
