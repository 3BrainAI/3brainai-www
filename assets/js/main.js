document.addEventListener('DOMContentLoaded', function () {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const evidenceHighlightTimers = new WeakMap();

  if (button && nav) {
    button.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-evidence-pack-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const fallbackTarget = document.querySelector(trigger.getAttribute('href'));
      const showcase = document.querySelector('#evidence-pack-sample');
      if (!fallbackTarget || !showcase) return;

      event.preventDefault();

      const activePanel = showcase.querySelector('.evidence-case-panel:not([hidden])');
      const activePack = activePanel?.querySelector('.evidence-pack-sample');
      const activeInput = activePanel?.querySelector('.evidence-input-band');
      const destination = trigger.dataset.evidencePackDestination;
      const scrollTarget = destination === 'input' && activeInput ? activeInput : fallbackTarget;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollTarget.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      const nextHash = scrollTarget.id ? `#${scrollTarget.id}` : '#evidence-pack-sample';
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, '', nextHash);
      }

      if (!activePanel || !activePack) return;

      const emphasisTarget = destination === 'input' && activeInput ? activeInput : activePack;
      const focusTarget = destination === 'input' && activeInput ? activeInput : activePanel;
      const previousTimer = evidenceHighlightTimers.get(emphasisTarget);
      if (previousTimer) window.clearTimeout(previousTimer);

      emphasisTarget.classList.remove('is-emphasized');
      window.requestAnimationFrame(function () {
        emphasisTarget.classList.add('is-emphasized');
        focusTarget.focus({ preventScroll: true });
      });

      const timer = window.setTimeout(function () {
        emphasisTarget.classList.remove('is-emphasized');
        evidenceHighlightTimers.delete(emphasisTarget);
      }, 1600);
      evidenceHighlightTimers.set(emphasisTarget, timer);
    });
  });

  document.querySelectorAll('.evidence-pack-showcase').forEach(function (showcase) {
    const tabs = Array.from(showcase.querySelectorAll('[data-case-target]'));
    const panels = Array.from(showcase.querySelectorAll('.evidence-case-panel'));

    if (tabs.length === 0 || panels.length === 0) return;

    function activateTab(tab, moveFocus) {
      const targetId = tab.getAttribute('data-case-target');

      tabs.forEach(function (item) {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.setAttribute('tabindex', selected ? '0' : '-1');
      });

      panels.forEach(function (panel) {
        panel.hidden = panel.id !== targetId;
      });

      if (moveFocus) {
        tab.focus();
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activateTab(tab, false);
      });

      tab.addEventListener('keydown', function (event) {
        let nextIndex = index;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      });
    });
  });
});
