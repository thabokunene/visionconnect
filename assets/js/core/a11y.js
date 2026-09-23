/*
 * Core utility: accessibility helpers shared by UI components.
 * Stateless — no component knowledge, no DOM assumptions beyond the call site.
 */

/** True when the user prefers reduced motion. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Sanitize text for use inside aria-label / live regions. */
export function announceText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Create (or reuse) a single polite live region on <body>.
 * Toasts, counters and async status updates all announce through here so
 * screen readers get one predictable channel instead of N competing ones.
 */
let politeRegion = null;
let assertiveRegion = null;

export function announce(message, { assertive = false } = {}) {
  const text = announceText(message);
  if (!text) return;

  if (assertive) {
    if (!assertiveRegion) {
      assertiveRegion = document.createElement('div');
      assertiveRegion.setAttribute('role', 'alert');
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      Object.assign(assertiveRegion.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
      });
      document.body.appendChild(assertiveRegion);
    }
    assertiveRegion.textContent = '';
    // Force a DOM change so repeated identical messages re-announce.
    requestAnimationFrame(() => { assertiveRegion.textContent = text; });
    return;
  }

  if (!politeRegion) {
    politeRegion = document.createElement('div');
    politeRegion.setAttribute('role', 'status');
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    Object.assign(politeRegion.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      border: 0,
    });
    document.body.appendChild(politeRegion);
  }
  politeRegion.textContent = '';
  requestAnimationFrame(() => { politeRegion.textContent = text; });
}

/** Generate a stable, unique id for aria-* wiring. */
let idSeq = 0;
export function uid(prefix = 'vc') {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}
