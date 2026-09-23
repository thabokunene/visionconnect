/*
 * <vc-button> — production CTA control.
 *
 * Renders a real <button> (or <a> when `href` is set) in light DOM so the
 * shared design-token stylesheet applies. Handles loading/disabled states,
 * optional leading/trailing icon slots, and keyboard activation natively.
 *
 * Attributes
 *   variant  primary | secondary | light     (default: primary)
 *   size     md | sm                         (default: md)
 *   loading  boolean — disables activation, shows spinner, aria-busy
 *   disabled boolean
 *   type     button | submit | reset         (default: button; ignored for href)
 *   href     string — upgrades the control to a link (navigates like an <a>)
 *   icon     string — Material Symbols name for the trailing icon
 *   icon-start string — Material Symbols name for the leading icon
 *   block    boolean — full-width control
 *
 * Events
 *   click — native; not re-dispatched. Spinner/aria state updates first.
 *
 * Properties
 *   loading : boolean  (reflected)
 *   variant : string   (reflected)
 */

import { uid } from '../core/a11y.js';

const SPINNER_HTML = `
  <span class="vc-button__spinner" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"
              stroke-width="3" stroke-linecap="round" stroke-dasharray="42 60"/>
    </svg>
  </span>`;

export class VcButton extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'loading', 'disabled', 'href', 'block'];

  #control = null;
  #label = null;
  #busyId = null;

  constructor() {
    super();
    this.#busyId = uid('vc-btn');
  }

  connectedCallback() {
    if (!this.#control) this.#render();
    this.#sync();
  }

  attributeChangedCallback() {
    if (!this.#control) return;
    // href can swap the underlying element type — re-render when it changes.
    const wantsLink = this.hasAttribute('href');
    const isLink = this.#control?.tagName === 'A';
    if (wantsLink !== isLink) {
      this.#render();
    }
    this.#sync();
  }

  /** Programmatic activation that respects loading/disabled. */
  click() {
    if (this.loading || this.disabled || this.hasAttribute('disabled')) return;
    this.#control?.click();
  }

  get loading() { return this.hasAttribute('loading'); }
  set loading(v) { this.toggleAttribute('loading', !!v); }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(v) { this.toggleAttribute('disabled', !!v); }

  get variant() { return this.getAttribute('variant') || 'primary'; }
  set variant(v) { this.setAttribute('variant', v); }

  #render() {
    const href = this.getAttribute('href');
    const type = this.getAttribute('type') || 'button';
    const el = document.createElement(href ? 'a' : 'button');
    el.className = 'vc-button';
    el.id = this.#busyId;

    if (href) {
      el.setAttribute('href', href);
      if (/^https?:/i.test(href) || href.startsWith('//')) {
        el.setAttribute('rel', this.getAttribute('rel') || 'noopener noreferrer');
      }
    } else {
      el.setAttribute('type', type);
    }

    // Preserve consumer slot content (text + icons written between tags).
    this.childNodes.forEach((n) => el.appendChild(n.cloneNode(true)));
    this.replaceChildren(el);
    this.#control = el;
    this.#label = el;
  }

  #sync() {
    const el = this.#control;
    if (!el) return;

    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'md';
    const loading = this.hasAttribute('loading');
    const disabled = this.hasAttribute('disabled');
    const block = this.hasAttribute('block');
    const icon = this.getAttribute('icon');
    const iconStart = this.getAttribute('icon-start');

    el.classList.toggle('vc-button', true);
    el.classList.toggle('vc-button--primary', variant === 'primary');
    el.classList.toggle('vc-button--secondary', variant === 'secondary');
    el.classList.toggle('vc-button--light', variant === 'light');
    el.classList.toggle('vc-button--sm', size === 'sm');
    el.classList.toggle('vc-button--block', block);
    el.classList.toggle('is-loading', loading);

    if (loading || disabled) {
      el.setAttribute('disabled', '');
      el.setAttribute('aria-disabled', 'true');
    } else {
      el.removeAttribute('disabled');
      el.removeAttribute('aria-disabled');
    }

    if (loading) {
      el.setAttribute('aria-busy', 'true');
    } else {
      el.removeAttribute('aria-busy');
    }

    // Spinner (idempotent)
    let spinner = el.querySelector(':scope > .vc-button__spinner');
    if (loading && !spinner) {
      el.insertAdjacentHTML('afterbegin', SPINNER_HTML);
      spinner = el.querySelector(':scope > .vc-button__spinner');
    } else if (!loading && spinner) {
      spinner.remove();
    }

    // Trailing / leading icons from attributes (only if not already in light DOM)
    this.#ensureIcon(el, 'end', icon);
    this.#ensureIcon(el, 'start', iconStart);
  }

  #ensureIcon(host, position, name) {
    const key = `icon-${position}`;
    const existing = host.querySelector(`:scope > [data-vc-icon="${key}"]`);
    if (!name) {
      existing?.remove();
      return;
    }
    if (existing) {
      existing.textContent = name;
      return;
    }
    const span = document.createElement('span');
    span.className = 'material-symbols-outlined vc-button__icon';
    span.setAttribute('data-vc-icon', key);
    span.setAttribute('aria-hidden', 'true');
    span.textContent = name;
    if (position === 'start') host.prepend(span);
    else host.append(span);
  }
}

export function registerVcButton() {
  if (!customElements.get('vc-button')) {
    customElements.define('vc-button', VcButton);
  }
}
