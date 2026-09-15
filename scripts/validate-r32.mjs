import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const read=rel=>readFile(path.join(root,rel),'utf8');
const approved=JSON.parse(await read('scripts/r32-approved-surface.json'));
for(const [file,parts] of Object.entries(approved)) {
 const html=await read(file);
 for(const [name,pattern] of [['main',/<main\b[\s\S]*?<\/main>/],['header',/<header class="site-header[\s\S]*?<\/header>/],['footer',/<footer\b[\s\S]*?<\/footer>/]]) {
  let surface=html.match(pattern)?.[0]??'';
  if(name==='footer') {
   // The Assurance addition is the only authorised change to these footers.
   const link='<a href="/assurance/">Assurance</a>';
   assert.equal(surface.split(link).length,2,`${file}: one Assurance footer link required`);
   surface=surface.replace(link,'');
  }
  assert.equal(createHash('sha256').update(surface).digest('hex'),parts[name],`${file}: approved ${name} drift`);
 }
}
const cri=await read('cri/index.html'),validation=await read('validation/index.html');
assert.ok(cri.includes('Selected evaluation invitations may be offered free of charge.'));
assert.ok(validation.includes('selected free evaluation invitations'));
assert.ok(cri.includes('any applicable fee'));
for(const file of ['contact/index.html','validation/index.html','investors/index.html']) {
 const html=await read(file);
 const cfg=JSON.parse(html.match(/<script type="application\/json" id="n4-config">([\s\S]*?)<\/script>/)[1]);
 assert.equal(cfg.embedded,false); assert.equal(cfg.publicCandidate,true);
 assert.match(html,/<button[^>]+type="submit"[^>]+data-prepare/);
 assert.ok(html.includes('Nothing has been sent by this page.'));
 assert.match(html,/connect-src 'none'; form-action 'none'/);
 for (const purpose of cfg.form.purposes) assert.equal(purpose.recipient, file.startsWith('validation')?'cri@3brain.ai':file.startsWith('investors')?'investors@3brain.ai':'contact@3brain.ai');
}
assert.doesNotMatch(await read('about/index.html'),/prikryl-portret/);
assert.match(await read('assets/cri-web-r32/about.css'),/\.about-page > \.hero h1/);
// Source syntax is checked for all imported stylesheet and script layers.
let cssCount=0,jsCount=0;
for(const folder of ['cri-web-r2','cri-web-r3-visual','cri-web-r31','cri-web-r32']) {
 for(const file of await readdir(path.join(root,'assets',folder))) {
  const rel=path.join('assets',folder,file);
  if(file.endsWith('.css')) {execFileSync(path.join(root,'node_modules/.bin/csstree-validator'),[rel],{cwd:root,stdio:'pipe'});cssCount++;}
  if(file.endsWith('.js')) {execFileSync(process.execPath,['--check',rel],{cwd:root,stdio:'pipe'});jsCount++;}
 }
}
execFileSync(process.execPath,['scripts/check-r32-responsive.cjs','assets/cri-web-r32/responsive.js'],{cwd:root,stdio:'pipe'});
console.log(`R3.2: 21 approved surfaces, access terms, forms, ${cssCount} CSS layers, ${jsCount} JS layers and responsive logic checked (no browser render).`);
