document.addEventListener('DOMContentLoaded', function () {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (button && nav) {
    button.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  }

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
