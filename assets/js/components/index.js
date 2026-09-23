/*
 * UI component registry — barrel + idempotent registration.
 *
 * Importing this module is enough to upgrade every <vc-*> tag in the document
 * (and any inserted later, since custom elements upgrade on connect).
 *
 * Pages opt in with:
 *   <script type="module" src="assets/js/ui.js"></script>
 *
 * Landing/parity pages keep loading only main.js — zero behavior change.
 */

import { registerVcButton, VcButton } from './button.js';
import { registerVcCounter, VcCounter } from './counter.js';
import { registerVcField, VcField } from './field.js';
import { registerVcToast, VcToast, Toast } from './toast.js';
import { registerVcDisclosure, VcDisclosure } from './disclosure.js';
import { registerVcSkeleton, VcSkeleton } from './skeleton.js';
import { registerVcEmpty, VcEmpty } from './empty-state.js';
import { registerVcBadge, VcBadge } from './badge.js';

const REGISTRARS = [
  registerVcButton,
  registerVcCounter,
  registerVcField,
  registerVcToast,
  registerVcDisclosure,
  registerVcSkeleton,
  registerVcEmpty,
  registerVcBadge,
];

/** Register every VisionConnect UI component (idempotent). */
export function registerComponents() {
  REGISTRARS.forEach((fn) => fn());
}

registerComponents();

export {
  VcButton,
  VcCounter,
  VcField,
  VcToast,
  VcDisclosure,
  VcSkeleton,
  VcEmpty,
  VcBadge,
  Toast,
};
