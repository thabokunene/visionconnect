/*
 * <vc-empty> — empty / zero-data state.
 *
 * Used when a list, table, or feed has nothing to show (first run, filtered
 * out, or failed-closed). Always give the user a next action when one exists.
 *
 * Attributes
 *   title       string (required for a11y) — heading
 *   description string — supporting copy
 *   tone        neutral | inline   (default: neutral; inline = compact)
 *   icon        Material Symbols name (default: inbox)
 *
 * Slots
 *   action  — primary call-to-action (button/link) below the copy
 *   visual  — replace the default icon (illustration, empty chart, …)
 *
 * Events
 *   none (content is static; actions inside `action` slot behave natively)
 */

import { uid } from '../core/a11y.js';

export class VcEmpty extends HTMLElement {
  static observedAttributes = ['title', 'description', 'tone', 'icon'];

  #ids = { title: '' };

  constructor() {
    super();
    this.#ids.title = uid('vc-empty');
  }

  connectedCallback() {
    if (!this.querySelector('.vc-empty')) this.#build();
    this.#sync();
  }

  attributeChangedCallback() {
    if (!this.querySelector('.vc-empty')) return;
    this.#sync();
  }

  #build() {
    this.classList.add('vc-empty-host');

    const box = document.createElement('div');
    box.className = 'vc-empty';

    const visual = document.createElement('div');
    visual.className = 'vc-empty__visual';

    const defaultIcon = document.createElement('span');
    defaultIcon.className = 'material-symbols-outlined vc-empty__icon';
    defaultIcon.setAttribute('aria-hidden', 'true');
    defaultIcon.dataset.defaultIcon = '1';
    visual.appendChild(defaultIcon);

    const visualSlot = document.createElement('slot');
    visualSlot.name = 'visual';
    visual.appendChild(visualSlot);

    const copy = document.createElement('div');
    copy.className = 'vc-empty__copy';

    const title = document.createElement('h3');
    title.className = 'vc-empty__title';
    title.id = this.#ids.title;

    const desc = document.createElement('p');
    desc.className = 'vc-empty__description';

    const actionWrap = document.createElement('div');
    actionWrap.className = 'vc-empty__action';
    const actionSlot = document.createElement('slot');
    actionSlot.name = 'action';
    actionWrap.appendChild(actionSlot);

    copy.append(title, desc, actionWrap);
    box.append(visual, copy);
    this.append(box);

    this.setAttribute('role', 'status');
  }

  #sync() {
    const title = this.getAttribute('title') ?? '';
    const description = this.getAttribute('description') ?? '';
    const tone = this.getAttribute('tone') || 'neutral';
    const icon = this.getAttribute('icon') || 'inbox';

    const titleEl = this.querySelector('.vc-empty__title');
    const descEl = this.querySelector('.vc-empty__description');
    const iconEl = this.querySelector('[data-default-icon]');

    titleEl.textContent = title;
    titleEl.hidden = !title;
    descEl.textContent = description;
    descEl.hidden = !description;
    if (iconEl) iconEl.textContent = icon;

    // Accessible name falls back to title + description.
    const label = [title, description].filter(Boolean).join('. ');
    if (label) this.setAttribute('aria-label', label);

    this.classList.toggle('vc-empty-host--inline', tone === 'inline');
    this.classList.toggle('vc-empty-host--neutral', tone !== 'inline');
  }
}

export function registerVcEmpty() {
  if (!customElements.get('vc-empty')) {
    customElements.define('vc-empty', VcEmpty);
  }
}
