import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HOST = 'www.3brain.ai';
const ORIGIN = `https://${HOST}`;
const KEY = '4c359192cfa68f4af5c6a8dd38964897';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const keyFile = path.join(repositoryRoot, `${KEY}.txt`);

const rawArguments = process.argv.slice(2);
const dryRun = rawArguments.includes('--dry-run');
const urlArguments = rawArguments.filter(argument => argument !== '--dry-run');

if (urlArguments.length === 0) {
  throw new Error(
    'Provide at least one changed canonical URL, for example: npm run indexnow -- https://www.3brain.ai/ https://www.3brain.ai/cri/'
  );
}

const publishedKey = (await readFile(keyFile, 'utf8')).trim();
if (publishedKey !== KEY) {
  throw new Error(`IndexNow key file ${path.basename(keyFile)} does not contain the expected key.`);
}

const urlList = [...new Set(urlArguments.map(argument => {
  const url = new URL(argument, `${ORIGIN}/`);
  if (url.origin !== ORIGIN) {
    throw new Error(`Refusing to submit a URL outside ${ORIGIN}: ${url.href}`);
  }
  url.hash = '';
  return url.href;
}))];

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: `${ORIGIN}/${KEY}.txt`,
  urlList
};

if (dryRun) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  const responseBody = await response.text();
  throw new Error(`IndexNow returned HTTP ${response.status}: ${responseBody || response.statusText}`);
}

process.stdout.write(`IndexNow accepted ${urlList.length} URL(s) with HTTP ${response.status}.\n`);
