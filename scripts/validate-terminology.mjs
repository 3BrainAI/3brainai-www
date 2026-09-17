import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const archive = 'evidence-packs/archive/public-records-before-terminology-2026-09-17.zip';
const original = file => execFileSync('unzip', ['-p', archive, file], { encoding: 'utf8' });
export const recordMain = html => html.match(/<main\b[\s\S]*?<\/main>/)[0];
export function revisedFischamendMain(old) {
  const marker = '              Large logistics / industrial real-estate development\n            </p>';
  return recordMain(old)
    .replace('Synthetic Project and Drawdown Context', 'Hypothetical drawdown review scenario')
    .replace('Declared - Synthetic', 'Declared - Hypothetical')
    .replaceAll('synthetic', 'hypothetical')
    .replaceAll('v0.1 PUBLIC-SAFE RELEASE', 'v0.2 TERMINOLOGY REVISION')
    .replace(marker, marker + '\n            <p class="case-meta mono">Terminology revision of v0.1, 17 Sep 2026. Findings unchanged.</p>');
}
export function validateTerminology() {
  const sha = x => createHash('sha256').update(x).digest('hex');
  const file = 'evidence-packs/fischamend/index.html';
  const old = original(file);
  assert.equal(sha(recordMain(old)), '13813d23bf18616eda561407fcbcd004a660d38a8938ef8e2d7a67a5d469fd30', 'Original v0.1 record is retained');
  assert.equal(recordMain(readFileSync(file, 'utf8')), revisedFischamendMain(old), 'Only approved terminology and revision labels may change the current record');
  for (const slug of ['lausitz', 'german-north-sea']) {
    const name = `evidence-packs/${slug}/index.html`;
    let expected = original(name)
      .replaceAll('Synthetic milestone record', 'Fictional milestone record')
      .replaceAll('synthetic milestone record', 'fictional milestone record')
      .replaceAll('Synthetic', 'Hypothetical').replaceAll('synthetic', 'hypothetical')
      .replace('<h2 id="archive-boundary-title">Archive boundary</h2>', '<h2 id="archive-boundary-title">Archive boundary</h2>\n        <p>Terminology revision, 17 September 2026. Observations, findings and qualifications are unchanged. <a href="/evidence-packs/archive/public-records-before-terminology-2026-09-17.zip" download>Download the original records and sources (ZIP)</a>.</p>');
    assert.equal(readFileSync(name, 'utf8'), expected, `${slug}: preserve all other record content`);
  }
  const rendered = JSON.parse(readFileSync('scripts/r42-rendered-assets.json', 'utf8'));
  for (const [name, expected] of Object.entries(rendered)) {
    assert.equal(sha(readFileSync(name)), expected, `${name}: reviewed render or archive changed`);
  }
  console.log('Terminology revisions match the exact approved map; original records are retained.');
}
