/*
 * <vc-counter> — animated metric that respects reduced-motion and a11y.
 *
 * Starts once when the element enters the viewport (IntersectionObserver),
 * renders the final value immediately for reduced-motion users, and exposes
 * the final value to assistive tech for the whole animation (no rapid-fire
 * live announcements of intermediate frames).
 *
 * Attributes
 *   value      number (required) — final value
 *   duration   ms (default 600) — matches production animateCount
 *   format     plain | grouped | percent   (default: auto-detect)
 *   suffix     string appended after the number (e.g. t, +)
 *   prefix     string prepended (e.g. R )
 *   decimals   integer (default 0)
 *   start      boolean — animate immediately instead of waiting for viewport
 *
 * Properties
 *   value : number
 *
 * Events
 *   vc:done — fired once when the animation completes (or immediately for
 *             reduced-motion / already-visible final state)
 */

import { prefersReducedMotion, uid } from '../core/a11y.js';

const EASE = (t) => 1 - Math.pow(1 - t, 3); // matches production cubic ease-out

export class VcCounter extends HTMLElement {
  static observedAttributes = ['value', 'duration', 'format', 'suffix', 'prefix', 'decimals'];

  #output = null;
  #observer = null;
  #raf = 0;
  #started = false;
  #done = false;

  constructor() {
    super();
    this.#output = document.createElement('span');
    this.#output.className = 'vc-counter';
  }

  connectedCallback() {
    if (!this.#output.isConnected) {
      this.replaceChildren(this.#output);
    }
    // Neutralise inner text for SR until we own the accessible value.
    this.#output.setAttribute('aria-hidden', 'true');
    this.setAttribute('role', 'text');
    const label = this.getAttribute('aria-label');
    const id = this.id || uid('vc-counter');
    if (!this.id) this.id = id;
    if (!label) {
      this.setAttribute('aria-label', this.#format(this.#target()));
    }

    this.#renderStatic(this.#target());
    if (this.hasAttribute('start')) {
      this.#start();
    } else {
      this.#observe();
    }
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
    cancelAnimationFrame(this.#raf);
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.#started = false;
    this.#done = false;
    cancelAnimationFrame(this.#raf);
    this.#renderStatic(this.#target());
    if (this.hasAttribute('start')) this.#start();
    else if (!this.#observer) this.#observe();
    const label = this.getAttribute('aria-label');
    if (label != null) this.setAttribute('aria-label', this.#format(this.#target()));
  }

  get value() { return this.#target(); }
  set value(n) { this.setAttribute('value', String(n)); }

  #target() {
    const raw = parseFloat(this.getAttribute('value') ?? '0');
    return Number.isFinite(raw) ? raw : 0;
  }

  #decimals() {
    const d = parseInt(this.getAttribute('decimals') ?? '', 10);
    if (Number.isFinite(d)) return d;
    const t = this.#target();
    return Number.isInteger(t) ? 0 : 1;
  }

  #format(n) {
    const prefix = this.getAttribute('prefix') ?? '';
    const suffix = this.getAttribute('suffix') ?? '';
    const format = this.getAttribute('format');
    const decimals = this.#decimals();

    let body;
    if (format === 'percent') {
      body = `${n.toFixed(decimals)}%`;
    } else if (format === 'grouped' || (format == null && Math.abs(n) >= 1000)) {
      body = n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } else {
      body = n.toFixed(decimals);
      if (decimals === 0) body = String(Math.round(n));
    }
    return `${prefix}${body}${suffix}`;
  }

  #renderStatic(n) {
    this.#output.textContent = this.#format(n);
  }

  #observe() {
    if (typeof IntersectionObserver === 'undefined') {
      this.#start();
      return;
    }
    this.#observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.#observer.disconnect();
          this.#observer = null;
          this.#start();
        }
      },
      { threshold: 0.4 },
    );
    this.#observer.observe(this);
  }

  #start() {
    if (this.#started) return;
    this.#started = true;

    const target = this.#target();
    const duration = Math.max(0, parseInt(this.getAttribute('duration') ?? '600', 10) || 600);

    // Reduced motion or zero-length: jump to final value.
    if (prefersReducedMotion() || duration === 0 || target === 0) {
      this.#renderStatic(target);
      this.#finish();
      return;
    }

    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const current = target * EASE(p);
      this.#renderStatic(p < 1 ? current : target);
      if (p < 1) {
        this.#raf = requestAnimationFrame(tick);
      } else {
        this.#finish();
      }
    };
    this.#raf = requestAnimationFrame(tick);
  }

  #finish() {
    if (this.#done) return;
    this.#done = true;
    this.dispatchEvent(new CustomEvent('vc:done', { bubbles: true }));
  }
}

export function registerVcCounter() {
  if (!customElements.get('vc-counter')) {
    customElements.define('vc-counter', VcCounter);
  }
}
