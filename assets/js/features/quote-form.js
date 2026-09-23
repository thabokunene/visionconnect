/*
 * Feature: quote form submission.
 * Prevents native submit and acknowledges the request.
 */

export function initQuoteForm() {
  document.querySelector('.quote-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Request received. We will respond within 24 hours.');
  });
}
