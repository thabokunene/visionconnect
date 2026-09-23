/*
 * Feature: proof metric counters.
 * Observes `.proof-number` elements (50% visibility) and animates each
 * value once when it scrolls into view.
 * (Production source labels this block: "Proof number counter animation".)
 */

import { animateCount } from '../core/animate-count.js';

export function initProofCounters() {
  const proofNumbers = document.querySelectorAll('.proof-number');
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
        }
        counterObserver.unobserve(el);
      }
    });
  }, observerOptions);

  proofNumbers.forEach(el => counterObserver.observe(el));
}
