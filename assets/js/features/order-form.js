/*
 * Feature: order (quote) form.
 * Radio-pill visual state, required-field validation feedback, and
 * submit acknowledgement for the multi-step order form (#quote).
 * Logic preserved exactly from the production script.
 * (v3: radio clear scoped to the same input[name] group; submit
 *  listener guarded so pages without #quote are safe — shared script.)
 */

/** Clear `.checked` on every radio pill in the same named group. */
function clearGroupChecked(group) {
  document.querySelectorAll('input[name="' + group + '"]').forEach(i => {
    const l = i.closest('.radio-option');
    if (l) l.classList.remove('checked');
  });
}

function initRadioPills() {
  // Radio option visual state
  document.querySelectorAll('.radio-option').forEach(label => {
    const input = label.querySelector('input');
    if (input) {
      input.addEventListener('change', () => {
        const group = input.getAttribute('name');
        clearGroupChecked(group);
        if (input.checked) label.classList.add('checked');
      });
    }
  });
}

function initSubmitHandler() {
  // Form submit (v3: guarded — landing and contact only)
  const quoteForm = document.getElementById('quote');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation feedback
      // (Exact assignment lines are parity markers — do not rewrite to consts.)
      const required = e.target.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--signal-red)';
          valid = false;
        } else {
          field.style.borderColor = 'var(--light-grey)';
        }
      });

      // Check radio group
      const loadTypeChecked = document.querySelector('input[name="loadType"]:checked');
      if (!loadTypeChecked) valid = false;

      if (!valid) {
        alert('Please complete all required fields marked with *');
        return;
      }

      alert('Request received. Our team will respond within 24 hours with a route plan, permit strategy, and firm quote.');
      e.target.reset();
      document.querySelectorAll('.radio-option').forEach(l => l.classList.remove('checked'));
    });
  }
}

export function initOrderForm() {
  initRadioPills();
  initSubmitHandler();
}
