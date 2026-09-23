/*
 * <vc-badge> — compact status/label chip.
 *
 * Non-interactive by default (role="text" via aria-label on the host when
 * meaningful). Use for compliance statuses, corridor counts, ADR classes —
 * anywhere a short token needs semantic colour without stealing focus.
 *
 * Attributes
 *   variant  neutral | success | danger | warning | info   (default: neutral)
 *   size     md | sm                                       (default: md)
 *   dot      boolean — leading status dot
 *
 * Text content is the light-DOM children (or `label` attribute).
 */

export class VcBadge extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'dot', 'label'];

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#sync();
  }

  #sync() {
    const variant = this.getAttribute('variant') || 'neutral';
    const size = this.getAttribute('size') || 'md';
    const dot = this.hasAttribute('dot');

    this.classList.add('vc-badge');
    this.classList.toggle('vc-badge--neutral', variant === 'neutral');
    this.classList.toggle('vc-badge--success', variant === 'success');
    this.classList.toggle('vc-badge--danger', variant === 'danger');
    this.classList.toggle('vc-badge--warning', variant === 'warning');
    this.classList.toggle('vc-badge--info', variant === 'info');
    this.classList.toggle('vc-badge--sm', size === 'sm');
    this.classList.toggle('vc-badge--dot', dot);

    const label = this.getAttribute('label');
    if (label != null && this.textContent.trim() !== label) {
      this.textContent = label;
    }

    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
  }
}

export function registerVcBadge() {
  if (!customElements.get('vc-badge')) {
    customElements.define('vc-badge', VcBadge);
  }
}
