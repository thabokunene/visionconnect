/*
 * Feature: metric counters (landing proof + about page numbers).
 * Observes `.proof-number, .about-number-value` (50% visibility) and
 * animates each value once when it scrolls into view.
 * (v3: about-number-value joined the selector; 't' suffix branch added.
 *  Note: '8,000t' hits the comma branch first and loses the 't' —
 *  preserved exactly as production.)
 */

import { animateCount } from '../core/animate-count.js';

export function initProofCounters() {
  const proofNumbers = document.querySelectorAll('.proof-number, .about-number-value');
  const observerOptions = { threshold: 0.5 };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();
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
        counterObserver.unobserve(el);
      }
    });
  }, observerOptions);

  proofNumbers.forEach(el => counterObserver.observe(el));
}
