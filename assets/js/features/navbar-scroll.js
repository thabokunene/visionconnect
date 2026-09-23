/*
 * Feature: sticky navbar scroll state.
 * Toggles `.scrolled` on #navbar once the page is scrolled past 10px.
 */

export function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}
