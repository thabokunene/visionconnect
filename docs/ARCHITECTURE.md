# VisionConnect — Architecture

> Rebuild of the original single-file production site into a modular, layered,
> zero-build static multi-page front end, kept in lockstep with production
> (latest: the full seven-page delivery — landing + six inner pages sharing one
> stylesheet and one script). **Production behavior is unchanged** — see
> [Behavior preservation](#behavior-preservation) for the verification method
> and results.

---

## 1. New folder structure

```
visionconnect/
├── index.html                      # Landing: semantic markup only,
│                                   # no <style>, no inline styles, no inline JS
├── capabilities.html               # Inner page: five service detail sections
├── corridors.html                  # Inner page: map + corridor group cards
├── fleet.html                      # Inner page: configuration + compliance
├── about.html                      # Inner page: story, numbers, leadership, values
├── case-studies.html               # Inner page: four full case articles
├── contact.html                    # Inner page: order form + contact details
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
    │   │   ├── btn-primary.css     #   Solid/outline CTA buttons (+ light variant)
    │   │   └── order-form.css      #   Multi-step order form (steps, inputs,
    │   │                           #   radio pills, dimensions, submit + its
    │   │                           #   own responsive rules)
    │   ├── sections/               # Layer 3: page sections (one file each)
    │   │   ├── pre-header.css
    │   │   ├── navbar.css
    │   │   ├── page-header.css     #   Shared header band for inner pages
    │   │   ├── hero.css
    │   │   ├── trust-bar.css
    │   │   ├── capabilities.css    #   Landing capabilities strip
    │   │   ├── service-detail.css  #   Capabilities page detail rows
    │   │   ├── corridors.css       #   Landing map + inner corridor list
    │   │   ├── fleet.css           #   Landing fleet + inner config/compliance
    │   │   ├── leadership.css
    │   │   ├── about.css           #   About page story/numbers/values
    │   │   ├── case-study.css      #   Landing case + inner full articles
    │   │   ├── proof.css
    │   │   ├── contact.css
    │   │   ├── cta-band.css        #   Shared closing CTA on inner pages
    │   │   └── footer.css
    │   └── accessibility.css        # Layer 4: focus + reduced-motion (imports last)
    └── js/
        ├── main.js                 # Composition root — the ONLY <script>.
        │                           # Imports features and boots them in order.
        ├── core/                   # Layer A: stateless utilities
        │   └── animate-count.js    #   Eased count-up animation (pure display)
        └── features/               # Layer B: one module per interactive feature
            ├── navbar-scroll.js    #   Sticky navbar scroll state (guarded)
            ├── proof-counters.js   #   Landing proof + about number counters
            └── order-form.js       #   Radio pills + validation + submit (guarded)
```

All seven pages link only `assets/css/main.css` and load only
`assets/js/main.js` (as an ES module). Inner pages carry content classes;
the shared script is feature-guarded so it is safe on every page.

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
| **sections** (`sections/`) | One page region each (landing *and* its inner-page extension), including *its own* responsive rules | Reach into another section |
| **accessibility** | Global focus/motion overrides | Be imported before anything it overrides |
| **Composition roots** (`main.css`, `main.js`) | Ordering only — no declarations, no logic | Contain implementation |

### 2.2 CSS architecture

* **One entry point.** Every page links only `assets/css/main.css`. Its
  `@import` list *is* the cascade contract:
  `tokens → base → layout → components → sections → accessibility`.
  A comment in the file documents that reordering requires checking
  equal-specificity conflicts.
* **Section vertical slices.** Each section owns all of its selectors — base
  rules *and* its `@media (max-width: …)` overrides at the bottom of the same
  file. Landing and inner-page selectors for the same region live together
  (e.g. `corridors.css` holds both the landing map and the inner corridor
  list; `fleet.css` holds landing fleet *and* the inner config/compliance
  page), so a region can never be half-updated.
* **Shared chrome is shared modules.** Page-header, CTA band and primary
  buttons are used by many inner pages, so they live in
  `page-header.css` / `cta-band.css` / `btn-primary.css` rather than being
  duplicated per page.
* **Tokens are the single source of truth.** Colors, fonts and spacing are
  declared once in `core/tokens.css`, including responsive token scaling
  (`--section-pad` steps down at 1024/768). No component hardcodes a palette
  value.
* **Variants as classes, not inline styles.** All inline `style="…"`
  attributes from the production markup were replaced by modifier classes /
  structural rules with identical computed values:
  * Landing (`index.html`,13 →0): `.micro-label--spaced`,
    `.cap-table` nth-child widths, `.contact-block-text--muted`,
    `.footer-emergency--tight`, `.form-group--gap-after` / `--gap-before`
  * Inner pages (23 →0): `service-detail-image--{dg,abnormal,cross-border,bulk,containerised}`
    (background URLs), `case-image--{lubumbashi,beira,kolwezi}`,
    `.panel-note` (info-panel body text), `.contact--page` (section offset),
    plus the same landing modifiers reused on contact/footer

### 2.3 JavaScript architecture

* **Composition root.** `assets/js/main.js` contains no logic — it imports
  three feature modules and boots them in the original script's order
  (`navbar → counters → order form`). Adding a feature = one import + one
  `init…()` call.
* **Feature modules are self-contained and page-safe.** Each `init…()`
  encapsulates its own DOM query and wiring. The navbar and form modules
  are guarded (`if (navbar)`, `if (quoteForm)`) so the shared script can be
  loaded on every page — including pages without a form.
* **Counters own their observer policy.** `proof-counters.js` observes
  `.proof-number, .about-number-value`, parses comma / `%` / `t` suffixes,
  and unobserves once. `animate-count.js` stays a pure display utility.
* **Core is pure.** `animate-count.js` exports the count-up animation with no
  knowledge of *which* elements are animated or *when*.
* **ES modules, no globals.** Bindings are private by construction; import
  edges are explicit and checkable.
* **Execution timing preserved.** Module scripts execute after document
  parsing, before `DOMContentLoaded` — the same window as the original
  end-of-body inline script.

---

## 3. Architectural improvements (why this scales)

1. **Separation of concerns.** Document, presentation and behavior are fully
   separated, and each layer is split by role.
2. **Modularity with a declared dependency direction.** Every file has one
   reason to change; `main.css`/`main.js` make composition order explicit.
3. **Reduced coupling.**
   * Sections cannot break each other: no cross-section selectors exist.
   * Features cannot break each other: no shared mutable globals; guards
     keep the shared script safe across pages.
4. **Change locality (maintenance cost).** Editing a region means opening one
   module, not scanning a multi-thousand-line document.
5. **Multi-page without duplication.** Seven documents share one CSS
   pipeline and one JS graph; chrome (nav, pre-header, footer) is uniform by
   construction, and page-specific content is isolated in its own HTML file
   plus its section modules.
6. **Scalability paths opened (without committing to them):**
   * *Performance:* point a bundler at `main.css` to flatten the `@import`
     pipeline — no module changes required.
   * *Pages:* copy a page shell, link `main.css` + `main.js`, add a section
     module and one import line.
   * *Content:* copy sits in semantic HTML ready to template or move behind
     a CMS.
   * *Testing:* pure core exports and injectable `init…()` functions.
7. **Dead weight removed from the DOM contract.** Zero inline styles across
   all seven pages; class names are the only styling API.

---

## 4. Behavior preservation

The refactor's contract: *same rendered CSS, same JS semantics, same DOM
(excluding the documented navigation exception below)*. Verified mechanically
against byte-accurate copies of the production delivery:

| Check | Method | Result |
|---|---|---|
| **CSS claim** | Prove `styles.css` = landing `<style>` + additions; landing part vs modules | Landing **1181** decls fully covered; additions **443** decls disjoint; combined **1624** |
| **CSS declarations** | Parse combined baseline vs concatenated modules into `(media-context, selector, property, value)` tuples (selector lists expanded) and compare multisets | **1624 → 1636**: exactly the **12** intentional declarations from de-inlining the landing page; **0 missing, 0 unexpected** |
| **Cascade safety** | For every shared declaration key, compare sequence | **All preserved** — relocation across files cannot change rendering |
| **HTML (inner pages)** | Reverse-transform each of the six pages (restore inline styles, `styles.css`/`scripts.js` links) | Reproduces each baseline **byte-for-byte**; **0** inline styles remain |
| **HTML (landing)** | Reverse-transform with the documented nav/pre-header/footer exception reversed first | Reproduces the v2 baseline **byte-for-byte** |
| **JS** | Marker checks against the shared `scripts.js` (v3 deltas over v2) | **All markers present**: navbar guard, `.about-number-value` selector, `t`-suffix branch, radio group scoping, form guard, both alerts, `target + suffix` |
| **Module graph** | Resolve every `import`; `node --check` all modules | All resolved; syntax OK on all **5** JS modules + baseline script |
| **Multi-page structure** | Nav/footer/pre-header uniformity across all **7** pages; per-page `active` state; internal link + anchor integrity | **All pass** |
| **Runtime** | Serve site, fetch all **7** pages + entry CSS/JS + **24** `main.css` imports | All **HTTP 200** |

### Documented exception: uniform multi-page navigation

The delivered landing page's nav, pre-header quote link and footer used
in-page `#anchors` (a single-page design). Integrating the multi-page
delivery required those chrome links to become uniform cross-page links on
**every** page (otherwise `corridors.html` and `case-studies.html` are
unreachable from the home page and the nav/footer differ per page). This is
the one intentional markup delta from the landing baseline:

| Location | Delivered (single-page) | Integrated (multi-page) |
|---|---|---|
| Pre-header “Request a Quote” | `#quote` | `contact.html` |
| Nav items | `#capabilities` … `#contact` | `capabilities.html` … `contact.html` |
| Wordmarks | `#` | `index.html` |
| Footer Services / Corridors / Company | `#` placeholders | Real page + anchor links |
| Hero + panel-cta “Request a Quote” | `#quote` | **`#quote` (unchanged)** — landing content anchors |
| Order form `id="quote"` | present | **present (unchanged)** |

Landing *content* (hero, proof, corridor map, fleet strip, case study,
leadership, contact section) is otherwise byte-identical. The reverse-transform
in the parity suite applies exactly this reversal before comparing.

Quirks preserved deliberately (behavior > tidiness): the `'0'` counter
early-return, the absence of an initial scroll-state check, and the
`'8,000t'` counter path hitting the comma branch first (losing the `t`
suffix) — all as delivered.

### How a production update is absorbed

The multi-page delivery validated the architecture at scale — six new
documents, forty-plus new style regions and four script deltas landed as
targeted module additions:

| Production change | Where it landed |
|---|---|
| Page-header + CTA band + primary buttons (shared chrome) | `sections/page-header.css`, `sections/cta-band.css`, `components/btn-primary.css` (new) |
| Capabilities detail rows + spec strips + image URLs | `sections/service-detail.css` (new) |
| About story / numbers / values | `sections/about.css` (new) |
| Corridor list + panel note + responsive | appended to `sections/corridors.css` |
| Fleet config + compliance cards + responsive | appended to `sections/fleet.css` |
| Full case articles + image modifiers | appended to `sections/case-study.css` |
| Contact page offset modifier | appended to `sections/contact.css` |
| Navbar guard, about counters, radio scoping, form guard | `features/navbar-scroll.js`, `features/proof-counters.js`, `features/order-form.js` |
| Six inner page documents | root `*.html` (de-inlined, `main.css`/`main.js` links) |
| Landing nav/pre-header/footer → multi-page | `index.html` (documented exception) |
| Import wiring | `main.css` (5 new lines) |

Process: pin the delivery as baseline → prove the styles.css claim →
mechanical declaration diff → port per the dependency rule → reverse-transform
every page → re-run both parity suites.

---

## 5. Scaling playbook

**Add a section to an existing page**
1. Markup: append a `<section>` in the page's HTML file.
2. Style: extend that region's module (or create
   `assets/css/sections/<name>.css` if it is a new region), keeping its
   `@media` blocks at the bottom of the same file.
3. Register (new file only): add one `@import` line to `main.css`
   (position = cascade tier among sections).
4. Behavior (if any): create `assets/js/features/<name>.js` exporting
   `init<Name>()`, import and call it from `main.js`. Guard the DOM query
   if not every page has the target.

**Add a page**
1. Copy an existing inner page as the shell (head, pre-header, nav, footer
   are already uniform).
2. Set `<title>` / meta description and the nav `active` class.
3. Write content sections; reuse `core/ + components/` and existing section
   modules where the region already exists.
4. De-inline any `style="…"` attributes into modifier classes; add the
   declarations to the owning module.
5. Register new section files in `main.css`. No JS changes unless the page
   introduces a new feature.

**Add a cross-cutting token**
Edit only `core/tokens.css` (plus its responsive scaling blocks). Consumers
pick it up through `var()`; no component edits.

**Introduce a build step later**
`main.css` and `main.js` are already bundler-shaped entry points; a single
Vite/esbuild config flattens them without touching any module.

**Absorb the next production delivery**
1. Pin delivered files as the new baseline under `.vc-verify/`.
2. Declaration-diff delivered CSS vs modules; port only the delta.
3. Reverse-transform every touched page; require byte-for-byte.
4. Re-run `verify_parity.py` + `verify_v3.py` until both are green.
