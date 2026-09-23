# VisionConnect UI Components

> Production component architecture for the VisionConnect design system.
> Framework-agnostic Web Components (Custom Elements) on the existing
> zero-build ES-module stack — no React, no bundler, no runtime framework.

**Living style guide:** open [`ui.html`](../ui.html) while the site is served
(`python3 -m http.server 8080` → `/ui.html`). Every example on that page is
the same markup you ship.

---

## 1. Component architecture

### 1.1 Layering

The UI library sits in its own JS layer beside `features/`, following the same
one-directional dependency rule as the rest of the codebase:

```
CSS                                      JS
──────────────────────────────           ──────────────────────────────
sections ──┐                             features ──┐
components ─┼──▶ core (tokens/base/      components ─┼──▶ core (a11y, …)
accessibility  layout, ui.css)           main.js     │      (components NEVER
   ▲                                     ui.js        │       import features)
   └── composed by main.css               ▲          │
                                          └── opt-in composition root
```

| Layer | Owns | Must never |
|---|---|---|
| `js/core/` | Stateless utilities (`animate-count`, `a11y`) | Know about a component or feature |
| `js/components/` | Reusable custom elements + `Toast` service | Import features, query page sections, assume a page |
| `js/features/` | Page-behaviour wiring (navbar, counters, form) | Import components internals (call public APIs only) |
| `js/ui.js` | Registration barrel (idempotent) | Contain component logic |
| `css/components/ui.css` | All `vc-*` / `.vc-*` visual rules | Reference section selectors |

### 1.2 Design principles

1. **Light DOM, not Shadow DOM** — the site’s tokens live in `:root`. Light DOM
   keeps one cascade, one source of truth for colour/type/spacing, and makes
   styling from page-level CSS possible without `::part()` gymnastics.
2. **Attributes are the HTML API; properties are the JS API** — both reflected
   for the common state (`loading`, `open`, `error`, `variant`).
3. **Progressive enhancement** — a page works without `ui.js` for static
   content; interactive `vc-*` tags upgrade when the module loads. Custom
   elements upgrade on connect, so dynamically inserted nodes just work.
4. **Accessibility is not optional** — every interactive component ships with
   correct roles, name/label/description wiring, keyboard paths, and focus
   visibility. Screen-reader announcements go through one shared live-region
   helper (`core/a11y.js`), never N competing regions.
5. **States are first-class** — every data-driven component defines
   *loading*, *empty*, *error*, and *ready* before it ships.
6. **Tokens only** — components never hardcode palette values; they consume
   `var(--signal-red)`, `var(--ink)`, etc.
7. **Reduced motion is respected** — counters jump to final value; skeleton
   shimmer pauses; toasts do not slide.

### 1.3 Inventory

| Tag | Role | Key states |
|---|---|---|
| `<vc-button>` | CTA / action control | default, hover, focus, disabled, loading, block |
| `<vc-counter>` | Animated metric | idle, animating, done, reduced-motion |
| `<vc-field>` | Labelled form control | default, hint, required, invalid, error |
| `<vc-toast>` + `Toast` | Transient feedback | success, error, info, warning, sticky |
| `<vc-disclosure>` | Accordion item | collapsed, expanded |
| `<vc-skeleton>` | Loading placeholder | text, media, circle; reduced-motion |
| `<vc-empty>` | Zero-data state | neutral, inline; with/without action |
| `<vc-badge>` | Status token | neutral, success, danger, warning, info; sm |

---

## 2. Props and API design

Conventions used across the library:

| Convention | Rule |
|---|---|
| Attribute names | `kebab-case`, multi-word (`icon-start`, `label-hidden`) |
| Boolean attributes | Presence = true (`loading`, `disabled`, `open`, `required`, `block`) |
| String enums | Documented closed set (`variant="primary\|secondary\|light"`) |
| Reflected state | Attribute ↔ class or internal DOM sync in `attributeChangedCallback` |
| Events | `vc:<verb>` for component-originated signals (`vc:valid`, `vc:open`, `vc:done`); native `click` never re-wrapped |
| Slots | Named slots only when composition is real (`action`, `visual`); default slot = primary content |
| Methods | Imperative escapes for app code: `validate()`, `toggle()`, `dismiss()`, `focus()` |
| Ids | Generated via `uid()` so multiple instances never collide in `aria-*` graphs |

### 2.1 `<vc-button>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `primary\|secondary\|light` | `primary` | Visual weight |
| `size` | `md\|sm` | `md` | Control density |
| `loading` | boolean | `false` | Spinner + `aria-busy` + blocks activation |
| `disabled` | boolean | `false` | Native disabled semantics |
| `type` | `button\|submit\|reset` | `button` | Ignored when `href` present |
| `href` | string | — | Renders a real `<a>` (crawlable, new-tab friendly) |
| `icon` / `icon-start` | string | — | Material Symbols ligature name |
| `block` | boolean | `false` | Full-width |

**Properties:** `loading`, `disabled`, `variant` (get/set).  
**Events:** native `click` only.  
**Guards:** `.click()` no-ops while loading/disabled.

```html
<vc-button variant="primary" href="contact.html" icon="arrow_forward">
  Request a Quote
</vc-button>

<vc-button variant="primary" id="save">Save</vc-button>
<script type="module">
  const save = document.getElementById('save');
  save.addEventListener('click', async () => {
    if (save.loading) return;
    save.loading = true;
    try {
      await api.save();
      Toast.success('Saved.');
    } finally {
      save.loading = false;
    }
  });
</script>
```

### 2.2 `<vc-counter>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | number | `0` | Final value (required) |
| `duration` | ms | `600` | Matches production ease-out curve |
| `format` | `plain\|grouped\|percent` | auto | `grouped` if \|v\| ≥ 1000 |
| `decimals` | int | auto | Fraction digits |
| `prefix` / `suffix` | string | — | Fixed affixes |
| `start` | boolean | `false` | Animate immediately (skip viewport wait) |
| `aria-label` | string | formatted value | **Accessible name = final value** |

**Events:** `vc:done` (once per run).  
**A11y:** intermediate frames are `aria-hidden`; SRs never hear the tween.

```html
<vc-counter value="14280" format="grouped"
            aria-label="Cross-border loads delivered"></vc-counter>
```

### 2.3 `<vc-field>`

| API | Kind | Description |
|---|---|---|
| `label` | attr | Visible label text |
| `hint` | attr | Help text → `aria-describedby` |
| `error` | attr + prop | Message; sets `is-invalid`, `aria-invalid` |
| `required` | attr | `*` marker, `aria-required`, validation |
| `label-hidden` | attr | Visually hidden label (SR still reads it) |
| `control` | prop | First input/select/textarea inside |
| `value` | prop | Proxies control `.value` |
| `validate()` | method | `boolean`; native `checkValidity` when available |
| `focus()` | method | Focus the control |
| `vc:valid` / `vc:invalid` | events | `invalid` detail: `{ message }` |

```html
<vc-field label="Email" hint="We respond within 24 hours." required>
  <input class="form-input" type="email" name="email" placeholder="ops@co.za">
</vc-field>
<script type="module">
  const field = document.querySelector('vc-field');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!field.validate()) { field.focus(); return; }
    // …
  });
  // Errors clear automatically when the user edits.
</script>
```

### 2.4 `Toast` service + `<vc-toast>`

```js
import { Toast } from '../components/index.js';

const t = Toast.show({
  title: 'Dispatch hold',          // optional
  message: 'Convoy staged until sunrise.',
  variant: 'warning',              // success | error | info | warning
  duration: 0,                     // 0 = sticky until dismissed
});
t.dismiss();

Toast.success('Corridor plan ready.');
Toast.error('Control tower unreachable.');
Toast.dismissAll();
```

| Behaviour | Detail |
|---|---|
| Placement | Fixed host `#vc-toast-host`, stacks, full-width ≤768px |
| Timing | Auto-dismiss pauses on hover **and** focus-within |
| A11y | Host is a labelled region; success/info → `role="status"`, error → `role="alert"` + assertive announce |
| Dupes | Safe to call from anywhere; each call is an independent node |

> **Parity note:** the landing/contact order-form still uses production
> `alert()` — that behavior is frozen for the parity contract. New features
> should use `Toast`.

### 2.5 `<vc-disclosure>`

| API | Kind | Description |
|---|---|---|
| `summary` | attr | Header text |
| `open` | attr + prop | Expanded state |
| `toggle(force?)` | method | Expand/collapse |
| `vc:open` / `vc:close` | events | On user-driven toggle |

Implements the WAI-ARIA accordion item pattern (`button[aria-expanded]`
+ `region[aria-labelledby]`).

### 2.6 `<vc-skeleton>`

| Attr | Description |
|---|---|
| `lines="4"` | Multi-line text block (last line shortened) |
| `media` | Block/media placeholder (default height 160px) |
| `circle` | Avatar placeholder |
| `width` / `height` / `radius` | Inline CSS lengths for custom geometry |

Decorative: `aria-hidden` on the box. Pair with a visible
`role="status"` “Loading…” label when the wait matters.

### 2.7 `<vc-empty>`

| Attr / Slot | Description |
|---|---|
| `title` | Heading (required for a sensible accessible name) |
| `description` | Supporting copy |
| `tone="inline"` | Compact padding variant |
| `icon` | Material Symbols name (default `inbox`) |
| `slot="action"` | Primary next step — almost always populate this |
| `slot="visual"` | Replace the default icon (illustration, chart) |

### 2.8 `<vc-badge>`

| Attr | Values | Default |
|---|---|---|
| `variant` | `neutral\|success\|danger\|warning\|info` | `neutral` |
| `size` | `md\|sm` | `md` |
| `dot` | boolean | off |
| `label` | string | else light-DOM text |

Colour is never the only signal — the text label is always present.

---

## 3. Production-ready implementation

### 3.1 Files

```
assets/js/core/a11y.js           prefersReducedMotion, announce, uid
assets/js/components/
  button.js                      VcButton
  counter.js                     VcCounter
  field.js                       VcField
  toast.js                       VcToast + Toast service
  disclosure.js                  VcDisclosure
  skeleton.js                    VcSkeleton
  empty-state.js                 VcEmpty
  badge.js                       VcBadge
  index.js                       registerComponents() barrel
assets/js/ui.js                  opt-in composition root
assets/css/components/ui.css     all vc-* styles (imported by main.css)
ui.html                          living style guide
docs/COMPONENTS.md               this document
```

### 3.2 Loading the library

```html
<!-- Product pages that use <vc-*> -->
<script type="module" src="assets/js/main.js"></script>
<script type="module" src="assets/js/ui.js"></script>
```

`registerComponents()` is **idempotent** — double-including `ui.js` is safe.
Landing/parity pages intentionally load only `main.js`; adding `ui.js` there
would be a no-op for custom elements but is omitted to keep the parity
contract obvious.

### 3.3 Edge cases handled in the implementations

| Case | Handling |
|---|---|
| Double-click while saving | `loading` blocks `.click()` and native activation |
| `href` vs `button` swap | Button re-renders the underlying element on attribute change |
| Counter interrupted (disconnect mid-tween) | `disconnectedCallback` cancels rAF + observer |
| Counter `value=0` | No tween; immediate final state + `vc:done` |
| Field with no control | `validate()` fails with an explicit message |
| Error then user types | Input/change listeners clear `error` immediately |
| Toast while unfocused (SR user) | Focus-within pauses timer; assertive path for errors |
| Duplicate element registration | Every `register*` checks `customElements.get` first |
| Dynamically inserted nodes | Native custom-element upgrade on connect |
| Reduced motion | a11y helper + CSS `prefers-reduced-motion` block |
| High-frequency announcements | Single shared polite/assertive regions in `core/a11y.js` |
| CLS from skeletons | Authors size skeletons to the loaded geometry (guide shows card pattern) |

### 3.4 Responsive behaviour

* Buttons/fields are fluid inside their containers; `block` for mobile primaries.
* Toast host becomes full-width gutters at ≤768px.
* Style-guide grids collapse to one column at ≤768px (page chrome only).
* Components inherit `--section-pad` / container rules from the page — they
  do not own page layout.

### 3.5 Performance

* No framework runtime; each component is a few KB of plain JS.
* Registration cost is one-time; attribute syncs are cheap class flips.
* Counter uses a single rAF loop and disconnects its observer after first run.
* `ui.css` rides the existing `@import` pipeline (a bundler can flatten it
  later with zero component changes).

---

## 4. Usage examples (copy-paste)

### Async form submit with toast + guard

```html
<form id="quote">
  <vc-field label="Company" required>
    <input class="form-input" name="company" required>
  </vc-field>
  <vc-button type="submit" variant="primary">Submit Request</vc-button>
</form>

<script type="module">
  import { Toast } from './assets/js/components/index.js';

  const form = document.getElementById('quote');
  const btn = form.querySelector('vc-button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.loading) return;

    const fields = [...form.querySelectorAll('vc-field')];
    const invalid = fields.filter((f) => !f.validate());
    if (invalid.length) {
      invalid[0].focus();
      Toast.error(`Please complete ${invalid.length} required field(s).`);
      return;
    }

    btn.loading = true;
    try {
      await fetch('/api/quote', { method: 'POST', body: new FormData(form) });
      Toast.success('Request received. Response within 24 hours.');
      form.reset();
    } catch {
      Toast.error('Submission failed. Your details are kept — try again.');
    } finally {
      btn.loading = false;
    }
  });
</script>
```

### Loading → ready list with empty state

```html
<div id="corridor-list" role="status" aria-live="polite" aria-busy="true">
  <vc-skeleton lines="3"></vc-skeleton>
  <vc-skeleton lines="3"></vc-skeleton>
  <span class="visually-hidden">Loading corridors…</span>
</div>

<script type="module">
  const list = document.getElementById('corridor-list');
  try {
    const rows = await loadCorridors();
    list.setAttribute('aria-busy', 'false');
    list.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('vc-empty');
      empty.setAttribute('title', 'No corridors match');
      empty.setAttribute('description', 'Clear filters or request a new route.');
      empty.setAttribute('icon', 'search_off');
      list.appendChild(empty);
      return;
    }
    rows.forEach((r) => list.appendChild(renderRow(r)));
  } catch {
    list.replaceChildren();
    Toast.error('Could not load corridors.');
  }
</script>
```

### Metric row (about / proof)

```html
<div class="about-numbers-grid">
  <div class="about-number">
    <vc-counter value="14280" format="grouped"
                aria-label="Cross-border loads"></vc-counter>
    <div class="about-number-label">Cross-border loads</div>
  </div>
  <div class="about-number">
    <vc-counter value="98.7" format="percent" decimals="1"
                aria-label="On-time delivery rate"></vc-counter>
    <div class="about-number-label">On-time rate</div>
  </div>
</div>
```

### FAQ disclosure stack

```html
<vc-disclosure summary="Do you carry ADR certification?" open>
  All drivers hold ADR Class 1–9. Tremcards and emergency protocols are
  filed before the truck leaves the yard.
</vc-disclosure>
<vc-disclosure summary="Which border posts do you use?">
  Beitbridge, Kazungula, Kasumbalesa, Chirundu, Lebombo, Machipanda and more.
</vc-disclosure>
```

---

## 5. Best practices

### Do

* **Prefer attributes in markup, properties in JS** (`el.loading = true`).
* **Always give counters and badges an accessible name** when the visible
  text is not enough (`aria-label="On-time delivery rate"`).
* **Pair skeletons with a status region** when loading exceeds ~300ms.
* **Always pass an action slot** to `<vc-empty>` — an empty state without a
  next step is a dead end.
* **Use `Toast` for new feedback**; reserve `alert()` for the frozen parity
  path only.
* **Guard async buttons** with the built-in `loading` flag (double-submit
  is a production bug, not a edge case).
* **Keep components page-agnostic.** Need page data? Pass it as attributes
  or drive it from a feature module.
* **Match skeleton geometry to loaded content** to keep CLS near zero.
* **Respect the cascade contract:** style new variants in `ui.css` with
  tokens; do not fork palette values into components.

### Don’t

* **Don’t import features from components** (kills reuse and creates cycles).
* **Don’t reach into another component’s internals** (`querySelector` on a
  `vc-*` child’s chrome). Use public props/methods/events.
* **Don’t add page-specific selectors to `ui.css`** — that belongs in
  `sections/`.
* **Don’t announce animation frames.** Never `aria-live` the counter’s
  intermediate values.
* **Don’t use colour-only badges or errors.** Text (or icon + text) must
  carry the meaning.
* **Don’t swallow focus.** If `validate()` fails, move focus to the first
  invalid field yourself.
* **Don’t re-implement spinner/empty/toast** — extend this library so
  behaviour and a11y stay consistent.
* **Don’t skip the style guide** — add every new component’s states to
  `ui.html` in the same PR.

### Definition of done (component checklist)

1. [ ] Attributes documented with types + defaults  
2. [ ] Keyboard path verified (Tab / Enter / Space / Esc where applicable)  
3. [ ] Accessible name + description wiring (axe or manual SR pass)  
4. [ ] Loading / empty / error / ready states defined  
5. [ ] Reduced-motion behaviour defined  
6. [ ] Responsive check at 360px / 768px / 1280px  
7. [ ] Token-only styling (`var(--…)` — no hardcoded hex in components)  
8. [ ] Style-guide examples for every variant + state  
9. [ ] `node --check` (or test suite) green; no new console errors  
10. [ ] Events use the `vc:*` prefix; no surprise global side effects  

---

## 6. Extending the library

**Add a variant** to an existing component  
1. Extend the `observedAttributes` closed set (document it above).  
2. Map attribute → class in `#sync()`.  
3. Add CSS under the component’s block in `ui.css`.  
4. Add a demo row to `ui.html`.

**Add a new component**  
1. `assets/js/components/<name>.js` exporting `VcName` + `registerVcName()`.  
2. Idempotent `customElements.define` guard.  
3. Styles in `ui.css` (token-only).  
4. Register in `components/index.js`.  
5. Demo + API table in `ui.html`.  
6. Document props/events/a11y in this file.  
7. Run `node --check` on the new module; re-run parity suites if `main.css`
   changed.

The architecture is intentionally boring: one registry, one stylesheet block,
one style guide, one doc file — so the next component cannot quietly ship
half-finished.
