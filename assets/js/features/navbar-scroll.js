/*
 * Feature: sticky navbar scroll state.
 * Toggles `.scrolled` on #navbar once the page scrolls past 10px.
 * (v3: guarded so pages without a navbar are safe — shared script.)
 *
 * Perf: passive listener + state short-circuit so the common scroll frames
 * (already in the same scrolled/not-scrolled state) touch nothing.
 * Initial-load check intentionally omitted — matches production behavior.
 */

export function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let scrolled = false;
    window.addEventListener('scroll', () => {
      const next = window.scrollY > 10;
      if (next === scrolled) return;
      scrolled = next;
      navbar.classList.toggle('scrolled', next);
    }, { passive: true });
  }
}
