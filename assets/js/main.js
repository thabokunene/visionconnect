/*
 * VisionConnect — JS composition root.
 *
 * Module scripts execute after document parsing (same timing window as the
 * original end-of-body inline script): all target elements exist, listeners
 * attach before DOMContentLoaded. Init order matches the original script.
 */
import { initNavbarScroll } from './features/navbar-scroll.js';
import { initProofCounters } from './features/proof-counters.js';
import { initQuoteForm } from './features/quote-form.js';

initNavbarScroll();
initProofCounters();
initQuoteForm();
