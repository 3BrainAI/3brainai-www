import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const record = '/evidence-packs/fischamend/';
const imagePath = `${record}assets/fischamend_t0_T0_2023-08-20_visual.png`;
const status = page => page.locator('.document-feedback');

test.beforeEach(async ({ page }) => {
 await page.route('https://fonts.googleapis.com/**', route => route.abort());
 await page.route('https://fonts.gstatic.com/**', route => route.abort());
 await page.emulateMedia({ reducedMotion:'reduce' });
});

for (const [width, height] of [[1280,650], [1366,668], [1440,780], [1536,760], [1920,950]]) {
 test(`desktop opening fits without scrolling at ${width}x${height}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  const metrics = await page.evaluate(() => {
   const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
   return {
    viewport:innerHeight,
    buttons:[...document.querySelectorAll('.v3-home-journey a')].map(el=>el.getBoundingClientRect().toJSON()),
    copy:rect('.r4-hero-copy'), folio:rect('.r4-folio-stage'),
    sheets:[...document.querySelectorAll('.r4-folio-sheet')].map(el=>el.getBoundingClientRect().toJSON()),
    overflow:document.documentElement.scrollWidth-innerWidth
   };
  });
  await info.attach('opening-geometry.json',{ body:JSON.stringify(metrics,null,2), contentType:'application/json' });
  await mkdir('artifacts/r3-preview', { recursive:true });
  await page.screenshot({path:`artifacts/r3-preview/r33-opening-${width}x${height}.png`});
  expect(Math.abs(metrics.buttons[0].top-metrics.buttons[1].top)).toBeLessThanOrEqual(1);
  expect(metrics.buttons[1].left).toBeGreaterThanOrEqual(metrics.buttons[0].right);
  expect(metrics.copy.bottom).toBeLessThanOrEqual(height-12);
  expect(Math.abs(metrics.folio.top-metrics.copy.top)).toBeLessThanOrEqual(1);
  expect(metrics.folio.bottom).toBeLessThanOrEqual(height-12);
  for (const box of [...metrics.buttons,...metrics.sheets]) expect(box.bottom).toBeLessThanOrEqual(height-12);
  for (const box of metrics.buttons) expect(box.height).toBeGreaterThanOrEqual(44);
  expect(metrics.overflow).toBeLessThanOrEqual(1);
 });
}

test('mobile keeps readable stacked journeys and both explanations', async ({ page }) => {
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const buttons = await page.locator('.v3-home-journey a').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));
 expect(buttons[1].top).toBeGreaterThan(buttons[0].bottom);
 for (const note of await page.locator('.v3-home-note').all()) await expect(note).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});

test('slow record navigation immediately acknowledges click and resets on Back', async ({ page }) => {
 let release;
 const gate = new Promise(resolve=>{release=resolve;});
 await page.route(`**${record}`,async route=>{await gate;await route.continue();});
 await page.goto('/');
 // Freeze only the animation clock: assertions must happen before Playwright
 // starts waiting for the intentionally withheld navigation response.
 await page.clock.install({time:new Date('2026-09-15T10:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-15T10:00:01Z'));
 await page.getByRole('link',{name:'View an Evidence Pack',exact:true}).click();
 try {
  await expect(status(page)).toBeVisible();
  await expect(status(page).getByRole('status')).toHaveText('Opening document...');
  const request=page.waitForRequest(`**${record}`);
  await page.clock.runFor(50);
  await request;
  // Read the old document directly while the new HTML response is pending.
  expect(await page.evaluate(()=>!document.querySelector('.document-feedback').hidden)).toBe(true);
 } finally { release(); }
 await page.waitForURL(`**${record}`);
 await page.goBack();
 await expect(status(page)).toBeHidden();
});

test('record keeps loading feedback until its delayed image arrives', async ({ page }, info) => {
 let release;
 const gate = new Promise(resolve=>{release=resolve;});
 await page.route(`**${imagePath}`,async route=>{await gate;await route.continue();});
 await page.goto(record,{waitUntil:'domcontentloaded'});
 try {
  await expect(status(page)).toBeVisible();
  await expect(status(page).getByRole('status')).toHaveText('Loading document images...');
  await expect(status(page).locator('.document-feedback__spinner')).toHaveCSS('animation-name','none');
  await info.attach('loading-feedback.png',{body:await page.screenshot(),contentType:'image/png'});
 } finally { release(); }
 await expect(status(page)).toBeHidden();
});

test('failed document image gives a reload action instead of endless spinner', async ({ page }) => {
 await page.route(`**${imagePath}`,route=>route.abort());
 await page.goto(record);
 await expect(status(page).getByRole('status')).toHaveText('Some document images could not load.');
 await expect(status(page).locator('.document-feedback__spinner')).toBeHidden();
 await expect(status(page).getByRole('button',{name:'Reload',exact:true})).toBeVisible();
 await page.unroute(`**${imagePath}`);
 await status(page).getByRole('button',{name:'Reload',exact:true}).click();
 await expect(status(page)).toBeHidden();
});

test('ordinary anchors and email links do not display document feedback', async ({ page }) => {
 await page.goto('/');
 await page.getByRole('link',{name:'Explore the review cycle'}).click();
 await expect(page).toHaveURL(/#workflow$/);
 await expect(status(page)).toBeHidden();
});

test('new-tab record retains its destination and gives source-page feedback', async ({ page }) => {
 await page.goto('/evidence-packs/');
 const link = page.locator(`a[href="${record}"][target="_blank"]`).first();
 const popupPromise=page.waitForEvent('popup');
 await link.click();
 const popup=await popupPromise;
 await expect(popup).toHaveURL(new RegExp(`${record}$`));
 await expect(status(page)).toBeVisible();
 await popup.close();
});

test('native file download keeps filename and has bounded honest feedback', async ({ page }) => {
 await page.route('**/feedback-fixture/',route=>route.fulfill({contentType:'text/html',body:
  '<!doctype html><html lang="en"><head><link rel="stylesheet" href="/assets/css/document-feedback.css?v=r33"><script src="/assets/js/document-feedback.js?v=r33" defer></script></head><body><a href="/sample.csv" download="review.csv">Download sample</a></body></html>'}));
 await page.route('**/sample.csv',route=>route.fulfill({contentType:'text/csv',body:'question,status\nSample,pending\n'}));
 await page.clock.install();
 await page.goto('/feedback-fixture/');
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('link',{name:'Download sample'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('review.csv');
 await expect(status(page).getByRole('status')).toHaveText('Opening document...');
 await page.clock.fastForward(8100);
 await expect(status(page).locator('.document-feedback__spinner')).toBeHidden();
 await expect(status(page).getByRole('status')).toHaveText('Your browser is handling the attachment. Check its document tab or download list.');
});
