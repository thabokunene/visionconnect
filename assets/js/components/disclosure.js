/*
 * <vc-disclosure> — accessible expand/collapse (accordion item).
 *
 * Follows the WAI-ARIA accordion pattern: a real <button> header with
 * aria-expanded + aria-controls pointing at a labelled panel. Multiple
 * disclosures can be grouped; this component itself is a single item.
 *
 * Attributes
 *   open     boolean — expanded state (reflected)
 *   summary  string — header label (falls back to slotted summary content)
 *
 * Slots
 *   summary — optional custom header content (overrides `summary` attr)
 *   default — panel body
 *
 * Properties
 *   open : boolean
 *
 * Methods
 *   toggle() / open() / close()
 *
 * Events
 *   vc:open  — just expanded
 *   vc:close — just collapsed
 */

import { uid } from '../core/a11y.js';

export class VcDisclosure extends HTMLElement {
  static observedAttributes = ['open', 'summary'];

  #btn = null;
  #panel = null;
  #summarySlot = null;
  #bodySlot = null;
  #ids = { btn: '', panel: '' };

  constructor() {
    super();
    this.#ids.btn = uid('vc-disc-btn');
    this.#ids.panel = uid('vc-disc-panel');
  }

  connectedCallback() {
    if (!this.#btn) this.#build();
    this.#sync();
  }

  attributeChangedCallback() {
    if (!this.#btn) return;
    this.#sync();
  }

  get open() { return this.hasAttribute('open'); }
  set open(v) { this.toggleAttribute('open', !!v); }

  toggle(force) {
    const next = typeof force === 'boolean' ? force : !this.open;
    if (next === this.open) return;
    this.open = next;
    this.dispatchEvent(new CustomEvent(next ? 'vc:open' : 'vc:close', { bubbles: true }));
  }

  #build() {
    this.classList.add('vc-disclosure');

    const header = document.createElement('div');
    header.className = 'vc-disclosure__header';

    this.#btn = document.createElement('button');
    this.#btn.type = 'button';
    this.#btn.className = 'vc-disclosure__trigger';
    this.#btn.id = this.#ids.btn;
    this.#btn.setAttribute('aria-expanded', 'false');
    this.#btn.setAttribute('aria-controls', this.#ids.panel);

    this.#summarySlot = document.createElement('span');
    this.#summarySlot.className = 'vc-disclosure__summary';

    const chevron = document.createElement('span');
    chevron.className = 'material-symbols-outlined vc-disclosure__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = 'expand_more';

    this.#btn.append(this.#summarySlot, chevron);

    this.#panel = document.createElement('div');
    this.#panel.className = 'vc-disclosure__panel';
    this.#panel.id = this.#ids.panel;
    this.#panel.setAttribute('role', 'region');
    this.#panel.setAttribute('aria-labelledby', this.#ids.btn);
    this.#panel.hidden = true;

    this.#bodySlot = document.createElement('slot');

    header.append(this.#btn);
    this.#panel.append(this.#bodySlot);
    this.append(header, this.#panel);

    this.#btn.addEventListener('click', () => this.toggle());
  }

  #sync() {
    const open = this.hasAttribute('open');
    const summary = this.getAttribute('summary') ?? '';

    // Only overwrite the summary span when the consumer uses the attribute
    // (slotted rich content in the light DOM default path is the panel body).
    if (summary) this.#summarySlot.textContent = summary;

    this.#btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    this.#panel.hidden = !open;
    this.classList.toggle('is-open', open);
  }
}

export function registerVcDisclosure() {
  if (!customElements.get('vc-disclosure')) {
    customElements.define('vc-disclosure', VcDisclosure);
  }
}
