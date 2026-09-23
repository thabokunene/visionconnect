# VisionConnect — Architecture

> Rebuild of the original single-file production page (≈2,300 lines of mixed
> HTML + CSS + JS in one document) into a modular, layered, zero-build static
> front end, kept in lockstep with production (latest: the multi-step order
> form update). **Production behavior is unchanged** — see
> [Behavior preservation](#behavior-preservation) for the verification method
> and results.

---

## 1. New folder structure

```
visionconnect/
├── index.html                      # Document shell: semantic markup only,
│                                   # no <style>, no inline styles, no inline JS
├── docs/
│   └── ARCHITECTURE.md             # This document
├── README.md
└── assets/
    ├── css/
    │   ├── main.css                # Composition root — the ONLY <link>.
    │   │                           # Its @import order is the cascade contract.
    │   ├── core/                   # Layer 1: shared foundations
    │   │   ├── tokens.css          #   Design tokens (:root) + token scaling
    │   │   ├── base.css            #   Reset, document defaults, icon defaults
    │   │   └── layout.css          #   Container, 12-col grid, micro-label
    │   ├── components/             # Layer 2: reusable UI components
    │   │   ├── wordmark.css        #   Wordmark (navbar + footer variants)
    │   │   ├── cta-link.css        #   Uppercase CTA link with icon
    │   │   └── order-form.css      #   Multi-step order form (steps, inputs,
    │   │                           #   radio pills, dimensions, submit + its
    │   │                           #   own responsive rules)
    │   ├── sections/               # Layer 3: page sections (one file each)
    │   │   ├── pre-header.css
    │   │   ├── navbar.css
    │   │   ├── hero.css
    │   │   ├── trust-bar.css
    │   │   ├── capabilities.css
    │   │   ├── corridors.css
    │   │   ├── fleet.css
    │   │   ├── leadership.css
    │   │   ├── case-study.css
    │   │   ├── proof.css
    │   │   ├── contact.css
    │   │   └── footer.css
    │   └── accessibility.css        # Layer 4: focus + reduced-motion (imports last)
    └── js/
        ├── main.js                 # Composition root — the ONLY <script>.
        │                           # Imports features and boots them in order.
        ├── core/                   # Layer A: stateless utilities
        │   └── animate-count.js    #   Eased count-up animation (pure display)
        └── features/               # Layer B: one module per interactive feature
            ├── navbar-scroll.js    #   Sticky navbar scroll state
            ├── proof-counters.js   #   IntersectionObserver metric counters
            └── order-form.js       #   Radio pills + validation + submit
```

---

## 2. Clean architectural breakdown

### 2.1 Layered dependency rule

Both style and behavior follow a strict one-directional dependency rule —
**lower layers never know about higher layers**:

```
CSS                                   JS
────────────────────────────          ────────────────────────────
sections  ──┐                         features ──┐
components ─┼──▶ core (tokens/base/   core utils ◀─┘ (features import core,
accessibility   layout)               main.js imports features — nothing
   ▲                                  imports main.js)
   └── composed by main.css           └── composed by main.js
```

| Layer | Owns | Must never |
|---|---|---|
| **core** (`core/`, `js/core/`) | Tokens, reset, layout primitives, stateless utilities | Reference a section or feature |
| **components** (`components/`) | Reusable UI with a lifecycle independent of any single section | Reference section selectors |
| **sections** (`sections/`) | One page region each, including *its own* responsive rules | Reach into another section |
| **accessibility** | Global focus/motion overrides | Be imported before anything it overrides |
| **Composition roots** (`main.css`, `main.js`) | Ordering only — no declarations, no logic | Contain implementation |

### 2.2 CSS architecture

* **One entry point.** `index.html` links only `assets/css/main.css`. Its
  `@import` list *is* the cascade contract:
  `tokens → base → layout → components → sections → accessibility`.
  A comment in the file documents that reordering requires checking
  equal-specificity conflicts.
* **Section vertical slices.** Each section owns all of its selectors — base
  rules *and* its `@media (max-width: …)` overrides at the bottom of the same
  file (locality of behavior: hero's breakpoints live with hero).
  Breakpoint order inside each file matches the original cascade
  (1024 → 768 → 480).
* **Tokens are the single source of truth.** Colors, fonts and spacing are
  declared once in `core/tokens.css`, including responsive token scaling
  (`--section-pad` steps down at 1024/768). No component hardcodes a palette
  value.
* **Components vs sections.** Selectors that are reused across regions
  (wordmark, CTA link, form controls) are extracted to `components/`; styles
  scoped to a single region stay in that region's file (e.g. the corridor
  info-panel is *not* a shared component, so it stays in `corridors.css`).
* **Variants as classes, not inline styles.** All13 inline `style="…"`
  attributes in the production markup were replaced by modifier classes /
  structural rules with identical computed values:
  * `.micro-label--spaced` (was `margin-top:48px` inline)
  * `.cap-table thead th:nth-child(n)` column widths (were inline on `<th>`)
  * `.contact-block-text--muted` (was inline `font-size/color`)
  * `.footer-emergency--tight` (was inline `margin-top`)
  * `.form-group--gap-after` / `.form-group--gap-before` (were inline
    `margin-bottom/top:20px` on standalone order-form groups)

### 2.3 JavaScript architecture

* **Composition root.** `assets/js/main.js` contains no logic — it imports
  three feature modules and boots them in the original script's order
  (`navbar → counters → order form`). Adding a feature = one import + one
  `init…()` call.
* **Feature modules are self-contained.** Each `init…()` function encapsulates
  its own DOM query, event/observer wiring and teardown semantics. No feature
  reaches into another; none registers globals.
* **Core is pure.** `animate-count.js` exports the count-up animation with no
  knowledge of *which* elements are animated or *when* — the observer policy
  (threshold, parsing, unobserve behavior) lives in the feature that owns it.
* **ES modules, no globals.** The original top-level script shared every
  `const` with the global scope (`navbar`, `counterObserver`, `animateCount`,
  …). Modules make those bindings private by construction and give explicit
  import edges the architecture can be checked against.
* **Execution timing preserved.** Module scripts execute after document
  parsing, before `DOMContentLoaded` — the same window as the original
  end-of-body inline script, so every listener attaches under identical
  conditions.

---

## 3. Architectural improvements (why this scales)

1. **Separation of concerns.** The monolith mixed three concerns in one file;
   now document (`index.html`), presentation (`assets/css`), and behavior
   (`assets/js`) are fully separated, and each layer is further split by role.
2. **Modularity with a declared dependency direction.** Every file has one
   reason to change; `main.css`/`main.js` make composition order explicit and
   reviewable in a diff.
3. **Reduced coupling.**
   * Sections cannot break each other: no cross-section selectors exist.
   * Features cannot break each other: no shared mutable globals.
   * Content/styling of one region coexists with its breakpoints, so a
     responsive fix cannot be applied in the wrong file.
4. **Change locality (maintenance cost).** Editing the hero used to mean
   scanning a2,300-line document; now it is one105-line file. The largest
   section file is `case-study.css` (~211 lines); the original was ~2,300.
5. **Scalability paths opened (without committing to them):**
   * *Performance:* point a bundler (Vite/esbuild) at `main.css` to flatten the
     `@import` pipeline into one minified asset — no module changes required.
   * *Pages:* new pages reuse `core/ + components/` and add their own
     `sections/*.css` + import line.
   * *Content:* copy (team, case studies, corridors) sits in semantic HTML
     sections ready to be templated or moved behind a CMS.
   * *Testing:* `animate-count` is a pure function export; feature `init…()`
     functions are injectable into a DOM harness.
6. **Dead weight removed from the DOM contract.** Zero inline styles; class
   names are the only styling API, so CSS can be audited, linted (e.g.
   Stylelint) and tree-shaken by class usage if a build step is added later.

---

## 4. Behavior preservation

The refactor's contract: *same rendered CSS, same JS semantics, same DOM*.
It was verified mechanically against a byte-accurate copy of the current
production file:

| Check | Method | Result |
|---|---|---|
| **CSS declarations** | Parse original vs concatenated modules into `(media-context, selector, property, value)` tuples (selector lists expanded) and compare multisets | **1181 → 1193**: exactly the12 intentional declarations from de-inlining; **0 missing,0 unexpected** |
| **Cascade safety** | For every duplicate `(context, selector, property)` key, compare declaration sequence | **0 conflicting groups** in the original (no order-sensitive pairs) — relocation across files cannot change rendering |
| **HTML** | Reverse-transform `index.html` (re-inline styles, restore `<style>`/`<script>` blocks) | Reproduces the original **byte-for-byte** |
| **JS** | Diff each function body against the original script; marker checks for observer, radio-pill and validation logic | **All bodies identical / all markers present** (comments/wrappers aside) |
| **Module graph** | Resolve every `import` path | All resolved; `node --check` passes on all5 modules |
| **Runtime** | Serve site, fetch entry + full19-file CSS chain +5 JS modules | All **HTTP200** |

Quirks preserved deliberately (behavior > tidiness in a no-behavior-change
refactor): the `'0'` counter early-return that skips `unobserve`, and the
absence of an initial scroll-state check on page load. (The unreachable
`val` reference in `animateCount`'s completion branch was fixed *in
production* with this update and is mirrored here as `target + suffix`.)

### How a production update is absorbed

The multi-step order-form update (contact section rewrite, new form styles,
validation JS) validated the architecture — the entire change landed in a
handful of files, with everything else untouched:

| Production change | Where it landed |
|---|---|
| New order-form styles + form responsive rules | `components/order-form.css` (new file) |
| `.contact-grid` ratio + section copy | `sections/contact.css`, `index.html` |
| `animateCount` completion-branch fix | `core/animate-count.js` |
| Radio-pill state + validation submit | `features/order-form.js` (renamed from `quote-form.js`) |
| Import wiring | `main.css`, `main.js` (one line each) |
| — untouched — | All other14 CSS modules, `navbar-scroll`, `proof-counters`, tokens, accessibility |

Process: pin the new production file as baseline → mechanical declaration
diff enumerates every change → port per the dependency rule → re-run the
parity suite.

---

## 5. Scaling playbook

**Add a section to this page**
1. Markup: append a `<section>` in `index.html`.
2. Style: create `assets/css/sections/<name>.css` (base rules, then its
   `@media` blocks at the bottom).
3. Register: add one `@import` line to `main.css` (position = cascade tier
   among sections).
4. Behavior (if any): create `assets/js/features/<name>.js` exporting
   `init<Name>()`, import and call it from `main.js`.

**Add a cross-cutting token**
Edit only `core/tokens.css` (plus its responsive scaling blocks). Consumers
pick it up through `var()`; no component edits.

**Add a page**
Copy `index.html` as the shell, link `main.css`, reuse `core/ + components/`,
add page-specific `sections/` files and imports.

**Introduce a build step later**
`main.css` and `main.js` are already bundler-shaped entry points; a single
Vite/esbuild config flattens them without touching any module.
