/*
 * <vc-field> — accessible form field wrapper (light DOM).
 *
 * On connect, adopts any form controls found as children into a stable
 * structure (label → control → hint → error) and wires aria-describedby /
 * aria-invalid / required. Authors never hand-write those associations.
 *
 * Markup
 *   <vc-field label="Email" hint="We never share this." required>
 *     <input type="email" name="email" placeholder="you@co.za">
 *   </vc-field>
 *
 * Attributes
 *   label        string — visible label text
 *   hint         string — help text
 *   error        string — validation message (reflects invalid state)
 *   required     boolean — marker + aria-required on the control
 *   label-hidden boolean — visually hide label (SR still reads it)
 *
 * Properties
 *   control : HTMLElement | null
 *   value   : string (get/set on first control)
 *   error   : string
 *   valid   : boolean
 *
 * Methods
 *   validate() → boolean   (fires vc:valid | vc:invalid)
 *   focus()
 *
 * Events
 *   vc:valid / vc:invalid (bubbles; invalid detail: { message })
 */

import { uid } from '../core/a11y.js';

export class VcField extends HTMLElement {
  static observedAttributes = ['label', 'hint', 'error', 'required', 'label-hidden'];

  #labelEl = null;
  #hintEl = null;
  #errorEl = null;
  #controlBox = null;
  #ids = { label: '', hint: '', error: '' };
  #childObs = null;

  constructor() {
    super();
    this.#ids.label = uid('lbl');
    this.#ids.hint = uid('hint');
    this.#ids.error = uid('err');
  }

  connectedCallback() {
    this.classList.add('vc-field');
    this.#build();
    this.#adoptChildren();
    this.#sync();
    // Cover late innerHTML / appendChild after connect.
    if (!this.#childObs) {
      this.#childObs = new MutationObserver(() => {
        this.#adoptChildren();
        this.#wireControl();
      });
      this.#childObs.observe(this, { childList: true });
    }
  }

  disconnectedCallback() {
    this.#childObs?.disconnect();
    this.#childObs = null;
  }

  attributeChangedCallback() {
    if (!this.#labelEl) return;
    this.#sync();
  }

  get control() {
    return this.#controlBox?.querySelector(
      'input, select, textarea, [role="radiogroup"], [role="group"]',
    ) ?? null;
  }

  get error() { return this.getAttribute('error') || ''; }
  set error(v) {
    if (v) this.setAttribute('error', v);
    else this.removeAttribute('error');
  }

  get valid() { return !this.hasAttribute('error'); }

  get value() {
    const c = this.control;
    if (!c) return '';
    if ('value' in c) return c.value;
    return '';
  }
  set value(v) {
    const c = this.control;
    if (c && 'value' in c) c.value = v;
  }

  focus() { this.control?.focus?.(); }

  validate() {
    const c = this.control;
    const required = this.hasAttribute('required');
    let message = '';

    if (!c) {
      message = 'This field is missing its control.';
    } else if (required && 'value' in c && !String(c.value || '').trim()) {
      message = 'This field is required.';
    } else if (typeof c.checkValidity === 'function' && !c.checkValidity()) {
      message = c.validationMessage || 'Please check this field.';
    }

    if (message) {
      this.error = message;
      this.dispatchEvent(new CustomEvent('vc:invalid', {
        bubbles: true,
        detail: { message },
      }));
      return false;
    }
    this.error = '';
    this.dispatchEvent(new CustomEvent('vc:valid', { bubbles: true }));
    return true;
  }

  #build() {
    if (this.#labelEl) return;

    this.#labelEl = document.createElement('label');
    this.#labelEl.className = 'vc-field__label';
    this.#labelEl.htmlFor = this.#ids.label;

    this.#controlBox = document.createElement('div');
    this.#controlBox.className = 'vc-field__control';

    this.#hintEl = document.createElement('p');
    this.#hintEl.className = 'vc-field__hint';
    this.#hintEl.id = this.#ids.hint;

    this.#errorEl = document.createElement('p');
    this.#errorEl.className = 'vc-field__error';
    this.#errorEl.id = this.#ids.error;
    this.#errorEl.hidden = true;

    this.append(this.#labelEl, this.#controlBox, this.#hintEl, this.#errorEl);
  }

  /** Move light-DOM children (the actual controls) into the control box. */
  #adoptChildren() {
    if (!this.#controlBox) return;
    const chrome = new Set([this.#labelEl, this.#controlBox, this.#hintEl, this.#errorEl]);
    const strays = [...this.childNodes].filter((n) => !chrome.has(n));
    strays.forEach((n) => this.#controlBox.appendChild(n));
  }

  #sync() {
    const label = this.getAttribute('label') ?? '';
    const hint = this.getAttribute('hint') ?? '';
    const error = this.getAttribute('error') ?? '';
    const required = this.hasAttribute('required');
    const labelHidden = this.hasAttribute('label-hidden');

    this.#labelEl.replaceChildren();
    this.#labelEl.append(document.createTextNode(label));
    if (required) {
      const req = document.createElement('span');
      req.className = 'vc-field__req';
      req.setAttribute('aria-hidden', 'true');
      req.textContent = '*';
      this.#labelEl.append(req);
    }
    this.#labelEl.hidden = !label;
    this.#labelEl.classList.toggle('vc-field__label--hidden', labelHidden);

    this.#hintEl.textContent = hint;
    this.#hintEl.hidden = !hint;

    this.#errorEl.textContent = error;
    this.#errorEl.hidden = !error;

    this.classList.toggle('is-invalid', !!error);
    this.classList.toggle('is-required', required);

    this.#wireControl();
  }

  #wireControl() {
    const c = this.control;
    if (!c) return;

    if (!c.id) c.id = this.#ids.label;
    this.#labelEl.htmlFor = c.id;

    const described = [];
    if (!this.#hintEl.hidden) described.push(this.#ids.hint);
    if (!this.#errorEl.hidden) described.push(this.#ids.error);

    const existing = (c.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== this.#ids.hint && id !== this.#ids.error);
    const next = [...existing, ...described];
    if (next.length) c.setAttribute('aria-describedby', next.join(' '));
    else c.removeAttribute('aria-describedby');

    if (this.hasAttribute('error')) c.setAttribute('aria-invalid', 'true');
    else c.removeAttribute('aria-invalid');

    if (this.hasAttribute('required')) {
      c.setAttribute('required', '');
      c.setAttribute('aria-required', 'true');
    }

    if (!c.dataset.vcFieldWired) {
      c.dataset.vcFieldWired = '1';
      const clear = () => { if (this.hasAttribute('error')) this.error = ''; };
      c.addEventListener('input', clear);
      c.addEventListener('change', clear);
    }
  }
}

export function registerVcField() {
  if (!customElements.get('vc-field')) {
    customElements.define('vc-field', VcField);
  }
}
