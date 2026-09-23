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
 * Visually-hidden live-region styling shared by polite + assertive channels.
 * One definition — no duplicated Object.assign blocks.
 */
const LIVE_REGION_STYLE = Object.freeze({
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

function createLiveRegion({ role, live }) {
  const region = document.createElement('div');
  region.setAttribute('role', role);
  region.setAttribute('aria-live', live);
  region.setAttribute('aria-atomic', 'true');
  Object.assign(region.style, LIVE_REGION_STYLE);
  document.body.appendChild(region);
  return region;
}

/**
 * Single polite / assertive announcement channel for the whole app.
 * Toasts, async status updates and future services announce through here so
 * screen readers get one predictable channel instead of N competing ones.
 *
 * Callers must not ALSO put role="status"/"alert" on visible UI that repeats
 * the same message — that double-announces.
 */
let politeRegion = null;
let assertiveRegion = null;

export function announce(message, { assertive = false } = {}) {
  const text = announceText(message);
  if (!text) return;

  if (assertive) {
    if (!assertiveRegion || !assertiveRegion.isConnected) {
      assertiveRegion = createLiveRegion({ role: 'alert', live: 'assertive' });
    }
    assertiveRegion.textContent = '';
    // Force a DOM change so repeated identical messages re-announce.
    requestAnimationFrame(() => { assertiveRegion.textContent = text; });
    return;
  }

  if (!politeRegion || !politeRegion.isConnected) {
    politeRegion = createLiveRegion({ role: 'status', live: 'polite' });
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
