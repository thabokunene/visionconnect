/*
 * <vc-toast> + Toast service — non-blocking status feedback.
 *
 * Imperative service is the primary API; the element exists for declarative
 * use and for the host to own dismiss wiring. Existing order-form alert()
 * behavior is intentionally untouched (parity).
 *
 * Announcement contract (single channel — no double SR reads):
 *   Visual toast does NOT use role="status"/"alert". Toast.show() announces
 *   once through core/a11y announce() (assertive for errors). The host is a
 *   plain labelled region so virtual-cursor users can still read the text.
 *
 * Service
 *   import { Toast } from './toast.js';
 *   Toast.show({ title?, message, variant?, duration? }) → { dismiss }
 *   Toast.success(message) / .error() / .info()
 *   Toast.dismissAll()
 *
 * Element attributes
 *   open / variant / duration / title / message
 */

import { announce } from '../core/a11y.js';

const HOST_ID = 'vc-toast-host';

function ensureHost() {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.className = 'vc-toast-host';
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(host);
  }
  return host;
}

export class VcToast extends HTMLElement {
  static observedAttributes = ['open', 'variant', 'duration', 'title', 'message'];

  #timer = 0;
  #paused = false;
  #built = false;

  connectedCallback() {
    this.#build();
    this.#sync();
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
  }

  attributeChangedCallback() {
    if (!this.#built) return;
    this.#sync();
  }

  dismiss() {
    this.removeAttribute('open');
  }

  #build() {
    if (this.#built) return;
    this.innerHTML = `
      <div class="vc-toast">
        <div class="vc-toast__body">
          <p class="vc-toast__title" hidden></p>
          <p class="vc-toast__message"></p>
        </div>
        <button type="button" class="vc-toast__close" aria-label="Dismiss notification">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>`;
    this.#built = true;

    this.querySelector('.vc-toast__close').addEventListener('click', () => this.dismiss());

    this.addEventListener('focusin', () => { this.#paused = true; this.#clearTimer(); });
    this.addEventListener('focusout', () => {
      this.#paused = false;
      if (this.hasAttribute('open')) this.#armTimer();
    });
    this.addEventListener('mouseenter', () => { this.#paused = true; this.#clearTimer(); });
    this.addEventListener('mouseleave', () => {
      this.#paused = false;
      if (this.hasAttribute('open')) this.#armTimer();
    });
  }

  #sync() {
    const open = this.hasAttribute('open');
    const variant = this.getAttribute('variant') || 'info';
    const title = this.getAttribute('title') || '';
    const message = this.getAttribute('message') || '';

    this.hidden = !open;
    this.setAttribute('data-variant', variant);

    // Visible feedback only — announcement is Toast.show → announce() once.
    if (open) this.setAttribute('aria-description', `${variant} notification`);
    else this.removeAttribute('aria-description');

    const titleEl = this.querySelector('.vc-toast__title');
    const msgEl = this.querySelector('.vc-toast__message');
    titleEl.textContent = title;
    titleEl.hidden = !title;
    msgEl.textContent = message;

    if (open) this.#armTimer();
    else this.#clearTimer();
  }

  #clearTimer() {
    clearTimeout(this.#timer);
    this.#timer = 0;
  }

  #armTimer() {
    this.#clearTimer();
    if (this.#paused) return;
    const duration = parseInt(this.getAttribute('duration') ?? '5000', 10);
    if (!Number.isFinite(duration) || duration <= 0) return;
    this.#timer = window.setTimeout(() => this.dismiss(), duration);
  }
}

export function registerVcToast() {
  if (!customElements.get('vc-toast')) {
    customElements.define('vc-toast', VcToast);
  }
}

export const Toast = {
  show({ title = '', message = '', variant = 'info', duration = 5000 } = {}) {
    if (!message && !title) return { dismiss() {} };
    registerVcToast();
    const host = ensureHost();
    const el = document.createElement('vc-toast');
    if (title) el.setAttribute('title', title);
    el.setAttribute('message', message);
    el.setAttribute('variant', variant);
    el.setAttribute('duration', String(duration));
    el.setAttribute('open', '');

    const mo = new MutationObserver(() => {
      if (!el.hasAttribute('open')) {
        el.remove();
        mo.disconnect();
      }
    });
    mo.observe(el, { attributes: true, attributeFilter: ['open'] });

    host.appendChild(el);
    // Single SR channel (see header). Polite for most; assertive for errors.
    announce([title, message].filter(Boolean).join('. '), {
      assertive: variant === 'error',
    });
    return { dismiss: () => el.dismiss() };
  },

  dismissAll() {
    document.querySelectorAll('vc-toast[open]').forEach((t) => t.dismiss());
  },

  success(message, opts = {}) {
    return this.show({ ...opts, message, variant: 'success' });
  },
  error(message, opts = {}) {
    return this.show({ ...opts, message, variant: 'error' });
  },
  info(message, opts = {}) {
    return this.show({ ...opts, message, variant: 'info' });
  },
};
