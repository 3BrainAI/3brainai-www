import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
 await page.route('https://fonts.googleapis.com/**', route=>route.abort());
 await page.route('https://fonts.gstatic.com/**', route=>route.abort());
 await page.emulateMedia({reducedMotion:'reduce'});
});

async function openForm(page) {
 await page.goto('/assurance/');
 await page.getByText('Prepare a due-diligence enquiry',{exact:true}).click();
}
async function fillRequest(page) {
 await page.getByLabel('Full name (required)',{exact:true}).fill('Anna Nováková');
 await page.getByLabel('Organisation (required)',{exact:true}).fill('Example institution');
 await page.getByLabel('Work email (required)',{exact:true}).fill('reviewer@example.org');
 await page.getByLabel('Professional role (required)',{exact:true}).fill('Risk reviewer');
 await page.getByLabel('Purpose (required)',{exact:true}).selectOption('customer');
 await page.getByLabel('Existing NDA with 3BrainAI (required)',{exact:true}).selectOption('no');
 await page.getByLabel('Evidence lineage and limitations',{exact:true}).check();
 await page.getByRole('checkbox',{name:'I have read the Privacy information (required).'}).check();
}

for(const width of [390,768,1366]) {
 test(`Assurance remains readable with the enquiry open at ${width}px`,async ({page})=>{
  await page.setViewportSize({width,height:844});
  await openForm(page);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Security, Governance & Assurance');
  await expect(page.getByRole('navigation',{name:'On this page'}).getByRole('link')).toHaveCount(7);
  const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,fields:[...document.querySelectorAll('.assurance-field input,.assurance-field select')].map(n=>n.getBoundingClientRect().toJSON())}));
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  for(const box of geometry.fields){expect(box.width).toBeGreaterThan(200);expect(box.height).toBeGreaterThanOrEqual(44);expect(box.right).toBeLessThanOrEqual(width);}
  await mkdir('artifacts/r3-preview',{recursive:true});
  await page.screenshot({path:`artifacts/r3-preview/assurance-${width}.png`,fullPage:true});
 });
}

test('Assurance is reachable from existing footers and section links land on real headings',async ({page})=>{
 for(const path of ['/','/cri/','/contact/','/security/']) {
  await page.goto(path);
  await expect(page.locator('footer').getByRole('link',{name:'Assurance',exact:true})).toHaveAttribute('href','/assurance/');
 }
 await page.locator('footer').getByRole('link',{name:'Assurance',exact:true}).click();
 await expect(page).toHaveURL(/\/assurance\/$/);
 await page.getByRole('navigation',{name:'On this page'}).getByRole('link',{name:'Due diligence',exact:true}).click();
 await expect(page).toHaveURL(/#due-diligence$/);
 const top=await page.locator('#dd-title').evaluate(n=>n.getBoundingClientRect().top);
 expect(top).toBeGreaterThan(60);expect(top).toBeLessThan(300);
});

test('keyboard entry exposes the skip link and focused controls have a visible outline',async ({page})=>{
 await page.goto('/assurance/');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Request assurance information',exact:true})).toBeFocused();
 const style=await page.locator(':focus').evaluate(n=>({style:getComputedStyle(n).outlineStyle,width:parseFloat(getComputedStyle(n).outlineWidth)}));
 expect(style.style).not.toBe('none');expect(style.width).toBeGreaterThanOrEqual(2);
});

test('a complete request produces a fixed-recipient draft without transmitting or storing answers',async ({page})=>{
 await openForm(page);
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await fillRequest(page);
 await page.getByLabel('Non-confidential context (optional)').fill('Please share the available scope for our review.');
 await page.getByRole('button',{name:'Prepare enquiry email'}).click();
 await expect(page.locator('#assurance-status')).toContainText('Nothing has been sent');
 await expect(page.locator('#assurance-result')).toBeFocused();
 const text=await page.locator('#assurance-draft').inputValue();
 expect(text).toContain('To: contact@3brain.ai\nSubject: Assurance information request - 3BrainAI');
 expect(text).toContain('Anna Nováková');expect(text).toContain('Evidence lineage and limitations');
 const link=await page.locator('#assurance-open-email').getAttribute('href');
 expect(link).toMatch(/^mailto:contact@3brain\.ai\?subject=/);
 expect(new URL(link).searchParams.get('body')).toContain('Work email: reviewer@example.org');
 expect(requests).toEqual([]);
 expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
 expect(page.url()).toMatch(/\/assurance\/$/);
});

test('missing category and privacy acknowledgement prevent draft creation',async ({page})=>{
 await openForm(page);await fillRequest(page);
 await page.getByLabel('Evidence lineage and limitations',{exact:true}).uncheck();
 await page.getByRole('button',{name:'Prepare enquiry email'}).click();
 await expect(page.locator('#assurance-result')).toBeHidden();
 await page.getByLabel('Evidence lineage and limitations',{exact:true}).check();
 await page.getByRole('checkbox',{name:'I have read the Privacy information (required).'}).uncheck();
 await page.getByRole('button',{name:'Prepare enquiry email'}).click();
 await expect(page.locator('#assurance-result')).toBeHidden();
});

test('invalid email is rejected and changing or clearing details invalidates the old draft',async ({page})=>{
 await openForm(page);await fillRequest(page);
 await page.getByLabel('Work email (required)',{exact:true}).fill('reviewer@');
 await page.getByRole('button',{name:'Prepare enquiry email'}).click();
 await expect(page.locator('#assurance-result')).toBeHidden();
 await page.getByLabel('Work email (required)',{exact:true}).fill('reviewer@example.org');
 await page.getByRole('button',{name:'Prepare enquiry email'}).click();
 await expect(page.locator('#assurance-result')).toBeVisible();
 await page.getByLabel('Purpose (required)',{exact:true}).selectOption('partner');
 await expect(page.locator('#assurance-draft')).toHaveValue('');
 await expect(page.locator('#assurance-open-email')).not.toHaveAttribute('href');
 await page.getByRole('button',{name:'Prepare enquiry email'}).click();
 await expect(page.locator('#assurance-draft')).toHaveValue(/Partner due diligence/);
 await page.getByRole('button',{name:'Clear form'}).click();
 await expect(page.locator('#assurance-draft')).toHaveValue('');
 await expect(page.getByLabel('Full name (required)',{exact:true})).toHaveValue('');
});

test('long Unicode context remains complete in the copyable draft instead of a truncated email URL',async ({page})=>{
 await openForm(page);await fillRequest(page);
 const context='Žádáme podklady. '.repeat(70);
 await page.getByLabel('Non-confidential context (optional)').fill(context);
 await page.getByRole('button',{name:'Prepare enquiry email'}).click();
 await expect(page.locator('#assurance-draft')).toHaveValue(new RegExp(context.trim()));
 await expect(page.locator('#assurance-open-email')).toBeHidden();
});

test('without JavaScript the direct email remains usable and preparation cannot submit',async ({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:4174/assurance/');
 await page.getByText('Prepare a due-diligence enquiry',{exact:true}).click();
 await expect(page.getByRole('button',{name:'Prepare enquiry email'})).toBeDisabled();
 await expect(page.locator('noscript a')).toHaveAttribute('href',/mailto:contact@3brain\.ai/);
 await context.close();
});
