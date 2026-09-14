/* Content disclosure and media hydration only. No form, transport, storage,
   payment or access behaviour. Native details stay open if JS is unavailable. */
(() => {
 'use strict';
 const mobile = window.matchMedia('(max-width:640px)');
 const disclosures = [...document.querySelectorAll('details[data-v32-responsive]')];
 const mobileChoice = new WeakMap();

 function allAncestorsOpen(node) {
  for (let p = node.parentElement; p; p = p.parentElement) {
   if (p.tagName === 'DETAILS' && !p.open) return false;
  }
  return true;
 }

 function loadVisibleMedia() {
  document.querySelectorAll('template[data-v32-media]').forEach(template => {
   if (template.dataset.v32Loaded === 'true') return;
   if (template.dataset.v32Media === 'desktop' && mobile.matches) return;
   if (!allAncestorsOpen(template)) return;
   const host = template.parentElement.querySelector('[data-v32-media-host]');
   if (!host) return;
   host.append(template.content.cloneNode(true));
   template.dataset.v32Loaded = 'true';
  });
 }

 function updateLayout() {
  disclosures.forEach(detail => {
   detail.open = mobile.matches ? (mobileChoice.get(detail) ?? false) : true;
  });
  loadVisibleMedia();
 }

 disclosures.forEach(detail => detail.addEventListener('toggle', () => {
  if (mobile.matches) mobileChoice.set(detail, detail.open);
  loadVisibleMedia();
 }));

 function revealAnchor(hash) {
  if (!hash || hash === '#') return;
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  for (let node = target; node; node = node.parentElement) {
   if (node.tagName === 'DETAILS') {
    node.open = true;
    if (node.hasAttribute('data-v32-responsive')) mobileChoice.set(node, true);
   }
   if (node.hasAttribute('data-v32-mobile-omit')) node.setAttribute('data-v32-revealed', 'true');
  }
  /* Section IDs sit outside their responsive disclosure. Open that section
     too, so an incoming link exposes the promised material. */
  if (target.tagName === 'SECTION') {
   const detail = target.querySelector('details[data-v32-responsive="section"]');
   if (detail) { detail.open = true; mobileChoice.set(detail, true); }
  }
  loadVisibleMedia();
  window.requestAnimationFrame(() => target.scrollIntoView({block:'start', behavior:'auto'}));
 }

 mobile.addEventListener('change', updateLayout);
 window.addEventListener('hashchange', () => revealAnchor(window.location.hash));
 /* The existing isolated review shell sends anchors to its srcdoc frame. */
 window.addEventListener('message', event => {
  if (event.source !== window.parent || event.data?.type !== 'cri-n4-anchor') return;
  revealAnchor(String(event.data.hash || ''));
 });
 document.addEventListener('click', event => {
  const a = event.target.closest?.('a[href]');
  if (!a) return;
  const raw = a.getAttribute('href');
  if (raw?.startsWith('#')) revealAnchor(raw);
 });
 updateLayout();
 revealAnchor(window.location.hash);
})();
