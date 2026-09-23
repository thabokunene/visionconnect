# VisionConnect — Senior Engineering Review

> Audit performed against branch `arena/01a0cc24-visionconnect` (post UI-kit).
> Lenses: reverse-engineering, architecture, debugging, performance, clean
> architecture, systems, UI systems. **Constraint: zero production-behavior
> change** — parity suites must stay green (`verify_v3` + `verify_parity`).

---

## 1. Reverse-engineered architecture & data flow

### 1.1 System shape

VisionConnect is a **zero-build static multi-page marketing site** (8 HTML
documents). There is no application server, no database, and no client-side
router. “Data flow” is: CDN/static host → HTML → CSS cascade + ES-module
side effects → DOM.

```
                         ┌────────────────────────────┐
  Browser request        │  Static origin (any CDN)   │
  *.html  ──────────────►│  immutable-ish assets      │
  assets/**  ───────────►│  long-cache static files   │
                         └─────────────┬──────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
        HTML (semantic)         main.css @import          main.js / ui.js
        8 pages, 0 inline       graph (25 modules)        ES module graph
        styles/handlers         tokens→…→a11y             features / components
              │                        │                        │
              └──────────── DOM ───────┴────── CSS cascade ─────┘
                                       │
                                       ▼
                    Third-party (originating outside repo):
                    • Google Fonts (Roboto + Lato)
                    • Material Symbols font
                    • Unsplash background images (CSS url())
```

### 1.2 Two composition roots (intentional)

| Root | Loads on | Imports | Role |
|---|---|---|---|
| `assets/css/main.css` | all pages | 25 `@import` modules | cascade contract |
| `assets/js/main.js` | all product pages | `features/*` + `core/animate-count` | page behavior |
| `assets/js/ui.js` | pages with `<vc-*>` (today: `ui.html`) | `components/*` + `core/a11y` | component registry |

**Dependency rule (enforced by review, not a bundler):**

```
CSS:   sections ─┐
       components ┼─► core (tokens/base/layout)     ui.css ∈ components tier
       accessibility (last)
JS:    features ─┐
       components ┼─► core (a11y, animate-count)
       main.js / ui.js = roots only
```

Components never import features; features never import components (today
they also don’t — form still uses frozen production `alert()` path).

### 1.3 Runtime data flows (what actually happens)

**Landing/about counters**
1. HTML ships final text (`14,280`, `98.7%`).
2. `initProofCounters` observes `.proof-number, .about-number-value` @ 0.5.
3. On first intersect → parse comma/`%`/`t` → `animateCount` rAF tween 600ms cubic ease-out.
4. Observer unobserves each target; disconnects when the set is exhausted *(new)*.
5. Known production quirk preserved: `'8,000t'` hits the comma branch first and drops `t`.

**Quote form (`#quote` on index + contact)**
1. `initRadioPills` binds `change` per radio → clears `.checked` across `input[name=group]` → adds `.checked`.
2. `submit` → `preventDefault` → scan `[required]` (inline `style.borderColor` — parity-frozen) → special-case `loadType` radio → `alert()` success/failure → `reset()`.
3. No network call; “submission” is simulated client-side.

**Navbar**
1. `scroll` (passive) → `scrollY > 10` toggles `.scrolled` with a state short-circuit.
2. No initial-state check on load (production quirk, preserved).

**`<vc-counter>` (component path, style guide / future pages)**
1. Upgrade → static final render → `aria-label` = final value (auto only).
2. IO @ 0.4 (or `start`) → tween → `vc:done`; reduced-motion jumps to end.

**Toasts**
1. `Toast.show` → ensure `#vc-toast-host` → create `vc-toast[open]` → **one**
   `announce()` through shared live region (assertive iff `error`).
2. Hover/focus pauses auto-dismiss; MutationObserver removes node on close.

**`<vc-field>`**
1. Build chrome (label/control/hint/error) → adopt light-DOM controls →
   wire `for` / `aria-describedby` / `aria-invalid` / `required`.
2. MutationObserver re-adopts late children; input clears `error`.

### 1.4 External dependency surface

| Dependency | Used for | Risk |
|---|---|---|
| fonts.googleapis (2 CSS) | Roboto/Lato + Material Symbols | render-blocking; geo variance |
| images.unsplash.com | hero/fleet/leadership/case/service backgrounds | no `loading=lazy` possible (CSS `background`); 3rd-party TTFB |
| (none) analytics/CDN | — | greenfield for perf instrumentation |

---

## 2. Critical problem areas (found & ranked)

### P0 — Correctness / a11y (fixed this pass)

| # | Issue | Root cause | Fix |
|---|---|---|---|
| 1 | **Toast double announcement** | Visible toast had `role=status/alert` *and* `announce()` pushed the same text to a second live region → SRs read twice | Single channel: toast is visual-only; `announce()` owns SR output (documented contract) |
| 2 | **Loading/disabled `<vc-button href>` still activatable via keyboard** | `pointer-events:none` blocks mouse; `<a>` ignores `disabled`; host `click()` override does not intercept inner native activation | Capture-phase `click` blocker on inner control; `disabled` attr only on real `<button>` |
| 3 | **`<vc-counter>` overwrote consumer `aria-label`** | `attributeChangedCallback` rewrote `aria-label` on *any* observed-attr change | `#autoLabel` ownership flag — only rewrite labels we generated |
| 4 | **`<vc-empty>` used `role=status` for static UI** | Live region on non-atomic content → noisy SR on paint | `role=group` + existing `aria-label` |

### P1 — Performance (fixed or tooled this pass)

| # | Issue | Impact | Fix / mitigation |
|---|---|---|---|
| 5 | **25 serial `@import` round-trips** | CSS is fully render-blocking; mobile RTT multiplies FCP | `tools/flatten_css.py` → `assets/css/dist/main.flat.css` (declaration-multiset **identical** to modular graph); deploy recipe below |
| 6 | **Unthrottled scroll handler** | Forced style/class work on every scroll frame | Passive listener + `scrolled` state short-circuit (same observable behavior) |
| 7 | **Counter observer never fully torn down** | Idle IO retained after all targets animated | Disconnect when `pending === 0` |
| 8 | **Duplicated live-region construction** | Drift risk, larger a11y surface | DRY `createLiveRegion` + frozen style object |

### P2 — Architecture / maintainability (documented; partly fixed)

| # | Issue | Notes |
|---|---|---|
| 9 | **Three parallel “button” systems** | `.btn-primary` (parity), raw links `.cta-link`, `<vc-button>` — visual language aligned via tokens; merging would break parity. Converge *new* UI on `vc-button`. |
| 10 | **Two validation stacks** | Frozen order-form inline-border+`alert` vs `<vc-field>.validate()`. Do not merge; migrate form only when parity baseline is intentionally superseded. |
| 11 | **Two counter stacks** | `animateCount` (frozen body — parity extracts and diffs it) vs `<vc-counter>`. Shared easing *cannot* be extracted without touching the frozen body. Documented duplication. |
| 12 | **Hardcoded palette in section CSS** | `#FAFAFA`, map fills, etc. — frozen by declaration parity (`hex → var()` changes the declaration tuple). Backlog item only when baseline is re-pinned. |
| 13 | **`ui.css` semantic hexes** | **Fixed** — migrated to `--vc-*` tokens local to `ui.css` (same computed values; suite EXPECTED regenerated). |
| 14 | **No favicon / canonical / OG tags** | Head is frozen by byte-for-byte reverse-transform; adding tags requires a deliberate baseline revision. |
| 15 | **Material Symbols full variable font** | One of the largest common web-font payloads; subset or switch to SVG sprite when HTML baseline can change. |
| 16 | **Unsplash via CSS `background`** | Not lazy-loadable, no `fetchpriority`, no local cache control. Prefer `<img>`/`<picture>` + self-hosted AVIF when markup may change. |

### P3 — Systems / scalability (infra recommendations — no code change)

For “millions of users” this site scales the right way: **static + CDN**.

| Concern | Recommendation |
|---|---|
| Cache | HTML `max-age=60, stale-while-revalidate=86400`; hashed assets `immutable, max-age=31536000` (adopt hashing when a bundler lands) |
| CSS | Serve `main.flat.css` (or hashed bundle) — kill `@import` waterfall |
| Fonts | Self-host WOFF2, `font-display: swap` (already in Google URL), preload the two text fonts only |
| Images | Self-host, AVIF/WebP, width descriptors; drop Unsplash hotlink dependency |
| Compression | Brotli at edge; precompress `.flat.css` |
| Observability | RUM beacon for LCP/CLS/INP by route; synthetic checks on 8 URLs |
| Security | `Content-Security-Policy` without `unsafe-inline` (site already has 0 inline styles/handlers on product pages); `Referrer-Policy`; `X-Content-Type-Options` |
| Availability | Multi-region object CDN + origin shield; no origin dependency for read path |
| DB/API (future) | Quote form currently alerts only — when a real API ships: edge-friendly JSON schema, idempotency keys, rate limit by IP+form hash, store in Postgres+queue; keep the static shell unchanged |

---

## 3. Debugging notes (edge cases that matter)

1. **`'8,000t'` loses suffix** — comma branch wins. Preserved; do not “fix”
   under parity. Future `parseMetric()` shared helper when baseline allows.
2. **Required non-text controls** — order-form only `value.trim()`-checks
   `[required]`; radios handled solely via `loadType`. Another required radio
   group would **not** be validated. Latent production bug — leave frozen;
   new forms must use `<vc-field>.validate()` (uses `checkValidity`).
3. **Button re-render clones children** — `href` present→absent swaps
   `<a>`↔`<button>` and clones light DOM; icons/attributes re-synced in
   `#sync`. Consumers should not hold references to the *inner* control.
4. **Toast + `announce` rAF** — clear-then-write pattern re-announces
   identical messages; two rapid shows schedule two rAFs (last write wins
   on the same region — acceptable; optional queue if spam becomes real).
5. **`<vc-field>` MutationObserver** — adopting nodes changes `childNodes`
   and re-fires once; second pass is a no-op (chrome excluded).
6. **`uid()` is process-unique, not DOM-unique** — fine per document; SSR
   would need a different strategy (N/A today).

---

## 4. Refactoring strategies (applied vs deferred)

### Applied now (quality-only, parity-safe)

| Change | Files |
|---|---|
| DRY live regions; resilient if region detached | `core/a11y.js` |
| Passive + state-cached scroll | `features/navbar-scroll.js` |
| Observer exhaustion disconnect | `features/proof-counters.js` |
| Radio group clear extracted; markers preserved | `features/order-form.js` |
| Toast single SR channel | `components/toast.js` |
| Loading-link activation guard | `components/button.js` |
| Counter auto-label ownership | `components/counter.js` |
| Empty `role=group` | `components/empty-state.js` |
| Disclosure `show()`/`hide()` API + doc sync | `components/disclosure.js` |
| `--vc-*` semantic tokens | `components/ui.css` |
| CSS flatten tool + verified equality | `tools/flatten_css.py`, `assets/css/dist/main.flat.css` |
| This review | `docs/ENGINEERING_REVIEW.md` |

### Deferred (require baseline re-pin or product decision)

1. **Collapse dual form/counter/button stacks** — only after stakeholders
   accept a new parity baseline (v4).
2. **Tokenize section hexes** — same re-pin; mechanical `EXPECTED_ADD` regen.
3. **Head upgrades** (favicon, OG, combined font URL, preload) — reverse-
   transform is byte-exact; plan as one “head modernization” commit.
4. **Replace CSS backgrounds with `<img>`** — unlocks lazy-load + LCP
   priority; needs HTML+CSS co-change.
5. **Add a bundler** (esbuild/Vite) — roots are already bundler-shaped;
   flatten tool is the zero-dep stepping stone.
6. **Split product CSS** (critical above-fold vs deferred) — needs measured
   LCP data first; flatten already removes the worst latency multiplier.

---

## 5. Improved production-grade snippets (reference)

### Deploy flatten (CI)

```bash
python3 tools/flatten_css.py --check || python3 tools/flatten_css.py
# ship assets/css/dist/main.flat.css; swap <link> at deploy-time only
```

### Single-channel toast (current)

```js
Toast.error('Control tower unreachable.');
// → visible vc-toast + ONE assertive announce(); no role=alert on the node
```

### Safe async CTA (current)

```html
<vc-button id="save" variant="primary">Save</vc-button>
<script type="module">
  const save = document.getElementById('save');
  save.addEventListener('click', async () => {
    if (save.loading) return;          // also blocked in capture phase
    save.loading = true;
    try { await api(); Toast.success('Saved.'); }
    finally { save.loading = false; }
  });
</script>
```

### Future quote API (systems sketch — not implemented)

```
POST /api/v1/quotes   (edge rate-limited)
  headers: Idempotency-Key
  body: { contact, corridor, loadType, … }  // mirrors form field names
  → 202 { quoteId }  enqueue → Postgres + worker email/SMS
GET  /api/v1/quotes/:id  (signed, no PII in URL)
```

Static shell remains the product; API is additive — same architecture rule
as `ui.js` beside `main.js`.

---

## 6. Verification (this pass)

| Check | Result |
|---|---|
| `verify_v3.py` | **ALL PASSED** — modules = combined + **319** documented adds |
| `verify_parity.py` | **ALL PASSED** — HTML reverse byte-exact; JS markers green |
| `node --check` × all modules | OK |
| `tools/flatten_css.py --check` | OK — flat ≡ modular declaration multiset (1943 = 1943) |
| HTTP smoke (8 pages + entries + flat CSS) | 200 |
| Inline `style=` attributes on product pages | 0 |

---

## 7. Summary judgment

**Architecture:** Already strong for a zero-build static system — layered,
documented, mechanically verified. The main structural debt is *intentional
dual stacks* (parity-frozen production paths vs the new component library),
not accidental coupling.

**Biggest real risks:** (1) `@import` waterfall + third-party fonts/images on
critical path, (2) head/metadata gaps blocked by byte-parity, (3) latent form
validation holes frozen under parity — migrate carefully.

**What changed:** bug-level a11y/activation fixes, main-thread waste removed,
semantic tokens, flatten pipeline, and a written map of what must *not* be
“cleaned up” until the baseline is consciously revised.
