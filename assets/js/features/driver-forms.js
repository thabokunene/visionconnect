/*
 * Feature: driver application + temporary-driver hire forms (#driverApp, #hireApp).
 * Same pattern as the order form: client-side required checks, alert()
 * acknowledgement, guarded so pages without the forms are safe.
 * No network transport yet — matches the production quote-form behavior.
 */

const BORDER_INVALID = 'var(--signal-red)';
const BORDER_DEFAULT = 'var(--light-grey)';

const MSG_INVALID = 'Please complete all required fields marked with *';
const MSG_DRIVER_OK =
  'Application received. We review every application and respond within 10 working days for successful candidates.';
const MSG_HIRE_OK =
  'Request received. We respond within 24 hours with a driver shortlist and placement plan.';

function validateRequired(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach((field) => {
    const empty = field.type === 'checkbox'
      ? !field.checked
      : !String(field.value || '').trim();
    if (empty) {
      if (field.type !== 'checkbox') field.style.borderColor = BORDER_INVALID;
      valid = false;
    } else if (field.type !== 'checkbox') {
      field.style.borderColor = BORDER_DEFAULT;
    }
  });
  return valid;
}

function wireForm(formId, successMessage) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateRequired(form)) {
      alert(MSG_INVALID);
      return;
    }
    alert(successMessage);
    form.reset();
    form.querySelectorAll('[required]').forEach((field) => {
      if (field.type !== 'checkbox') field.style.borderColor = BORDER_DEFAULT;
    });
  });

  // Clear invalid border as soon as the user edits the field.
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t && t.style && t.style.borderColor) t.style.borderColor = BORDER_DEFAULT;
  });
}

export function initDriverForms() {
  wireForm('driverApp', MSG_DRIVER_OK);
  wireForm('hireApp', MSG_HIRE_OK);
}
