/*
 * Feature: sticky navbar scroll state.
 * Toggles `.scrolled` on #navbar once the page scrolls past 10px.
 * (v3: guarded so pages without a navbar are safe — shared script.)
 */

export function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}
