/*
 * Feature: metric counters (landing proof + about page numbers).
 * Observes `.proof-number, .about-number-value` (50% visibility) and
 * animates each value once when it scrolls into view.
 * (v3: about-number-value joined the selector; 't' suffix branch added.
 *  Note: '8,000t' hits the comma branch first and loses the 't' —
 *  preserved exactly as production.)
 *
 * Perf: one shared IntersectionObserver; each target unobserves after its
 * first hit; the observer disconnects entirely once every target has run
 * (no idle observer left behind on long sessions / SPAs that reuse the page).
 */

import { animateCount } from '../core/animate-count.js';

export function initProofCounters() {
  const proofNumbers = document.querySelectorAll('.proof-number, .about-number-value');
  if (!proofNumbers.length) return;

  let pending = proofNumbers.length;
  const observerOptions = { threshold: 0.5 };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();
        counterObserver.unobserve(el);
        pending -= 1;
        if (pending <= 0) counterObserver.disconnect();

        if (text === '0') return;
        if (text.includes(',')) {
          const target = parseInt(text.replace(/,/g, ''));
          animateCount(el, target, true);
        } else if (text.includes('%')) {
          const target = parseFloat(text);
          animateCount(el, target, false, '%');
        } else if (text.includes('t')) {
          const target = parseInt(text);
          animateCount(el, target, false, 't');
        }
      }
    });
  }, observerOptions);

  proofNumbers.forEach(el => counterObserver.observe(el));
}
