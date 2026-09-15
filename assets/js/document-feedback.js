/* Keep native links, URL destinations, downloads and CSP intact. This module
   never fetches files, reports fabricated percentages or claims a native
   browser download has finished. No analytics or persistent state. */
(() => {
 'use strict';
 const recordPath = /^\/evidence-packs\/(?:fischamend|lausitz|german-north-sea)\/(?:index\.html)?$/;
 const filePath = /\.(?:pdf|zip|docx?|xlsx?|pptx?|csv|png|jpe?g|webp)(?:$)/i;
 const lang = document.documentElement.lang.split('-')[0];
 const translations = {
  en: ['Opening document...', 'Loading document images...', 'Still loading document images...', 'Some document images could not load.', 'The document is opening in another tab. If it does not appear, try the link again.', 'Your browser is handling the attachment. Check its document tab or download list.', 'Reload', 'Dismiss'],
  cs: ['Otevírání dokumentu...', 'Načítání obrázků dokumentu...', 'Obrázky dokumentu se stále načítají...', 'Některé obrázky dokumentu se nepodařilo načíst.', 'Dokument se otevírá v jiné kartě. Pokud se neobjeví, zkuste odkaz znovu.', 'Přílohu zpracovává prohlížeč. Zkontrolujte kartu s dokumentem nebo seznam stahování.', 'Načíst znovu', 'Zavřít'],
  de: ['Dokument wird geöffnet...', 'Dokumentbilder werden geladen...', 'Dokumentbilder werden weiterhin geladen...', 'Einige Dokumentbilder konnten nicht geladen werden.', 'Das Dokument wird in einem anderen Tab geöffnet. Falls es nicht erscheint, versuchen Sie den Link erneut.', 'Ihr Browser verarbeitet den Anhang. Prüfen Sie den Dokument-Tab oder die Downloadliste.', 'Neu laden', 'Schließen']
 };
 const copy = translations[lang] || translations.en;
 const panel = document.createElement('div');
 panel.className = 'document-feedback';
 panel.hidden = true;
 const spinner = document.createElement('span');
 spinner.className = 'document-feedback__spinner';
 spinner.setAttribute('aria-hidden', 'true');
 const message = document.createElement('span');
 message.setAttribute('role', 'status');
 message.setAttribute('aria-live', 'polite');
 message.setAttribute('aria-atomic', 'true');
 const reload = document.createElement('button');
 reload.type = 'button'; reload.textContent = copy[6]; reload.hidden = true;
 reload.addEventListener('click', () => location.reload());
 const close = document.createElement('button');
 close.type = 'button'; close.textContent = '\u00d7'; close.setAttribute('aria-label', copy[7]);
 panel.append(spinner, message, reload, close);
 document.body.append(panel);
 let timer;
 let active = false;
 function hide() {
  clearTimeout(timer); active = false; panel.hidden = true;
 }
 function show(text, busy = true, retry = false) {
  panel.hidden = false; spinner.hidden = !busy; reload.hidden = !retry; message.textContent = text;
 }
 close.addEventListener('click', hide);
 window.addEventListener('pagehide', hide);
 window.addEventListener('pageshow', event => { if (event.persisted) hide(); });

 if (/^\/evidence-packs\/fischamend\/(?:index\.html)?$/.test(location.pathname)) {
  const contextNav = document.createElement('nav');
  contextNav.className = 'evidence-pack-context-nav';
  contextNav.setAttribute('aria-label', 'Evidence Pack context');
  contextNav.innerHTML = '<a href="/evidence-packs/#reading-guide">Reading guide</a><a href="/cri/">What is CRI?</a><a href="/about/">About</a><a href="/contact/">Contact</a>';
  document.body.prepend(contextNav);
 }

 document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href]');
  if (!link) return;
  const url = new URL(link.href, location.href);
  if (!['https:', 'http:'].includes(url.protocol)) return;
  const record = url.origin === location.origin && recordPath.test(url.pathname);
  const file = link.hasAttribute('download') || filePath.test(url.pathname);
  if (!record && !file) return;
  if (!file && url.pathname === location.pathname) return;
  clearTimeout(timer); active = true; show(copy[0]);
  const sameTab = !link.target || link.target === '_self';
  if (record && sameTab && !link.hasAttribute('download')) {
   // Give the status a paint before navigation waits for a slow HTML response.
   event.preventDefault();
   requestAnimationFrame(() => requestAnimationFrame(() => location.assign(link.href)));
   timer = setTimeout(() => { if (active) show(copy[0], true, true); }, 15000);
  } else {
   // Native downloads and new tabs have no reliable completion event here.
   // Hand off honestly instead of leaving an endless spinner on the source page.
   timer = setTimeout(() => { if (active) show(file ? copy[5] : copy[4], false); }, 8000);
  }
 });

 if (!recordPath.test(location.pathname)) return;
 // Track eager document images plus lazy evidence images when they actually
 // enter the viewport; off-screen images never keep a loading notice spinning.
 const pending = new Set();
 const watched = new WeakSet();
 let failed = false;
 function settle(img, success) {
  pending.delete(img); failed ||= !success;
  if (pending.size) return;
  clearTimeout(timer);
  if (failed) { active = true; show(copy[3], false, true); }
  else hide();
 }
 function watch(img) {
  if (watched.has(img)) return;
  watched.add(img);
  if (img.complete) {
   if (!img.naturalWidth) { failed = true; active = true; show(copy[3], false, true); }
   return;
  }
  pending.add(img); active = true; show(copy[1]);
  img.addEventListener('load', () => settle(img, true), { once:true });
  img.addEventListener('error', () => settle(img, false), { once:true });
  clearTimeout(timer);
  timer = setTimeout(() => { if (active && pending.size) show(copy[2], true, true); }, 15000);
 }
 const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).forEach(entry => {
   watch(entry.target); observer.unobserve(entry.target);
  });
 }) : null;
 document.querySelectorAll('main img, .document img').forEach(img => {
  if (img.loading === 'lazy' && observer) observer.observe(img);
  else watch(img);
 });
})();
