/*
 * <vc-skeleton> — loading placeholder.
 *
 * Pure presentational. Respects prefers-reduced-motion (pulse disabled via
 * CSS). For text blocks, `lines` renders a multi-line paragraph skeleton
 * with a shorter final line (natural ragged edge).
 *
 * Attributes
 *   width   CSS length (default: 100%)
 *   height  CSS length (default: 1em for text, 160px for block/media)
 *   radius  CSS length (default: 4px)
 *   lines   integer > 1 → paragraph skeleton with N lines
 *   media   boolean → block/media placeholder (square-ish)
 *   circle  boolean → avatar/radio placeholder
 *
 * Accessibility: aria-hidden by default (decorative). If the host carries
 * aria-label / role, those pass through on the custom element itself —
 * authors should pair skeletons with a visible "Loading…" status elsewhere.
 */

export class VcSkeleton extends HTMLElement {
  static observedAttributes = ['width', 'height', 'radius', 'lines', 'media', 'circle'];

  connectedCallback() {
    this.#render();
    this.#sync();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#sync();
  }

  #render() {
    if (this.querySelector('.vc-skeleton')) return;
    const box = document.createElement('span');
    box.className = 'vc-skeleton';
    box.setAttribute('aria-hidden', 'true');
    this.replaceChildren(box);
  }

  #sync() {
    const box = this.querySelector('.vc-skeleton');
    if (!box) return;

    const lines = Math.max(1, parseInt(this.getAttribute('lines') ?? '1', 10) || 1);
    const media = this.hasAttribute('media');
    const circle = this.hasAttribute('circle');

    this.classList.toggle('vc-skeleton-host--media', media || circle);
    this.classList.toggle('vc-skeleton-host--circle', circle);
    box.classList.toggle('vc-skeleton--media', media);
    box.classList.toggle('vc-skeleton--circle', circle);
    box.classList.toggle('vc-skeleton--text', lines > 1 && !media && !circle);

    if (lines > 1 && !media && !circle) {
      box.replaceChildren();
      for (let i = 0; i < lines; i += 1) {
        const line = document.createElement('span');
        line.className = 'vc-skeleton__line';
        if (i === lines - 1) line.classList.add('vc-skeleton__line--last');
        box.appendChild(line);
      }
    } else if (!box.querySelector('.vc-skeleton__shine')) {
      box.replaceChildren();
      const shine = document.createElement('span');
      shine.className = 'vc-skeleton__shine';
      box.appendChild(shine);
    }

    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    const radius = this.getAttribute('radius');
    box.style.width = width || (lines > 1 && !media && !circle ? '100%' : undefined);
    if (circle) {
      box.style.height = height || width || '48px';
      box.style.width = width || height || '48px';
    } else if (height) {
      box.style.height = height;
    } else if (media) {
      box.style.height = '160px';
    }
    if (radius != null && radius !== '') box.style.borderRadius = radius;
  }
}

export function registerVcSkeleton() {
  if (!customElements.get('vc-skeleton')) {
    customElements.define('vc-skeleton', VcSkeleton);
  }
}
