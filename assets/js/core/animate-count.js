/*
 * Core utility: eased count-up animation for metric counters.
 * Pure display concern — no DOM queries, no observer logic.
 * Behavior preserved exactly from the original production script.
 */

export function animateCount(el, target, useComma, suffix = '') {
  let current = 0;
  const duration = 600;
  const start = performance.now();
  const isFloat = !Number.isInteger(target);

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    current = target * eased;

    if (isFloat) {
      el.textContent = current.toFixed(1) + suffix;
    } else {
      const val = Math.floor(current);
      el.textContent = useComma ? val.toLocaleString() : val + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (isFloat) {
        el.textContent = target.toFixed(1) + suffix;
      } else {
        el.textContent = useComma ? target.toLocaleString() : target + suffix;
      }
    }
  }
  requestAnimationFrame(update);
}
