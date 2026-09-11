// The shared menu needs to close when a link targets a section of this page.
(() => {
  const nav = document.querySelector('.site-header .nav');
  const button = document.querySelector('.site-header .menu-toggle');
  if (!nav || !button) return;

  const closeMenu = () => {
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  };
  nav.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('a[href]')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      button.focus();
    }
  });
})();
