import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repositoryRoot = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'playwright-report', 'artifacts']);
const copyExtensions = new Set(['.css', '.html', '.js', '.mjs', '.json', '.txt', '.xml']);
const forbiddenCopyPattern = new RegExp('\\u2014|&' + 'mdash;');

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
assert.equal(htmlFiles.length, 33, 'All 33 public HTML entry points must remain covered');

const requiredIconLinks = [
  '<link rel="icon" type="image/svg+xml" href="/assets/img/favicon-mark-v2.svg">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-mark-v2-32.png">',
  '<link rel="shortcut icon" href="/assets/img/favicon-mark-v2.ico">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon-mark-v2.png">',
  '<link rel="manifest" href="/assets/manifest.json">'
];

const releaseAssetVersion = '3036e1a9';
const requiredStylesheetLink = `<link rel="stylesheet" href="/assets/css/style.css?v=${releaseAssetVersion}">`;
const requiredScriptSource = `/assets/js/main.js?v=${releaseAssetVersion}`;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relativePath = path.relative(repositoryRoot, file);
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
  assert.match(footer, /European project · Head office in Prague/);
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
  (homepageHtml.match(/Bank-review artefact · synthetic public-safe sample/g) ?? []).length,
  2,
  'Both Evidence Pack cases must use the bank-review artefact label'
);
assert.equal(
  (homepageHtml.match(/evidence-pack-state evidence-pack-state--featured/g) ?? []).length,
  2,
  'Both case headers must expose the featured status treatment'
);
assert.match(
  homepageHtml,
  /href="#lausitz-evidence-input"[^>]*data-evidence-pack-destination="input">View the evidence imagery/
);
assert.match(homepageHtml, /id="lausitz-evidence-input"[^>]*tabindex="-1"/);
assert.match(homepageHtml, /id="north-sea-evidence-input"[^>]*tabindex="-1"/);

const stylesheet = await readFile(path.join(repositoryRoot, 'assets/css/style.css'), 'utf8');
assert.match(stylesheet, /\.evidence-pack-header h2\s*{[^}]*font-size:\s*33\.35px;[^}]*font-weight:\s*400;/s);
assert.match(stylesheet, /\.evidence-pack-product\s*{[^}]*font-weight:\s*600;/s);
assert.match(stylesheet, /#panel-lausitz \.evidence-input-figure img\s*{[^}]*brightness\(1\.14\)/s);
assert.match(stylesheet, /#panel-north-sea \.evidence-input-figure img\s*{[^}]*brightness\(1\.25\)/s);
assert.match(stylesheet, /\.evidence-input-band:target\s*{/);

const mainScript = await readFile(path.join(repositoryRoot, 'assets/js/main.js'), 'utf8');
assert.match(mainScript, /dataset\.evidencePackDestination/);
assert.match(mainScript, /activePanel\?\.querySelector\('\.evidence-input-band'\)/);
assert.match(mainScript, /focusTarget\.focus\(\{ preventScroll: true \}\)/);

process.stdout.write(`Site polish contract validated for ${htmlFiles.length} HTML entry points.\n`);
